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

createNameSpace('realityEditor.gui.ar');

/**
 * @fileOverview realityEditor.gui.ar.index.js
 * Various functions related to the AR process, including setting
 * the projection matrix, and various ways of finding closest frames and nodes.
 */

/**********************************************************************************************************************
 **********************************************************************************************************************/

/**
 * Called from the native iOS Vuforia engine with the projection matrix for rendering to the screen correctly.
 * Makes some adjustments based on the viewport of the device and notifies the native iOS app when it is done.
 * @param {Array.<number>} matrix - a 4x4 projection matrix
 */
realityEditor.gui.ar.setProjectionMatrix = function (matrix) {
    var corX = 0;
    var corY = 0;
    // var scaleAdjusting = 1;

    // iPhone 5(GSM), iPhone 5 (GSM+CDMA)
    if (globalStates.device === 'iPhone5,1' || globalStates.device === 'iPhone5,2') {
        corX = 0;
        corY = -3;
    }

    // iPhone 5c (GSM), iPhone 5c (GSM+CDMA)
    if (globalStates.device === 'iPhone5,3' || globalStates.device === 'iPhone5,4') {
        // not yet tested todo add values
        corX = 0;
        corY = 0;
    }

    // iPhone 5s (GSM), iPhone 5s (GSM+CDMA)
    if (globalStates.device === 'iPhone6,1' || globalStates.device === 'iPhone6,2') {
        corX = -3;
        corY = -1;
    }

    // iPhone 6 plus
    if (globalStates.device === 'iPhone7,1') {
        // not yet tested todo add values
        corX = 0;
        corY = 0;
    }

    // iPhone 6
    if (globalStates.device === 'iPhone7,2') {
        corX = -4.5;
        corY = -6;
    }

    // iPhone 6s
    if (globalStates.device === 'iPhone8,1') {
        // not yet tested todo add values
        corX = 0;
        corY = 0;
    }

    // iPhone 6s Plus
    if (globalStates.device === 'iPhone8,2') {
        corX = -0.3;
        corY = -1.5;
    }
    // iPhone 8
    if (globalStates.device === 'iPhone10,1') {
        corX = 1;
        corY = -5;
        console.log('------------------------------------');
        // scaleAdjusting = 0.84;
    }

    // iPad
    if (globalStates.device === 'iPad1,1') {
        // not yet tested todo add values
        corX = 0;
        corY = 0;
    }

    // iPad 2 (WiFi), iPad 2 (GSM), iPad 2 (CDMA), iPad 2 (WiFi)
    if (
        globalStates.device === 'iPad2,1' ||
        globalStates.device === 'iPad2,2' ||
        globalStates.device === 'iPad2,3' ||
        globalStates.device === 'iPad2,4'
    ) {
        corX = -31;
        corY = -5;
    }

    // iPad Mini (WiFi), iPad Mini (GSM), iPad Mini (GSM+CDMA)
    if (
        globalStates.device === 'iPad2,5' ||
        globalStates.device === 'iPad2,6' ||
        globalStates.device === 'iPad2,7'
    ) {
        // not yet tested todo add values
        corX = 0;
        corY = 0;
    }

    // iPad 3 (WiFi), iPad 3 (GSM+CDMA), iPad 3 (GSM)
    if (
        globalStates.device === 'iPad3,1' ||
        globalStates.device === 'iPad3,2' ||
        globalStates.device === 'iPad3,3'
    ) {
        corX = -3;
        corY = -1;
    }
    //iPad 4 (WiFi), iPad 4 (GSM), iPad 4 (GSM+CDMA)
    if (
        globalStates.device === 'iPad3,4' ||
        globalStates.device === 'iPad3,5' ||
        globalStates.device === 'iPad3,6'
    ) {
        corX = -5;
        corY = 17;
    }

    // iPad Air (WiFi), iPad Air (Cellular)
    if (globalStates.device === 'iPad4,1' || globalStates.device === 'iPad4,2') {
        // not yet tested todo add values
        corX = 0;
        corY = 0;
    }

    // iPad mini 2G (WiFi) iPad mini 2G (Cellular)
    if (globalStates.device === 'iPad4,4' || globalStates.device === 'iPad4,5') {
        corX = -11;
        corY = 6.5;
    }

    // iPad Pro
    if (globalStates.device === 'iPad6,7') {
        // TODO: make any small corrections if needed
    }

    //  generate all transformations for the object that needs to be done ASAP
    var scaleZ = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1];

    var multiplier = -1;

    var viewportScaling = [
        globalStates.height,
        0,
        0,
        0,
        0,
        multiplier * globalStates.width,
        0,
        0,
        0,
        0,
        1,
        0,
        corX - 5,
        corY + 10,
        0,
        1,
    ];

    // changes for iPhoneX
    if (globalStates.device === 'iPhone10,3') {
        var scaleRatio = globalStates.height / globalStates.width / (568 / 320);

        // new scale based on aspect ratio of camera feed - just use the size of the old iphone screen
        viewportScaling[0] = 568 * scaleRatio;
        viewportScaling[5] = -320 * scaleRatio;
    }

    var r = [];

    var shouldMatrixBeFlipped =
        globalStates.realProjectionMatrix[0] !== globalStates.unflippedRealProjectionMatrix[0];

    globalStates.unflippedRealProjectionMatrix = realityEditor.gui.ar.utilities.copyMatrix(matrix);
    globalStates.realProjectionMatrix = realityEditor.gui.ar.utilities.copyMatrix(matrix);
    this.utilities.multiplyMatrix(scaleZ, matrix, r);
    this.utilities.multiplyMatrix(r, viewportScaling, globalStates.projectionMatrix);

    // if setProjectionMatrix happens after onOrientationChanged, flip it if necessary
    if (shouldMatrixBeFlipped) {
        realityEditor.gui.ar.updateProjectionMatrix(true);
    }
};

