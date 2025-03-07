createNameSpace('realityEditor.gui.screenExtension');

// all screenObjects ever detected in the system
// maps frameKey -> (object, frame, node)
realityEditor.gui.screenExtension.registeredScreenObjects = {};

// the screenObjects currently visible (that should be notified of touch events)
// maps objectKey -> bool
realityEditor.gui.screenExtension.visibleScreenObjects = {};

realityEditor.gui.screenExtension.screenObject = {
    touchState: null,
    closestObject: null,
    x: 0,
    y: 0,
    scale: 1,
    object: null,
    frame: null,
    node: null,
    isScreenVisible: false,
    touchOffsetX: 0,
    touchOffsetY: 0,
    touches: null,
    lastEditor: globalStates.tempUuid,
};

// distance to screen when first tap down
realityEditor.gui.screenExtension.initialDistance = null;

/**
 * @type {CallbackHandler}
 */
realityEditor.gui.screenExtension.callbackHandler =
    new realityEditor.moduleCallbacks.CallbackHandler('gui/screenExtension');

/**
 * Adds a callback function that will be invoked when the specified function is called
 * @param {string} functionName
 * @param {function} callback
 */
realityEditor.gui.screenExtension.registerCallback = function (functionName, callback) {
    if (!this.callbackHandler) {
        this.callbackHandler = new realityEditor.moduleCallbacks.CallbackHandler(
            'gui/screenExtension'
        );
    }
    this.callbackHandler.registerCallback(functionName, callback);
};

// If this is false, it will automatically keep registeredScreenObjects and visibleScreenObjects up-to-date
//   by searching for all objects marked as 'screen'.
// If this is true, relies on a tool on that object to use the activateScreenObject API to register the object.
// This is set to false because the tool with activateScreenObject is needed anyways for screen message passing
//   but I can imagine a future where that tool isn't needed and we can remove this flag
realityEditor.gui.screenExtension.disableAutoRegistration = true;

realityEditor.gui.screenExtension.initService = function () {
    if (this.disableAutoRegistration) {
        console.warn('SCREEN EXTENSION initService is currently internally-disabled');
        return;
    }

    // register screen objects when they are loaded
    realityEditor.network.addObjectDiscoveredCallback(function (object, objectKey) {
        // check if this object is visualization===screen and if so, add to registeredScreenObjects
        if (object.visualization !== 'screen') {
            return;
        }

        realityEditor.gui.screenExtension.registeredScreenObjects[objectKey] = {
            object: objectKey,
            frame: null,
            node: null,
        };
    });

    // register screen objects when their visualization property is updated
    // TODO: this would require a network listener to detect changes

    // use registeredScreenObjects and visibleObjects to get visibleScreenObjects
    realityEditor.gui.ar.draw.addUpdateListener(function (visibleObjects) {
        // return if no registered screenObjects
        let screenExtension = realityEditor.gui.screenExtension;
        let registeredObjectKeys = Object.keys(screenExtension.registeredScreenObjects);
        if (registeredObjectKeys.length === 0) {
            return;
        }

        // remove visibleScreenObjects that aren't in visibleObjects anymore
        let visibleRegisteredObjectKeys = Object.keys(screenExtension.visibleScreenObjects);
        visibleRegisteredObjectKeys.forEach(function (objectKey) {
            if (!visibleObjects.hasOwnProperty(objectKey)) {
                delete screenExtension.visibleScreenObjects[objectKey];
            }
        });

        // add objects that are registered and visible but not in visibleScreenObjects yet
        registeredObjectKeys.forEach(function (objectKey) {
            if (
                visibleObjects.hasOwnProperty(objectKey) &&
                !screenExtension.visibleScreenObjects.hasOwnProperty(objectKey)
            ) {
                screenExtension.visibleScreenObjects[objectKey] = {
                    object: objectKey,
                    frame: null,
                    node: null,
                    x: 0,
                    y: 0,
                    touches: null,
                };
            }
        });
    });
};

realityEditor.gui.screenExtension.shouldSendTouchesToScreen = function (eventObject) {
    // don't send touches
    if (globalStates.guiState !== 'ui') {
        return false;
    }

    // don't send multi-touch if already editing a frame in AR
    if (this.getValidTouches(eventObject).length > 1 && realityEditor.device.editingState.frame) {
        return false;
    }

    // don't send touch to screen if the pocket is open
    if (realityEditor.gui.pocket.pocketShown()) {
        return false;
    }

    return true;
};

