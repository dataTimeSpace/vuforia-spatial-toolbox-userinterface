/**
 * Coordinates with canvases in the scene to asynchronously take a screenshot at the proper time in the render loop
 *
 * To make use of this with a new canvas, do the following:
 * 1. import { getPendingCapture } from './sceneCapture.js';
 *    ...
 *    // In the main render loop, directly after finishing drawing, do:
 *    let pendingCapture = getPendingCapture('thisCanvasId');
 *    if (pendingCapture) {
 *      pendingCapture.performCapture();
 *    }
 * 2. Then when you want to take a screenshot of the canvas elsewhere, do:
 *    import { captureScreenshot } from '../../src/gui/sceneCapture.js';
 *    ...
 *    captureScreenshot('thisCanvasId', options).then(screenshotImageSrc => {
 *      console.log(screenshotImageSrc);
 *    });
 */
import { uuidTime } from "../utilities/uuid.js";
import { addPostMessageHandler } from "../network/index.js";

class SceneCapture {
    constructor() {
        this.pendingCaptures = {};
        
        this.pendingThingViewDatas = {};
        addPostMessageHandler('thingviewSendCanvasCapture', (evt) => {
            console.log('scene capture got message from thingview tool!');
            // console.log(evt.thingviewResponseId);
            if (evt.thingviewCanvasData === undefined) return;
            // todo Steve figure out how to keep this in sync with the request !
            this.pendingThingViewDatas[evt.thingviewResponseId] = evt.thingviewCanvasData;
        });
    }
    
    async checkGetThingViewData(thingviewRequestId) {
        return new Promise((resolve, reject) => {
            let id = setInterval(() => {
                if (this.pendingThingViewDatas[thingviewRequestId] !== undefined) {
                    clearInterval(id);
                    resolve(this.pendingThingViewDatas[thingviewRequestId]); // return the ThingView canvas data that corresponds to the request id
                }
            }, 0);
        });
    }
    
    async requestAndGetThingViewCanvasData(thingviewRequestId) {
        return new Promise(async (resolve, reject) => {
            realityEditor.forEachFrameInAllObjects((objectkey, framekey) => {
                if (realityEditor.envelopeManager.getFrameTypeFromKey(objectkey, framekey) === 'thingview') {
                    let iframe = document.getElementById('iframe' + framekey);
                    iframe.contentWindow.postMessage(JSON.stringify({
                        requestCanvas: true,
                        thingviewRequestId: thingviewRequestId
                    }), '*');
                }
            });
            let image = new Image();
            image.crossOrigin = 'Anonymous'; // Important if dealing with cross-origin data
            image.onload = function() {
                resolve(image);
            };
            image.onerror = function(err) {
                reject('Failed to load image:', err);
            };
            image.src = await this.checkGetThingViewData(thingviewRequestId);
        })
    }
    
    async createThreejsCanvasImage(src) {
        let image = new Image();
        image.crossOrigin = 'anonymous';
        return new Promise(resolve => {
            image.onload = () => {
                resolve(image);
            }
            image.onerror = function(err) {
                reject('Failed to load image:', err);
            };
            image.src = src;
        })
    }
    
    async waitIntervalForBothCanvasesToLoad(boolFunc) {
        return new Promise(resolve => {
            let id = setInterval(() => {
                if (boolFunc()) {
                    clearInterval(id);
                    resolve();
                }
            }, 0);
        });
    }