/**
 * Updates the projection matrix to be rotated 180 degrees or 0 degrees based on whether the phone is upside down.
 * @param {boolean} isFlippedUpsideDown
 */
realityEditor.gui.ar.updateProjectionMatrix = function (isFlippedUpsideDown) {
    var isMatrixAlreadyFlipped =
        globalStates.realProjectionMatrix[0] !== globalStates.unflippedRealProjectionMatrix[0];

    // rotate if screen is flipped upside down
    if (
        (isFlippedUpsideDown && !isMatrixAlreadyFlipped) ||
        (!isFlippedUpsideDown && isMatrixAlreadyFlipped)
    ) {
        globalStates.realProjectionMatrix[0] *= -1; // to rotate 180 degrees, just flip X and Y coordinates
        globalStates.realProjectionMatrix[5] *= -1;
        globalStates.projectionMatrix[0] *= -1; // needs to update both the projection and realProjection matrices
        globalStates.projectionMatrix[5] *= -1;
    }
};

/**
 * Returns a list of nodes that are visible and within the screen bounds.
 * @return {Array.<{objectKey: string, frameKey: string, nodeKey: string}>}
 */
realityEditor.gui.ar.getVisibleNodes = function () {
    var visibleNodes = [];

    for (var objectKey in objects) {
        for (var frameKey in objects[objectKey].frames) {
            var thisFrame = realityEditor.getFrame(objectKey, frameKey);
            if (!thisFrame) continue;
            if (realityEditor.gui.ar.draw.visibleObjects.hasOwnProperty(objectKey)) {
                // this is a way to check which objects are currently visible
                // var thisObject = objects[objectKey];

                for (var nodeKey in thisFrame.nodes) {
                    if (!thisFrame.nodes.hasOwnProperty(nodeKey)) continue;

                    if (realityEditor.gui.ar.utilities.isNodeWithinScreen(thisFrame, nodeKey)) {
                        visibleNodes.push({
                            objectKey: objectKey,
                            frameKey: frameKey,
                            nodeKey: nodeKey,
                        });
                    }
                }
            }
        }
    }
    return visibleNodes;
};

/**
 * Given a list of visible nodes (generated by this.getVisibleNodes), returns a list of any links to or from them.
 * @param {Array.<{objectKey: string, frameKey: string, nodeKey: string}>} visibleNodes
 * @return {Array.<{objectKey: string, frameKey: string, linkKey: string}>}
 */