realityEditor.gui.screenExtension.touchStart = function (eventObject) {
    if (!this.shouldSendTouchesToScreen(eventObject)) return;

    // additionally, don't send touch start to screen if tapping a menu button
    var frontTouchedElement = document.elementFromPoint(eventObject.x, eventObject.y);
    var didTouchMenuButton =
        frontTouchedElement &&
        frontTouchedElement.id &&
        frontTouchedElement.id.indexOf('ButtonDiv') > -1;
    if (didTouchMenuButton) return;

    // this.updateScreenObject(eventObject);
    this.onScreenTouchDown(eventObject);

    var didTouchARFrame = !!this.screenObject.object && !!this.screenObject.frame;

    if (this.areAnyScreensVisible() && !didTouchARFrame) {
        realityEditor.gui.screenExtension.sendScreenObject();
    }
};

realityEditor.gui.screenExtension.touchMove = function (eventObject) {
    if (!this.shouldSendTouchesToScreen(eventObject)) return;

    // this will retroactively set the screen object to a new frame when it gets added by dragging in from the pocket
    if (
        eventObject.object &&
        eventObject.frame &&
        !this.screenObject.object &&
        !this.screenObject.frame
    ) {
        this.onScreenTouchDown(eventObject);
    }

    this.onScreenTouchMove(eventObject);

    // make sure we aren't manipulating a screenObject frame with AR visualization mode
    var thisVisualization = '';
    if (this.screenObject.object && this.screenObject.frame) {
        var activeFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
        if (activeFrame) {
            thisVisualization = activeFrame.visualization;
        }
    }

    if (this.areAnyScreensVisible() && thisVisualization !== 'ar') {
        realityEditor.gui.screenExtension.sendScreenObject();
    }
};

realityEditor.gui.screenExtension.touchEnd = function (eventObject) {
    if (!this.shouldSendTouchesToScreen(eventObject)) return;

    this.onScreenTouchUp(eventObject);

    if (this.areAnyScreensVisible()) {
        realityEditor.gui.screenExtension.sendScreenObject();
    }

    this.screenObject.x = 0;
    this.screenObject.y = 0;
    this.screenObject.scale = 1;
    // this.screenObject.object = null;
    // this.screenObject.frame = null;
    // this.screenObject.node = null;
    this.screenObject.closestObject = null;
    this.screenObject.touchState = null;

    globalStates.initialDistance = null;

    //console.log("end", this.screenObject);
};

/**
 * Filters a list of TouchEvents to only include those with populated coordinate fields (sometimes empty objects get stuck there)
 * @param {ScreenEventObject} eventObject
 * @return {Array.<{screenX: number, screenY: number, type: string}>}
 */
realityEditor.gui.screenExtension.getValidTouches = function (eventObject) {
    return eventObject.touches.filter(function (touch) {
        return touch && typeof touch.screenX === 'number' && typeof touch.screenY === 'number';
    });
};

realityEditor.gui.screenExtension.onScreenTouchDown = function (eventObject) {
    // figure out if I'm touching on AR frame, screen frame, or nothing
    // console.log('onScreenTouchDown', eventObject, this.screenObject);

    this.screenObject.closestObject = realityEditor.gui.ar.getClosestObject()[0];
    this.screenObject.touchState = eventObject.type;

    if (this.getValidTouches(eventObject).length < 2) {
        // don't reset in between scaling gestures
        this.screenObject.object = eventObject.object;
        this.screenObject.frame = eventObject.frame;
        this.screenObject.node = eventObject.node;
    }

    var didTouchARFrame = !!eventObject.object && !!eventObject.frame;

    this.screenObject.isScreenVisible = !didTouchARFrame;

    if (this.screenObject.closestObject && !didTouchARFrame) {
        // for every visible screen, calculate this touch's exact x,y coordinate within that screen plane
        for (var frameKey in this.visibleScreenObjects) {
            if (!this.visibleScreenObjects.hasOwnProperty(frameKey)) continue;
            var visibleScreenObject = this.visibleScreenObjects[frameKey];
            var point = realityEditor.gui.ar.utilities.screenCoordinatesToTargetXY(
                visibleScreenObject.object,
                eventObject.x,
                eventObject.y
            );
            visibleScreenObject.x = point.x;
            visibleScreenObject.y = point.y;
        }
    }

    // console.log(this.screenObject);
};

