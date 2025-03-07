/**
 *
 *
 *                                      .,,,;;,'''..
 *                                  .'','...     ..',,,.
 *                                .,,,,,,',,',;;:;,.  .,l,
 *                               .,',.     ...     ,;,   :l.
 *                              ':;.    .'.:do;;.    .c   ol;'.
 *       ';;'                   ;.;    ', .dkl';,    .c   :; .'.',::,,'''.
 *      ',,;;;,.                ; .,'     .'''.    .'.   .d;''.''''.
 *     .oxddl;::,,.             ',  .'''.   .... .'.   ,:;..
 *      .'cOX0OOkdoc.            .,'.   .. .....     'lc.
 *     .:;,,::co0XOko'              ....''..'.'''''''.
 *     .dxk0KKdc:cdOXKl............. .. ..,c....
 *      .',lxOOxl:'':xkl,',......'....    ,'.
 *           .';:oo:...                        .
 *                .cd,      ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐    .
 *                  .l;     ║╣  │││ │ │ │├┬┘    '
 *                    'l.   ╚═╝─┴┘┴ ┴ └─┘┴└─   '.
 *                     .o.                   ...
 *                      .''''','.;:''.........
 *                           .'  .l
 *                          .:.   l'
 *                         .:.    .l.
 *                        .x:      :k;,.
 *                        cxlc;    cdc,,;;.
 *                       'l :..   .c  ,
 *                       o.
 *                      .,
 *
 *      ╦═╗┌─┐┌─┐┬  ┬┌┬┐┬ ┬  ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐  ╔═╗┬─┐┌─┐ ┬┌─┐┌─┐┌┬┐
 *      ╠╦╝├┤ ├─┤│  │ │ └┬┘  ║╣  │││ │ │ │├┬┘  ╠═╝├┬┘│ │ │├┤ │   │
 *      ╩╚═└─┘┴ ┴┴─┘┴ ┴  ┴   ╚═╝─┴┘┴ ┴ └─┘┴└─  ╩  ┴└─└─┘└┘└─┘└─┘ ┴
 *
 *
 * Created by Valentin on 10/22/14.
 *
 * Copyright (c) 2015 Valentin Heun
 * Modified by Valentin Heun 2014, 2015, 2016, 2017
 * Modified by Benjamin Reynholds 2016, 2017
 * Modified by James Hobin 2016, 2017
 *
 * All ascii characters above must be included in any redistribution.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

createNameSpace('realityEditor.gui.ar.draw');

/**
 * @fileOverview realityEditor.gui.ar.draw.js
 * Contains the main rendering code for rendering frames and nodes into the 3D scene.
 * Also determines when visual elements need to be hidden or shown, and has code for creating
 * the DOM elements for new frames and nodes.
 */

/**********************************************************************************************************************
 ******************************************** update and draw the 3D Interface ****************************************
 **********************************************************************************************************************/

realityEditor.gui.ar.draw.globalCanvas = globalCanvas;

/**
 * @type {Object.<string, Array.<number>>}
 */
realityEditor.gui.ar.draw.visibleObjects = {};
realityEditor.gui.ar.draw.visibleObjectsStatus = {};
realityEditor.gui.ar.draw.globalStates = globalStates;
realityEditor.gui.ar.draw.globalDOMCache = globalDOMCache;
realityEditor.gui.ar.draw.activeObject = {};
realityEditor.gui.ar.draw.activeFrame = {};
realityEditor.gui.ar.draw.activeNode = {};
realityEditor.gui.ar.draw.activeVehicle = {};
realityEditor.gui.ar.draw.activeObjectMatrix = [];
realityEditor.gui.ar.draw.finalMatrix = [];
realityEditor.gui.ar.draw.rotateX = rotateX;

/**
 * @type {{temp: number[], begin: number[], end: number[], r: number[], r2: number[], r3: number[]}}
 */
realityEditor.gui.ar.draw.matrix = {
    worldReference: null,
    temp: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    begin: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    end: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    r: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    r2: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    r3: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
};
realityEditor.gui.ar.draw.tempMatrix = {
    worldOffset: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    objectOffset: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
};
realityEditor.gui.ar.draw.objectKey = '';
realityEditor.gui.ar.draw.frameKey = '';
realityEditor.gui.ar.draw.nodeKey = '';
realityEditor.gui.ar.draw.activeKey = '';
realityEditor.gui.ar.draw.type = '';
realityEditor.gui.ar.draw.notLoading = '';
realityEditor.gui.ar.draw.utilities = realityEditor.gui.ar.utilities;

/**
 * don't render the following node types:
 * @type {Array.<string>}
 */
realityEditor.gui.ar.draw.hiddenNodeTypes = ['storeData', 'invisible'];

/**
 * Array of registered callbacks for the update function
 * @type {Array}
 */
realityEditor.gui.ar.draw.updateListeners = [];
realityEditor.gui.ar.draw.visibleObjectModifiers = [];

/**
 * Registers a callback from an external module to be updated every frame with the visibleObjects matrices
 * @param {function} callback
 */
realityEditor.gui.ar.draw.addUpdateListener = function (callback) {
    this.updateListeners.push(callback);
};

/**
 * Registers a callback for other modules to modify the list of visible objects before rendering takes place
 * Passes in a mutable set of objectId:matrix pairs that can be added to (or removed), e.g. anchors can use this to
 * be rendered by the regular update loop even though they aren't detected by Vuforia
 * @param {function} callback
 */
realityEditor.gui.ar.draw.addVisibleObjectModifier = function (callback) {
    this.visibleObjectModifiers.push(callback);
};

/**
 * @type {CallbackHandler}
 */
realityEditor.gui.ar.draw.callbackHandler = new realityEditor.moduleCallbacks.CallbackHandler(
    'gui/ar/draw'
);

/**
 * Adds a callback function that will be invoked when the specified function is called
 * @param {string} functionName
 * @param {function} callback
 */
realityEditor.gui.ar.draw.registerCallback = function (functionName, callback) {
    if (!this.callbackHandler) {
        this.callbackHandler = new realityEditor.moduleCallbacks.CallbackHandler('gui/ar/draw');
    }
    this.callbackHandler.registerCallback(functionName, callback);
};

/**
 * The most recently received set of matrices for the currently visible objects.
 * A set of {objectId: matrix} pairs, one per recognized target
 * @type {Object.<string, Array.<number>>}
 */
realityEditor.gui.ar.draw.visibleObjectsCopy = {};

realityEditor.gui.ar.draw.m1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

realityEditor.gui.ar.draw.worldCorrection = null;

realityEditor.gui.ar.draw.currentClosestObject = null;

/**
 * Main update loop.
 * A wrapper for the real realityEditor.gui.ar.draw.update update function.
 * Calling it this way, using requestAnimationFrame, makes it render more smoothly.
 * (A different update loop inside of desktopAdapter is used on desktop devices to include camera manipulations)
 */
// realityEditor.gui.ar.draw.updateLoop = function () {
//     realityEditor.gui.ar.draw.update(realityEditor.gui.ar.draw.visibleObjectsCopy, realityEditor.gui.ar.draw.areMatricesPrecomputed);
//     requestAnimationFrame(realityEditor.gui.ar.draw.updateLoop);
// };

realityEditor.gui.ar.draw.lowFrequencyUpdateCounter = 0;
realityEditor.gui.ar.draw.lowFrequencyUpdateCounterMax = 30; // how many frames pass per lowFrequencyUpdate
realityEditor.gui.ar.draw.isLowFrequencyUpdateFrame = false;
realityEditor.gui.ar.draw.isObjectWithNoFramesVisible = false;
realityEditor.gui.ar.draw.visibleObjectsStatusTimes = {};

realityEditor.gui.ar.draw.updateExtendedTrackingVisibility = function (visibleObjects) {
    for (var objectKey in visibleObjects) {
        if (this.visibleObjectsStatus[objectKey] === 'EXTENDED_TRACKED') {
            if (!globalStates.freezeButtonState) {
                if (this.visibleObjectsStatusTimes[objectKey] > 60) {
                    delete visibleObjects[objectKey];
                } else {
                    this.visibleObjectsStatusTimes[objectKey] += 1;
                }
            }
        } else {
            // status === 'TRACKED'
            this.visibleObjectsStatusTimes[objectKey] = 0;
        }
    }
};

realityEditor.gui.ar.draw.frameNeedsToBeRendered = true;
realityEditor.gui.ar.draw.prevSuppressedRendering = false;

/**
 * Previously triggered directly by the native app when the AR engine updates with a new set of recognized targets,
 * But now gets called 60FPS regardless of the AR engine, and just uses the most recent set of matrices.
 * @param {Object.<string, Array.<number>>} visibleObjects - set of {objectId: matrix} pairs, one per recognized target
 */