realityEditor.gui.ar.getVisibleLinks = function (visibleNodes) {
    var visibleNodeKeys = visibleNodes.map(function (keys) {
        return keys.nodeKey;
    });

    var visibleLinks = [];

    for (var objectKey in objects) {
        for (var frameKey in objects[objectKey].frames) {
            var thisFrame = realityEditor.getFrame(objectKey, frameKey);
            if (!thisFrame) continue;

            for (var linkKey in thisFrame.links) {
                if (!thisFrame.links.hasOwnProperty(linkKey)) continue;
                var thisLink = thisFrame.links[linkKey];

                var isVisibleNodeA = visibleNodeKeys.indexOf(thisLink.nodeA) > -1;
                var isVisibleNodeB = visibleNodeKeys.indexOf(thisLink.nodeB) > -1;

                if (isVisibleNodeA || isVisibleNodeB) {
                    visibleLinks.push({
                        objectKey: objectKey,
                        frameKey: frameKey,
                        linkKey: linkKey,
                    });
                }
            }
        }
    }

    console.log('visibleLinks = ', visibleLinks);
    return visibleLinks;
};

/**
 * @desc Object reference
 **/
realityEditor.gui.ar.objects = objects;

realityEditor.gui.ar.MAX_DISTANCE = 10000000000;

realityEditor.gui.ar.closestObjectFilters = [];

/**
 * Allows add-ons to check each objectKey in visible objects and reject them from being considered closest
 * @param {function} filterFunction
 */
realityEditor.gui.ar.injectClosestObjectFilter = function (filterFunction) {
    this.closestObjectFilters.push(filterFunction);
};

/**
 * This function returns the closest visible object relative to the camera.
 * Priority: 1) closest non-world objects. 2) closest world objects other than localWorld object. 3) local world object
 * Accepts an optional filter that will be applied to each object key to restrict which objects are considered.
 * @param {function<string>} optionalFilter - a function used to narrow down which objects to consider. takes in an object key. if it returns false, ignore that object.
 * @return {Array.<string|null>} [ObjectKey, null, null]
 **/
realityEditor.gui.ar.getClosestObject = function (optionalFilter) {
    var object = null;
    var frame = null;
    var node = null;

    // first looks for visible non-world objects
    var info = this.closestVisibleObject(function (objectKey) {
        if (typeof optionalFilter !== 'undefined') {
            if (!optionalFilter(objectKey)) {
                return false;
            }
        }
        for (let i = 0; i < realityEditor.gui.ar.closestObjectFilters.length; i++) {
            if (!realityEditor.gui.ar.closestObjectFilters[i](objectKey)) {
                return false;
            }
        }
        return (
            typeof objects[objectKey] !== 'undefined' &&
            !realityEditor.worldObjects.isWorldObjectKey(objectKey)
        );
    });

    // if no visible non-world objects, get the closest non-local-world object
    if (!info.objectKey) {
        info = this.closestVisibleObject(function (objectKey) {
            if (typeof optionalFilter !== 'undefined') {
                if (!optionalFilter(objectKey)) {
                    return false;
                }
            }
            return (
                realityEditor.worldObjects.isWorldObjectKey(objectKey) &&
                objectKey !== realityEditor.worldObjects.getLocalWorldId()
            );
        });
    }

    // if no non-local-world object, see if the local world object passes the filter and use it as a last resort
    if (!info.objectKey) {
        info = this.closestVisibleObject(function (objectKey) {
            if (typeof optionalFilter !== 'undefined') {
                if (!optionalFilter(objectKey)) {
                    return false;
                }
            }
            return objectKey === realityEditor.worldObjects.getLocalWorldId();
        });
    }

    object = info.objectKey;

    return [object, frame, node];
};

/**
 * Reusable function that will return the object closest to the camera that passes whatever conditions you specify.
 * @param {function|undefined} optionalFilter - function that takes in an object key and returns true or false.
 * @return {{distance: number, objectKey: string}}
 */
realityEditor.gui.ar.closestVisibleObject = function (optionalFilter) {
    var object = null;
    var closest = this.MAX_DISTANCE;
    var distance = this.MAX_DISTANCE;

    for (var objectKey in realityEditor.gui.ar.draw.visibleObjects) {
        if (typeof optionalFilter !== 'undefined') {
            if (!optionalFilter(objectKey)) {
                continue;
            }
        }

        // distance is computed from modelViewMatrices rather than un-modified visibleObject matrices to be compatible
        // with both regular objects and anchor objects
        distance = realityEditor.sceneGraph.getDistanceToCamera(objectKey);

        if (distance < closest) {
            object = objectKey;
            closest = distance;
        }
    }

    return {
        objectKey: object,
        distance: distance,
    };
};