/**
 *
 * @param {ScreenEventObject} eventObject
 */
realityEditor.gui.screenExtension.onScreenTouchMove = function (eventObject) {
    // do nothing other than send xy to screen // maybe iff I'm touching on screen frame, move AR frame to mirror its position
    // console.log('onScreenTouchMove', eventObject, this.screenObject);

    this.screenObject.closestObject = realityEditor.gui.ar.getClosestObject()[0];
    this.screenObject.touchState = eventObject.type;

    if (!this.screenObject.closestObject) {
        return;
    }

    // for every visible screen, calculate this touch's exact x,y coordinate within that screen plane
    for (var frameKey in this.visibleScreenObjects) {
        if (!this.visibleScreenObjects.hasOwnProperty(frameKey)) continue;
        var visibleScreenObject = this.visibleScreenObjects[frameKey];
        var point = realityEditor.gui.ar.utilities.screenCoordinatesToTargetXY(
            visibleScreenObject.object,
            eventObject.x,
            eventObject.y
        );
        visibleScreenObject.x = point.x;
        visibleScreenObject.y = point.y;

        // console.log('touched (x,y) = (' + visibleScreenObject.x + ', ' + visibleScreenObject.y + ')')

        // var targetWidth = targetSize.width;
        // var screenX = point.x + targetWidth/2;
        //
        // console.log('x -> ' + screenX);

        // TODO: also do this separately for each visible screen object
        if (this.getValidTouches(eventObject).length > 1) {
            visibleScreenObject.touches = [];
            visibleScreenObject.touches[0] = {
                x: point.x,
                y: point.y,
                type: eventObject.type,
            };

            var secondPoint = realityEditor.gui.ar.utilities.screenCoordinatesToTargetXY(
                visibleScreenObject.object,
                eventObject.touches[1].screenX,
                eventObject.touches[1].screenY
            );
            visibleScreenObject.touches[1] = {
                x: secondPoint.x,
                y: secondPoint.y,
                type: eventObject.touches[1].type,
            };
        } else {
            visibleScreenObject.touches = null;
        }

        // also needs to update AR frame positions so that AR nodes match their screen frames' positions
        if (
            this.screenObject.object &&
            this.screenObject.frame &&
            this.screenObject.object === visibleScreenObject.object
        ) {
            var matchingARFrame = realityEditor.getFrame(
                this.screenObject.object,
                this.screenObject.frame
            );
            if (matchingARFrame && matchingARFrame.visualization === 'screen') {
                // console.log('moved matching ar frame from (' + matchingARFrame.ar.x + ', ' + matchingARFrame.ar.y + ') ...');

                // keep the invisible AR frames synchronized with the position of their screen frames (so that nodes are in same place and pulls out in the right place)
                matchingARFrame.ar.x = point.x;
                matchingARFrame.ar.y = -1 * point.y; // y-axis is inverted between screen and AR

                // console.log('...to (' + matchingARFrame.ar.x + ', ' + matchingARFrame.ar.y + ')');
            }
        }
    }

    // console.log(this.screenObject);
};

realityEditor.gui.screenExtension.onScreenTouchUp = function (eventObject) {
    // reset screen object to null and update screen state to match
    // console.log('onScreenTouchUp', eventObject, this.screenObject);

    this.screenObject.closestObject = realityEditor.gui.ar.getClosestObject()[0];
    this.screenObject.touchState = eventObject.type;

    if (this.getValidTouches(eventObject).length < 2) {
        // don't reset in between scaling gestures
        this.screenObject.object = null;
        this.screenObject.frame = null;
        this.screenObject.node = null;
    }

    // console.log(this.screenObject);
};

realityEditor.gui.screenExtension.update = function () {
    if (globalStates.guiState !== 'ui') return;
    if (!this.areAnyScreensVisible()) return;

    // console.log("end", this.screenObject);
    if (this.screenObject.touchState) {
        realityEditor.gui.screenExtension.calculatePushPop();
    }
};