realityEditor.gui.ar.draw.update = function (visibleObjects) {
    if (realityEditor.device.environment.isObjectRenderingSuppressed()) {
        if (!this.prevSuppressedRendering) {
            let toolContainer = document.getElementById('GUI');
            let canvas = document.getElementById('canvas');
            let glcanvas = document.getElementById('glcanvas');
            let threejsCanvas = document.getElementById('mainThreejsCanvas');
            [toolContainer, canvas, glcanvas, threejsCanvas].forEach((eltToHide) => {
                eltToHide.classList.add('suppressedRendering');
            });
        }
        this.prevSuppressedRendering = true;
        return; // ignore render loop while suppressing renderer
    } else if (this.prevSuppressedRendering) {
        this.prevSuppressedRendering = false;
        // un-hide the hidden tools and canvases when suppressObjectRendering variable first changes
        let toolContainer = document.getElementById('GUI');
        let canvas = document.getElementById('canvas');
        let glcanvas = document.getElementById('glcanvas');
        let threejsCanvas = document.getElementById('mainThreejsCanvas');
        [toolContainer, canvas, glcanvas, threejsCanvas].forEach((eltToHide) => {
            eltToHide.classList.remove('suppressedRendering');
        });
    }

    if (
        !realityEditor.gui.ar.draw.frameNeedsToBeRendered &&
        realityEditor.device.environment.isWithinToolboxApp()
    ) {
        // don't recompute multiple times between a single animation frames (not compatible with WebXR)
        return;
    }
    realityEditor.gui.ar.draw.frameNeedsToBeRendered = false; // gets set back to true by requestAnimationFrame code

    var objectKey;
    var frameKey;
    var nodeKey;

    this.ar.utilities.timeSynchronizer(timeCorrection);

    if (globalStates.guiState === 'logic') {
        this.gui.crafting.redrawDataCrafting(); // todo maybe animation frame
    }

    // TODO: not currently used, needs to be adjusted to be useful
    // if (realityEditor.gui.settings.toggleStates.extendedTracking) {
    //     this.updateExtendedTrackingVisibility(visibleObjects);
    // }

    // allow other modules to modify the set of objects currently seen (except while frozen)
    if (!globalStates.freezeButtonState) {
        this.visibleObjectModifiers.forEach(function (callback) {
            callback(visibleObjects);
        });
    }

    // the included matrices aren't used anymore, but the list of object IDs is used to determine what to render
    this.visibleObjects = visibleObjects;

    // erases anything on the background canvas
    if (this.globalCanvas.hasContent === true) {
        this.globalCanvas.context.clearRect(
            0,
            0,
            this.globalCanvas.canvas.width,
            this.globalCanvas.canvas.height
        );
        this.globalCanvas.hasContent = false;
    }

    // make sure that all Spatial Questions are empty
    realityEditor.gui.spatial.clearSpatialList();

    // this is a quick hack but maybe needs to move somewhere else.
    // I dont know if this is the right spot. //TODO: what is this actually doing?
    for (objectKey in objects) {
        // if (this.doesObjectContainStickyFrame(objectKey) && !(objectKey in visibleObjects)) {
        if (
            realityEditor.getObject(objectKey).containsStickyFrame &&
            !(objectKey in visibleObjects)
        ) {
            visibleObjects[objectKey] = [];
        }
    }

    if (this.lowFrequencyUpdateCounter >= this.lowFrequencyUpdateCounterMax) {
        this.isLowFrequencyUpdateFrame = true;
        this.lowFrequencyUpdateCounter = 0;
    } else {
        this.isLowFrequencyUpdateFrame = false;
        this.lowFrequencyUpdateCounter++;
    }

    // checks if you detect an object with no frames within the viewport, so that you can provide haptic feedback

    let visibleNonWorldObjects = [];
    let worldObjectKeys = realityEditor.worldObjects.getWorldObjectKeys();
    Object.keys(visibleObjects).forEach(function (tempObjectKey) {
        if (!worldObjectKeys.includes(tempObjectKey)) {
            visibleNonWorldObjects.push(tempObjectKey);
        }
    });

    if (visibleNonWorldObjects.length > 0) {
        if (this.isLowFrequencyUpdateFrame) {
            if (realityEditor.gui.ar.utilities.getAllVisibleFramesFast().length === 0) {
                this.isObjectWithNoFramesVisible = true;
            } else {
                this.isObjectWithNoFramesVisible = false;
            }
        }
    } else {
        this.isObjectWithNoFramesVisible = false;
    }

    // each sceneGraphNode's local matrix gets updated with the visibleObjectMatrix in app/callbacks.js
    // so each frame, we just need to recompute everything's worldMatrix if their localMatrix changed
    realityEditor.sceneGraph.calculateFinalMatrices(Object.keys(visibleObjects));

    if (globalStates.inTransitionObject && globalStates.inTransitionFrame) {
        realityEditor.sceneGraph.calculateFinalMatrices([globalStates.inTransitionObject]);
    }

    realityEditor.gui.spatial.collectSpatialLists();

    // iterate over every object and decide whether or not to render it based on what the AR engine has detected
    for (objectKey in objects) {
        // if (!objects.hasOwnProperty(objectKey)) { continue; }

        this.activeObject = realityEditor.getObject(objectKey);
        if (!this.activeObject) {
            continue;
        }

        // for now, totally ignore avatar objects in the rendering engine
        // TODO: if we want to render tools relative to each avatar, we can remove this and add them to the visibleObjects list
        if (realityEditor.avatar.utils.isAvatarObject(this.activeObject)) {
            continue;
        }
        if (realityEditor.humanPose.utils.isHumanPoseObject(this.activeObject)) {
            continue;
        }

        // if this object was detected by the AR engine this frame, render its nodes and/or frames
        if (this.visibleObjects.hasOwnProperty(objectKey)) {
            // make the object visible
            this.activeObject.visibleCounter = timeForContentLoaded;
            this.setObjectVisible(this.activeObject, true);

            // TODO: check if this needs to be fixed for desktop, now that we have a different method for worldCorrection / world origins
            if (realityEditor.device.environment.shouldBroadcastUpdateObjectMatrix()) {
                if (realityEditor.gui.ar.draw.worldCorrection !== null) {
                    console.warn('Should never get here until we fix worldCorrection');
                    if (!this.activeObject.isWorldObject) {
                        // properly accounts for world correction
                        realityEditor.gui.ar.utilities.multiplyMatrix(
                            this.visibleObjects[objectKey],
                            realityEditor.gui.ar.utilities.invertMatrix(
                                realityEditor.gui.ar.draw.worldCorrection
                            ),
                            this.activeObject.matrix
                        );
                        // this.activeObject.matrix = realityEditor.gui.ar.utilities.copyMatrix(this.visibleObjects[objectKey]); // old version didn't include worldCorrection
                        realityEditor.network.realtime.broadcastUpdateObjectMatrix(
                            objectKey,
                            this.activeObject.matrix,
                            realityEditor.sceneGraph.getWorldId()
                        );
                    }
                }
            }

            // iterate over every frame it contains, add iframes if necessary, and update the iframe CSS3D matrix to render in correct position
            for (frameKey in objects[objectKey].frames) {
                this.activeFrame = realityEditor.getFrame(objectKey, frameKey);

                // allows backwards compatibility for frames that don't have a visualization property
                if (!this.activeFrame.hasOwnProperty('visualization')) {
                    this.activeFrame.visualization = 'ar';
                }

                this.activeKey = frameKey;
                this.activeVehicle = this.activeFrame;
                this.activeType = 'ui';

                // TODO ben: re-enable intended behavior
                // // I think this might be a hack and it could be done in a much better way.
                // if(!this.modelViewMatrices[objectKey][0] && this.activeFrame.fullScreen !== 'sticky' ){
                //     this.hideTransformed(this.activeKey, this.activeVehicle, this.globalDOMCache, this.cout);
                //     continue;
                // }

                // perform all the 3D calculations and CSS updates to actually show the frame and render in the correct position
                this.drawTransformed(
                    objectKey,
                    this.activeKey,
                    this.activeType,
                    this.activeVehicle,
                    this.notLoading,
                    this.globalDOMCache,
                    this.globalStates,
                    this.globalCanvas,
                    this.activeObjectMatrix,
                    this.matrix,
                    this.finalMatrix,
                    this.utilities,
                    this.cout
                );

                // if a DOM element hasn't been added for this frame yet, add it and load the correct src into an iframe
                var frameUrl = realityEditor.network.getURL(
                    this.activeObject.ip,
                    realityEditor.network.getPort(objects[objectKey]),
                    '/obj/' + this.activeObject.name + '/frames/' + this.activeFrame.name + '/'
                );
                this.addElement(
                    frameUrl,
                    objectKey,
                    frameKey,
                    null,
                    this.activeType,
                    this.activeVehicle
                );

                // if we're not viewing frames (e.g. should be viewing nodes instead), hide the frame
                if (globalStates.guiState !== 'ui') {
                    this.hideTransformed(
                        this.activeKey,
                        this.activeVehicle,
                        this.globalDOMCache,
                        this.cout
                    );
                }

                // iterate over every node in this frame, and perform the same rendering process as for the frames
                for (nodeKey in this.activeFrame.nodes) {
                    // render the nodes if we're in node/logic viewing mode
                    if (globalStates.guiState === 'node' || globalStates.guiState === 'logic') {
                        this.activeNode = realityEditor.getNode(objectKey, frameKey, nodeKey);
                        this.activeKey = nodeKey;
                        this.activeVehicle = this.activeNode;
                        this.activeType = this.activeNode.type;

                        // nodes of certain types are invisible and don't need to be rendered (e.g. storeData nodes)
                        if (this.hiddenNodeTypes.indexOf(this.activeType) > -1) {
                            continue;
                        }
                        // the above check is deprecated: new nodes will have an invisible property
                        if (this.activeNode.invisible) {
                            continue;
                        }

                        // perform all the 3D calculations and CSS updates to actually show the node and render in the correct position
                        this.drawTransformed(
                            objectKey,
                            this.activeKey,
                            this.activeType,
                            this.activeVehicle,
                            this.notLoading,
                            this.globalDOMCache,
                            this.globalStates,
                            this.globalCanvas,
                            this.activeObjectMatrix,
                            this.matrix,
                            this.finalMatrix,
                            this.utilities,
                            this.cout
                        );

                        // if a DOM element hasn't been added for this node yet, add it and load the correct src into an iframe
                        var nodeUrl = realityEditor.network.getURL(
                            this.activeObject.ip,
                            realityEditor.network.getPort(objects[objectKey]),
                            '/nodes/' + this.activeType + '/index.html'
                        );
                        this.addElement(
                            nodeUrl,
                            objectKey,
                            frameKey,
                            nodeKey,
                            this.activeType,
                            this.activeVehicle
                        );
                    } else {
                        // if we're not in node/logic viewing mode, hide the nodes
                        this.activeNode = realityEditor.getNode(objectKey, frameKey, nodeKey);
                        this.activeKey = nodeKey;
                        this.activeVehicle = this.activeNode;
                        this.hideTransformed(
                            this.activeKey,
                            this.activeVehicle,
                            this.globalDOMCache,
                            this.cout
                        );
                    }
                }
            }

            // if this object was NOT detected by the AR engine, hide its nodes and frames or perform edge-case functionality
            // check if objectVisible so that this only happens once for each object
        } else if (this.activeObject.objectVisible) {
            // setting objectVisible = false makes sure we don't unnecessarily repeatedly hide it
            realityEditor.gui.ar.draw.setObjectVisible(this.activeObject, false);

            var wereAnyFramesMovedToGlobal = false;

            for (frameKey in objects[objectKey].frames) {
                //  if (!objects[objectKey].frames.hasOwnProperty(frameKey)) { continue; }

                this.activeFrame = realityEditor.getFrame(objectKey, frameKey);
                if (!this.activeFrame) {
                    continue;
                }

                this.activeKey = frameKey;
                this.activeVehicle = this.activeFrame;
                this.activeType = 'ui';

                // preserve frame globally when its object disappears if it is being moved in unconstrained editing
                if (
                    realityEditor.device.isEditingUnconstrained(this.activeVehicle) &&
                    this.activeVehicle.location === 'global'
                ) {
                    wereAnyFramesMovedToGlobal = true;
                    globalStates.inTransitionObject = objectKey;
                    globalStates.inTransitionFrame = frameKey;

                    // if not unconstrained editing a global frame, hide it
                } else {
                    var startingMatrix = realityEditor.device.editingState.startingMatrix;

                    // unconstrained editing local frame - can't transition to global, but reset its matrix to what it was before starting to edit
                    if (
                        realityEditor.device.isEditingUnconstrained(this.activeVehicle) &&
                        startingMatrix
                    ) {
                        realityEditor.sceneGraph
                            .getSceneNodeById(frameKey)
                            .setLocalMatrix(startingMatrix);
                    }

                    // hide the frame
                    this.hideTransformed(
                        this.activeKey,
                        this.activeVehicle,
                        this.globalDOMCache,
                        this.cout
                    );

                    // hide each node within this frame
                    for (nodeKey in this.activeFrame.nodes) {
                        //  if (!this.activeFrame.nodes.hasOwnProperty(nodeKey)) { continue; }

                        this.activeNode = realityEditor.getNode(objectKey, frameKey, nodeKey);
                        this.activeKey = nodeKey;
                        this.activeVehicle = this.activeNode;
                        this.activeType = this.activeNode.type;

                        // unconstrained editing local node - can't transition to global, but reset its matrix to what it was before starting to edit
                        if (
                            realityEditor.device.isEditingUnconstrained(this.activeNode) &&
                            startingMatrix
                        ) {
                            realityEditor.sceneGraph
                                .getSceneNodeById(nodeKey)
                                .setLocalMatrix(startingMatrix);
                        }

                        // hide the node
                        this.hideTransformed(
                            this.activeKey,
                            this.activeVehicle,
                            this.globalDOMCache,
                            this.cout
                        );
                    }
                }
            }

            // remove editing states related to this object (unless transitioned a frame to global)
            if (
                !wereAnyFramesMovedToGlobal &&
                realityEditor.device.editingState.object === objectKey
            ) {
                realityEditor.device.resetEditingState();
            }

            // if this object was NOT detected by the AR engine, AND its frames/nodes have already been hidden, continuously
            // continuously check if enough time has passed to completely kill its content from the DOM
        } else {
            this.killObjects(this.activeKey, this.activeObject, this.globalDOMCache);
        }
    }

    // draw all lines - links and cutting lines
    if (globalStates.guiState === 'node' || globalStates.guiState === 'logic') {
        // render each link
        realityEditor.forEachFrameInAllObjects(function (objectKey, frameKey) {
            realityEditor.gui.ar.lines.drawAllLines(
                realityEditor.getFrame(objectKey, frameKey),
                globalCanvas.context
            );
        });

        // render the cutting line if you are dragging on the background (not in editing mode)
        if (!globalStates.editingMode) {
            this.ar.lines.drawInteractionLines();
        }
    }

    // render the frame that was pulled off of one object and is being moved through global space to a new object
    if (globalStates.inTransitionObject && globalStates.inTransitionFrame) {
        this.activeObject = objects[globalStates.inTransitionObject];
        this.activeObject.visibleCounter = timeForContentLoaded;
        this.activeObject.objectVisible = true;

        objectKey = globalStates.inTransitionObject;
        frameKey = globalStates.inTransitionFrame;

        this.activeObjectMatrix = [];

        // TODO: finish this new method of transferring frames immediately so they can be pushed into screens in one motion
        /*
        var numObjectsVisible =  Object.keys(this.visibleObjects).length;
        var areAnyObjectsVisible = numObjectsVisible > 0;
        var isSingleObjectVisible = numObjectsVisible === 1;
        var isSingleScreenObjectVisible = false;
        var isDifferentSingleScreenObjectVisible = false;
        
        if (isSingleObjectVisible) {
            var visibleObjectKey = Object.keys(this.visibleObjects)[0];
            var visibleObject = realityEditor.getObject(visibleObjectKey);
            isSingleScreenObjectVisible = visibleObject.visualization === 'screen';
            isDifferentObjectVisible = visibleObjectKey !== globalStates.inTransitionObject;
            if (isSingleScreenObjectVisible && isDifferentObjectVisible) {
                console.log('should attach to new object now');
            }
        }
        */

        // render the transition frame even if its object is not visible
        if (!this.visibleObjects.hasOwnProperty(objectKey)) {
            this.activeFrame = this.activeObject.frames[frameKey];
            this.activeKey = frameKey;
            this.activeObjectMatrix = this.activeFrame.temp;

            this.drawTransformed(
                objectKey,
                this.activeKey,
                this.activeType,
                this.activeFrame,
                this.notLoading,
                this.globalDOMCache,
                this.globalStates,
                this.globalCanvas,
                this.activeObjectMatrix,
                this.matrix,
                this.finalMatrix,
                this.utilities,
                this.cout
            );
        }
    }

    // if needed, reset acceleration data from devicemotion events
    if (globalStates.acceleration.motion !== 0) {
        globalStates.acceleration = {
            x: 0,
            y: 0,
            z: 0,
            alpha: 0,
            beta: 0,
            gamma: 0,
            motion: 0,
        };
    }

    // Adds a pulsing vibration that you can feel when you are looking at an object that has no frames.
    // Provides haptic feedback to give you the confidence that you can add frames to what you are looking at.
    if (this.isObjectWithNoFramesVisible) {
        var closestObject = realityEditor.getObject(realityEditor.gui.ar.getClosestObject()[0]);
        if (closestObject && !closestObject.isWorldObject) {
            var delay = closestObject.isWorldObject ? 1000 : 500;
            if (!visibleObjectTapInterval || delay !== visibleObjectTapDelay) {
                // tap once, immediately
                realityEditor.app.tap();

                clearInterval(visibleObjectTapInterval);
                visibleObjectTapInterval = null;

                // then tap every 0.5 seconds if you're looking at an image/object target
                // or every 1 seconds if you're looking at the world object
                visibleObjectTapInterval = setInterval(function () {
                    if (!globalStates.freezeButtonState) {
                        const TAP_WHEN_NO_FRAMES_VISIBLE = false;
                        if (TAP_WHEN_NO_FRAMES_VISIBLE) {
                            realityEditor.app.tap();
                        }
                    }
                }, delay);

                // keep track of the the tap delay used, so that you can adjust the interval when switching between world and image targets
                visibleObjectTapDelay = delay;
            }
        }
    } else {
        if (visibleObjectTapInterval) {
            clearInterval(visibleObjectTapInterval);
            visibleObjectTapInterval = null;
        }
    }

    if (this.closestObjectListeners.length > 0 && this.isLowFrequencyUpdateFrame) {
        var newClosestObject = realityEditor.gui.ar.getClosestObject()[0];
        if (newClosestObject !== this.currentClosestObject) {
            this.closestObjectListeners.forEach(
                function (callback) {
                    callback(this.currentClosestObject, newClosestObject);
                }.bind(this)
            );
            this.currentClosestObject = newClosestObject;
        }
    }

    // make the update loop extensible by additional services that wish to subscribe to matrix updates
    this.updateListeners.forEach(function (callback) {
        // warning: sends a reference to the original set of matrices, for performance reasons, instead of a deep clone.
        // services that subscribe to this are responsible to not mutate this object.
        callback(realityEditor.gui.ar.draw.visibleObjects);
    });
};

realityEditor.gui.ar.draw.closestObjectListeners = [];

/**
 * Adds a callback that will be triggered whenever the closest object changes
 * @param {function<string, string>} callback - first parameter is old closest object, second is new
 */
realityEditor.gui.ar.draw.onClosestObjectChanged = function (callback) {
    this.closestObjectListeners.push(callback);
};