/**
 * @desc This function returns the closest visible frame relative to the camera.
 * @param filterFunction - optional function applied to each frame. return true if you want to include that frame in the search, false to ignore.
 *                         for example, function localARFilter(frame) {return frame.visualization !== 'screen' && frame.location === 'local';}
 * @return {Array.<string|null>} [ObjectKey, FrameKey, null]
 **/
realityEditor.gui.ar.getClosestFrame = function (filterFunction) {
    var object = null;
    var frame = null;
    var node = null;
    var closest = 10000000000;
    var distance = 10000000000;

    for (var objectKey in realityEditor.gui.ar.draw.visibleObjects) {
        for (var frameKey in this.objects[objectKey].frames) {
            // apply an additional filter, e.g.
            if (filterFunction) {
                if (!filterFunction(this.objects[objectKey].frames[frameKey])) continue;
            }

            distance = realityEditor.sceneGraph.getDistanceToCamera(frameKey);
            if (distance < closest) {
                object = objectKey;
                frame = frameKey;
                closest = distance;
            }
        }
    }

    return [object, frame, node];
};

/**
 * @desc This function returns the closest visible node relative to the camera.
 * @return {Array.<string|null>} [ObjectKey, FrameKey, NodeKey]
 **/
realityEditor.gui.ar.getClosestNode = function () {
    var object = null;
    var frame = null;
    var node = null;
    var closest = 10000000000;
    var distance = 10000000000;

    for (var objectKey in realityEditor.gui.ar.draw.visibleObjects) {
        for (var frameKey in this.objects[objectKey].frames) {
            for (var nodeKey in this.objects[objectKey].frames[frameKey].nodes) {
                // don't include hidden node types (e.g. dataStore) when finding closest
                let thisNode = realityEditor.getNode(objectKey, frameKey, nodeKey);
                if (realityEditor.gui.ar.draw.hiddenNodeTypes.indexOf(thisNode.type) > -1) {
                    break;
                }
                // the above check is deprecated: new nodes will have an invisible property
                if (thisNode.invisible) {
                    break;
                }

                distance = realityEditor.sceneGraph.getDistanceToCamera(nodeKey);
                if (distance < closest) {
                    object = objectKey;
                    frame = frameKey;
                    node = nodeKey;
                    closest = distance;
                }
            }
        }
    }
    return [object, frame, node];
};

/**
 * Returns the frame whose center screen coordinate is closest to the specified screen coordinate.
 * @param {number} screenX
 * @param {number} screenY
 * @return {Array.<string|null>} [ObjectKey, FrameKey, NodeKey]
 */
realityEditor.gui.ar.getClosestFrameToScreenCoordinates = function (screenX, screenY) {
    var object = null;
    var frame = null;
    var node = null;
    var closest = 10000000000;
    var distance = 10000000000;

    for (var objectKey in realityEditor.gui.ar.draw.visibleObjects) {
        for (var frameKey in this.objects[objectKey].frames) {
            distance = realityEditor.sceneGraph.getDistanceToCamera(frameKey);

            var thisFrame = realityEditor.getFrame(objectKey, frameKey);
            var dx = screenX - thisFrame.screenX;
            var dy = screenY - thisFrame.screenY;
            distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closest) {
                object = objectKey;
                frame = frameKey;
                closest = distance;
            }
        }
    }
    return [object, frame, node];
};

/**
 * If you pass in a frame, returns its distanceScale.
 * If you pass in a node, returns the distanceScale of the frame it belongs to.
 * If the frame doesn't have a value, defaults to 1.0
 * @param {Frame|Node} activeVehicle
 * @return {number}
 */
realityEditor.gui.ar.getDistanceScale = function (activeVehicle) {
    var keys = realityEditor.getKeysFromVehicle(activeVehicle);
    if (keys.nodeKey) {
        // it's a node, return its parent frame's value
        var parentFrame = realityEditor.getFrame(keys.objectKey, keys.frameKey);
        if (!parentFrame) {
            return 1;
        }
        return parentFrame.distanceScale || 1;
    } else {
        // it's a frame, return its own value
        return activeVehicle.distanceScale || 1;
    }
};
