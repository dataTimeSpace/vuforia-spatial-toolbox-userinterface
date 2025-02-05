const RenderMode = {
    canvas: 'canvas',
    svg: 'svg',
}

const WIDTH = 480;

export class PathMap {
    constructor(container) {
        this.container = container;
        this.renderMode = RenderMode.svg;
    }

    /**
     * Render all spaghetti to our current canvas or svg
     * @param {MotionStudy} motionStudy
     */
    update(motionStudy) {
        let hpa = motionStudy.humanPoseAnalyzer;
        let allSpaghetti = hpa.historyLines[hpa.activeLens].all;
        const renderer = this.createRenderer(allSpaghetti);
        for (let spaghetti of allSpaghetti) {
            renderer.renderSpaghetti(spaghetti);
        }
    }

    calculateBounds(allSpaghetti) {
        let minX = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let minY = Number.MAX_VALUE;
        let maxY = Number.MIN_VALUE;
        let minZ = Number.MAX_VALUE;
        let maxZ = Number.MIN_VALUE;

        for (let spaghetti of allSpaghetti) {
            for (let point of spaghetti.points) {
                maxX = Math.max(maxX, point.x);
                minX = Math.min(minX, point.x);
                maxY = Math.max(maxY, point.y);
                minY = Math.min(minY, point.y);
                maxZ = Math.max(maxZ, point.z);
                minZ = Math.min(minZ, point.z);
            }
        }

        return {
            minX, maxX,
            minY, maxY,
            minZ, maxZ,
        };
    }

    createRenderer(allSpaghetti) {
        let { maxX, minX, maxY, minY } = this.calculateBounds(allSpaghetti);

        let pxPerMm = (maxX - minX) / WIDTH;
        let width = WIDTH;
        let height = (maxY - minY) / pxPerMm;
        if (this.renderMode === RenderMode.svg) {
            return new SVGRenderer(this.container, pxPerMm, width, height);
        } else {
            return new CanvasRenderer(this.container, pxPerMm, width, height);
        }
    }
}

class Renderer {
    constructor(_container, pxPerMm, width, height) {
        this.pxPerMm = pxPerMm;
        this.width = width;
        this.height = height;
    }

    renderSpaghetti(_spaghetti) {
    }
}

function colorEquals(a, b) {
    // falsy is undefined and not equal to anything
    if (!a || !b) {
        return false;
    }
    return a[0] === b[0] &&
        a[1] === b[1] &&
        a[2] === b[2]; // TODO unclear if alpha channel exists
}

function colorToCssColor(color) {
    let r = Math.round(color[0]);
    let g = Math.round(color[1]);
    let b = Math.round(color[2]);
    return `rgb(${r} ${g} ${b})`;
}

class SVGRenderer extends Renderer {
    constructor(container, pxPerMm, width, height) {
        super(container, pxPerMm, width, height);
        this.createElement();
        container.appendChild(this.element);
    }

    createElement() {
        this.element = document.createElement('svg');
        this.element.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    }

    renderSpaghetti(spaghetti) {
        if (spaghetti.points.length === 0) {
            return;
        }

        let currentPath = document.createElement('path');
        let pathParts = [];
        let currentColor = spaghetti.points[0].color;
        currentPath.setAttribute('stroke', colorToCssColor(currentColor));
        for (let point of spaghetti) {
            if (!colorEquals(point.color, currentColor)) {
                const pathString = 'M' + pathParts.join('L');
                currentPath.setAttribute('d', pathString);
                this.element.appendChild(currentPath);
                currentPath = document.createElement('path');
                currentColor = point.color;
                pathParts = []
                currentPath.setAttribute('stroke', colorToCssColor(currentColor));
            }
            pathParts.push(
                Math.round(point.x * this.pxPerMm) + ' ' +
                Math.round(point.y * this.pxPerMm) + ' '
            );
        }

        if (pathParts.length > 1) {
            const pathString = 'M' + pathParts.join('L');
            currentPath.setAttribute('d', pathString);
            this.element.appendChild(currentPath);
        }
    }
}

class CanvasRenderer extends Renderer {
    constructor(container, pxPerMm, width, height) {
        super(container, pxPerMm, width, height);
        this.createElement();
        container.appendChild(this.element);
    }

    createElement() {
        this.element = document.createElement('canvas');
        this.element.width = this.width;
        this.element.height = this.height;
        this.gfx = this.element.getContext('2d');
    }

    renderSpaghetti(spaghetti) {
        if (spaghetti.points.length === 0) {
            return;
        }

        let currentColor = spaghetti.points[0].color;
        let pathStarted = false;
        for (let point of spaghetti) {
            if (!colorEquals(point.color, currentColor)) {
                this.gfx.strokeStyle = colorToCssColor(currentColor);
                this.gfx.stroke();
                currentColor = point.color;
                pathStarted = false;
            }
            if (pathStarted) {
                this.gfx.lineTo(point.x * this.pxPerMm, point.y * this.pxPerMm);
            } else {
                this.gfx.beginPath();
                this.gfx.moveTo(point.x * this.pxPerMm, point.y * this.pxPerMm);
                pathStarted = true;
            }
        }

        if (pathStarted) {
            this.gfx.strokeStyle = colorToCssColor(currentColor);
            this.gfx.stroke();
        }
    }
}