/**
 * Detach the oldFrameKey frame from oldObjectKey object,
 * and attach instead to newObjectKey object, assigning it a new uuid of newFrameKey.
 * Also needs to rename all of its nodes with correct paths,
 * update all relevant DOM element ids,
 * possibly update the editing state and screen object pointers,
 * delete the old frame from the old object server and upload to the new object server,
 * and modify all of the links going to and from its nodes,
 * syncing links with the server so that data gets routed correctly.
 * @param {string} oldObjectKey
 * @param {string} oldFrameKey
 * @param {string} newObjectKey
 * @param {string} newFrameKey
 */
realityEditor.gui.ar.draw.moveFrameToNewObject = function (
    oldObjectKey,
    oldFrameKey,
    newObjectKey,
    newFrameKey
) {
    if (oldObjectKey === newObjectKey && oldFrameKey === newFrameKey) return; // don't need to do anything

    var oldObject = realityEditor.getObject(oldObjectKey);
    var newObject = realityEditor.getObject(newObjectKey);

    var frame = realityEditor.getFrame(oldObjectKey, oldFrameKey);

    if (frame.location !== 'global') {
        console.warn('WARNING: TRYING TO DELETE A LOCAL FRAME');
        return;
    }

    // invalidate vehicleKeyCache
    delete realityEditor.vehicleKeyCache[oldFrameKey];

    let frameSceneNode = realityEditor.sceneGraph.getSceneNodeById(oldFrameKey);
    // this will recompute a new position for it so it stays in same place relative to camera/world
    realityEditor.sceneGraph.changeParent(frameSceneNode, newObjectKey, true);
    realityEditor.sceneGraph.changeId(frameSceneNode, newFrameKey);

    // rename nodes and give new keys
    var newNodes = {};
    for (var oldNodeKey in frame.nodes) {
        var node = frame.nodes[oldNodeKey];
        var newNodeKey = newFrameKey + node.name;
        node.objectId = newObjectKey;
        node.frameId = newFrameKey;
        node.uuid = newNodeKey;
        newNodes[node.uuid] = node;
        delete frame.nodes[oldNodeKey];

        // invalidate vehicleKeyCache
        delete realityEditor.vehicleKeyCache[oldNodeKey];

        // update the scene graph
        let nodeSceneNode = realityEditor.sceneGraph.getSceneNodeById(oldNodeKey);
        realityEditor.sceneGraph.changeId(nodeSceneNode, newNodeKey);

        // update the DOM elements for each node
        // (only if node has been loaded to DOM already - doesn't happen if haven't ever switched to node view)
        if (globalDOMCache[oldNodeKey]) {
            // update their keys in the globalDOMCache
            globalDOMCache['object' + newNodeKey] = globalDOMCache['object' + oldNodeKey];
            globalDOMCache['iframe' + newNodeKey] = globalDOMCache['iframe' + oldNodeKey];
            globalDOMCache[newNodeKey] = globalDOMCache[oldNodeKey];
            globalDOMCache['svg' + newNodeKey] = globalDOMCache['svg' + oldNodeKey];
            delete globalDOMCache['object' + oldNodeKey];
            delete globalDOMCache['iframe' + oldNodeKey];
            delete globalDOMCache[oldNodeKey];
            delete globalDOMCache['svg' + oldNodeKey];

            // re-assign ids to DOM elements
            globalDOMCache['object' + newNodeKey].id = 'object' + newNodeKey;
            globalDOMCache['iframe' + newNodeKey].id = 'iframe' + newNodeKey;
            globalDOMCache[newNodeKey].id = newNodeKey;
            globalDOMCache[newNodeKey].objectId = newObjectKey;
            globalDOMCache[newNodeKey].frameId = newFrameKey;
            globalDOMCache[newNodeKey].nodeId = newNodeKey;
            globalDOMCache['svg' + newNodeKey].id = 'svg' + newNodeKey;

            // update iframe attributes
            globalDOMCache['iframe' + newNodeKey].setAttribute('data-frame-key', newFrameKey);
            globalDOMCache['iframe' + newNodeKey].setAttribute('data-object-key', newObjectKey);
            globalDOMCache['iframe' + newNodeKey].setAttribute('data-node-key', newNodeKey);

            globalDOMCache['iframe' + newNodeKey].setAttribute(
                'onload',
                'realityEditor.network.onElementLoad("' +
                    newObjectKey +
                    '","' +
                    newFrameKey +
                    '","' +
                    newNodeKey +
                    '")'
            );
            try {
                let reloadSrc = globalDOMCache['iframe' + newNodeKey].src;
                globalDOMCache['iframe' + newNodeKey].src = reloadSrc; // this is intentionally the same src
            } catch (e) {
                console.warn('error reloading node src for ' + newNodeKey);
            }
        } else {
            node.loaded = false;
        }
    }

    frame.nodes = newNodes;
    frame.objectId = newObjectKey;
    frame.uuid = newFrameKey;

    // update any variables in the application with the old keys to use the new keys
    if (realityEditor.device.editingState.object === oldObjectKey) {
        realityEditor.device.editingState.object = newObjectKey;
    }
    if (realityEditor.device.editingState.frame === oldFrameKey) {
        realityEditor.device.editingState.frame = newFrameKey;
    }
    if (realityEditor.gui.screenExtension.screenObject.object === oldObjectKey) {
        realityEditor.gui.screenExtension.screenObject.object = newObjectKey;
    }
    if (realityEditor.gui.screenExtension.screenObject.frame === oldFrameKey) {
        realityEditor.gui.screenExtension.screenObject.frame = newFrameKey;
    }

    // update the DOM elements for the frame with new ids
    // (only if node has been loaded to DOM already - doesn't happen if haven't ever switched to ui view)
    if (globalDOMCache[oldFrameKey]) {
        // update their keys in the globalDOMCache
        globalDOMCache['object' + newFrameKey] = globalDOMCache['object' + oldFrameKey];
        globalDOMCache['iframe' + newFrameKey] = globalDOMCache['iframe' + oldFrameKey];
        globalDOMCache[newFrameKey] = globalDOMCache[oldFrameKey];
        globalDOMCache['svg' + newFrameKey] = globalDOMCache['svg' + oldFrameKey];

        // re-assign ids to DOM elements
        globalDOMCache['object' + newFrameKey].id = 'object' + newFrameKey;
        globalDOMCache['iframe' + newFrameKey].id = 'iframe' + newFrameKey;
        globalDOMCache[newFrameKey].id = newFrameKey;
        globalDOMCache[newFrameKey].objectId = newObjectKey;
        globalDOMCache[newFrameKey].frameId = newFrameKey;
        globalDOMCache['svg' + newFrameKey].id = 'svg' + newFrameKey;

        // update iframe attributes
        globalDOMCache['iframe' + newFrameKey].setAttribute('data-frame-key', newFrameKey);
        globalDOMCache['iframe' + newFrameKey].setAttribute('data-object-key', newObjectKey);

        globalDOMCache['iframe' + newFrameKey].setAttribute(
            'onload',
            'realityEditor.network.onElementLoad("' +
                newObjectKey +
                '","' +
                newFrameKey +
                '","' +
                null +
                '")'
        );

        var newSrc = realityEditor.network.availableFrames.getFrameSrc(newObjectKey, frame.src);
        try {
            globalDOMCache['iframe' + newFrameKey].src = newSrc;
        } catch (e) {
            console.warn('error reloading frame src for ' + newFrameKey);
        }
    } else {
        frame.loaded = false;
    }

    // add the frame to the new object and post the new frame on the server (must exist there before we can update the links)
    objects[newObjectKey].frames[newFrameKey] = frame;
    var newObjectIP = realityEditor.getObject(newObjectKey).ip;
    realityEditor.network.postNewFrame(newObjectIP, newObjectKey, frame, function (err) {
        if (err) {
            console.warn('server returned error when moving frame to new object');
        }

        // update all links locally and on the server
        // loop through all frames
        realityEditor.forEachFrameInAllObjects(function (thatObjectKey, thatFrameKey) {
            var thatFrame = realityEditor.getFrame(thatObjectKey, thatFrameKey);

            // loop through all links in that frame
            for (var linkKey in thatFrame.links) {
                var link = thatFrame.links[linkKey];
                var didLinkChange = false;

                // update the start of the link
                if (link.objectA === oldObjectKey && link.frameA === oldFrameKey) {
                    link.objectA = newObjectKey;
                    link.frameA = newFrameKey;
                    link.nodeA = newFrameKey + link.namesA[2];
                    link.namesA[0] = newObject.name;
                    didLinkChange = true;
                }

                // update the end of the link
                if (link.objectB === oldObjectKey && link.frameB === oldFrameKey) {
                    link.objectB = newObjectKey;
                    link.frameB = newFrameKey;
                    link.nodeB = newFrameKey + link.namesB[2];
                    link.namesB[0] = newObject.name;
                    didLinkChange = true;
                }

                // only change the link on the server if its objectA or objectB changed
                if (didLinkChange) {
                    var linkObjectIP = realityEditor.getObject(thatObjectKey).ip;
                    // remove link from old frame (locally and on the server)
                    delete thatFrame.links[linkKey];
                    realityEditor.network.deleteLinkFromObject(
                        linkObjectIP,
                        thatObjectKey,
                        thatFrameKey,
                        linkKey
                    );
                    // add link to new frame (locally and on the server -- post link to server adds it locally too)
                    realityEditor.network.postLinkToServer(link, linkKey);
                }
            }
        });

        // update the publicData on the server to point to the new path
        if (publicDataCache.hasOwnProperty(oldFrameKey)) {
            // update locally
            publicDataCache[newFrameKey] = publicDataCache[oldFrameKey];
            delete publicDataCache[oldFrameKey];

            // update on the server
            realityEditor.network.deletePublicData(oldObject.ip, oldObjectKey, oldFrameKey);
            realityEditor.network.postPublicData(
                newObject.ip,
                newObjectKey,
                newFrameKey,
                publicDataCache[newFrameKey]
            );
        }

        // remove the frame from the old object
        delete objects[oldObjectKey].frames[oldFrameKey];
        realityEditor.network.deleteFrameFromObject(oldObject.ip, oldObjectKey, oldFrameKey);
    });
};

/**
 * When a transition frame is dropped somewhere it cannot be transferred to (empty space, no object visible),
 * returns the frame back to the position where it came from. Update state and remove DOM elements if necessary.
 */
realityEditor.gui.ar.draw.returnTransitionFrameBackToSource = function () {
    var frameInMotion = realityEditor.getFrame(
        globalStates.inTransitionObject,
        globalStates.inTransitionFrame
    );
    realityEditor.gui.ar.draw.hideTransformed(
        globalStates.inTransitionFrame,
        frameInMotion,
        globalDOMCache,
        cout
    );

    if (realityEditor.device.editingState.startingMatrix) {
        realityEditor.sceneGraph
            .getSceneNodeById(globalStates.inTransitionFrame)
            .setLocalMatrix(realityEditor.device.editingState.startingMatrix);
    }

    // TODO: remove temp and begin now that scene graph handles positioning
    frameInMotion.temp = realityEditor.gui.ar.utilities.newIdentityMatrix();
    frameInMotion.begin = realityEditor.gui.ar.utilities.newIdentityMatrix();

    // update any variables in the application with the old keys to use the new keys
    // TODO: do these need to be set here or will they update automatically elsewhere?
    if (realityEditor.gui.screenExtension.screenObject.object === globalStates.inTransitionObject)
        realityEditor.gui.screenExtension.screenObject.object = null;
    if (realityEditor.gui.screenExtension.screenObject.frame === globalStates.inTransitionFrame)
        realityEditor.gui.screenExtension.screenObject.frame = null;

    globalStates.inTransitionObject = null;
    globalStates.inTransitionFrame = null;
};

/**
 * When an inTransitionFrame is dropped onto an object, assign it new matrices to try to preserve its position,
 * and call the moveFrameToNewObject function to do the majority of the work of reassigning it to the new object
 * @param {string} oldObjectKey
 * @param {string} oldFrameKey
 * @param {string} newObjectKey
 * @param {string} newFrameKey
 */
realityEditor.gui.ar.draw.moveTransitionFrameToObject = function (
    oldObjectKey,
    oldFrameKey,
    newObjectKey,
    newFrameKey
) {
    this.moveFrameToNewObject(oldObjectKey, oldFrameKey, newObjectKey, newFrameKey);
    globalStates.inTransitionObject = null;
    globalStates.inTransitionFrame = null;
};

/**
 * (One of the most important and heavily-used functions in the Editor.)
 * Renders a specific frame or node with the correct CSS3D transformations based on all application state.
 * Also determines if the DOM element needs to be shown or hidden.
 * The long list of parameters is for optimization purposes. Using a local variable is faster than a global one,
 *   so references to many global variables are passed in as shortcuts. This function gets called 60 FPS for every
 *   frame and node on any currently-visible objects, so small optimizations here make a big difference on performance.
 * @param modelViewMatrices - contains the modelview matrices for visible objects
 * @param objectKey - the uuid of the object that this frame or node belongs to
 * @param activeKey - the uuid of the frame or node to render
 * @param activeType - 'node' or 'ui' depending on if it's a node or frame element
 * @param activeVehicle - the Frame or Node reference. "Vehicle" means "Frame or Node". (something you can move)
 * @param notLoading - starts false when this vehicle's element is initialized. gets set to the vehicle's uuid when it loads
 * @param globalDOMCache - reference to global variable
 * @param globalStates - reference to global variable
 * @param globalCanvas - reference to global variable
 * @param activeObjectMatrix - the result of multiplying the object's modelview matrix, the projection matrix, and the screen rotation matrix
 * @param matrix - object containing several matrix references that can be used as temporary registers for multiplication results.
 *      includes matrix.temp, matrix.begin, matrix.end, matrix.r, matrix.r2, and matrix.r3
 * @param finalMatrix - stores the resulting final CSS3D matrix for the vehicle @todo this doesnt seem to be used anywhere?
 * @param utilities - reference to realityEditor.gui.ar.utilities
 * @param _cout - reference to debug logging function (unused)
 */