    /**
     * Resolves a pending capture with a base-64 encoded image of the specified canvas
     * @param {string} canvasId
     * @param {number|undefined} outputWidth
     * @param {number|undefined} outputHeight
     * @param {Object} [compressionOptions]
     * @param {boolean} [compressionOptions.useJpg] - Uses PNG if false, JPG if true
     * @param {number} [compressionOptions.quality] - Quality of JPG, if used (0 to 1)
     */
    async captureMultiple(pendingCaptureKey, outputWidth, outputHeight, compressionOptions) {
        let thingviewRequestId = `thingview-capture-${uuidTime()}`;
        let canvasIds = pendingCaptureKey.split('-');
        
        // canvasIds is an array of canvas IDs
        if (!Array.isArray(canvasIds) || canvasIds.length === 0) {
            console.warn('No canvas IDs provided for capture');
            return;
        }

        // Get the source canvases
        let dataToBeDrawn = [];
        for (let i = 0; i < canvasIds.length; i++) {
            let id = canvasIds[i];
            if (id === 'CreoViewWebGLDiv_CreoViewCanvas0') {
                // let thingviewCanvasImage = await this.requestAndGetThingViewCanvasData(thingviewRequestId);
                this.requestAndGetThingViewCanvasData(thingviewRequestId).then((thingviewCanvasImage) => {
                    dataToBeDrawn.push(thingviewCanvasImage);
                });
            } else {
                let threejsCanvas = document.getElementById(id);
                // todo Steve: (solved) tip: 
                //  to prevent three js canvas capture from taking a screenshot after the supposed time
                //  do "canvas.toDataURL" to save it into a jpeg first, so that this information is always accessible, even after canvas changes later
                let threejsCanvasData = threejsCanvas.toDataURL('image/jpeg');
                this.createThreejsCanvasImage(threejsCanvasData).then(image => {
                    dataToBeDrawn.push(image);
                });
            }
        }
        
        const boolFunc = () => {return dataToBeDrawn.length === 2};
        await this.waitIntervalForBothCanvasesToLoad(boolFunc);
        console.log('%c dataToBeDrawn has 2 inputs !!!', 'color: blue');
        
        let pendingCapture = this.pendingCaptures[pendingCaptureKey];
        if (!pendingCapture) {
            console.warn(`capture called on ${canvasIds} when there are no pendingCaptures waiting on this data`);
            return;
        }

        // Determine the size of the output image
        let originalWidth = Math.max(...dataToBeDrawn.map(data => data.width));
        let originalHeight = Math.max(...dataToBeDrawn.map(data => data.height));

        if (!outputWidth && !outputHeight) {
            outputWidth = originalWidth;
            outputHeight = originalHeight;
        } else if (!outputHeight) {
            outputHeight = outputWidth * (originalHeight / originalWidth);
        } else if (!outputWidth) {
            outputWidth = outputHeight * (originalWidth / originalHeight);
        }

        // Create an off-screen canvas for combining
        let offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = outputWidth;
        offScreenCanvas.height = outputHeight;
        let ctx = offScreenCanvas.getContext('2d', {alpha: true});

        // Draw each source canvas onto the off-screen canvas
        for (let i = 0; i < dataToBeDrawn.length; i++) {
            let data = dataToBeDrawn[i];
            ctx.drawImage(data, 0, 0, data.width, data.height, 0, 0, outputWidth, outputHeight);
        }
        
        let mostRecentCapture;
        if (compressionOptions.useJpg) {
            // Get the data URL of the resized canvas as JPEG
            let quality = compressionOptions.quality || 0.7; // Adjust the quality parameter (0.0 to 1.0) as needed
            mostRecentCapture = offScreenCanvas.toDataURL('image/jpeg', quality);
        } else {
            mostRecentCapture = offScreenCanvas.toDataURL('image/png');
        }
        
        let THREE = realityEditor.gui.threejsScene.THREE;

        if (pendingCapture.promiseResolve) {
            pendingCapture.promiseResolve({
                imageSrc: mostRecentCapture,
                focalLength: realityEditor.gui.threejsScene.getInternals().getCamera().getInternalObject().getFocalLength(),
                imageSize: [outputWidth, outputHeight],
                rotation: new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().extractRotation(realityEditor.gui.threejsScene.getInternals().getCamera().getInternalObject().matrixWorld)).toArray(),
            });
            pendingCapture.promiseResolve = null;
        }
        delete this.pendingCaptures[pendingCaptureKey];
    }

    capture(canvasId, outputWidth, outputHeight, compressionOptions) {
        let sourceCanvas = document.getElementById(canvasId); // document.getElementById('mainThreejsCanvas');
        if (!sourceCanvas) {
            console.warn(`trying to capture a non-existent canvas ${canvasId}`);
            return;
        }
        let pendingCapture = this.pendingCaptures[canvasId];
        if (!pendingCapture) {
            console.warn(`capture called on ${canvasId} when there are no pendingCaptures waiting on this data`);
            return;
        }

        if (outputWidth || outputHeight) {
            let originalWidth = sourceCanvas.width;
            let originalHeight = sourceCanvas.height;

            if (!outputHeight) {
                // Calculate height to preserve aspect ratio
                outputHeight = outputWidth * (originalHeight / originalWidth);
            } else if (!outputWidth) {
                // Calculate width to preserve aspect ratio
                outputWidth = outputHeight * (originalWidth / originalHeight);
            }

            // Create an off-screen canvas for resizing
            let offScreenCanvas = document.createElement('canvas');
            offScreenCanvas.width = outputWidth;
            offScreenCanvas.height = outputHeight;
            let ctx = offScreenCanvas.getContext('2d');

            // Draw the original canvas onto the off-screen canvas at the desired size
            ctx.drawImage(sourceCanvas, 0, 0, offScreenCanvas.width, offScreenCanvas.height);
            sourceCanvas = offScreenCanvas;
        }

        let mostRecentCapture;
        if (compressionOptions.useJpg) {
            // Get the data URL of the resized canvas as JPEG
            let quality = compressionOptions.quality || 0.7; // Adjust the quality parameter (0.0 to 1.0) as needed
            mostRecentCapture = sourceCanvas.toDataURL('image/jpeg', quality);
        } else {
            mostRecentCapture = sourceCanvas.toDataURL('image/png');
        }

        if (pendingCapture.promiseResolve) {
            pendingCapture.promiseResolve(mostRecentCapture);
            pendingCapture.promiseResolve = null;
        }
        delete this.pendingCaptures[canvasId];
    }
}