realityEditor.gui.screenExtension.receiveObject = function (object) {
    // console.log('receiveObject', object);

    this.screenObject.object = object.object;
    this.screenObject.frame = object.frame;
    this.screenObject.node = object.node;
    this.screenObject.touchOffsetX = object.touchOffsetX;
    this.screenObject.touchOffsetY = object.touchOffsetY;

    if (this.screenObject.object && this.screenObject.frame) {
        overlayDiv.classList.add('overlayScreenFrame');
        overlayDiv.style.backgroundImage = 'none';
        overlayDiv.classList.remove('overlayMemory');
    } else {
        overlayDiv.classList.remove('overlayScreenFrame');
    }
};

realityEditor.gui.screenExtension.onScreenPushIn = function (screenFrame) {
    // set screen object visible, wait to hear that the screen received it, then hide AR frame

    var isScreenVisible = true;

    if (isScreenVisible !== this.screenObject.isScreenVisible) {
        console.log('onScreenPushIn');

        this.screenObject.isScreenVisible = true;
        this.screenObject.scale =
            realityEditor.gui.ar.positioning.getPositionData(screenFrame).scale;
        // realityEditor.gui.ar.draw.changeVisualization(screenFrame, newVisualization); // TODO: combine this with updateArFrameVisibility
        realityEditor.app.tap();
        realityEditor.gui.screenExtension.updateArFrameVisibility();
    }
};

realityEditor.gui.screenExtension.onScreenPullOut = function () {
    // set screen object hidden, wait to hear that the screen received it, then move AR frame to position and show AR frame

    var isScreenVisible = false;

    if (isScreenVisible !== this.screenObject.isScreenVisible) {
        console.log('onScreenPullOut');

        this.screenObject.isScreenVisible = false;
        // realityEditor.gui.ar.draw.changeVisualization(screenFrame, newVisualization); // TODO: combine this with updateArFrameVisibility
        realityEditor.app.tap();
        realityEditor.gui.screenExtension.updateArFrameVisibility();
    }
};

realityEditor.gui.screenExtension.calculatePushPop = function () {
    if (globalStates.freezeButtonState) return; // don't allow pushing and pulling if the background is frozen

    var screenFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
    if (!screenFrame) return;

    // don't do it if we're moving the tool directly dropped from the pocket
    if (pocketFrame.vehicle && pocketFrame.vehicle.uuid === this.screenObject.frame) {
        return;
    }

    // don't do it if we're transitioning the tool from another object
    if (globalStates.inTransitionFrame === this.screenObject.frame) {
        return;
    }

    var isScreenObjectVisible =
        !!realityEditor.gui.ar.draw.visibleObjects[this.screenObject.object]; // can only push in frames to visible objects
    if (screenFrame && isScreenObjectVisible && !pocketDropAnimation) {
        // can only push in frames not being animated forwards when dropping from pocket

        if (screenFrame.location === 'global') {
            // only able to push global frames into the screen

            let toolNode = realityEditor.sceneGraph.getSceneNodeById(this.screenObject.frame);
            let objectNode = realityEditor.sceneGraph.getSceneNodeById(this.screenObject.object);

            // get position of tool relative to object, because this is used to push things into the screen
            let relativeMatrix =
                toolNode && objectNode
                    ? toolNode.getMatrixRelativeTo(objectNode)
                    : realityEditor.gui.ar.utilities.newIdentityMatrix();
            let zDistance = relativeMatrix[14];

            // calculate distance from camera to object, because this is used to pull things out of screen
            var distanceToObject = realityEditor.sceneGraph.getDistanceToCamera(
                this.screenObject.object
            );

            if (!globalStates.initialDistance) {
                globalStates.initialDistance = distanceToObject;
            }

            var distanceThreshold = globalStates.framePullThreshold;

            // only push in frame if it is within the width and height of the image target (screen size)
            var touchPosition = realityEditor.gui.ar.positioning.getMostRecentTouchPosition();
            var projectedPoint = realityEditor.gui.ar.utilities.screenCoordinatesToTargetXY(
                this.screenObject.object,
                touchPosition.x,
                touchPosition.y
            );
            let targetSize = realityEditor.gui.utilities.getTargetSize(this.screenObject.object);
            var isWithinWidth = Math.abs(projectedPoint.x) < (targetSize.width * 1000) / 2;
            var isWithinHeight = Math.abs(projectedPoint.y) < (targetSize.height * 1000) / 2;

            var didPushIn = false;

            // pushing in happens when z distance between tool and screen is negative
            if (isWithinWidth && isWithinHeight && zDistance < 0) {
                didPushIn = true;
            }

            // pulling out happens when current distance to screen exceeds initial distance by a certain threshold
            var didPullOut =
                distanceToObject > globalStates.initialDistance + distanceThreshold ||
                !isWithinWidth ||
                !isWithinHeight;

            if (didPullOut) {
                this.onScreenPullOut(screenFrame);
            } else if (didPushIn) {
                this.onScreenPushIn(screenFrame);
            }
        }
    }
};