realityEditor.gui.ar.draw.drawTransformed = function (
    objectKey,
    activeKey,
    activeType,
    activeVehicle,
    notLoading,
    globalDOMCache,
    globalStates,
    globalCanvas,
    activeObjectMatrix,
    matrix,
    finalMatrix,
    utilities,
    _cout
) {
    // it's ok if the frame isn't visible anymore if we're in the node view - render it anyways
    var shouldRenderFramesInNodeView = globalStates.guiState === 'node' && activeType === 'ui'; // && globalStates.renderFrameGhostsInNodeViewEnabled;

    if (
        notLoading !== activeKey &&
        activeVehicle.loaded === true &&
        activeVehicle.visualization !== 'screen'
    ) {
        //todo this reference can be faster when taking the local
        var editingVehicle = realityEditor.device.getEditingVehicle();
        var thisIsBeingEdited = editingVehicle === activeVehicle;

        var activePocketFrameWaiting =
            activeVehicle === pocketFrame.vehicle && pocketFrame.waitingToRender;
        var activePocketNodeWaiting =
            activeVehicle === pocketNode.vehicle && pocketNode.waitingToRender;

        // make visible a frame or node if it was previously hidden
        // waits to make visible until positionOnLoad has been applied, to avoid one frame rendered in wrong position
        if (
            !shouldRenderFramesInNodeView &&
            !activeVehicle.visible &&
            !(activePocketFrameWaiting || activePocketNodeWaiting)
        ) {
            activeVehicle.visible = true;

            var container = globalDOMCache['object' + activeKey];
            let iFrame = globalDOMCache['iframe' + activeKey];
            var overlay = globalDOMCache[activeKey];
            var canvas = globalDOMCache['svg' + activeKey];

            if (!container) {
                activeVehicle.loaded = false;
                return;
            }

            if (activeType === 'ui') {
                container.classList.remove('hiddenFrameContainer');
                container.classList.add('visibleFrameContainer');
                container.classList.remove('displayNone');
            } else {
                container.classList.remove('hiddenNodeContainer');
                container.classList.add('visibleNodeContainer');
            }

            iFrame.classList.remove('hiddenFrame');
            iFrame.classList.add('visibleFrame');

            overlay.style.visibility = 'visible';

            if (globalStates.editingMode) {
                canvas.classList.add('visibleEditingSVG');
                // canvas.style.visibility = 'visible';
                // canvas.style.display = 'inline';

                overlay.querySelector('.corners').style.visibility = 'visible';
            } else {
                // canvas.style.display = 'none';
                canvas.classList.remove('visibleEditingSVG');

                overlay.querySelector('.corners').style.visibility = 'hidden';
            }

            if (activeType === 'ui') {
                iFrame.contentWindow.postMessage(
                    JSON.stringify({
                        visibility: 'visible',
                        interface: globalStates.interface,
                    }),
                    '*'
                );
            }

            if (activeType === 'logic' && objectKey !== 'pocket') {
                if (activeVehicle.animationScale === 1) {
                    globalDOMCache['logic' + activeKey].className = 'mainEditing scaleOut';
                    activeVehicle.animationScale = 0;
                }
            }

            // re-activate the activeScreenObject when it reappears
            var screenExtension = realityEditor.gui.screenExtension;
            if (screenExtension.registeredScreenObjects[activeKey]) {
                if (!screenExtension.visibleScreenObjects.hasOwnProperty(activeKey)) {
                    screenExtension.visibleScreenObjects[activeKey] = {
                        object: objectKey,
                        frame: activeKey,
                        node: null,
                        x: 0,
                        y: 0,
                        touches: null,
                    };
                }
            }
        }

        // render visible frame/node
        if (
            activeVehicle.visible ||
            shouldRenderFramesInNodeView ||
            activePocketFrameWaiting ||
            activePocketNodeWaiting
        ) {
            // safety mechanism to prevent bugs where tries to manipulate a DOM element that doesn't exist
            if (!globalDOMCache['object' + activeKey]) {
                activeVehicle.visible = false;
                return;
            }

            if (globalDOMCache['object' + activeKey].classList.contains('displayNone')) {
                // TODO: speedup with flag
                globalDOMCache['object' + activeKey].classList.remove('displayNone');
                console.warn('removing displayNone in drawTransformed, should happen before this');
            }

            // push matrices into iframe as early as possible to reduce lag
            // these coordinate systems are based purely on the scene graph, so they can happen early in this function
            if (activeType === 'ui') {
                realityEditor.network.frameContentAPI.sendCoordinateSystemsToIFrame(
                    activeVehicle.objectId,
                    activeVehicle.uuid
                );
            }

            // can't change while frozen so don't recalculate
            if (
                realityEditor.device.environment.supportsDistanceFading() &&
                (!globalStates.freezeButtonState ||
                    realityEditor.device.environment.ignoresFreezeButton())
            ) {
                // fade out frames and nodes when they move beyond a certain distance
                var distance = realityEditor.sceneGraph.getDistanceToCamera(activeKey); //activeVehicle.screenZ;
                var distanceScale = realityEditor.gui.ar.getDistanceScale(activeVehicle);
                // multiply the default min distance by the amount this frame distance has been scaled up
                var distanceThreshold =
                    distanceScale * realityEditor.device.distanceScaling.getDefaultDistance();
                var isDistantVehicle = distance > distanceThreshold;
                var isAlmostDistantVehicle = distance > distanceThreshold * 0.8;

                // hide visuals if not already hidden
                if (isDistantVehicle && activeVehicle.screenOpacity !== 0) {
                    globalDOMCache['object' + activeKey].classList.add('distantFrame');
                    activeVehicle.screenOpacity = 0;
                } else if (!isDistantVehicle) {
                    // show visuals if not already shown
                    if (activeVehicle.screenOpacity === 0) {
                        globalDOMCache['object' + activeKey].classList.remove('distantFrame'); // show again, but fade out opacity if within a narrow threshold
                    }

                    if (isAlmostDistantVehicle) {
                        // full opacity if within 80% of the threshold. fades out linearly to zero opacity at 100% of the threshold
                        var opacity =
                            1.0 - (distance - 0.8 * distanceThreshold) / (0.2 * distanceThreshold);
                        globalDOMCache['object' + activeKey].style.opacity = opacity;
                        activeVehicle.screenOpacity = opacity;
                    } else {
                        // remove the CSS property so it doesn't override other classes added to this frame/node
                        globalDOMCache['object' + activeKey].style.opacity = '';
                        activeVehicle.screenOpacity = 1;
                    }
                }
            }

            if (typeof activeVehicle.isPendingInitialPlacement !== 'undefined') {
                let touchPosition = realityEditor.gui.ar.positioning.getMostRecentTouchPosition();
                realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(
                    activeVehicle,
                    touchPosition.x,
                    touchPosition.y,
                    true
                );
                let keys = activeVehicle.isPendingInitialPlacement;
                realityEditor.device.beginTouchEditing(keys.objectKey, keys.frameKey, keys.nodeKey);
                delete activeVehicle.isPendingInitialPlacement;
            }

            // set initial position of frames and nodes placed in from pocket
            // 1. drop directly onto target plane if in freeze state (or quick-tapped the frame)
            // 2. otherwise float in unconstrained slightly in front of the editor camera
            // 3. animate so it looks like it is being pushed from pocket
            if (
                activePocketNodeWaiting &&
                typeof activeVehicle.mostRecentFinalMatrix !== 'undefined'
            ) {
                this.addPocketVehicle(pocketNode);
            }
            if (
                activePocketFrameWaiting &&
                typeof activeVehicle.mostRecentFinalMatrix !== 'undefined'
            ) {
                this.addPocketVehicle(pocketFrame);
            }

            if (globalStates.editingMode || thisIsBeingEdited) {
                // show the svg overlay if needed (doesn't always get added correctly in the beginning so this is the safest way to ensure it appears)
                var svg = globalDOMCache['svg' + activeKey];
                if (svg.children.length === 0) {
                    let iFrame = globalDOMCache['iframe' + activeKey];
                    svg.style.width = iFrame.style.width;
                    svg.style.height = iFrame.style.height;
                    realityEditor.gui.ar.moveabilityOverlay.createSvg(svg);
                }

                // TODO ben: what are these?
                // todo test if this can be made touch related
                // if (activeType === "logic") {
                //      utilities.copyMatrixInPlace(activeObjectMatrix, activeVehicle.temp);
                // }

                if (realityEditor.device.isEditingUnconstrained(activeVehicle)) {
                    let sceneNode = realityEditor.sceneGraph.getSceneNodeById(activeKey);
                    let cameraNode = realityEditor.sceneGraph.getSceneNodeById('CAMERA');

                    // TODO: also show "shadow" on ground plane on remote operator while moving, to help position it

                    // when you first trigger unconstrained repositioning, attach the tool to the camera so that its
                    // matrix gets stored "frozen" relative to the camera and moves with it
                    if (matrix.copyStillFromMatrixSwitch) {
                        let relativeMatrix = sceneNode.getMatrixRelativeTo(cameraNode);
                        activeVehicle.begin = utilities.copyMatrix(relativeMatrix); // todo: do we still need the .begin matrix?
                        matrix.copyStillFromMatrixSwitch = false;
                        realityEditor.sceneGraph.changeParent(sceneNode, 'CAMERA', true);
                    }

                    // this forces it to broadcast its position in realtime to other clients
                    sceneNode.setLocalMatrix(sceneNode.localMatrix);
                }
            }

            // TODO ben: add in animation matrix
            // multiply in the animation matrix if you are editing this frame in unconstrained mode.
            // in the future this can be expanded but currently this is the only time it gets animated.
            // if (realityEditor.device.isEditingUnconstrained(activeVehicle)) {
            //     var animatedFinalMatrix = [];
            //     utilities.multiplyMatrix(finalMatrix, editingAnimationsMatrix, animatedFinalMatrix);
            //     utilities.copyMatrixInPlace(animatedFinalMatrix, finalMatrix);
            // }

            // TODO: do this on frame touch up (snap position when editing ends), or if unconstrained editing (visual feedback when ready to snap)
            // this.snapFrameMatrixIfNecessary(activeVehicle, activeKey);

            // we want nodes closer to camera to have higher z-coordinate, so that they are rendered in front
            // but we want all of them to have a positive value so they are rendered in front of background canvas
            // and frames with developer=false should have the lowest positive value

            finalMatrix = utilities.copyMatrix(realityEditor.sceneGraph.getCSSMatrix(activeKey));

            if (activeVehicle.alwaysFaceCamera === true) {
                // this gives a pretty good billboard effect, as long as you aren't looking from top-down
                let modelMatrix = realityEditor.sceneGraph.getModelMatrixLookingAt(
                    activeKey,
                    'CAMERA'
                );
                let modelViewMatrix = [];
                utilities.multiplyMatrix(
                    modelMatrix,
                    realityEditor.sceneGraph.getViewMatrix(),
                    modelViewMatrix
                );

                // In AR mode, we need to use this lookAt method, because camera up vec doesn't always match scene up vec
                if (realityEditor.device.environment.isARMode()) {
                    utilities.multiplyMatrix(
                        modelViewMatrix,
                        globalStates.projectionMatrix,
                        finalMatrix
                    );
                } else {
                    // the lookAt method isn't perfect – it has a singularity as you approach top or bottom
                    // so let's correct the scale and remove the rotation – this works on desktop because camera up = scene up
                    let scale = realityEditor.sceneGraph
                        .getSceneNodeById(activeKey)
                        .getVehicleScale();
                    let constructedModelViewMatrix = [
                        scale,
                        0,
                        0,
                        0,
                        0,
                        -scale,
                        0,
                        0,
                        0,
                        0,
                        scale,
                        0,
                        modelViewMatrix[12],
                        modelViewMatrix[13],
                        modelViewMatrix[14],
                        1,
                    ];
                    utilities.multiplyMatrix(
                        constructedModelViewMatrix,
                        globalStates.projectionMatrix,
                        finalMatrix
                    );
                }
            }

            // TODO ben: sceneGraph probably gives better data for z-depth relative to camera
            activeVehicle.screenZ = finalMatrix[14]; // but save pre-processed z position to use later to calculate screenLinearZ

            finalMatrix[14] = realityEditor.gui.ar.positioning.getFinalMatrixScreenZ(
                finalMatrix[14],
                thisIsBeingEdited,
                shouldRenderFramesInNodeView
            );

            activeVehicle.mostRecentFinalMatrix = finalMatrix; // TODO ben: remove mostRecentFinalMatrix

            // draw transformed
            if (activeVehicle.fullScreen !== true && activeVehicle.fullScreen !== 'sticky') {
                let activeElt = globalDOMCache['object' + activeKey];
                if (!activeVehicle.isOutsideViewport) {
                    // normalize the matrix and clear the last column, to avoid some browser-specific bugs
                    let normalizedMatrix =
                        realityEditor.gui.ar.utilities.normalizeMatrix(finalMatrix);
                    normalizedMatrix[3] = 0;
                    normalizedMatrix[7] = 0;
                    normalizedMatrix[11] = 0;
                    activeElt.style.transform = 'matrix3d(' + normalizedMatrix.toString() + ')';

                    // if tool is rendering while it should be behind the camera, visually hide it (for now)
                    if (normalizedMatrix[14] < 0) {
                        activeElt.classList.add('elementBehindCamera');
                    } else {
                        activeElt.classList.remove('elementBehindCamera');
                    }
                } else if (!activeElt.classList.contains('outsideOfViewport')) {
                    activeElt.classList.add('outsideOfViewport');
                }

                // draw a placeholder for unloaded vehicles to provide better visual feedback while they're loading
                let iframe = globalDOMCache['iframe' + activeKey];
                if (!iframe.dataset.doneLoading || activeVehicle.isOutsideViewport) {
                    if (realityEditor.sceneGraph.getSceneNodeById(activeKey)) {
                        if (realityEditor.sceneGraph.isInFrontOfCamera(activeKey)) {
                            this.debugDrawVehicle(activeVehicle, finalMatrix);
                        }
                    }
                }

                if (
                    this.isLowFrequencyUpdateFrame &&
                    realityEditor.device.environment.variables.enableViewFrustumCulling &&
                    !globalStates.disableUnloading
                ) {
                    // if too far beyond visibility threshold, unload and render a little dot instead
                    let distanceThreshold =
                        1.2 *
                        realityEditor.gui.ar.getDistanceScale(activeVehicle) *
                        realityEditor.device.distanceScaling.getDefaultDistance();

                    var isNowOutsideViewport = realityEditor.gui.ar.positioning.canUnload(
                        activeKey,
                        finalMatrix,
                        parseInt(activeVehicle.frameSizeX) / 2,
                        parseInt(activeVehicle.frameSizeY) / 2,
                        distanceThreshold
                    );

                    if (isNowOutsideViewport) {
                        if (
                            !activeVehicle.isOutsideViewport ||
                            !activeElt.classList.contains('outsideOfViewport')
                        ) {
                            // Moved out
                            activeVehicle.isOutsideViewport = true;
                            activeElt.classList.add('outsideOfViewport');
                            let iframe = globalDOMCache['iframe' + activeKey];
                            if (iframe) {
                                iframe.dataset.src = iframe.src;
                                delete iframe.src;
                                delete iframe.dataset.doneLoading;
                            }
                        }
                    } else {
                        if (activeVehicle.isOutsideViewport) {
                            // Moved in
                            activeVehicle.isOutsideViewport = false;
                            activeElt.classList.remove('outsideOfViewport');

                            let iframe = globalDOMCache['iframe' + activeKey];
                            if (iframe && iframe.dataset.src) {
                                iframe.src = iframe.dataset.src;
                                delete iframe.dataset.src;
                                // can detect in onElementLoad whether loaded for first time or reloaded
                                iframe.dataset.isReloading = true;
                            }
                        }
                    }
                }
            } else {
                if (realityEditor.isVehicleAFrame(activeVehicle)) {
                    this.updateStickyFrameCss(activeKey, activeVehicle.fullScreen);
                } else {
                    // fullscreen nodes can be dragged around, need to be updated
                    let zIndex = parseInt(
                        globalDOMCache['object' + activeKey].style.zIndex || 5000
                    );
                    globalDOMCache['object' + activeKey].style.transform =
                        'matrix3d(' +
                        activeVehicle.scale +
                        ', 0, 0, 0,' +
                        '0, ' +
                        activeVehicle.scale +
                        ', 0, 0,' +
                        '0, 0, 1, 0,' +
                        activeVehicle.x +
                        ', ' +
                        activeVehicle.y +
                        ', ' +
                        zIndex +
                        ', 1)';
                }
            }

            if (activeVehicle.fullScreen) {
                let clientRect = globalDOMCache[activeKey].getClientRects()[0];
                if (!clientRect) {
                    let style = window.getComputedStyle(globalDOMCache[activeKey]);
                    clientRect = {
                        top: parseFloat(style.top),
                        left: parseFloat(style.left),
                        width: parseFloat(style.width),
                        height: parseFloat(style.height),
                    };
                }
                activeVehicle.screenX = clientRect.left + clientRect.width / 2;
                activeVehicle.screenY = clientRect.top + clientRect.height / 2;
                activeVehicle.screenZ = 500; // this gives it a good link line width
            } else {
                activeVehicle.screenX = finalMatrix[12] / finalMatrix[15] + globalStates.height / 2;
                activeVehicle.screenY = finalMatrix[13] / finalMatrix[15] + globalStates.width / 2;
            }

            if (thisIsBeingEdited) {
                realityEditor.device.checkIfFramePulledIntoUnconstrained(activeVehicle);
            }

            if (
                this.isLowFrequencyUpdateFrame &&
                activeVehicle.fullScreen === true &&
                realityEditor.isVehicleAFrame(activeVehicle)
            ) {
                // update z-order of fullscreen frames so that closest ones get put in front of further-back ones
                let distanceToFullscreenFrame =
                    realityEditor.sceneGraph.getDistanceToCamera(activeKey);
                const zPosition = activeVehicle.fullscreenZPosition
                    ? activeVehicle.fullscreenZPosition
                    : globalStates.defaultFullscreenFrameZ - Math.log(distanceToFullscreenFrame);
                globalDOMCache['object' + activeKey].style.transform =
                    'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,' + zPosition + ',1)';
            }

            if (activeType === 'ui') {
                let sendMatrices = activeVehicle.sendMatrices;
                if (
                    activeVehicle.sendMatrix ||
                    activeVehicle.sendAcceleration ||
                    activeVehicle.sendScreenPosition ||
                    activeVehicle.sendPositionInWorld ||
                    activeVehicle.sendDeviceDistance ||
                    activeVehicle.sendObjectPositions ||
                    (sendMatrices &&
                        (sendMatrices.devicePose ||
                            sendMatrices.groundPlane ||
                            sendMatrices.anchoredModelView ||
                            sendMatrices.allObjects ||
                            sendMatrices.model ||
                            sendMatrices.view))
                ) {
                    var thisMsg = {};

                    if (activeVehicle.sendMatrix === true) {
                        // TODO ben: send translation iff not three.js fullscreen
                        if (activeVehicle.alwaysFaceCamera) {
                            let modelMatrix = realityEditor.sceneGraph.getModelMatrixLookingAt(
                                activeVehicle.uuid,
                                'CAMERA'
                            );
                            // TODO: fixup the scale and rotation similar to the other alwaysFaceCamera conditional
                            let modelViewMatrix = [];
                            utilities.multiplyMatrix(
                                modelMatrix,
                                realityEditor.sceneGraph.getViewMatrix(),
                                modelViewMatrix
                            );
                            thisMsg.modelViewMatrix = modelViewMatrix;
                        } else {
                            thisMsg.modelViewMatrix = realityEditor.sceneGraph.getModelViewMatrix(
                                activeVehicle.uuid
                            );
                        }
                    }

                    if (sendMatrices.model === true) {
                        thisMsg.modelMatrix = realityEditor.sceneGraph.getSceneNodeById(
                            activeVehicle.uuid
                        ).worldMatrix;
                    }

                    if (sendMatrices.view === true) {
                        thisMsg.viewMatrix = realityEditor.sceneGraph.getViewMatrix();
                    }

                    if (sendMatrices.devicePose === true) {
                        thisMsg.devicePose =
                            realityEditor.sceneGraph.getSceneNodeById('CAMERA').worldMatrix;
                    }

                    if (sendMatrices.groundPlane === true) {
                        thisMsg.groundPlaneMatrix =
                            realityEditor.sceneGraph.getGroundPlaneModelViewMatrix();
                        thisMsg.floorOffset =
                            realityEditor.gui.ar.areaCreator.calculateFloorOffset();
                    }

                    if (sendMatrices.anchoredModelView === true) {
                        thisMsg.anchoredModelView =
                            realityEditor.gui.ar.groundPlaneAnchors.getMatrix(activeVehicle.uuid);
                    }

                    if (sendMatrices.allObjects === true) {
                        thisMsg.allObjects = this.visibleObjects; // TODO ben: get correct matrices from scene graph
                    }

                    if (activeVehicle.sendAcceleration === true) {
                        thisMsg.acceleration = globalStates.acceleration;
                    }

                    if (activeVehicle.sendScreenPosition === true) {
                        var halfWidth = parseInt(activeVehicle.frameSizeX) / 2;
                        var halfHeight = parseInt(activeVehicle.frameSizeY) / 2;

                        thisMsg.frameScreenPosition = {
                            upperLeft: realityEditor.sceneGraph.getScreenPosition(activeKey, [
                                -halfWidth,
                                -halfHeight,
                                0,
                                1,
                            ]),
                            center: realityEditor.sceneGraph.getScreenPosition(
                                activeKey,
                                [0, 0, 0, 1]
                            ),
                            lowerRight: realityEditor.sceneGraph.getScreenPosition(activeKey, [
                                halfWidth,
                                halfHeight,
                                0,
                                1,
                            ]),
                        };
                    }

                    if (activeVehicle.sendPositionInWorld === true) {
                        // check what it's best worldId should be
                        let worldObjectId = realityEditor.sceneGraph.getWorldId();
                        // only works if its localized against a world object
                        if (worldObjectId) {
                            let toolSceneNode = realityEditor.sceneGraph.getSceneNodeById(
                                activeVehicle.uuid
                            ); //.worldMatrix;
                            let worldSceneNode =
                                realityEditor.sceneGraph.getSceneNodeById(worldObjectId); //.worldMatrix;
                            let relativeMatrix = toolSceneNode.getMatrixRelativeTo(worldSceneNode);

                            thisMsg.positionInWorld = {
                                objectId: objectKey,
                                worldId: worldObjectId,
                                worldMatrix: relativeMatrix,
                            };
                        }
                    }

                    if (activeVehicle.sendDeviceDistance === true) {
                        thisMsg.deviceDistance = realityEditor.sceneGraph.getDistanceToCamera(
                            activeVehicle.uuid
                        );
                    }

                    if (typeof activeVehicle.sendObjectPositions !== 'undefined') {
                        thisMsg.objectPositions =
                            realityEditor.gui.ar.positioning.getObjectPositionsOfTypes(
                                activeVehicle.sendObjectPositions,
                                true
                            );
                    }

                    if (realityEditor.device.profiling.isEnabled()) {
                        let matrixHash = realityEditor.device.profiling.getShortHashForString(
                            JSON.stringify(realityEditor.sceneGraph.getCameraNode().worldMatrix)
                        );
                        let processName = `cameraUpdate_${matrixHash}`;
                        realityEditor.device.profiling.stopTimeProcess(
                            processName,
                            'cameraUpdates'
                        );
                    }

                    if (activeType === 'ui') {
                        globalDOMCache['iframe' + activeKey].contentWindow.postMessage(
                            JSON.stringify(thisMsg),
                            '*'
                        );
                    }
                }
            }

            activeVehicle.screenLinearZ = ((10001 - 20000 / activeVehicle.screenZ) / 9999 + 1) / 2;
            // map the linearized zBuffer to the final ball size
            activeVehicle.screenLinearZ = utilities.map(
                activeVehicle.screenLinearZ,
                0.996,
                1,
                50,
                1
            );

            // Animate and show the 4 colored quadrants of the logic node if we touch near it
            if (activeType === 'logic' && objectKey !== 'pocket') {
                let currentTouchPosition =
                    realityEditor.gui.ar.positioning.getMostRecentTouchPosition();
                let logicNodeBounds = globalDOMCache[activeKey].getClientRects()[0];
                if (logicNodeBounds) {
                    // only calculate if the node has a valid element on screen
                    let estimatedCenter = {
                        x: logicNodeBounds.left + logicNodeBounds.width / 2,
                        y: logicNodeBounds.top + logicNodeBounds.height / 2,
                    };

                    let distanceVector = {
                        x: currentTouchPosition.x - estimatedCenter.x,
                        y: currentTouchPosition.y - estimatedCenter.y,
                    };
                    let distanceMoved = Math.sqrt(
                        distanceVector.x * distanceVector.x + distanceVector.y * distanceVector.y
                    );

                    // if we're too close to its center, dont expand. instead, let us hold to drag it around.
                    let minExpansionThreshold = 30;
                    let maxExpansionThreshold = 30 + logicNodeBounds.width;
                    let isTouchCloseButNotTooClose =
                        distanceMoved > minExpansionThreshold &&
                        distanceMoved < maxExpansionThreshold;

                    // don't show the logic ports if you are dragging anything around, or if this logic is locked
                    if (
                        globalProgram.objectA &&
                        isTouchCloseButNotTooClose &&
                        !activeVehicle.lockPassword &&
                        !editingVehicle
                    ) {
                        globalCanvas.hasContent = true;

                        if (activeVehicle.animationScale === 0 && !globalStates.editingMode) {
                            globalDOMCache['logic' + activeKey].className = 'mainEditing scaleIn';
                        }
                        activeVehicle.animationScale = 1;
                    } else {
                        if (activeVehicle.animationScale === 1) {
                            globalDOMCache['logic' + activeKey].className = 'mainEditing scaleOut';
                        }
                        activeVehicle.animationScale = 0;
                    }
                }
            }

            // temporary UI styling to visualize locks

            var LOCK_SERVICE_ENABLED = false;

            if (LOCK_SERVICE_ENABLED) {
                if (activeType !== 'ui') {
                    if (!!activeVehicle.lockPassword && activeVehicle.lockType === 'full') {
                        globalDOMCache['iframe' + activeKey].style.opacity = 0.25;
                    } else if (!!activeVehicle.lockPassword && activeVehicle.lockType === 'half') {
                        globalDOMCache['iframe' + activeKey].style.opacity = 0.75;
                    } else {
                        globalDOMCache['iframe' + activeKey].style.opacity = 1.0;
                    }
                }
            }
        }
    } else if (activeType === 'ui' && activeVehicle.visualization === 'screen') {
        this.hideScreenFrame(activeKey);
    }

    if (shouldRenderFramesInNodeView && !globalStates.renderFrameGhostsInNodeViewEnabled) {
        this.hideScreenFrame(activeKey);
    }

    if (
        typeof activeVehicle.ignoreAllTouches !== 'undefined' &&
        globalDOMCache['object' + activeKey]
    ) {
        if (activeVehicle.ignoreAllTouches) {
            if (!globalDOMCache['object' + activeKey].classList.contains('ignoreAllTouches')) {
                globalDOMCache['object' + activeKey].classList.add('ignoreAllTouches');
                globalDOMCache['iframe' + activeKey].classList.add('ignoreAllTouches');
                globalDOMCache[activeKey].classList.add('ignoreAllTouches');
            }
        } else {
            if (globalDOMCache['object' + activeKey].classList.contains('ignoreAllTouches')) {
                globalDOMCache['object' + activeKey].classList.remove('ignoreAllTouches');
                globalDOMCache['iframe' + activeKey].classList.remove('ignoreAllTouches');
                globalDOMCache[activeKey].classList.remove('ignoreAllTouches');
            }
        }
    }
};