/**
 * Pending canvas capture information, which can be performed at a future time using its `SceneCapture` instance
 */
class PendingCapture {
    /**
     * @param {SceneCapture} sceneCaptureInstance
     * @param {string} canvasId
     * @param {number|undefined} outputWidth
     * @param {number|undefined} outputHeight
     * @param {boolean} useJpgCompression
     * @param {number} jpgQuality
     */
    constructor(sceneCaptureInstance, canvasId, outputWidth, outputHeight, useJpgCompression, jpgQuality) {
        this.sceneCaptureInstance = sceneCaptureInstance;
        this.canvasId = canvasId;
        this.outputWidth = outputWidth;
        this.outputHeight = outputHeight;
        this.jpgCompression = {
            useJpg: useJpgCompression,
            quality: jpgQuality
        };
        this.promiseResolve = null; // gets set after initialization
    }

    /**
     * Triggers the actual capture
     */
    performCapture() {
        this.sceneCaptureInstance.capture(this.canvasId, this.outputWidth, this.outputHeight, this.jpgCompression);
    }
    
    async performCaptureMultiple() {
        await this.sceneCaptureInstance.captureMultiple(this.canvasId, this.outputWidth, this.outputHeight, this.jpgCompression);
    }
}

const sceneCapture = new SceneCapture();

/**
 * Captures a screenshot of the canvas by creating a PendingCapture and returning a promise that will resolve when
 * the PendingCapture finishes performing the capture
 * @param {string} canvasId
 * @param {Object} [options] - The options for capturing the screenshot.
 * @param {number} [options.outputWidth] - The desired width. Only one of width/height needs to be specified.
 * @param {number} [options.outputHeight] - The desired height. If both unspecified, uses full width/height of canvas.
 * @param {boolean} [options.useJpgCompression=false] - Uses PNG if false, JPG if true.
 * @param {number} [options.jpgQuality=0.7] - The quality of the JPG compression, if used. Value should be between 0 and 1.
 * @return {Promise<string>} - resolves with the screenshot src as a base-64 encoded string (from `canvas.toDataURL`)
 */
export const captureScreenshot = (canvasId, options = {outputWidth: undefined, outputHeight: undefined, useJpgCompression: false, jpgQuality: 0.7}) => {
    if (sceneCapture.pendingCaptures[canvasId]) console.warn('wait for previous capture to finish before capturing again');

    let pendingCapture = new PendingCapture(sceneCapture, canvasId,
        options.outputWidth, options.outputHeight, options.useJpgCompression, options.jpgQuality);

    sceneCapture.pendingCaptures[canvasId] = pendingCapture;

    return new Promise((resolve) => {
        pendingCapture.promiseResolve = resolve;
    });
};

export const captureScreenshotMultiple = (canvasIds, options = {outputWidth: undefined, outputHeight: undefined, useJpgCompression: false, jpgQuality: 0.7}) => {
    if (!Array.isArray(canvasIds) || canvasIds.length === 0) {
        console.warn('No canvas IDs provided for capture');
        return;
    }

    let pendingCaptureKey = canvasIds.join('-');
    if (sceneCapture.pendingCaptures[pendingCaptureKey]) console.warn('wait for previous capture to finish before capturing again');

    let pendingCapture = new PendingCapture(sceneCapture, pendingCaptureKey,
        options.outputWidth, options.outputHeight, options.useJpgCompression, options.jpgQuality);

    sceneCapture.pendingCaptures[pendingCaptureKey] = pendingCapture;

    return new Promise((resolve) => {
        pendingCapture.promiseResolve = resolve;
    });
};

/**
 * Checks if there is a pending capture for the specified canvas
 * @param {string} canvasId
 * @return {PendingCapture}
 */
export const getPendingCapture = (canvasId) => {
    return sceneCapture.pendingCaptures[canvasId];
};

export const getPendingCaptureMultiple = (canvasIds) => {
    if (!Array.isArray(canvasIds) || canvasIds.length === 0) {
        console.warn('No canvas IDs provided for capture');
        return;
    }
    let pendingCaptureKey = canvasIds.join('-');
    return sceneCapture.pendingCaptures[pendingCaptureKey];
};