realityEditor.gui.screenExtension.sendScreenObject = function () {
    for (var frameKey in this.visibleScreenObjects) {
        if (!this.visibleScreenObjects.hasOwnProperty(frameKey)) continue;
        var visibleScreenObject = this.visibleScreenObjects[frameKey];
        var screenObjectClone = JSON.parse(JSON.stringify(this.screenObject));
        screenObjectClone.x = visibleScreenObject.x;
        screenObjectClone.y = visibleScreenObject.y;
        screenObjectClone.targetScreen = {
            object: visibleScreenObject.object,
            frame: visibleScreenObject.frame,
        };
        screenObjectClone.touches = visibleScreenObject.touches;

        var iframe = globalDOMCache['iframe' + frameKey];
        if (iframe) {
            iframe.contentWindow.postMessage(
                JSON.stringify({
                    screenObject: screenObjectClone,
                }),
                '*'
            );
        }
    }
};

/**
 * Map touchOffset x and y from target units to 0-1 range representing the percent x and y within the touched frame
 * e.g. (0,0) means tapped upper left corner, (0.5, 0.5) is center, (1,1) is lower right corner
 * @param thisFrame
 * @return {{x: number, y: number}}
 */
realityEditor.gui.screenExtension.getTouchOffsetAsPercent = function (thisFrame) {
    var frameWidth = parseInt(thisFrame.width);
    var frameHeight = parseInt(thisFrame.height);

    var frameDimensions = {
        width: frameWidth * thisFrame.ar.scale,
        height: frameHeight * thisFrame.ar.scale,
    };

    // touchOffset is only (0,0) on the upper left corner of an iframe if that frame has scale=1
    // otherwise, the upper left corner "scales into" a higher x,y touchOffset coordinate
    // this calculation corrects for that so that frames of any scale have (0,0) at upper left
    var touchOffsetCorrectedForScale = {
        x:
            realityEditor.device.editingState.touchOffset.x -
            (frameWidth * (1.0 - thisFrame.ar.scale)) / 2,
        y:
            realityEditor.device.editingState.touchOffset.y -
            (frameHeight * (1.0 - thisFrame.ar.scale)) / 2,
    };

    var xPercent = touchOffsetCorrectedForScale.x / frameDimensions.width;
    var yPercent = touchOffsetCorrectedForScale.y / frameDimensions.height;

    return {
        x: xPercent,
        y: yPercent,
    };
};