realityEditor.gui.ar.draw.debugDrawVehicle = function (activeVehicle, finalMatrix) {
    let bbox = realityEditor.gui.ar.positioning.getVehicleBoundingBoxFast(
        finalMatrix,
        parseInt(activeVehicle.frameSizeX) / 2,
        parseInt(activeVehicle.frameSizeY) / 2
    );
    let thisColor = 'rgba(0,255,255,0.3)';
    // 72 is a magic number that seems to work so that this had a pseudo-3d radius of frameSizeX/2
    let thisSize =
        (parseInt(activeVehicle.frameSizeX) /
            2 /
            realityEditor.sceneGraph.getDistanceToCamera(activeVehicle.uuid)) *
        72;
    this.globalCanvas.context.beginPath();
    this.globalCanvas.context.fillStyle = thisColor;
    this.globalCanvas.context.arc(bbox.center.x, bbox.center.y, thisSize, 0, Math.PI * 2);
    this.globalCanvas.context.fill();
    this.globalCanvas.hasContent = true;
};

/**
 * Temporarily disabled function that will snap the frame to the target plane
 * (by removing its rotation components) if the amount of rotation is very small
 * @todo: only do this if it is also close to the target plane in the Z direction
 * @param {Frame|Node} activeVehicle
 * @param {string} activeKey
 */
