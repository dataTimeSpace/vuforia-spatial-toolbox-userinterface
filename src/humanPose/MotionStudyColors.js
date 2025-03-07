import * as THREE from '../../thirdPartyCode/three/three.module.js';

/**
 * A collection of colors used often in the motion study system.
 * They are created here to ensure that they are only created once.
 */
export const MotionStudyColors = {
    undefined: new THREE.Color(1, 0, 1),
    base: new THREE.Color(0, 0.5, 1),
    red: new THREE.Color(1, 0, 0),
    yellow: new THREE.Color(1, 1, 0),
    green: new THREE.Color(0, 1, 0),
    blue: new THREE.Color(0, 0, 1),
    gray: new THREE.Color(0.8, 0.8, 0.8),
    black: new THREE.Color(0, 0, 0),
    /**
     * Fades a color to a faded version of itself.
     * @param {Color} color The color to fade.
     * @param {number} saturation Target saturation.
     * @return {Color} The faded color.
     */
    fade: (color, saturation = 0.8) => {
        const hsl = color.getHSL({});
        return new THREE.Color().setHSL(hsl.h, hsl.s * saturation, hsl.l * 0.6);
    },
    /**
     * Highlights a color to a brighter version of itself.
     * @param {Color} color The color to highlight.
     * @return {Color} The highlighted color.
     */
    highlight: (color) => {
        const h = color.getHSL({}).h;
        return new THREE.Color().setHSL(h, 1, 0.6);
    },
};