realityEditor.gui.screenExtension.updateArFrameVisibility = function () {
    var thisFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
    if (thisFrame) {
        globalStates.initialDistance = null;

        var oldVisualizationPositionData = null;

        if (this.screenObject.isScreenVisible) {
            console.log('hide frame -> screen');
            thisFrame.visualization = 'screen';

            if (realityEditor.device.editingState.touchOffset) {
                var touchOffsetPercent = this.getTouchOffsetAsPercent(thisFrame);
                this.screenObject.touchOffsetX = touchOffsetPercent.x;
                this.screenObject.touchOffsetY = touchOffsetPercent.y;
            }

            realityEditor.gui.ar.draw.hideTransformed(
                thisFrame.uuid,
                thisFrame,
                globalDOMCache,
                cout
            );

            thisFrame.ar.x = 0;
            thisFrame.ar.y = 0;
            thisFrame.begin = [];
            thisFrame.ar.matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

            oldVisualizationPositionData = thisFrame.ar;

            realityEditor.device.resetEditingState();

            // update position on server
            // var urlEndpoint = (realityEditor.network.useHTTPS ? 'https' : 'http') + '://' + objects[this.screenObject.object].ip + ':' + httpPort + '/object/' + this.screenObject.object + "/frame/" + this.screenObject.frame + "/node/" + null + "/size/";
            // var content = thisFrame.ar;
            // content.lastEditor = globalStates.tempUuid;
            // realityEditor.network.postData(urlEndpoint, content);
        } else {
            console.log('show frame -> AR');

            thisFrame.visualization = 'ar';

            // set to false so it definitely gets re-added and re-rendered
            thisFrame.visible = false;

            var activeKey = thisFrame.uuid;

            let sceneNode = realityEditor.sceneGraph.getSceneNodeById(activeKey);
            let startingMatrix = realityEditor.gui.ar.utilities.newIdentityMatrix();
            startingMatrix[14] = 50; // start out 5 cm in front of screen
            sceneNode.setLocalMatrix(startingMatrix);

            // resize iframe to override incorrect size it starts with so that it matches the screen frame
            var iframe = globalDOMCache['iframe' + activeKey];
            var overlay = globalDOMCache[activeKey];
            var svg = globalDOMCache['svg' + activeKey];

            iframe.style.width = thisFrame.frameSizeX + 'px';
            iframe.style.height = thisFrame.frameSizeY + 'px';
            iframe.style.left = (globalStates.height - parseFloat(thisFrame.frameSizeX)) / 2 + 'px';
            iframe.style.top = (globalStates.width - parseFloat(thisFrame.frameSizeY)) / 2 + 'px';

            overlay.style.width = iframe.style.width;
            overlay.style.height = iframe.style.height;
            overlay.style.left = iframe.style.left;
            overlay.style.top = iframe.style.top;

            svg.style.width = iframe.style.width;
            svg.style.height = iframe.style.height;
            realityEditor.gui.ar.moveabilityOverlay.createSvg(svg);

            // TODO: this still isn't correct all of the time
            // set the correct position for the frame that was just pulled to AR

            // 1. move it so it is centered on the pointer, ignoring touchOffset
            var touchPosition = realityEditor.gui.ar.positioning.getMostRecentTouchPosition();
            // realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinateBasedOnTarget(thisFrame, touchPosition.x, touchPosition.y, false);

            let xPos = touchPosition.x - window.innerWidth / 2; // (0, 0) is the middle of the screen
            let yPos = touchPosition.y - window.innerHeight / 2;

            realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(
                thisFrame,
                xPos,
                yPos,
                false
            );

            // set touch offset to center of tool's container (which is sized to fit the screen)
            realityEditor.device.editingState.touchOffset = {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            };

            // realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate(thisFrame, touchPosition.x, touchPosition.y, true);

            // // 2. convert touch offset from percent scale to actual scale of the frame
            // var convertedTouchOffsetX = (this.screenObject.touchOffsetX) * parseFloat(thisFrame.width);
            // var convertedTouchOffsetY = (this.screenObject.touchOffsetY) * parseFloat(thisFrame.height);
            //
            // // 3. manually apply the touchOffset to the results so that it gets rendered in the correct place on the first pass
            // thisFrame.ar.x -= (convertedTouchOffsetX - parseFloat(thisFrame.width)/2 ) * thisFrame.ar.scale;
            // thisFrame.ar.y -= (convertedTouchOffsetY - parseFloat(thisFrame.height)/2 ) * thisFrame.ar.scale;

            // TODO: this causes a bug now with the offset... figure out why it used to be necessary but doesn't help anymore
            // 4. set the actual touchOffset so that it stays in the correct offset as you drag around
            // realityEditor.device.editingState.touchOffset = {
            //     x: convertedTouchOffsetX,
            //     y: convertedTouchOffsetY
            // };

            realityEditor.gui.ar.draw.showARFrame(activeKey);

            realityEditor.device.beginTouchEditing(thisFrame.objectId, activeKey);
        }
        console.log('updateArFrameVisibility', thisFrame.visualization);
        // realityEditor.gui.ar.draw.changeVisualization(thisFrame, thisFrame.visualization);

        realityEditor.gui.screenExtension.sendScreenObject();

        realityEditor.network.updateFrameVisualization(
            objects[thisFrame.objectId].ip,
            thisFrame.objectId,
            thisFrame.uuid,
            thisFrame.visualization,
            oldVisualizationPositionData
        );

        this.callbackHandler.triggerCallbacks('updateArFrameVisibility', {
            objectKey: this.screenObject.object,
            frameKey: this.screenObject.frame,
            newVisualization: thisFrame.visualization,
        });
    }
};

realityEditor.gui.screenExtension.areAnyScreensVisible = function () {
    return Object.keys(this.visibleScreenObjects).length > 0;
};