realityEditor.gui.ar.draw.snapFrameMatrixIfNecessary = function (activeVehicle, activeKey) {
    var positionData = realityEditor.gui.ar.positioning.getPositionData(activeVehicle);

    // start with the frame's matrix
    var snappedMatrix = this.ar.utilities.copyMatrix(positionData.matrix);

    // calculate its rotation in Euler Angles about the X and Y axis, using a bunch of quaternion math in the background
    var xRotation = this.ar.utilities.getRotationAboutAxisX(snappedMatrix);
    var yRotation = this.ar.utilities.getRotationAboutAxisY(snappedMatrix);
    var snapX = false;
    var snapY = false;

    // see if the xRotation is close enough to neutral
    if (0.5 - Math.abs(Math.abs(xRotation) / Math.PI - 0.5) < 0.05) {
        // globalDOMCache["iframe" + activeKey].classList.add('snapX');
        snapX = true;
    } else {
        // globalDOMCache["iframe" + activeKey].classList.remove('snapX');
    }

    // see if the yRotation is close enough to neutral
    if (0.5 - Math.abs(Math.abs(yRotation) / Math.PI - 0.5) < 0.05) {
        // globalDOMCache["iframe" + activeKey].classList.add('snapY');
        snapY = true;
    } else {
        // globalDOMCache["iframe" + activeKey].classList.remove('snapY');
    }

    /**
     * Removes all rotation components from a modelView matrix
     * Given a modelview matrix, computes its rotation as a quaternion, find the inverse, and multiplies the original
     * matrix by that inverse rotation to remove its rotation
     * @param {Array.<number>} mat
     * @return {Array}
     */
    function computeSnappedMatrix(mat) {
        var res = [];
        var rotationQuaternion = realityEditor.gui.ar.utilities.getQuaternionFromMatrix(mat);
        var inverseRotationQuaternion =
            realityEditor.gui.ar.utilities.invertQuaternion(rotationQuaternion);
        var inverseRotationMatrix =
            realityEditor.gui.ar.utilities.getMatrixFromQuaternion(inverseRotationQuaternion);
        realityEditor.gui.ar.utilities.multiplyMatrix(snappedMatrix, inverseRotationMatrix, res);
        return res;
    }

    globalDOMCache['iframe' + activeKey].classList.remove('snappableFrame');

    if (!realityEditor.device.isEditingUnconstrained(activeVehicle) && snapX && snapY) {
        // actually update the frame's matrix if meets the conditions
        snappedMatrix = computeSnappedMatrix(this.ar.utilities.copyMatrix(positionData.matrix));
        realityEditor.gui.ar.positioning.setPositionDataMatrix(activeVehicle, snappedMatrix);
    } else if (snapX && snapY) {
        // otherwise if it is close but you are still moving it, show some visual feedback to warn you it will snap
        globalDOMCache['iframe' + activeKey].classList.add('snappableFrame');
    }
};

/**
 * Updates the visibility / touch events of a sticky fullscreen frame differently than other frames,
 * because they can't rely on events to trigger them becoming visible or invisible, need to check state each frame
 * @param {string} activeKey
 * @param {boolean} _isFullscreen (unused)
 */
realityEditor.gui.ar.draw.updateStickyFrameCss = function (activeKey, _isFullScreen) {
    // sticky frames need a special process to show and hide depending on guiState....
    if (
        globalStates.guiState === 'node' &&
        (globalDOMCache['object' + activeKey].classList.contains('visibleFrameContainer') ||
            globalDOMCache['iframe' + activeKey].classList.contains('visibleFrame') ||
            globalDOMCache[activeKey].classList.contains('usePointerEvents'))
    ) {
        globalDOMCache['object' + activeKey].classList.remove('visibleFrameContainer');
        globalDOMCache['object' + activeKey].classList.add('hiddenFrameContainer');

        // if (!isFullScreen) {
        globalDOMCache['iframe' + activeKey].classList.remove('visibleFrame');
        globalDOMCache['iframe' + activeKey].classList.add('hiddenFrame');
        // }

        globalDOMCache[activeKey].classList.remove('usePointerEvents');
        globalDOMCache[activeKey].classList.add('ignorePointerEvents');
    } else if (
        globalStates.guiState === 'ui' &&
        (globalDOMCache['object' + activeKey].classList.contains('hiddenFrameContainer') ||
            globalDOMCache['object' + activeKey].classList.contains('outsideOfViewport') ||
            globalDOMCache['iframe' + activeKey].classList.contains('hiddenFrame') ||
            globalDOMCache[activeKey].classList.contains('ignorePointerEvents'))
    ) {
        globalDOMCache['object' + activeKey].classList.remove('outsideOfViewport');

        globalDOMCache['object' + activeKey].classList.add('visibleFrameContainer');
        globalDOMCache['object' + activeKey].classList.remove('hiddenFrameContainer');

        globalDOMCache['iframe' + activeKey].classList.add('visibleFrame');
        globalDOMCache['iframe' + activeKey].classList.remove('hiddenFrame');

        globalDOMCache[activeKey].classList.add('usePointerEvents');
        globalDOMCache[activeKey].classList.remove('ignorePointerEvents');
    }
};

// Valentin: Speeding up the calls by placing the variables outside of the scope into an object. As such Javascript does not need to handle memory for it.

realityEditor.gui.ar.draw.getMatrixValues = {
    utils: realityEditor.gui.ar.utilities,
    r1: [],
    r2: [],
    r3: [],
    finalMatrix: [],
    rotateX: rotateX,
    scale: [],
};

/**
 * Ensures that a frame gets display:none applied to it when it is pushed into the screen.
 * @param {string} activeKey
 */
realityEditor.gui.ar.draw.hideScreenFrame = function (activeKey) {
    if (globalDOMCache['object' + activeKey]) {
        globalDOMCache['object' + activeKey].classList.add('displayNone');
    }
};

/**
 * Triggered when a frame gets pulled into AR.
 * Removes the display:none applied to a frame by the corresponding hideScreenFrame call.
 * @param {string} activeKey
 */
realityEditor.gui.ar.draw.showARFrame = function (activeKey) {
    if (globalDOMCache['object' + activeKey]) {
        globalDOMCache['object' + activeKey].classList.remove('displayNone');
    }
};

/**
 * A one-time action that sets up the frame or node added from the pocket in the correct place and begins editing it
 * @param {PocketContainer} pocketContainer - either pocketFrame or pocketNode
 */
realityEditor.gui.ar.draw.addPocketVehicle = function (pocketContainer) {
    // drop frames in from pocket, floating in front of screen in unconstrained mode, aligned with the touch position

    let activeKey = pocketContainer.vehicle.uuid;
    var activeFrameKey = pocketContainer.vehicle.frameId || pocketContainer.vehicle.uuid;
    var activeNodeKey =
        pocketContainer.vehicle.uuid === activeFrameKey ? null : pocketContainer.vehicle.uuid;

    let spatialCursorMatrix = realityEditor.spatialCursor.getOrientedCursorRelativeToWorldObject();
    if (spatialCursorMatrix) {
        this.addPocketVehicleAtCursorPosition(pocketContainer);
        return;
    }

    let distanceInFrontOfCamera =
        400 * realityEditor.device.environment.variables.newFrameDistanceMultiplier;
    realityEditor.gui.ar.positioning.moveFrameToCamera(
        pocketContainer.vehicle.objectId,
        activeKey,
        distanceInFrontOfCamera
    );

    // TODO: automatically recognize when CSS matrix is out of date, so that we don't need to manually recalculate here
    realityEditor.sceneGraph.calculateFinalMatrices([pocketContainer.vehicle.objectId]);

    // only start editing (and animate) it if you didn't do a quick tap that already released by the time it loads
    if (
        pocketContainer.type !== 'ui' ||
        realityEditor.device.currentScreenTouches
            .map(function (elt) {
                return elt.targetId;
            })
            .indexOf('pocket-element') > -1
    ) {
        // immediately start placing the pocket frame in unconstrained mode
        realityEditor.device.editingState.unconstrained = true;

        // Several steps to translate it exactly to be centered on the touch when it gets added
        // 1. calculate where the center of the frame would naturally end up on the screen, given the moveFrameToCamera matrix
        let defaultScreenCenter = realityEditor.sceneGraph.getScreenPosition(activeKey);
        //realityEditor.gui.ar.positioning.getScreenPosition(pocketContainer.vehicle.objectId, activeFrameKey, true, false, false, false, false).center;
        let touchPosition = realityEditor.gui.ar.positioning.getMostRecentTouchPosition();
        // 2. calculate the correct touch offset as if you placed it at the default position (doesn't actually set x and y)
        realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(
            pocketContainer.vehicle,
            defaultScreenCenter.x,
            defaultScreenCenter.y,
            true
        );
        // 3. actually move it to the touch position (sets x and y), now that it knows the relative offset from the default
        realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(
            pocketContainer.vehicle,
            touchPosition.x,
            touchPosition.y,
            true
        );
        // 4. add a flag so that we can finalize its position and begin dragging the next time drawTransformed is called
        pocketContainer.vehicle.isPendingInitialPlacement = {
            objectKey: pocketContainer.vehicle.objectId,
            frameKey: activeFrameKey,
            nodeKey: activeNodeKey,
        };
        // animate it as flowing out of the pocket
        this.startPocketDropAnimation(200, 0, 0, distanceInFrontOfCamera / 3);
    }

    // clear some flags so it gets rendered after this occurs
    pocketContainer.positionOnLoad = null;
    pocketContainer.waitingToRender = false;

    realityEditor.network.postVehiclePosition(pocketContainer.vehicle);

    // realityEditor.gui.ar.positioning.setPositionDataMatrix(activeVehicle, snappedMatrix);

    // setTimeout(function() {
    //     var keys = realityEditor.getKeysFromVehicle(pocketContainer.vehicle);
    //     var propertyPath = pocketContainer.vehicle.hasOwnProperty('visualization') ? 'ar.matrix' : 'matrix';
    //     realityEditor.network.realtime.broadcastUpdate(keys.objectKey, keys.frameKey, keys.nodeKey, propertyPath, newMatrixValue);
    // }, 500);
};

realityEditor.gui.ar.draw.addPocketVehicleAtCursorPosition = function (pocketContainer) {
    // clear some flags so it gets rendered after this occurs
    pocketContainer.positionOnLoad = null;
    pocketContainer.waitingToRender = false;

    realityEditor.device.resetEditingState();

    realityEditor.network.postVehiclePosition(pocketContainer.vehicle);
};

/**
 * Run an animation on the frame being dropped in from the pocket, performing a smooth tweening of its last matrix element
 * The frame scales down (moves away from camera) the bigger that 15th element is
 * @param {number} timeInMilliseconds - how long the animation takes (default 250ms)
 * @param {number} startX - the frame starts out with this X translation and returns to its regular X
 * @param {number} startY - the frame starts out with this Y translation and returns to its regular Y
 * @param {number} startZ - the frame starts out with this Z translation and returns to its regular Z
 */
realityEditor.gui.ar.draw.startPocketDropAnimation = function (
    timeInMilliseconds,
    startX,
    startY,
    startZ
) {
    var duration = timeInMilliseconds || 250;
    if (!startX && !startY && !startZ) {
        return;
    } // if motion unspecified or all are zero, skip animation

    // reset this so that the initial distance to screens gets calculated when the pocketAnimation ends
    // (or else it automatically gets pushed in by its own animation)
    if (globalStates.initialDistance) {
        globalStates.initialDistance = null;
    }

    var position = { x: startX, y: startY, z: startZ };
    pocketDropAnimation = new TWEEN.Tween(position)
        .to({ x: 0, y: 0, z: 0 }, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function () {
            editingAnimationsMatrix[12] = position.x;
            editingAnimationsMatrix[13] = position.y;
            editingAnimationsMatrix[14] = position.z;
        })
        .onComplete(function () {
            editingAnimationsMatrix[12] = 0;
            editingAnimationsMatrix[13] = 0;
            editingAnimationsMatrix[14] = 0;
            realityEditor.gui.ar.positioning.stopRepositioning(); // trigger drag matrix to be recomputed
            pocketDropAnimation = null;
        })
        .onStop(function () {
            editingAnimationsMatrix[12] = 0;
            editingAnimationsMatrix[13] = 0;
            editingAnimationsMatrix[14] = 0;
            realityEditor.gui.ar.positioning.stopRepositioning();
            pocketDropAnimation = null;
        })
        .start();
};

/**
 * Hides the DOM elements for a specified frame or node if they still exist and are visible
 * @param {string} activeKey
 * @param {Frame|Node} activeVehicle
 * @param {Object} globalDOMCache
 * @param {function} cout
 */
