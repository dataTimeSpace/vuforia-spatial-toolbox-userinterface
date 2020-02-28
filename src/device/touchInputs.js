createNameSpace("realityEditor.device.touchInputs");

/**
 * @fileOverview realityEditor.device.touchInputs.js
 * Provides a central location where document multi-touch events are handled.
 * Additional modules and experiments (e.g. the screenExtension) can plug into these for touch interaction.
 */

(function(exports) {

    /**
     * Public init method sets up module and registers callbacks in other modules
     */
    function initService() {
        realityEditor.gui.ar.draw.addUpdateListener(update);
    }

    /**
     * Document touch down event handler that is always present.
     * @param {TouchEvent} eventObject
     */
    function screenTouchStart(eventObject){
        realityEditor.gui.screenExtension.touchStart(eventObject)
    }

    /**
     * Document touch up event handler that is always present.
     * @param {TouchEvent} eventObject
     */
    function screenTouchEnd(eventObject){
        realityEditor.gui.screenExtension.touchEnd(eventObject);
    }

    /**
     * Document touch move event handler that is always present.
     * @param {TouchEvent} eventObject
     */
    function screenTouchMove(eventObject){
        realityEditor.gui.screenExtension.touchMove(eventObject);
    }

    /**
     * Update function that is always present and gets called as often as Vuforia update loop (AR rendering) occurs.
     */
    function update(){
        realityEditor.gui.screenExtension.update();
    }

    exports.initService = initService;
    exports.screenTouchStart = screenTouchStart;
    exports.screenTouchEnd = screenTouchEnd;
    exports.screenTouchMove = screenTouchMove;

})(realityEditor.device.touchInputs);
