createNameSpace('realityEditor.gui.threejsScene');

import * as THREE from '../../thirdPartyCode/three/three.module.js';
import { CSS2DRenderer } from '../../thirdPartyCode/three/CSS2DRenderer.js';
import { GLTFLoader } from '../../thirdPartyCode/three/GLTFLoader.module.js';
import { mergeBufferGeometries } from '../../thirdPartyCode/three/BufferGeometryUtils.module.js';
import { MeshBVH } from '../../thirdPartyCode/three-mesh-bvh.module.js';
import { TransformControls } from '../../thirdPartyCode/three/TransformControls.js';
import {
    ViewFrustum,
    frustumVertexShader,
    frustumFragmentShader,
    MAX_VIEW_FRUSTUMS,
    UNIFORMS,
} from './ViewFrustum.js';
import { MapShaderSettingsUI } from '../measure/mapShaderSettingsUI.js';
import GroundPlane from './scene/GroundPlane.js';
import AnchoredGroup from './scene/AnchoredGroup.js';
import { WebXRCamera, DefaultCamera, LayerConfig } from './scene/Camera.js';
import { Renderer } from './scene/Renderer.js';
import { setMatrixFromArray } from './scene/utils.js';
import { getPendingCapture } from './sceneCapture.js';

(function (exports) {
    /**
     * this layer renders the grid first
     */
    const RENDER_ORDER_SCAN = -2;

    /**
     * this will render the scanned scene second
     */
    const RENDER_ORDER_DEPTH_REPLACEMENT = -1;

    exports.RENDER_ORDER_DEPTH_REPLACEMENT = RENDER_ORDER_DEPTH_REPLACEMENT;

    var isProjectionMatrixSet = false;
    const animationCallbacks = [];
    let lastFrameTime = Date.now();
    const worldObjectGroups = {}; // Parent objects for objects attached to world objects
    const worldOcclusionObjects = {}; // Keeps track of initialized occlusion objects per world object
    /**
     * @type {GroundPlane}
     */
    let groundPlane;
    let isGroundPlanePositionSet = false; // gets updated when the ground plane collider is added
    let isWorldMeshLoadedAndProcessed = false; // gets updated when area target mesh and navmesh have been processed
    let distanceRaycastVector = new THREE.Vector3();
    let distanceRaycastResultPosition = new THREE.Vector3();
    let originBoxes = {};
    let allMeshes = [];
    let isHeightMapOn = false;
    let isSteepnessMapOn = false;
    let navmesh = null;
    let gltfBoundingBox = null;
    let cssRenderer = null;
    // other modules can subscribe to these events
    let callbacks = {
        onGltfDownloadProgress: [],
        onGltfLoaded: [],
    };
    // values for the 'renderMode' property of objects
    const RENDER_MODES = Object.freeze({
        mesh: 'mesh',
        ai: 'ai',
    });

    const DISPLAY_ORIGIN_BOX = true;

    let customMaterials;
    let materialCullingFrustums = {}; // used in remote operator to cut out points underneath the point-clouds

    let areaTargetMaterials = [];

    /**
     * for now, this contains everything not attached to a specific world object
     * @type {AnchoredGroup}
     */
    var threejsContainer;

    /**
     * @type {DefaultCamera}
     */
    var defaultCamera;

    /**
     * @type {WebXRCamera|null}
     */
    var webXRCamera;

    /**
     * @type {Renderer}
     */
    var mainRenderer;

    function initService() {
        // create a fullscreen webgl renderer for the threejs content
        /** @type {HTMLCanvasElement} */
        const domElement = document.getElementById('mainThreejsCanvas');
        mainRenderer = new Renderer(domElement);

        defaultCamera = new DefaultCamera('Default Camera', window.innerWidth / window.innerHeight);
        webXRCamera = null; // can only be initilized if we have a webxr session
        mainRenderer.add(defaultCamera); // Normally not needed, but needed in order to add child objects relative to camera
        mainRenderer.setCamera(defaultCamera);

        // create a parent 3D object to contain all the non-world-aligned three js objects
        // we can apply the transform to this object and all of its children objects will be affected
        threejsContainer = new AnchoredGroup('threejsContainer');
        mainRenderer.add(threejsContainer);

        customMaterials = new CustomMaterials();
        let _mapShaderUI = new MapShaderSettingsUI();

        // additional 3d content can be added to the scene like so:
        // var radius = 75;
        // var geometry = new THREE.IcosahedronGeometry( radius, 1 );
        // var materials = [
        //     new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } ),
        //     new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
        // ];
        // mesh = SceneUtils.createMultiMaterialObject( geometry, materials );
        // threejsContainerObj.add( mesh );
        // mesh.position.setZ(150);

        addGroundPlaneCollider(); // invisible object for raycasting intersections with ground plane

        // this triggers with a requestAnimationFrame on remote operator,
        // or at frequency of Vuforia updates on mobile
        realityEditor.gui.ar.draw.addUpdateListener(renderScene);

        if (DISPLAY_ORIGIN_BOX) {
            realityEditor.gui.settings.addToggle(
                'Display Origin Boxes',
                'show debug cubes at origin',
                'displayOriginCubes',
                '../../../svg/move.svg',
                false,
                function (newValue) {
                    toggleDisplayOriginBoxes(newValue);
                },
                { dontPersist: true }
            );
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' || e.key === 'N') {
                e.stopPropagation();
                navmesh.visible = !navmesh.visible;
            }
        });

        cssRenderer = new CSS2DRenderer();
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
        const css3dCanvas = cssRenderer.domElement;
        css3dCanvas.id = 'three-js-scene-css-3d-renderer';
        // set the position style and pointer events none to complete the setup
        css3dCanvas.style.position = 'absolute';
        css3dCanvas.style.pointerEvents = 'none';
        css3dCanvas.style.top = '0';
        css3dCanvas.style.left = '0';
        document.body.appendChild(css3dCanvas);
    }

    // use this helper function to update the camera matrix using the camera matrix from the sceneGraph
    function setCameraPosition(matrix) {
        defaultCamera.setCameraMatrixFromArray(matrix);
        if (customMaterials) {
            let forwardVector = realityEditor.gui.ar.utilities.getForwardVector(matrix);
            customMaterials.updateCameraDirection(
                new THREE.Vector3(forwardVector[0], forwardVector[1], forwardVector[2])
            );
        }
    }

    // adds an invisible plane to the ground that you can raycast against to fill in holes in the area target
    // this is different from the ground plane visualizer element
    function addGroundPlaneCollider() {
        const sceneSizeInMeters = 100; // not actually infinite, but relative to any area target this should cover it

        isGroundPlanePositionSet = true;
        groundPlane = new GroundPlane(
            sceneSizeInMeters / mainRenderer.getGlobalScale().getSceneScale()
        );
        addToScene(groundPlane.getInternalObject(), { occluded: true });

        let areaTargetNavmesh = null;
        realityEditor.app.targetDownloader.onNavmeshCreated((navmesh) => {
            areaTargetNavmesh = navmesh;
            tryUpdatingGroundPlanePosition();
        });

        let areaTargetMesh = null;
        realityEditor.avatar.network.onLoadOcclusionObject(
            (_cachedWorldObject, cachedOcclusionObject) => {
                areaTargetMesh = cachedOcclusionObject;
                tryUpdatingGroundPlanePosition();
            }
        );

        const tryUpdatingGroundPlanePosition = () => {
            if (!areaTargetMesh || !areaTargetNavmesh) return; // only continue after both have been processed
            isWorldMeshLoadedAndProcessed = true;

            groundPlane.tryUpdatingGroundPlanePosition(areaTargetMesh, areaTargetNavmesh);

            isGroundPlanePositionSet = true;
        };
    }

    function renderScene() {
        const deltaTime = Date.now() - lastFrameTime; // In ms
        lastFrameTime = Date.now();

        const globalScale = mainRenderer.getGlobalScale();
        if (mainRenderer.isInWebXRMode()) {
            // 1 meter is 1 device unit
            if (globalScale.getDeviceScale() !== 1) {
                globalScale.setDeviceScale(1);
                webXRCamera = new WebXRCamera('WebXR Camera', mainRenderer);
                mainRenderer.setCamera(webXRCamera);
                console.log('webXR camera');
            }
        } else {
            // 1 meter is 1000 device units
            if (globalScale.getDeviceScale() !== 1000) {
                globalScale.setDeviceScale(1000);
                mainRenderer.setCamera(defaultCamera);
                console.log('default camera');
            }
        }

        cssRenderer.render(
            mainRenderer.getInternalScene(),
            mainRenderer.getCamera().getInternalObject()
        );

        // additional modules, e.g. spatialCursor, should trigger their update function with an animationCallback
        animationCallbacks.forEach((callback) => {
            callback(deltaTime);
        });

        if (globalStates.realProjectionMatrix && globalStates.realProjectionMatrix.length > 0) {
            defaultCamera.setProjectionMatrixFromArray(globalStates.realProjectionMatrix);
            isProjectionMatrixSet = true;
        }

        const worldObjectIds = realityEditor.worldObjects.getWorldObjectKeys();
        worldObjectIds.forEach((worldObjectId) => {
            if (!worldObjectGroups[worldObjectId]) {
                const group = new THREE.Group();
                group.name = worldObjectId + '_group';
                worldObjectGroups[worldObjectId] = group;
                group.matrixAutoUpdate = false; // this is needed to position it directly with matrices
                mainRenderer.add(group);

                // Helps visualize world object origin point for debugging
                if (
                    DISPLAY_ORIGIN_BOX &&
                    worldObjectId !== realityEditor.worldObjects.getLocalWorldId() &&
                    !realityEditor.device.environment.variables.hideOriginCube
                ) {
                    const originBox = new THREE.Mesh(
                        new THREE.BoxGeometry(10, 10, 10),
                        new THREE.MeshNormalMaterial()
                    );
                    const xBox = new THREE.Mesh(
                        new THREE.BoxGeometry(5, 5, 5),
                        new THREE.MeshBasicMaterial({ color: 0xff0000 })
                    );
                    const yBox = new THREE.Mesh(
                        new THREE.BoxGeometry(5, 5, 5),
                        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
                    );
                    const zBox = new THREE.Mesh(
                        new THREE.BoxGeometry(5, 5, 5),
                        new THREE.MeshBasicMaterial({ color: 0x0000ff })
                    );
                    xBox.position.x = 15;
                    yBox.position.y = 15;
                    zBox.position.z = 15;
                    group.add(originBox);
                    originBox.scale.set(10, 10, 10);
                    originBox.add(xBox);
                    originBox.add(yBox);
                    originBox.add(zBox);

                    originBoxes[worldObjectId] = originBox;
                    if (
                        typeof realityEditor.gui.settings.toggleStates.displayOriginCubes !==
                        'undefined'
                    ) {
                        originBox.visible =
                            realityEditor.gui.settings.toggleStates.displayOriginCubes;
                    }
                }
            }

            // each of the world object containers has its origin set to the origin matrix of that world object
            const group = worldObjectGroups[worldObjectId];
            const worldMatrix =
                realityEditor.sceneGraph.getSceneNodeById(worldObjectId).worldMatrix;
            if (worldMatrix) {
                setMatrixFromArray(group.matrix, worldMatrix);
                group.visible = true;

                if (worldOcclusionObjects[worldObjectId]) {
                    setMatrixFromArray(worldOcclusionObjects[worldObjectId].matrix, worldMatrix);
                    worldOcclusionObjects[worldObjectId].visible = true;
                }
            } else {
                group.visible = false;

                if (worldOcclusionObjects[worldObjectId]) {
                    worldOcclusionObjects[worldObjectId].visible = false;
                }
            }
        });

        // the main three.js container object has its origin set to the ground plane origin
        const rootMatrix = realityEditor.sceneGraph.getGroundPlaneNode().worldMatrix;
        if (rootMatrix) {
            threejsContainer.setMatrixFromArray(rootMatrix);
        }

        customMaterials.update();

        // only render the scene if the projection matrix is initialized
        if (isProjectionMatrixSet) {
            mainRenderer.render();

            let pendingCapture = getPendingCapture('mainThreejsCanvas');
            if (pendingCapture) {
                pendingCapture.performCapture();
            }
        }
    }

    function toggleDisplayOriginBoxes(newValue) {
        Object.values(originBoxes).forEach((box) => {
            box.visible = newValue;
        });
    }

    /**
     *
     * @param {THREE.Object3D} obj
     * @param {*} parameters
     */
    function addToScene(obj, parameters) {
        if (!parameters) {
            parameters = {};
        }
        const occluded = parameters.occluded;
        const parentToCamera = parameters.parentToCamera;
        const worldObjectId = parameters.worldObjectId;
        const attach = parameters.attach;
        if (occluded) {
            const queue = [obj];
            while (queue.length > 0) {
                const currentObj = queue.pop();
                currentObj.renderOrder = 2;
                currentObj.children.forEach((child) => queue.push(child));
            }
        }
        if (parentToCamera) {
            if (attach) {
                defaultCamera.attach(obj);
            } else {
                defaultCamera.add(obj);
            }
        } else if (worldObjectId) {
            if (attach) {
                worldObjectGroups[worldObjectId].attach(obj);
            } else {
                worldObjectGroups[worldObjectId].add(obj);
            }
        } else {
            if (attach) {
                threejsContainer.attach(obj);
            } else {
                threejsContainer.add(obj);
            }
        }
    }

    /**
     *
     * @param {THREE.Object3D} obj
     */
    function removeFromScene(obj) {
        if (obj && obj.parent) {
            obj.parent.remove(obj);
        }
    }

    function onAnimationFrame(callback) {
        animationCallbacks.push(callback);
    }

    function removeAnimationCallback(callback) {
        if (animationCallbacks.includes(callback)) {
            animationCallbacks.splice(animationCallbacks.indexOf(callback), 1);
        }
    }

    function addOcclusionGltf(pathToGltf, objectId) {
        // Code remains here, but likely won't be used due to distance-based fading looking better

        if (worldOcclusionObjects[objectId]) {
            // occlusion gltf already loaded
            return; // Don't try creating multiple occlusion objects for the same world object
        }

        const gltfLoader = new GLTFLoader();
        gltfLoader.load(pathToGltf, function (gltf) {
            const geometries = [];
            gltf.scene.traverse((obj) => {
                if (obj.geometry) {
                    obj.geometry.deleteAttribute('uv'); // Messes with merge if present in some geometries but not others
                    obj.geometry.deleteAttribute('uv2'); // Messes with merge if present in some geometries but not others
                    geometries.push(obj.geometry);
                }
            });

            let geometry = geometries[0];
            if (geometries.length > 1) {
                const mergedGeometry = mergeBufferGeometries(geometries);
                geometry = mergedGeometry;
            }

            // SimplifyModifier seems to freeze app
            // if (geometry.index) {
            //     geometry = new SimplifyModifier().modify(geometry, geometry.index.count * 0.2);
            // } else {
            //     geometry = new SimplifyModifier().modify(geometry, geometry.attributes.position.count * 0.2);
            // }
            geometry.computeVertexNormals();

            // Add the BVH to the boundsTree variable so that the acceleratedRaycast can work
            geometry.boundsTree = new MeshBVH(geometry);

            const material = new THREE.MeshNormalMaterial();
            material.colorWrite = false; // Makes it invisible
            const mesh = new THREE.Mesh(geometry, material);
            mesh.renderOrder = 1;
            mesh.scale.set(1000, 1000, 1000); // convert meters -> mm
            const group = new THREE.Group(); // mesh needs to be in group so scale doesn't get overriden by model view matrix
            group.add(mesh);
            group.matrixAutoUpdate = false; // allows us to update with the model view matrix
            mainRenderer.add(group);
            worldOcclusionObjects[objectId] = group;
        });
    }

    function getObjectForWorldRaycasts(objectId) {
        return worldOcclusionObjects[objectId] || mainRenderer.getObjectByName('areaTargetMesh');
    }

    function isOcclusionActive(objectId) {
        return !!worldOcclusionObjects[objectId];
    }

    /**
     * Key function for the remote operator. Loads and adds a GLTF model to the
     * scene as a static reference mesh.
     * @param {string} pathToGltf - url of gltf
     * @param {{x: number, y: number, z: number}} originOffset - offset of model for ground plane being aligned with y=0
     * @param {{x: number, y: number, z: number}} originRotation - rotation for up to be up
     * @param {number} maxHeight - maximum (ceiling) height of model
     * @param {number} ceilingAndFloor - max y (ceiling) and min y (floor) value of model mesh
     * @param {{x: number, y: number, z: number}} center - center of model for loading animation
     * @param {function} callback - Called on load with gltf's threejs object
     *
    /* For my example area target:
        pathToGltf = './svg/BenApt1_authoring.glb' // put in arbitrary local directory to test
        originOffset = {x: -600, y: 0, z: -3300};
        originRotation = {x: 0, y: 2.661627109291353, z: 0};
        maxHeight = 2.3 // use to slice off the ceiling above this height (meters)
     */
    function addGltfToScene(
        pathToGltf,
        map,
        steepnessMap,
        heightMap,
        originOffset,
        originRotation,
        maxHeight,
        ceilingAndFloor,
        center,
        callback
    ) {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
            pathToGltf,
            function (gltf) {
                let wireMesh;
                let wireMaterial = customMaterials.areaTargetMaterialWithTextureAndHeight(
                    new THREE.MeshStandardMaterial({
                        wireframe: true,
                        color: 0x777777,
                    }),
                    {
                        maxHeight: maxHeight,
                        center: center,
                        animateOnLoad: true,
                        inverted: true,
                        useFrustumCulling: false,
                    }
                );

                if (gltf.scene.geometry) {
                    allMeshes.push(gltf.scene);
                    if (typeof maxHeight !== 'undefined') {
                        if (!gltf.scene.material) {
                            console.warn('no material', gltf.scene);
                        } else {
                            // cache the original gltf material on mobile browsers, to improve performance
                            gltf.scene.originalMaterial = gltf.scene.material.clone();
                            if (realityEditor.device.environment.isDesktop()) {
                                gltf.scene.colorMaterial =
                                    customMaterials.areaTargetMaterialWithTextureAndHeight(
                                        gltf.scene.material,
                                        {
                                            maxHeight: maxHeight,
                                            center: center,
                                            animateOnLoad: true,
                                            inverted: false,
                                            useFrustumCulling: false,
                                        }
                                    );
                            }
                        }
                    }
                    gltf.scene.geometry.computeVertexNormals();
                    gltf.scene.geometry.computeBoundingBox();
                    gltf.scene.heightMaterial = customMaterials.heightMapMaterial(
                        gltf.scene.material,
                        { ceilingAndFloor: ceilingAndFloor }
                    );
                    gltf.scene.gradientMaterial = customMaterials.gradientMapMaterial(
                        gltf.scene.material
                    );
                    gltf.scene.material = gltf.scene.colorMaterial || gltf.scene.originalMaterial;

                    // Add the BVH to the boundsTree variable so that the acceleratedRaycast can work
                    gltf.scene.geometry.boundsTree = new MeshBVH(gltf.scene.geometry);

                    wireMesh = new THREE.Mesh(gltf.scene.geometry, wireMaterial);
                } else {
                    let meshesToRemove = [];
                    gltf.scene.traverse((child) => {
                        if (child.material && child.geometry) {
                            // meshes scanned with ATC have additional untextured mesh(es) with this naming convention
                            // the scan may visually look better if they are removed. textured meshes are named "texture_N"
                            if (child.name && child.name.toLocaleLowerCase().startsWith('mesh_')) {
                                meshesToRemove.push(child);
                                return;
                            }
                            allMeshes.push(child);
                        }
                    });

                    // make sure we don't remove ALL meshes, if certain scanning software (e.g. Polycam) names all children mesh_X
                    if (allMeshes.length > 0) {
                        for (let mesh of meshesToRemove) {
                            mesh.removeFromParent();
                        }
                    } else {
                        for (let mesh of meshesToRemove) {
                            allMeshes.push(mesh);
                        }
                    }

                    allMeshes.forEach((child) => {
                        if (typeof maxHeight !== 'undefined') {
                            // TODO: to re-enable frustum culling on desktop, add this: if (!realityEditor.device.environment.isDesktop())
                            //  so that we don't swap to the original material on desktop. also need to update desktopRenderer.js
                            // cache the original gltf material on mobile browsers, to improve performance
                            child.originalMaterial = child.material.clone();
                            if (realityEditor.device.environment.isDesktop()) {
                                child.colorMaterial =
                                    customMaterials.areaTargetMaterialWithTextureAndHeight(
                                        child.material,
                                        {
                                            maxHeight: maxHeight,
                                            center: center,
                                            animateOnLoad: true,
                                            inverted: false,
                                            useFrustumCulling: false,
                                        }
                                    );
                            }
                        }

                        child.geometry.computeVertexNormals();
                        child.heightMaterial = customMaterials.heightMapMaterial(child.material, {
                            ceilingAndFloor: ceilingAndFloor,
                        });
                        child.gradientMaterial = customMaterials.gradientMapMaterial(
                            child.material
                        );
                        child.material = child.colorMaterial || child.originalMaterial;

                        // the attributes must be non-indexed in order to add a barycentric coordinate buffer
                        child.geometry = child.geometry.toNonIndexed();

                        // we assign barycentric coordinates to each vertex in order to render a wireframe shader
                        let positionAttribute = child.geometry.getAttribute('position');
                        let barycentricBuffer = [];
                        const count = positionAttribute.count / 3;
                        for (let i = 0; i < count; i++) {
                            barycentricBuffer.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
                        }

                        child.geometry.setAttribute(
                            'a_barycentric',
                            new THREE.BufferAttribute(new Uint8Array(barycentricBuffer), 3)
                        );
                    });
                    const mergedGeometry = mergeBufferGeometries(
                        allMeshes.map((child) => {
                            let geo = child.geometry.clone();
                            geo.deleteAttribute('uv');
                            geo.deleteAttribute('uv2');
                            return geo;
                        })
                    );
                    mergedGeometry.computeBoundingBox();
                    gltfBoundingBox = mergedGeometry.boundingBox;

                    // Add the BVH to the boundsTree variable so that the acceleratedRaycast can work
                    allMeshes.map((child) => {
                        child.geometry.boundsTree = new MeshBVH(child.geometry);
                    });

                    wireMesh = new THREE.Mesh(mergedGeometry, wireMaterial);
                }

                navmesh = realityEditor.app.pathfinding.initService(map, steepnessMap, heightMap);
                // add in the navmesh
                // navmesh.scale.set(1000, 1000, 1000);
                // navmesh.position.set(gltfBoundingBox.min.x * 1000, 0, gltfBoundingBox.min.z * 1000);
                // navmesh.visible = false;
                // threejsContainerObj.add(navmesh);

                // align the coordinate systems
                gltf.scene.scale.set(1000, 1000, 1000); // convert meters -> mm
                wireMesh.scale.set(1000, 1000, 1000); // convert meters -> mm
                if (typeof originOffset !== 'undefined') {
                    gltf.scene.position.set(originOffset.x, originOffset.y, originOffset.z);
                    wireMesh.position.set(originOffset.x, originOffset.y, originOffset.z);
                }
                if (typeof originRotation !== 'undefined') {
                    gltf.scene.rotation.set(originRotation.x, originRotation.y, originRotation.z);
                    wireMesh.rotation.set(originRotation.x, originRotation.y, originRotation.z);
                }

                wireMesh.renderOrder = RENDER_ORDER_SCAN;
                gltf.scene.renderOrder = RENDER_ORDER_SCAN;
                wireMesh.layers.set(LayerConfig.LAYER_SCAN);
                gltf.scene.layers.set(LayerConfig.LAYER_SCAN);
                gltf.scene.traverse((child) => {
                    if (child.layers) {
                        child.layers.set(LayerConfig.LAYER_SCAN);
                    }
                });

                threejsContainer.add(wireMesh);
                setTimeout(() => {
                    threejsContainer.remove(wireMesh);
                }, 5000);
                threejsContainer.add(gltf.scene);

                realityEditor.network.addPostMessageHandler(
                    'getAreaTargetMesh',
                    (_, fullMessageData) => {
                        realityEditor.network.postMessageIntoFrame(fullMessageData.frame, {
                            areaTargetMesh: {
                                mesh: gltf.scene.toJSON(),
                            },
                        });
                    }
                );

                if (callback) {
                    callback(gltf.scene, wireMesh);
                }

                // in addition to triggering the callback provided by the caller of this function,
                // also trigger callbacks for any other modules listening for gltf loaded events
                callbacks.onGltfLoaded.forEach((cb) => {
                    cb(pathToGltf);
                });
            },
            (xhr) => {
                // can be used to display download progress, useful if loading large gltf files on slow networks
                callbacks.onGltfDownloadProgress.forEach((cb) => {
                    cb(pathToGltf, xhr.loaded, xhr.total);
                });
            }
        );
    }

    function changeMeasureMapType(mapType) {
        switch (mapType) {
            case 'color':
                isHeightMapOn = false;
                isSteepnessMapOn = false;
                realityEditor.forEachFrameInAllObjects(postHeightMapChangeEventIntoIframes);
                allMeshes.forEach((child) => {
                    child.material.dispose();
                    child.material = child.colorMaterial || child.originalMaterial;
                });
                break;
            case 'height':
                isHeightMapOn = true;
                isSteepnessMapOn = false;
                realityEditor.forEachFrameInAllObjects(postHeightMapChangeEventIntoIframes);
                allMeshes.forEach((child) => {
                    child.material.dispose();
                    child.material = child.heightMaterial;
                });
                break;
            case 'steepness':
                isHeightMapOn = false;
                isSteepnessMapOn = true;
                realityEditor.forEachFrameInAllObjects(postHeightMapChangeEventIntoIframes);
                allMeshes.forEach((child) => {
                    child.material.dispose();
                    child.material = child.gradientMaterial;
                });
                break;
        }
    }

    function postHeightMapChangeEventIntoIframes(objectkey, framekey) {
        if (
            realityEditor.envelopeManager.getFrameTypeFromKey(objectkey, framekey) ===
            'spatialMeasure'
        ) {
            let iframe = document.getElementById('iframe' + framekey);
            iframe.contentWindow.postMessage(
                JSON.stringify({
                    isHeightMapOn: isHeightMapOn,
                    isSteepnessMapOn: isSteepnessMapOn,
                }),
                '*'
            );
        }
    }

    function highlightWalkableArea(isOn) {
        if (customMaterials) {
            customMaterials.highlightWalkableArea(isOn);
        }
    }

    function updateGradientMapThreshold(minAngle, maxAngle) {
        if (customMaterials) {
            customMaterials.updateGradientMapThreshold(minAngle, maxAngle);
        }
    }

    /**
     * Returns the 3D coordinate which is [distance] mm in front of the screen pixel coordinates [clientX, clientY]
     * @param {number} clientX - in screen pixels
     * @param {number} clientY - in screen pixels
     * @param {number} distance - in millimeters
     * @returns {Vector3} - position relative to camera
     */
    function getPointAtDistanceFromCamera(clientX, clientY, distance) {
        distanceRaycastVector.set(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1,
            0
        );
        distanceRaycastVector.unproject(mainRenderer.getCamera().getInternalObject());
        distanceRaycastVector.normalize();
        distanceRaycastResultPosition
            .set(0, 0, 0)
            .add(distanceRaycastVector.multiplyScalar(distance));
        return distanceRaycastResultPosition;
    }

    function getObjectByName(name) {
        return mainRenderer.getObjectByName(name);
    }

    function getObjectsByName(name) {
        return mainRenderer.getObjectsByName(name);
    }

    function getGroundPlaneCollider() {
        return groundPlane;
    }

    function getToolGroundPlaneShadowMatrix(objectKey, frameKey) {
        let frame = realityEditor.getFrame(objectKey, frameKey);
        let sceneNode = realityEditor.sceneGraph.getSceneNodeById(frameKey);
        if (!frame || !sceneNode) return [];
        let groundPlaneNode = realityEditor.sceneGraph.getGroundPlaneNode();
        let shadowMatrix = realityEditor.gui.ar.utilities.copyMatrix(sceneNode.worldMatrix);
        shadowMatrix[13] = groundPlaneNode.worldMatrix[13];
        return realignUpVector(shadowMatrix);
    }

    function getToolSurfaceShadowMatrix(objectKey, frameKey) {
        let worldId = realityEditor.sceneGraph.getWorldId();
        let worldOcclusionObject = getObjectForWorldRaycasts(worldId);
        return getMatrixProjectedOntoObject(objectKey, frameKey, worldOcclusionObject);
    }

    function getMatrixProjectedOntoObject(objectKey, frameKey, collisionObject) {
        let frame = realityEditor.getFrame(objectKey, frameKey);
        let sceneNode = realityEditor.sceneGraph.getSceneNodeById(frameKey);
        if (!frame || !sceneNode) return [];

        if (!collisionObject) return sceneNode.worldMatrix;

        // let toolPosition = realityEditor.sceneGraph.getWorldPosition(frameKey);
        let toolMatrixGP = sceneNode.getMatrixRelativeTo(
            realityEditor.sceneGraph.getGroundPlaneNode()
        );
        let toolPosition = new THREE.Vector3(toolMatrixGP[12], toolMatrixGP[13], toolMatrixGP[14]);

        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, -1, 0); // Pointing downwards along Y-axis

        // Set raycaster
        raycaster.set(toolPosition, direction);
        raycaster.firstHitOnly = true; // faster (using three-mesh-bvh)

        // add object layer to raycast layer mask
        raycaster.layers.mask = raycaster.layers.mask | collisionObject.layers.mask;

        const intersects = raycaster.intersectObject(collisionObject);
        if (intersects.length > 0) {
            const shadowPosition = intersects[0].point;
            let shadowMatrix = realityEditor.gui.ar.utilities.copyMatrix(sceneNode.worldMatrix);
            shadowMatrix[12] = shadowPosition.x;
            shadowMatrix[13] = shadowPosition.y;
            shadowMatrix[14] = shadowPosition.z;

            return realignUpVector(shadowMatrix);
        }

        return sceneNode.worldMatrix;
    }

    // removes rotation except along the Y axis, so it stays "flat" on the ground plane
    function realignUpVector(originalMatrix) {
        let matrix = new THREE.Matrix4();
        setMatrixFromArray(matrix, originalMatrix);

        // Decompose the matrix into position, rotation, and scale
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        matrix.decompose(position, rotation, scale);

        // Convert Quaternion to Euler to easily zero out X and Z rotations
        const euler = new THREE.Euler().setFromQuaternion(rotation, 'XYZ');

        // Zero out X and Z rotations
        euler.x = 0;
        euler.z = 0;

        // Convert back to Quaternion from Euler
        rotation.setFromEuler(euler);

        // Recompose the matrix
        matrix.compose(position, rotation, scale);

        return matrix.elements;
    }

    /**
     * Helper function to create a new ViewFrustum instance with preset camera internals
     * @returns {ViewFrustum}
     */
    const createCullingFrustum = function () {
        areaTargetMaterials.forEach((material) => {
            material.transparent = true;
        });

        // TODO: get these camera parameters dynamically?
        const iPhoneVerticalFOV = 41.22673; // https://discussions.apple.com/thread/250970597
        const widthToHeightRatio = 1920 / 1080;

        const MAX_DIST_OBSERVED = 5000;
        const FAR_PLANE_MM = Math.min(MAX_DIST_OBSERVED, 5000) + 100; // extend it slightly beyond the extent of the LiDAR sensor
        const NEAR_PLANE_MM = 10;

        let frustum = new ViewFrustum();
        frustum.setCameraInternals(
            iPhoneVerticalFOV * 0.95,
            widthToHeightRatio,
            NEAR_PLANE_MM / 1000,
            FAR_PLANE_MM / 1000
        );
        return frustum;
    };

    /**
     * Creates a frustum, or updates the existing frustum with this id, to move it to this position and orientation.
     * Returns the parameters that define the planes of this frustum after moving it.
     * @param {string} id – id of the virtualizer
     * @param {number[]} cameraPosition - position in model coordinates. this may be meters, not millimeters.
     * @param {number[]} cameraLookAtPosition – position where the camera is looking. if you subtract cameraPosition, you get direction
     * @param {number[]} cameraUp - normalized up vector of camera orientation
     * @param {number} maxDepthMeters - furthest point detected by the LiDAR sensor this frame
     * @returns {{normal1: Vector3, normal2: Vector3, normal3: Vector3, normal4: Vector3, normal5: Vector3, normal6: Vector3, D1: number, D2: number, D3: number, D4: number, D5: number, D6: number}}
     */
    function updateMaterialCullingFrustum(
        id,
        cameraPosition,
        cameraLookAtPosition,
        cameraUp,
        maxDepthMeters
    ) {
        if (typeof materialCullingFrustums[id] === 'undefined') {
            materialCullingFrustums[id] = createCullingFrustum();
        }

        let frustum = materialCullingFrustums[id];

        if (typeof maxDepthMeters !== 'undefined') {
            frustum.setCameraInternals(
                frustum.angle,
                frustum.ratio,
                frustum.nearD,
                (frustum.farD + maxDepthMeters) / 2,
                true
            );
        }

        frustum.setCameraDef(cameraPosition, cameraLookAtPosition, cameraUp);

        let viewingCameraForwardVector = realityEditor.gui.ar.utilities.getForwardVector(
            realityEditor.sceneGraph.getCameraNode().worldMatrix
        );
        let viewAngleSimilarity = realityEditor.gui.ar.utilities.dotProduct(
            materialCullingFrustums[id].planes[5].normal,
            viewingCameraForwardVector
        );
        viewAngleSimilarity = Math.max(0, viewAngleSimilarity); // limit it to 0 instead of going to -1 if viewing from anti-parallel direction

        return {
            normal1: array3ToXYZ(materialCullingFrustums[id].planes[0].normal),
            normal2: array3ToXYZ(materialCullingFrustums[id].planes[1].normal),
            normal3: array3ToXYZ(materialCullingFrustums[id].planes[2].normal),
            normal4: array3ToXYZ(materialCullingFrustums[id].planes[3].normal),
            normal5: array3ToXYZ(materialCullingFrustums[id].planes[4].normal),
            normal6: array3ToXYZ(materialCullingFrustums[id].planes[5].normal),
            D1: materialCullingFrustums[id].planes[0].D,
            D2: materialCullingFrustums[id].planes[1].D,
            D3: materialCullingFrustums[id].planes[2].D,
            D4: materialCullingFrustums[id].planes[3].D,
            D5: materialCullingFrustums[id].planes[4].D,
            D6: materialCullingFrustums[id].planes[5].D,
            viewAngleSimilarity: viewAngleSimilarity,
        };
    }

    /**
     * Helper function to convert [x,y,z] from toolbox math format to three.js vector
     * @param {number[]} arr3 – [x, y, z] array
     * @returns {Vector3}
     */
    function array3ToXYZ(arr3) {
        return new THREE.Vector3(arr3[0], arr3[1], arr3[2]);
    }

    /**
     * Deletes the ViewFrustum that corresponds with the virtualizer id
     * @param {string} id
     */
    function removeMaterialCullingFrustum(id) {
        delete materialCullingFrustums[id];

        let numFrustums = Object.keys(materialCullingFrustums).length;

        areaTargetMaterials.forEach((material) => {
            material.uniforms[UNIFORMS.numFrustums].value = Math.min(
                numFrustums,
                MAX_VIEW_FRUSTUMS
            );
            if (numFrustums === 0) {
                material.transparent = false; // optimize by turning off transparency when no virtualizers are connected
            }
        });
    }

    class CustomMaterials {
        constructor() {
            this.materialsToAnimate = [];
            this.heightMapMaterials = [];
            this.gradientMapMaterials = [];
            this.lastUpdate = -1;
        }
        areaTargetVertexShader({ useFrustumCulling, useLoadingAnimation, center }) {
            if (!useLoadingAnimation && !useFrustumCulling)
                return THREE.ShaderChunk.meshphysical_vert;
            if (useLoadingAnimation && !useFrustumCulling) {
                return this.loadingAnimationVertexShader(center);
            }
            return frustumVertexShader({
                useLoadingAnimation: useLoadingAnimation,
                center: center,
            });
        }
        areaTargetFragmentShader({ useFrustumCulling, useLoadingAnimation, inverted }) {
            if (!useLoadingAnimation && !useFrustumCulling)
                return THREE.ShaderChunk.meshphysical_frag;
            if (useLoadingAnimation && !useFrustumCulling) {
                return this.loadingAnimationFragmentShader(inverted);
            }
            return frustumFragmentShader({
                useLoadingAnimation: useLoadingAnimation,
                inverted: inverted,
            });
        }
        loadingAnimationVertexShader(center) {
            return THREE.ShaderChunk.meshphysical_vert
                .replace(
                    '#include <worldpos_vertex>',
                    `#include <worldpos_vertex>
    len = length(position - vec3(${center.x}, ${center.y}, ${center.z}));
    `
                )
                .replace(
                    '#include <common>',
                    `#include <common>
    varying float len;
    `
                );
        }
        loadingAnimationFragmentShader(inverted) {
            let condition = 'if (len > maxHeight) discard;';
            if (inverted) {
                // condition = 'if (len < maxHeight || len > (maxHeight + 8.0) / 2.0) discard;';
                condition = 'if (len < maxHeight) discard;';
            }
            return THREE.ShaderChunk.meshphysical_frag
                .replace(
                    '#include <clipping_planes_fragment>',
                    `
                         ${condition}
                         #include <clipping_planes_fragment>`
                )
                .replace(
                    `#include <common>`,
                    `
                         #include <common>
                         varying float len;
                         uniform float maxHeight;
                         `
                );
        }
        buildDefaultFrustums(numFrustums) {
            let frustums = [];
            for (let i = 0; i < numFrustums; i++) {
                frustums.push({
                    normal1: { x: 1, y: 0, z: 0 },
                    normal2: { x: 1, y: 0, z: 0 },
                    normal3: { x: 1, y: 0, z: 0 },
                    normal4: { x: 1, y: 0, z: 0 },
                    normal5: { x: 1, y: 0, z: 0 },
                    normal6: { x: 1, y: 0, z: 0 },
                    D1: 0,
                    D2: 0,
                    D3: 0,
                    D4: 0,
                    D5: 0,
                    D6: 0,
                    viewAngleSimilarity: 0,
                });
            }
            return frustums;
        }
        updateCameraDirection(cameraDirection) {
            areaTargetMaterials.forEach((material) => {
                for (let i = 0; i < material.uniforms[UNIFORMS.numFrustums].value; i++) {
                    let thisFrustum = material.uniforms[UNIFORMS.frustums].value[i];
                    let frustumDir = [
                        thisFrustum.normal6.x,
                        thisFrustum.normal6.y,
                        thisFrustum.normal6.z,
                    ];
                    let viewingDir = [cameraDirection.x, cameraDirection.y, cameraDirection.z];
                    // set to 1 if parallel, 0 if perpendicular. lower bound clamped to 0 instead of going to -1 if antiparallel
                    thisFrustum.viewAngleSimilarity = Math.max(
                        0,
                        realityEditor.gui.ar.utilities.dotProduct(frustumDir, viewingDir)
                    );
                }
            });
        }
        heightMapMaterial(sourceMaterial, { ceilingAndFloor }) {
            let material = sourceMaterial.clone();

            material.uniforms = THREE.UniformsUtils.merge([
                THREE.ShaderLib.physical.uniforms,
                {
                    heightMap_maxY: { value: ceilingAndFloor.ceiling },
                    heightMap_minY: { value: ceilingAndFloor.floor },
                    distanceToCamera: { value: 0 }, // todo Steve; later in the code, need to set gltf.scene.material.uniforms['....'] to desired value
                },
            ]);

            material.vertexShader = realityEditor.gui.shaders.heightMapVertexShader();

            material.fragmentShader = realityEditor.gui.shaders.heightMapFragmentShader();

            material.type = 'verycoolheightmapmaterial';

            material.needsUpdate = true;

            this.heightMapMaterials.push(material);

            return material;
        }
        gradientMapMaterial(sourceMaterial) {
            let material = sourceMaterial.clone();

            material.uniforms = THREE.UniformsUtils.merge([
                THREE.ShaderLib.physical.uniforms,
                {
                    gradientMap_minAngle: { value: 0 },
                    gradientMap_maxAngle: { value: 25 },
                    gradientMap_outOfRangeAreaOriginalColor: { value: false },
                    distanceToCamera: { value: 0 },
                },
            ]);

            material.vertexShader = realityEditor.gui.shaders.gradientMapVertexShader();

            material.fragmentShader = realityEditor.gui.shaders.gradientMapFragmentShader();

            material.type = 'verycoolgradientmapmaterial';

            material.needsUpdate = true;

            this.gradientMapMaterials.push(material);

            return material;
        }
        highlightWalkableArea(isOn) {
            this.gradientMapMaterials.forEach((material) => {
                material.uniforms['gradientMap_outOfRangeAreaOriginalColor'].value = isOn;
            });
        }
        updateGradientMapThreshold(minAngle, maxAngle) {
            this.gradientMapMaterials.forEach((material) => {
                material.uniforms['gradientMap_minAngle'].value = minAngle;
                material.uniforms['gradientMap_maxAngle'].value = maxAngle;
            });
        }
        areaTargetMaterialWithTextureAndHeight(
            sourceMaterial,
            { maxHeight, center, animateOnLoad, inverted, useFrustumCulling }
        ) {
            let material = sourceMaterial.clone();

            // for the shader to work, we must fully populate the frustums uniform array
            // with placeholder data (e.g. normals and constants for all 5 frustums),
            // but as long as numFrustums is 0 then it won't have any effect
            let defaultFrustums = this.buildDefaultFrustums(MAX_VIEW_FRUSTUMS);

            material.uniforms = THREE.UniformsUtils.merge([
                THREE.ShaderLib.physical.uniforms,
                {
                    maxHeight: { value: maxHeight },
                    numFrustums: { value: 0 },
                    frustums: { value: defaultFrustums },
                },
            ]);

            material.vertexShader = this.areaTargetVertexShader({
                useFrustumCulling: useFrustumCulling,
                useLoadingAnimation: animateOnLoad,
                center: center,
            });
            material.fragmentShader = this.areaTargetFragmentShader({
                useFrustumCulling: useFrustumCulling,
                useLoadingAnimation: animateOnLoad,
                inverted: inverted,
            });

            material.transparent = Object.keys(materialCullingFrustums).length > 0;
            areaTargetMaterials.push(material);

            if (animateOnLoad) {
                this.materialsToAnimate.push({
                    material: material,
                    currentHeight: -15, // -maxHeight,
                    maxHeight: maxHeight * 4,
                    animationSpeed: 0.02 / 2,
                });
            }

            material.type = 'thecoolermeshstandardmaterial';

            material.needsUpdate = true;

            return material;
        }
        update() {
            if (this.materialsToAnimate.length === 0) {
                return;
            }

            let now = window.performance.now();
            if (this.lastUpdate < 0) {
                this.lastUpdate = now;
            }
            let dt = now - this.lastUpdate;
            this.lastUpdate = now;

            let indicesToRemove = [];
            this.materialsToAnimate.forEach(function (entry, index) {
                let material = entry.material;
                if (entry.currentHeight < entry.maxHeight) {
                    entry.currentHeight += entry.animationSpeed * dt;
                    material.uniforms['maxHeight'].value = entry.currentHeight;
                } else {
                    indicesToRemove.push(index);
                }
            });

            for (let i = indicesToRemove.length - 1; i >= 0; i--) {
                let matIndex = indicesToRemove[i];
                this.materialsToAnimate.splice(matIndex, 1);
            }
        }
    }

    /**
     * @param object {THREE.Mesh}
     * @param options {{size: number?, hideX: boolean?, hideY: boolean?, hideZ: boolean?}}
     * @param onChange {function?}
     * @param onDraggingChanged {function?}
     * @returns {TransformControls}
     */
    function addTransformControlsTo(object, options, onChange, onDraggingChanged) {
        let transformControls = new TransformControls(
            defaultCamera.getInternalObject(),
            mainRenderer.getInternalCanvas()
        );
        if (options && typeof options.hideX !== 'undefined') {
            transformControls.showX = !options.hideX;
        }
        if (options && typeof options.hideY !== 'undefined') {
            transformControls.showY = !options.hideY;
        }
        if (options && typeof options.hideZ !== 'undefined') {
            transformControls.showZ = !options.hideZ;
        }
        if (options && typeof options.size !== 'undefined') {
            transformControls.size = options.size;
        }
        transformControls.attach(object);
        mainRenderer.add(transformControls);

        if (typeof onChange === 'function') {
            transformControls.addEventListener('change', onChange);
        }
        if (typeof onDraggingChanged === 'function') {
            transformControls.addEventListener('dragging-changed', onDraggingChanged);
        }
        return transformControls;
    }

    exports.getScreenXY = (meshPosition) => mainRenderer.getCamera().getScreenXY(meshPosition);

    exports.isPointOnScreen = (pointPosition) =>
        mainRenderer.getCamera().isPointOnScreen(pointPosition);

    // gets the position relative to groundplane (common coord system for threejsScene)
    exports.getToolPosition = function (toolId) {
        let toolSceneNode = realityEditor.sceneGraph.getSceneNodeById(toolId);
        let groundPlaneNode = realityEditor.sceneGraph.getGroundPlaneNode();
        let tp = realityEditor.sceneGraph.convertToNewCoordSystem(
            { x: 0, y: 0, z: 0 },
            toolSceneNode,
            groundPlaneNode
        );
        return new THREE.Vector3(tp.x, tp.y, tp.z);
    };

    exports.getCameraPosition = function () {
        let cameraSceneNode = realityEditor.sceneGraph.getCameraNode();
        let groundPlaneNode = realityEditor.sceneGraph.getGroundPlaneNode();
        let cp = realityEditor.sceneGraph.convertToNewCoordSystem(
            { x: 0, y: 0, z: 0 },
            cameraSceneNode,
            groundPlaneNode
        );
        return new THREE.Vector3(cp.x, cp.y, cp.z);
    };

    // gets the direction the tool is facing, within the coordinate system of the groundplane
    // todo Steve: currently this is not correct. Need further debugging
    exports.getToolDirection = function (toolId) {
        let toolSceneNode = realityEditor.sceneGraph.getSceneNodeById(toolId);
        let groundPlaneNode = realityEditor.sceneGraph.getGroundPlaneNode();
        let toolMatrix = realityEditor.sceneGraph.convertToNewCoordSystem(
            realityEditor.gui.ar.utilities.newIdentityMatrix(),
            toolSceneNode,
            groundPlaneNode
        );
        let forwardVector = realityEditor.gui.ar.utilities.getForwardVector(toolMatrix);
        return new THREE.Vector3(forwardVector[0], forwardVector[1], forwardVector[2]);
    };

    exports.getGltfBoundingBox = function () {
        return gltfBoundingBox;
    };

    /**
     * @return {Renderer} Various internal objects necessary for advanced (hacky) functions
     */
    exports.getInternals = function getInternals() {
        return mainRenderer;
    };

    /**
     * Turns off the mesh rendering so that the scene can be rendered on another canvas by another technology.
     * This should most likely only be called on non-AR clients.
     * @param {boolean} broadcastToOthers - if true, posts the updated renderMode to the server to notify other clients
     */
    function enableExternalSceneRendering(broadcastToOthers) {
        let areaMesh = getObjectByName('areaTargetMesh');
        // hide the mesh
        if (areaMesh) {
            areaMesh.visible = false;
        }
        // hide the ground plane holodeck visualizer
        realityEditor.gui.ar.groundPlaneRenderer.stopVisualization();
        // update the spatial cursor internal state
        realityEditor.spatialCursor.gsToggleActive(true);
        // update the renderMode of the world object and broadcast to other clients
        let worldObject = realityEditor.worldObjects.getBestWorldObject();
        if (worldObject) {
            worldObject.renderMode = RENDER_MODES.ai;
            if (!broadcastToOthers) return;
            realityEditor.network
                .postObjectRenderMode(worldObject.ip, worldObject.objectId, worldObject.renderMode)
                .then((_response) => {
                    // console.log('successfully sent renderMode to other clients via the server', response);
                })
                .catch((err) => {
                    console.warn('error in postObjectRenderMode', err);
                });
        }
    }

    /**
     * Restores mesh rendering when external rendering canvas is removed
     * This should most likely only be called on non-AR clients.
     * @param {boolean} broadcastToOthers - if true, posts the updated renderMode to the server to notify other clients
     */
    function disableExternalSceneRendering(broadcastToOthers) {
        let areaMesh = getObjectByName('areaTargetMesh');
        if (areaMesh) {
            areaMesh.visible = true;
        }
        realityEditor.gui.ar.groundPlaneRenderer.startVisualization();
        realityEditor.spatialCursor.gsToggleActive(false);
        let worldObject = realityEditor.worldObjects.getBestWorldObject();
        if (worldObject) {
            worldObject.renderMode = RENDER_MODES.mesh;
            if (!broadcastToOthers) return;
            realityEditor.network
                .postObjectRenderMode(worldObject.ip, worldObject.objectId, worldObject.renderMode)
                .then((_response) => {
                    // console.log('successfully sent renderMode to other clients via the server', response);
                })
                .catch((err) => {
                    console.warn('error in postObjectRenderMode', err);
                });
        }
    }

    /**
     * Converts from common array or object formats to THREE.Vector3
     * @param input
     * @return {Vector3}
     */
    function convertToVector3(input) {
        let x, y, z;

        if (Array.isArray(input)) {
            // Input format is an array [x, y, z]
            [x, y, z] = input;
        } else if (typeof input === 'string') {
            // Input format is a string "(x, y, z)"
            const match = input.match(/\(([^)]+)\)/);
            if (match) {
                [x, y, z] = match[1].split(',').map(Number);
            } else {
                throw new Error('Invalid string format');
            }
        } else if (typeof input === 'object' && input !== null) {
            // Input format is an object {x, y, z}
            if ('x' in input && 'y' in input && 'z' in input) {
                x = input.x;
                y = input.y;
                z = input.z;
            } else {
                throw new Error('Object does not have x, y, and z properties');
            }
        } else {
            throw new Error('Unsupported input type');
        }

        return new THREE.Vector3(x, y, z);
    }

    exports.initService = initService;
    exports.setCameraPosition = setCameraPosition;
    exports.addOcclusionGltf = addOcclusionGltf;
    exports.isOcclusionActive = isOcclusionActive;
    exports.addGltfToScene = addGltfToScene;
    exports.onAnimationFrame = onAnimationFrame;
    exports.removeAnimationCallback = removeAnimationCallback;
    exports.addToScene = addToScene;
    exports.removeFromScene = removeFromScene;
    exports.getScreenRay = (clientX, clientY) => {
        return mainRenderer.getScreenRay(clientX, clientY);
    };
    exports.getRaycastIntersects = (clientX, clientY, objectsToCheck) => {
        return mainRenderer.getRaycastIntersects(clientX, clientY, objectsToCheck);
    };
    exports.getPointAtDistanceFromCamera = getPointAtDistanceFromCamera;
    exports.getObjectByName = getObjectByName;
    exports.getObjectsByName = getObjectsByName;
    exports.getGroundPlaneCollider = getGroundPlaneCollider;
    exports.isGroundPlanePositionSet = () => {
        return isGroundPlanePositionSet;
    };
    exports.isWorldMeshLoadedAndProcessed = () => {
        return isWorldMeshLoadedAndProcessed;
    };
    exports.setMatrixFromArray = setMatrixFromArray;
    exports.getObjectForWorldRaycasts = getObjectForWorldRaycasts;
    exports.getToolGroundPlaneShadowMatrix = getToolGroundPlaneShadowMatrix;
    exports.getToolSurfaceShadowMatrix = getToolSurfaceShadowMatrix;
    exports.addTransformControlsTo = addTransformControlsTo;
    exports.toggleDisplayOriginBoxes = toggleDisplayOriginBoxes;
    exports.updateMaterialCullingFrustum = updateMaterialCullingFrustum;
    exports.removeMaterialCullingFrustum = removeMaterialCullingFrustum;
    exports.changeMeasureMapType = changeMeasureMapType;
    exports.highlightWalkableArea = highlightWalkableArea;
    exports.updateGradientMapThreshold = updateGradientMapThreshold;
    exports.setMatrixFromArray = setMatrixFromArray;
    exports.THREE = THREE;
    exports.GLTFLoader = GLTFLoader;
    exports.onGltfDownloadProgress = (cb) => {
        callbacks.onGltfDownloadProgress.push(cb);
    };
    exports.onGltfLoaded = (cb) => {
        callbacks.onGltfLoaded.push(cb);
    };
    exports.enableExternalSceneRendering = enableExternalSceneRendering;
    exports.disableExternalSceneRendering = disableExternalSceneRendering;
    exports.RENDER_MODES = RENDER_MODES;
    exports.convertToVector3 = convertToVector3;
})(realityEditor.gui.threejsScene);