realityEditor.gui.ar.draw.hideTransformed = function (
    activeKey,
    activeVehicle,
    globalDOMCache,
    cout
) {
    var doesDOMElementExist = !!globalDOMCache['object' + activeKey];
    if (!doesDOMElementExist && activeVehicle.visible === true) {
        activeVehicle.visible = false;
        console.warn("trying to hide a frame that doesn't exist");
        return;
    }

    if (activeVehicle.hasOwnProperty('fullScreen')) {
        if (activeVehicle.fullScreen === 'sticky') {
            return;
        }
    }

    var isVisible = activeVehicle.visible === true;

    // TODO: this makes frames disappear when object becomes invisible, but it's making the visibility message keep posting into the frame, which in response makes the node socket keep sending on loop while in the node view...
    /*
    if (!isVisible) {
        var isPartiallyHiddenFrame = (activeVehicle.type === 'ui' || typeof activeVehicle.type === 'undefined') &&
                                     !globalDOMCache['object' + activeKey].classList.contains('displayNone');
        if (isPartiallyHiddenFrame) {
            isVisible = true;
        }
    }
    */

    if (isVisible) {
        if (activeVehicle.type === 'ui' || typeof activeVehicle.type === 'undefined') {
            globalDOMCache['object' + activeKey].classList.remove('visibleFrameContainer');
            globalDOMCache['object' + activeKey].classList.add('hiddenFrameContainer');

            let shouldReallyHide =
                !this.visibleObjects.hasOwnProperty(activeVehicle.objectId) ||
                activeVehicle.visualization === 'screen' ||
                !this.visibleObjects[activeVehicle.objectId][0];
            if (shouldReallyHide) {
                globalDOMCache['object' + activeKey].classList.add('displayNone');
            }

            globalDOMCache['iframe' + activeKey].contentWindow.postMessage(
                JSON.stringify({
                    visibility: 'hidden',
                }),
                '*'
            );
        } else {
            globalDOMCache['object' + activeKey].classList.remove('visibleNodeContainer');
            globalDOMCache['object' + activeKey].classList.add('hiddenNodeContainer');
        }

        // if (!activeVehicle.fullScreen) {
        globalDOMCache['iframe' + activeKey].classList.remove('visibleFrame');
        globalDOMCache['iframe' + activeKey].classList.add('hiddenFrame');
        // }

        // TODO: does this need to happen here?
        // globalDOMCache["iframe" + activeKey].contentWindow.postMessage(
        //     JSON.stringify(
        //         {
        //             visibility: "hidden"
        //         }), '*');

        activeVehicle.visible = false;
        activeVehicle.visibleEditing = false;

        globalDOMCache[activeKey].style.visibility = 'hidden';
        // globalDOMCache["svg" + activeKey].style.display = 'none';
        globalDOMCache['svg' + activeKey].classList.remove('visibleEditingSVG');

        globalDOMCache[activeKey].querySelector('.corners').style.visibility = 'hidden';

        // reset the active screen object when it disappears
        if (realityEditor.gui.screenExtension.visibleScreenObjects[activeKey]) {
            delete realityEditor.gui.screenExtension.visibleScreenObjects[activeKey];
        }

        cout('hideTransformed');
    } else {
        // for frames in node view that are technically "hidden" but still show opacity ghost...
        // hide completely when their object stops being recognized

        if (!globalDOMCache['object' + activeKey]) {
            return;
        }
        if (!(activeVehicle.type === 'ui' || typeof activeVehicle.type === 'undefined')) {
            return;
        }

        if (!globalDOMCache['object' + activeKey].classList.contains('displayNone')) {
            let shouldReallyHide =
                !this.visibleObjects.hasOwnProperty(activeVehicle.objectId) ||
                activeVehicle.visualization === 'screen' ||
                !this.visibleObjects[activeVehicle.objectId][0];
            if (shouldReallyHide) {
                globalDOMCache['object' + activeKey].classList.add('displayNone');
            }
        }
    }
};

/**
 * If needed, creates the DOM element for a given frame or node
 * Can be safely called multiple times for the same element (knows to ignore if its already been loaded)
 * @param {string} thisUrl - the iframe src url
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {string} activeType - 'ui', 'node', 'logic', etc, to tag the element with
 * @param {Frame|Node} activeVehicle - reference to the frame or node to create.
 *                                     it's properties are used to instantiate the correct DOM element.
 */
realityEditor.gui.ar.draw.addElement = function (
    thisUrl,
    objectKey,
    frameKey,
    nodeKey,
    activeType,
    activeVehicle
) {
    var activeKey = nodeKey ? nodeKey : frameKey;
    var isFrameElement = activeKey === frameKey;

    if (
        this.notLoading !== true &&
        this.notLoading !== activeKey &&
        activeVehicle.loaded !== true
    ) {
        this.notLoading = activeKey;

        // assign the element some default properties if they don't exist
        if (typeof activeVehicle.frameSizeX === 'undefined') {
            activeVehicle.frameSizeX = activeVehicle.width || 220;
        }
        if (typeof activeVehicle.width === 'undefined') {
            activeVehicle.width = activeVehicle.frameSizeX;
        }
        if (typeof activeVehicle.frameSizeY === 'undefined') {
            activeVehicle.frameSizeY = activeVehicle.height || 220;
        }
        if (typeof activeVehicle.height === 'undefined') {
            activeVehicle.height = activeVehicle.frameSizeY;
        }
        if (typeof activeVehicle.begin !== 'object') {
            activeVehicle.begin = realityEditor.gui.ar.utilities.newIdentityMatrix();
        }
        if (typeof activeVehicle.temp !== 'object') {
            activeVehicle.temp = realityEditor.gui.ar.utilities.newIdentityMatrix();
        }
        activeVehicle.animationScale = 0;
        activeVehicle.loaded = true;
        activeVehicle.visibleEditing = false;

        // determine if the frame should be loaded locally or from the server (by default thisUrl points to server)
        if (isFrameElement && activeVehicle.location === 'global') {
            // loads frames from server of the object it is being added to
            thisUrl = realityEditor.network.availableFrames.getFrameSrc(
                objectKey,
                activeVehicle.src
            );
        }

        // Create DOM elements for everything associated with this frame/node
        var domElements = this.createSubElements(
            thisUrl,
            objectKey,
            frameKey,
            nodeKey,
            activeVehicle
        );
        var addContainer = domElements.addContainer;
        var addIframe = domElements.addIframe;
        var addOverlay = domElements.addOverlay;
        var addSVG = domElements.addSVG;

        addOverlay.objectId = objectKey;
        addOverlay.frameId = frameKey;
        addOverlay.nodeId = nodeKey;
        addOverlay.type = activeType;

        // todo the event handlers need to be bound to non animated ui elements for fast movements.
        // todo the lines need to end at the center of the square.

        if (activeType === 'logic') {
            // add the 4-quadrant animated SVG overlay for the logic nodes
            var addLogic = this.createLogicElement(activeVehicle, activeKey);
            addOverlay.appendChild(addLogic);
            globalDOMCache['logic' + activeKey] = addLogic;
        }

        // TODO: try adding to var documentFragment = document.createDocumentFragment(); while constructing, for performance

        // append all the created elements to the DOM in the correct order...
        document.getElementById('GUI').appendChild(addContainer);
        addContainer.appendChild(addIframe);
        addContainer.appendChild(addOverlay);
        addOverlay.appendChild(addSVG);

        // cache references to these elements to more efficiently retrieve them in the future
        globalDOMCache[addContainer.id] = addContainer;
        globalDOMCache[addIframe.id] = addIframe;
        globalDOMCache[addOverlay.id] = addOverlay;
        globalDOMCache[addSVG.id] = addSVG;

        // wrapping div in corners can only be done after it has been added
        // the width and height don't matter as much here because it will get recalculated when frame contents load
        var padding = 24;
        realityEditor.gui.moveabilityCorners.wrapDivWithCorners(
            addOverlay,
            padding,
            false,
            {
                width: activeVehicle.width + padding * 2 + 'px',
                height: activeVehicle.height + padding * 2 + 'px',
                visibility: 'hidden',
            },
            null,
            4,
            30
        );

        // add touch event listeners
        realityEditor.device.addTouchListenersForElement(addOverlay, activeVehicle);
    }
};

/**
 * Instantiates the many different DOM elements that make up a frame or node.
 *      addContainer - holds all the different pieces of this element
 *      addIframe - loads in the content for this frame, e.g. a graph or three.js scene, or a node graphic
 *      addOverlay - an invisible overlay that catches touch events and passes into the iframe if needed
 *      addSVG - a visual feedback image that displays when you are dragging the element around
 * @param {string} iframeSrc
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {string} nodeKey
 * @param {Frame|Node} activeVehicle
 * @return {{addContainer: HTMLDivElement, addIframe: HTMLIFrameElement, addOverlay: HTMLDivElement, addSVG: HTMLElement}}
 */
realityEditor.gui.ar.draw.createSubElements = function (
    iframeSrc,
    objectKey,
    frameKey,
    nodeKey,
    activeVehicle
) {
    var activeKey = nodeKey ? nodeKey : frameKey;

    var addContainer = document.createElement('div');
    addContainer.id = 'object' + activeKey;
    addContainer.classList.add('main');
    addContainer.style.width = globalStates.height + 'px';
    addContainer.style.height = globalStates.width + 'px';
    if (nodeKey) {
        addContainer.classList.add('hiddenNodeContainer');
    } else {
        addContainer.classList.add('hiddenFrameContainer');
    }
    addContainer.style.border = 0;
    addContainer.classList.add('ignorePointerEvents'); // don't let invisible background from container intercept touches

    var addIframe = document.createElement('iframe');
    addIframe.id = 'iframe' + activeKey;
    addIframe.classList.add('main');
    addIframe.frameBorder = 0;
    addIframe.style.width = (activeVehicle.width || activeVehicle.frameSizeX) + 'px';
    addIframe.style.height = (activeVehicle.height || activeVehicle.frameSizeY) + 'px';
    addIframe.style.left = (globalStates.height - activeVehicle.frameSizeX) / 2 + 'px';
    addIframe.style.top = (globalStates.width - activeVehicle.frameSizeY) / 2 + 'px';
    addIframe.classList.add('hiddenFrame');
    addIframe.src = iframeSrc;
    addIframe.setAttribute('data-frame-key', frameKey);
    addIframe.setAttribute('data-object-key', objectKey);
    addIframe.setAttribute('data-node-key', nodeKey);
    addIframe.setAttribute(
        'onload',
        'realityEditor.network.onElementLoad("' +
            objectKey +
            '","' +
            frameKey +
            '","' +
            nodeKey +
            '")'
    );
    // TODO: remove this 'sandbox' attribute if you try to embed iframes within the tool's iframe and you run into browser restrictions
    let allowPopups = realityEditor.device.environment.isWithinToolboxApp() ? '' : 'allow-popups';
    addIframe.setAttribute(
        'sandbox',
        `allow-forms allow-pointer-lock allow-same-origin allow-scripts ${allowPopups}`
    );
    addIframe.classList.add('usePointerEvents'); // override parent (addContainer) pointerEvents value

    // TODO: try to load elements with an XHR request so they don't block the rendering loop

    var addOverlay = document.createElement('div');
    addOverlay.id = activeKey;
    addOverlay.classList.add(
        globalStates.editingMode && activeVehicle.developer ? 'mainEditing' : 'mainProgram'
    );
    addOverlay.frameBorder = 0;
    addOverlay.style.width = activeVehicle.frameSizeX + 'px';
    addOverlay.style.height = activeVehicle.frameSizeY + 'px';
    addOverlay.style.left = (globalStates.height - activeVehicle.frameSizeX) / 2 + 'px';
    addOverlay.style.top = (globalStates.width - activeVehicle.frameSizeY) / 2 + 'px';
    addOverlay.style.visibility = 'hidden';
    addOverlay.style.zIndex = '3';
    if (activeVehicle.developer) {
        addOverlay.style['touch-action'] = 'none';
    }
    addOverlay.classList.add('usePointerEvents'); // override parent (addContainer) pointerEvents value

    var addSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    addSVG.id = 'svg' + activeKey;
    addSVG.classList.add('mainCanvas');
    addSVG.style.width = '100%';
    addSVG.style.height = '100%';
    addSVG.style.zIndex = '3';
    // addSVG.style.display = 'none';
    addSVG.classList.add('svgDefaultState');
    addSVG.classList.add('usePointerEvents'); // override parent (addContainer) pointerEvents value
    addSVG.setAttribute('shape-rendering', 'geometricPrecision'); //'optimizeSpeed'

    return {
        addContainer: addContainer,
        addIframe: addIframe,
        addOverlay: addOverlay,
        addSVG: addSVG,
    };
};

/**
 * Gets the correct iconImage url for the logic node and posts it into the logic node iframe to be displayed.
 * its iconImage property is either 'auto', 'custom', or 'none'
 * @param {Logic} activeVehicle
 */
realityEditor.gui.ar.draw.updateLogicNodeIcon = function (activeVehicle) {
    // add the icon image for the logic nodes
    var logicIconSrc = realityEditor.gui.crafting.getLogicNodeIcon(activeVehicle);
    var nodeDom = globalDOMCache['iframe' + activeVehicle.uuid];
    if (nodeDom) {
        nodeDom.contentWindow.postMessage(JSON.stringify({ iconImage: logicIconSrc }), '*');
    }
};

/**
 * Creates the DOM element for a Logic Node
 * @param {Frame|Node} activeVehicle
 * @param {string} activeKey
 * @return {HTMLDivElement}
 */
