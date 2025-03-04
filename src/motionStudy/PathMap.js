const RenderMode = {
    canvas: 'canvas',
    svg: 'svg',
}

const WIDTH = 640;

export class PathMap {
    constructor(container) {
        this.container = container;
        this.renderMode = RenderMode.svg;
        this.renderer = null;
    }

    /**
     * Render all spaghetti to our current canvas or svg
     * @param {MotionStudy} motionStudy
     */
    update(motionStudy) {
        let hpa = motionStudy.humanPoseAnalyzer;
        let allSpaghettiById = hpa?.historyLines?.[hpa.activeLens?.name]?.all;
        if (!allSpaghettiById) {
            return;
        }
        let allSpaghetti = Object.values(allSpaghettiById);
        if (this.renderer) {
            this.renderer.remove();
        }
        this.renderer = this.createRenderer(allSpaghetti);
        for (let spaghetti of allSpaghetti) {
            this.renderer.renderSpaghetti(spaghetti);
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
        let bounds = this.calculateBounds(allSpaghetti);

        if (this.renderMode === RenderMode.svg) {
            return new SVGRenderer(this.container, bounds);
        } else {
            return new CanvasRenderer(this.container, bounds);
        }
    }
}

class Renderer {
    constructor(_container, bounds) {
        let { maxX, minX, maxY, minY } = bounds;
        let mmPerPx = (maxX - minX) / (WIDTH - 20);
        let pxPerMm = 1 / mmPerPx;
        // Add 10 px of margin around width
        minX -= 10 * mmPerPx;
        let width = WIDTH;
        // Add 10 px of margin around height
        let height = Math.round((maxY - minY + 20 * mmPerPx) * pxPerMm);
        minY -= 10 * mmPerPx;

        this.pxPerMm = pxPerMm;
        this.minX = minX;
        this.minY = minY;
        this.width = width;
        this.height = height;
    }

    renderSpaghetti(_spaghetti) {
    }

    remove() {
    }

    xToPx(x) {
        return (x - this.minX) * this.pxPerMm;
    }
    yToPx(y) {
        return (y - this.minY) * this.pxPerMm;
    }
}

function colorEquals(a, b) {
    // falsy is undefined and not equal to anything
    if (!a || !b) {
        return false;
    }
    return
        Math.round(a[0]) === Math.round(b[0]) &&
        Math.round(a[1]) === Math.round(b[1]) &&
        Math.round(a[2]) === Math.round(b[2]);
}

function colorToCssColor(color) {
    let r = Math.round(color[0]);
    let g = Math.round(color[1]);
    let b = Math.round(color[2]);
    return `rgb(${r} ${g} ${b})`;
}

class SVGRenderer extends Renderer {
    constructor(container, bounds) {
        super(container, bounds);
        this.createElement();
        container.appendChild(this.element);
    }

    createElement() {
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.element.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.element.setAttribute('width', `${this.width}`);
        this.element.setAttribute('height', `${this.height}`);
    }

    renderSpaghetti(spaghetti) {
        if (spaghetti.points.length === 0) {
            return;
        }

        let currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathParts = [];
        let currentColor = spaghetti.points[0].color;
        currentPath.setAttribute('stroke', colorToCssColor(currentColor));
        currentPath.setAttribute('fill', 'transparent');
        for (let point of spaghetti.points) {
            if (!colorEquals(point.color, currentColor)) {
                pathParts.push(
                    Math.round(this.xToPx(point.x)) + ' ' +
                    Math.round(this.yToPx(point.y)) + ' '
                );
                const pathString = 'M ' + pathParts.join('L ');
                currentPath.setAttribute('d', pathString);
                this.element.appendChild(currentPath);
                currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                currentColor = point.color;
                pathParts = []
                currentPath.setAttribute('stroke', colorToCssColor(currentColor));
                currentPath.setAttribute('fill', 'transparent');
            }
            pathParts.push(
                Math.round(this.xToPx(point.x)) + ' ' +
                Math.round(this.yToPx(point.y)) + ' '
            );
        }

        if (pathParts.length > 1) {
            const pathString = 'M ' + pathParts.join('L ');
            currentPath.setAttribute('d', pathString);
            this.element.appendChild(currentPath);
        }
    }

    remove() {
        this.element.parentNode.removeChild(this.element);
    }
}

class CanvasRenderer extends Renderer {
    constructor(container, bounds) {
        super(container, bounds);
        this.createElement();
        container.appendChild(this.element);
    }

    createElement() {
        this.element = document.createElement('canvas');
        this.element.width = this.width * 2;
        this.element.height = this.height * 2;
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.gfx = this.element.getContext('2d');
        this.gfx.lineWidth = 4;
        this.gfx.lineJoin = 'round';
        this.gfx.lineCap = 'round';
        this.gfx.fillStyle = 'rgba(120, 120, 120, 0.9)';
        this.gfx.fillRect(0, 0, this.width, this.height);
    }

    renderSpaghetti(spaghetti) {
        if (spaghetti.points.length === 0) {
            return;
        }

        let currentColor = spaghetti.points[0].color;
        let pathStarted = false;
        for (let point of spaghetti.points) {
            if (!colorEquals(point.color, currentColor)) {
                this.gfx.strokeStyle = colorToCssColor(currentColor);
                this.gfx.lineTo(this.xToPx(point.x) * 2, this.yToPx(point.y) * 2);
                this.gfx.stroke();
                currentColor = point.color;
                pathStarted = false;
            }
            if (pathStarted) {
                this.gfx.lineTo(this.xToPx(point.x) * 2, this.yToPx(point.y) * 2);
            } else {
                this.gfx.beginPath();
                this.gfx.moveTo(this.xToPx(point.x) * 2, this.yToPx(point.y) * 2);
                pathStarted = true;
            }
        }

        if (pathStarted) {
            this.gfx.strokeStyle = colorToCssColor(currentColor);
            this.gfx.stroke();
        }
    }

    remove() {
        this.element.parentNode.removeChild(this.element);
    }
}