realityEditor.gui.ar.draw.createLogicElement = function (activeVehicle, activeKey) {
    var size = 200;
    var addLogic = document.createElement('div');
    addLogic.id = 'logic' + activeKey;
    addLogic.className = 'mainEditing';
    addLogic.style.width = size + 'px';
    addLogic.style.height = size + 'px';
    addLogic.style.left = 0; //((activeVehicle.frameSizeX - size) / 2) + "px";
    addLogic.style.top = 0; //((activeVehicle.frameSizeY - size) / 2) + "px";
    addLogic.style.visibility = 'hidden';

    var svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgContainer.setAttributeNS(null, 'viewBox', '0 0 100 100');

    var svgElement = [];
    svgElement.push(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    svgElement[0].setAttributeNS(null, 'fill', '#00ffff');
    svgElement[0].setAttributeNS(null, 'd', 'M50,0V50H0V30A30,30,0,0,1,30,0Z');
    svgElement.push(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    svgElement[1].setAttributeNS(null, 'fill', '#00ff00');
    svgElement[1].setAttributeNS(null, 'd', 'M100,30V50H50V0H70A30,30,0,0,1,100,30Z');
    svgElement.push(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    svgElement[2].setAttributeNS(null, 'fill', '#ffff00');
    svgElement[2].setAttributeNS(null, 'd', 'M100,50V70a30,30,0,0,1-30,30H50V50Z');
    svgElement.push(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    svgElement[3].setAttributeNS(null, 'fill', '#ff007c');
    svgElement[3].setAttributeNS(null, 'd', 'M50,50v50H30A30,30,0,0,1,0,70V50Z');

    for (var i = 0; i < svgElement.length; i++) {
        svgContainer.appendChild(svgElement[i]);
        svgElement[i].number = i;
        svgElement[i].addEventListener('pointerenter', function () {
            globalProgram.logicSelector = this.number;

            if (globalProgram.nodeA === activeKey) {
                globalProgram.logicA = this.number;
            } else {
                globalProgram.logicB = this.number;
            }
        });
        addLogic.appendChild(svgContainer);
    }

    return addLogic;
};

/**
 * Helper function checks if the specified object contains any frame with sticky fullscreen property.
 * @param {string} objectKey
 * @return {boolean}
 */
realityEditor.gui.ar.draw.doesObjectContainStickyFrame = function (objectKey) {
    var object = realityEditor.getObject(objectKey);
    return Object.keys(object.frames)
        .map(function (frameKey) {
            return realityEditor.getFrame(objectKey, frameKey).fullScreen;
        })
        .some(function (fullScreen) {
            return fullScreen === 'sticky';
        });
};

realityEditor.gui.ar.draw.doesAnythingUseGroundPlane = function () {
    // TODO: narrow down to visibleObjects?
    var isAnyFrameSubscribedToGroundPlane = false;
    realityEditor.forEachFrameInAllObjects(function (objectKey, frameKey) {
        var frame = realityEditor.getFrame(objectKey, frameKey);
        if (typeof frame.sendMatrices !== 'undefined') {
            if (frame.sendMatrices.groundPlane || frame.sendMatrices.anchoredModelView) {
                isAnyFrameSubscribedToGroundPlane = true;
            }
        }
        if (frame.attachToGroundPlane) {
            // future-proofing in case we use attachToGroundPlane on frames in the future
            isAnyFrameSubscribedToGroundPlane = true;
        }
        for (let nodeKey in frame.nodes) {
            let node = frame.nodes[nodeKey];
            if (node.attachToGroundPlane) {
                isAnyFrameSubscribedToGroundPlane = true;
            }
        }
    });
    return isAnyFrameSubscribedToGroundPlane;
};

/**
 * Helper function to iterate over all frames on currently visible objects
 * @param {function} callback
 */
realityEditor.gui.ar.draw.forEachVisibleFrame = function (callback) {
    realityEditor.forEachFrameInAllObjects(function (objectKey, frameKey) {
        if (realityEditor.gui.ar.draw.visibleObjects.hasOwnProperty(objectKey)) {
            // only do this for visible objects (and the world object, of course)
            callback(objectKey, frameKey); // populates allDistanceUIs with new distanceUIs if they don't exist yet
        }
    });
};

/**
 * Returns a list of IDs for all frames that are currently fullscreen and require exclusive control of the screen
 * @return {Array.<{objectKey: string, frameKey: string}>}
 */
realityEditor.gui.ar.draw.getAllVisibleExclusiveFrames = function () {
    var exclusiveFrameKeys = [];
    realityEditor.gui.ar.draw.forEachVisibleFrame(function (objectKey, frameKey) {
        var frame = realityEditor.getFrame(objectKey, frameKey);
        if (frame.fullScreen && frame.isFullScreenExclusive) {
            exclusiveFrameKeys.push({
                objectKey: objectKey,
                frameKey: frameKey,
            });
        }
    });
    return exclusiveFrameKeys;
};

/**
 * Makes sure that there are no other exclusive fullscreen frames other than the specified one.
 * (Turns off fullscreen mode for all the others)
 * @param {string} objectKey
 * @param {string} frameKey
 */
realityEditor.gui.ar.draw.ensureOnlyCurrentFullscreen = function (objectKey, frameKey) {
    var exclusiveFrameKeys = this.getAllVisibleExclusiveFrames();
    if (exclusiveFrameKeys.length > 1) {
        exclusiveFrameKeys.forEach(function (keys) {
            if (keys.frameKey !== frameKey) {
                realityEditor.gui.ar.draw.removeFullscreenFromFrame(keys.objectKey, keys.frameKey);
                // post a message into the ejected frame so that it can update its interface if necessary
                realityEditor.gui.ar.draw.callbackHandler.triggerCallbacks('fullScreenEjected', {
                    objectKey: keys.objectKey,
                    frameKey: keys.frameKey,
                });
            }
        });
    }
};

/**
 * Helper function called by frame API and elsewhere to stop rendering a frame as fullscreen
 * @param {string} objectKey
 * @param {string} frameKey
 * @param {boolean|undefined} isAnimated - true for envelopes, add a minimizing animation and fade in the iframe
 */
realityEditor.gui.ar.draw.removeFullscreenFromFrame = function (objectKey, frameKey, isAnimated) {
    var frame = realityEditor.getFrame(objectKey, frameKey);

    frame.fullScreen = false;
    if (frame.uuid) {
        globalDOMCache[frame.uuid].style.opacity = '1'; // svg overlay still exists so we can reposition, but invisible
    }

    // reset left/top offset when returns to non-fullscreen
    if (globalDOMCache['iframe' + frame.uuid].dataset.leftBeforeFullscreen) {
        globalDOMCache['iframe' + frame.uuid].style.left =
            globalDOMCache['iframe' + frame.uuid].dataset.leftBeforeFullscreen;
    }
    if (globalDOMCache['iframe' + frame.uuid].dataset.topBeforeFullscreen) {
        globalDOMCache['iframe' + frame.uuid].style.top =
            globalDOMCache['iframe' + frame.uuid].dataset.topBeforeFullscreen;
    }

    if (globalDOMCache[frame.uuid].dataset.leftBeforeFullscreen) {
        globalDOMCache[frame.uuid].style.left =
            globalDOMCache[frame.uuid].dataset.leftBeforeFullscreen;
    }
    if (globalDOMCache[frame.uuid].dataset.topBeforeFullscreen) {
        globalDOMCache[frame.uuid].style.top =
            globalDOMCache[frame.uuid].dataset.topBeforeFullscreen;
    }

    globalDOMCache['iframe' + frame.uuid].classList.remove('webGlFrame');
    globalDOMCache[frame.uuid].classList.remove('deactivatedIframeOverlay');

    globalDOMCache['object' + frame.uuid].style.zIndex = '';

    var containingObject = realityEditor.getObject(objectKey);
    if (!containingObject.objectVisible) {
        containingObject.objectVisible = true;
    }

    if (isAnimated) {
        // subtly fade in the iframe instead of instantly pops up in new place
        globalDOMCache['iframe' + frame.uuid].style.opacity = 0;
        globalDOMCache['iframe' + frame.uuid].classList.add('envelopeFadingIn');
        setTimeout(function () {
            // 50ms delay causes the CSS transition property to apply to the new opacity
            globalDOMCache['iframe' + frame.uuid].style.opacity = 1;
            setTimeout(function () {
                globalDOMCache['iframe' + frame.uuid].classList.remove('envelopeFadingIn');
            }, 1000);
        }, 50);

        const parentDiv = globalDOMCache['object' + frame.uuid];
        let tempAnimDiv = document.createElement('div');
        tempAnimDiv.classList.add('temp-anim-div');
        // To obtain this hard-coded matrix3d(), I added a tool, closed it to reveal the icon, and moved the camera towards the tool,
        // so that it almost fills up the screen in the center. And then I get the matrix3d of the object that the tool is attached to.
        // Very hacky, hope to make it procedural in the future
        tempAnimDiv.style.transform =
            'matrix3d(643.374, -0.373505, 0.000212662, 0.000212647, 0.372554, 643.38, 0.000554764, 0.000554727, -2.77404, 4.28636, 0.500033, 0.5, -1406.67, 2173.54, 34481.6, 253.541)';
        tempAnimDiv.style.top = '0';
        tempAnimDiv.style.left = '0';
        tempAnimDiv.style.width = parentDiv.style.width;
        tempAnimDiv.style.height = parentDiv.style.height;
        document.getElementById('GUI').appendChild(tempAnimDiv);
        setTimeout(() => {
            tempAnimDiv.style.transform = globalDOMCache['object' + frame.uuid].style.transform;
            tempAnimDiv.style.width =
                globalDOMCache['object' + frame.uuid].childNodes[0].style.width;
            tempAnimDiv.style.height =
                globalDOMCache['object' + frame.uuid].childNodes[0].style.height;
            tempAnimDiv.style.top = globalDOMCache['object' + frame.uuid].childNodes[0].style.top;
            tempAnimDiv.style.left = globalDOMCache['object' + frame.uuid].childNodes[0].style.left;
            tempAnimDiv.classList.add('temp-anim-div-anim');
            setTimeout(() => {
                tempAnimDiv.parentElement.removeChild(tempAnimDiv);
            }, 500);
        }, 50);
    }
};

/**
 * Fully deletes DOM elements and unloads frames and nodes if they have been invisible for 3+ seconds
 * @param {string} activeKey
 * @param {string} activeVehicle
 * @param {Object} globalDOMCache
 */
realityEditor.gui.ar.draw.killObjects = function (activeKey, activeVehicle, globalDOMCache) {
    if (!activeVehicle.visibleCounter) {
        return;
    }
    if (realityEditor.getObject(activeVehicle.objectId)) {
        if (realityEditor.getObject(activeVehicle.objectId).containsStickyFrame) {
            // Don't kill object with sticky frame
            return;
        }
    }

    if (activeVehicle.visibleCounter > 1) {
        activeVehicle.visibleCounter--;
    } else {
        activeVehicle.visibleCounter--;
        for (var activeFrameKey in activeVehicle.frames) {
            if (!activeVehicle.frames.hasOwnProperty(activeFrameKey)) continue;

            // don't kill inTransitionFrame or its nodes
            if (activeFrameKey === globalStates.inTransitionFrame) continue;

            try {
                globalDOMCache['object' + activeFrameKey].parentNode.removeChild(
                    globalDOMCache['object' + activeFrameKey]
                );
                delete globalDOMCache['object' + activeFrameKey];
                delete globalDOMCache['iframe' + activeFrameKey];
                delete globalDOMCache[activeFrameKey];
                delete globalDOMCache['svg' + activeFrameKey];
                activeVehicle.frames[activeFrameKey].loaded = false;
            } catch (err) {
                this.cout('could not find any frames');
            }

            for (var activeNodeKey in activeVehicle.frames[activeFrameKey].nodes) {
                if (!activeVehicle.frames[activeFrameKey].nodes.hasOwnProperty(activeNodeKey))
                    continue;
                try {
                    globalDOMCache['object' + activeNodeKey].parentNode.removeChild(
                        globalDOMCache['object' + activeNodeKey]
                    );
                    delete globalDOMCache['object' + activeNodeKey];
                    delete globalDOMCache['iframe' + activeNodeKey];
                    delete globalDOMCache[activeNodeKey];
                    delete globalDOMCache['svg' + activeNodeKey];
                    activeVehicle.frames[activeFrameKey].nodes[activeNodeKey].loaded = false;
                } catch (err) {
                    this.cout('could not find any nodes');
                }
            }
        }
        this.cout('killObjects');
    }
};

/**
 * Fully delete the DOM element for a specific frame or node
 * (to be triggered when that frame or node is dropped on the trash)
 * @param {string} thisActiveVehicleKey
 * @param {Frame|Node} thisActiveVehicle
 */
realityEditor.gui.ar.draw.killElement = function (thisActiveVehicleKey, thisActiveVehicle) {
    thisActiveVehicle.loaded = false;
    if (globalDOMCache['object' + thisActiveVehicleKey]) {
        globalDOMCache['object' + thisActiveVehicleKey].parentNode.removeChild(
            globalDOMCache['object' + thisActiveVehicleKey]
        );
    }
    delete globalDOMCache['object' + thisActiveVehicleKey];
    delete globalDOMCache['iframe' + thisActiveVehicleKey];
    delete globalDOMCache[thisActiveVehicleKey];
    delete globalDOMCache['svg' + thisActiveVehicleKey];
    delete globalDOMCache[thisActiveVehicleKey];
};

/**
 * Delete a node from a frame. Remove it from the frame's nodes list, and remove the DOM elements.
 * @param {string} objectId
 * @param {string} frameId
 * @param {string} nodeId
 */
realityEditor.gui.ar.draw.deleteNode = function (objectId, frameId, nodeId) {
    var thisFrame = realityEditor.getFrame(objectId, frameId);
    if (!thisFrame) return;

    delete thisFrame.nodes[nodeId];
    if (this.globalDOMCache['object' + nodeId]) {
        if (this.globalDOMCache['object' + nodeId].parentNode) {
            this.globalDOMCache['object' + nodeId].parentNode.removeChild(
                this.globalDOMCache['object' + nodeId]
            );
        }
        delete this.globalDOMCache['object' + nodeId];
    }
    delete this.globalDOMCache['iframe' + nodeId];
    delete this.globalDOMCache[nodeId];
    delete this.globalDOMCache['svg' + nodeId];
};

/**
 * Delete a frame from an object. Remove it from the objects's frames list, and remove the DOM elements.
 * @param {string} objectId
 * @param {string} frameId
 */
realityEditor.gui.ar.draw.deleteFrame = function (objectId, frameId) {
    realityEditor.forEachNodeInFrame(
        objectId,
        frameId,
        realityEditor.gui.ar.draw.deleteNode.bind(realityEditor.gui.ar.draw)
    );

    delete objects[objectId].frames[frameId];
    if (this.globalDOMCache['object' + frameId]) {
        if (this.globalDOMCache['object' + frameId].parentNode) {
            this.globalDOMCache['object' + frameId].parentNode.removeChild(
                this.globalDOMCache['object' + frameId]
            );
        }
        delete this.globalDOMCache['object' + frameId];
    }
    delete this.globalDOMCache['iframe' + frameId];
    delete this.globalDOMCache[frameId];
    delete this.globalDOMCache['svg' + frameId];
};

/**
 * Sets the objectVisible property of not only the object, but also all of its frames
 * @param {Object} object - reference to the object whose property you wish to set
 * @param {boolean} shouldBeVisible - objects that are not visible do not render their interfaces, nodes, links.
 */
realityEditor.gui.ar.draw.setObjectVisible = function (object, shouldBeVisible) {
    if (!object) return;
    object.objectVisible = shouldBeVisible;
    for (var frameKey in object.frames) {
        //if (!object.frames.hasOwnProperty(frameKey)) continue;
        object.frames[frameKey].objectVisible = shouldBeVisible;
    }
};
