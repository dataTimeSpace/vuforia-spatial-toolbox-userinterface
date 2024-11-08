import SplatManager from './SplatManager.js';
import Splatting from "./Splatting.js";

export class SplatSettingsUI {
    constructor() {

        this.root = document.createElement('div');
        this.root.id = 'splat-settings';
        
        this.root.innerHTML = `
            <div class="hpa-settings-header">
                <div class="hpa-settings-title">GS Settings</div>
                <div class="hpa-settings-header-icon">_</div>
            </div>
            <div class="hpa-settings-body">
                <!-- Display Settings -->
                <div class="hpa-settings-section">
                    <div class="hpa-settings-section-title">Display Settings</div>
                    <div class="hpa-settings-section-body">
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Display Mode</div>
                            <select class="hpa-settings-section-row-select" id="splat-settings-select-display-mode">
                                <option value="color">Color Mode</option>
                                <option value="category">Category Mode</option>
                                <option value="flat">Flat Shading Mode</option>
                            </select>
                        </div>
                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">
                            <div class="hpa-settings-section-row-label">Display Labels</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="splat-settings-display-labels">
                        </div>
                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">
                            <div class="hpa-settings-section-row-label">Display Clusters</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="splat-settings-display-clusters">
                        </div>
                    </div>
                </div>
                <!-- Region Settings -->
                <div class="hpa-settings-section">
                    <div class="hpa-settings-section-title">Region Settings</div>
                    <div class="hpa-settings-section-body">
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Select Region</div>
                            <select class="hpa-settings-section-row-select" id="splat-settings-select-region">
                                
                            </select>
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Select Region in GUI</div>
                            <button class="hpa-settings-section-row-button">Select region in GUI</button>
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Region Info</div>
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Name: </div>
                            <div class="hpa-settings-section-row-label" id="splat-settings-region-name"></div>
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Vertex Count: </div>
                            <div class="hpa-settings-section-row-label" id="splat-settings-region-vertex-count"></div>
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Row Length: </div>
                            <div class="hpa-settings-section-row-label" id="splat-settings-region-row-length"></div>
                        </div>
                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">
                            <div class="hpa-settings-section-row-label">Enable Region</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="splat-settings-enable-region">
                        </div>
                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">
                            <div class="hpa-settings-section-row-label">Solo Region</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="splat-settings-solo-region">
                        </div>
                        <!-- Transform Region -->
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Move Region</div>
                            <button class="hpa-settings-section-row-button">Move Region</button>
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Rotate Region</div>
                            <button class="hpa-settings-section-row-button">Rotate Region</button>
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Edit Region</div>
                            <button class="hpa-settings-section-row-button">Edit Region</button>
                            <button class="hpa-settings-section-row-button">Undo</button>
                            <button class="hpa-settings-section-row-button">Redo</button>
                            <button class="hpa-settings-section-row-button">Reset</button>
                        </div>
                        <div class='hpa-settings-section-row'>
                            <div class="hpa-settings-section-row-label">Region Opacity Filter</div>
                            <input class="hpa-settings-slider" type="range" min="0" max="1" step="0.05" id="splat-settings-region-opacity-slider" value="0.3">
                            <input class="hpa-settings-slider-number" type="number" min="0" max="1" step="0.05" id="splat-settings-region-opacity-number" value="0.3">
                        </div>
                        <div class='hpa-settings-section-row'>
                            <div class="hpa-settings-section-row-label">Region Camera Near Clip</div>
                            <input class="hpa-settings-slider" type="range" min="0" max="5" step="0.05" id="splat-settings-region-camera-near-clip-slider" value="1">
                            <input class="hpa-settings-slider-number" type="number" min="0" max="5" step="0.05" id="splat-settings-region-camera-near-clip-number" value="1">
                        </div>
                    </div>
                </div>
                 <!-- Label Settings -->
                 <div class="hpa-settings-section">
                    <div class="hpa-settings-section-title">Region Settings</div>
                    <div class="hpa-settings-section-body">
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Selected Label: </div>
                            <div class="hpa-settings-section-row-label">253</div>
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Label Custom Texts:</div>
                        </div>
                    </div>
                 </div>
            </div>
        `;
        
        this.splatRegionsCopy = null;
        this.activeRegionIndex = 0;
        
        this.setupEventListeners();
        this.enableDrag();
        document.body.appendChild(this.root);
        this.setInitialPosition();
    }
    
    addChangeDisplayModeListener() {
        this.root.querySelector('#splat-settings-select-display-mode').addEventListener('change', (e) => {
            Splatting.changeDisplayMode(e.target.value);
        })
    }

    addEnableRegionListener() {
        this.root.querySelector('#splat-settings-enable-region').addEventListener('change', (event) => {
            
        });
    }

    addSoloRegionListener() {
        this.root.querySelector('#splat-settings-solo-region').addEventListener('change', (event) => {
            Splatting.changeDisplayRegion(event.target.checked ? this.activeRegionIndex : -1);
        });
    }

    updateRegions() { // todo Steve: update available regions, as loading regions from .splat files
        let regionSelector = this.root.querySelector('#splat-settings-select-region');
        regionSelector.innerHTML = '';

        this.splatRegionsCopy = SplatManager.getSplatRegions();
        this.splatRegionsCopy.forEach((regionInfo, regionId) => {
            let regionOption = document.createElement('option');
            regionOption.value = regionId;
            regionOption.innerHTML = regionInfo.fileName;
            regionSelector.appendChild(regionOption);
        })

        regionSelector.removeEventListener('change', this.selectRegionCb.bind(this));
        regionSelector.addEventListener('change', this.selectRegionCb.bind(this));
        
        this.activeRegionIndex = SplatManager.getActiveIndex();
        this.root.querySelector('#splat-settings-region-name').innerHTML = this.splatRegionsCopy.get(this.activeRegionIndex).fileName;
        this.root.querySelector('#splat-settings-region-row-length').innerHTML = this.splatRegionsCopy.get(this.activeRegionIndex).rowLength;
        this.root.querySelector('#splat-settings-region-vertex-count').innerHTML = this.splatRegionsCopy.get(this.activeRegionIndex).vertexCount;
    }
    
    selectRegionCb(e) {
        this.activeRegionIndex = parseInt(e.target.value);
        
        this.root.querySelector('#splat-settings-region-name').innerHTML = this.splatRegionsCopy.get(this.activeRegionIndex).fileName;
        this.root.querySelector('#splat-settings-region-row-length').innerHTML = this.splatRegionsCopy.get(this.activeRegionIndex).rowLength;
        this.root.querySelector('#splat-settings-region-vertex-count').innerHTML = this.splatRegionsCopy.get(this.activeRegionIndex).vertexCount;
        
        SplatManager.selectRegion(this.activeRegionIndex);
        
        // todo Steve: special function enabled for solo region to work
        //  need a more robust way to store & update settings for all splat regions
        //  note that some settings make sense to persist with other splat regions, while other settings don't
        Splatting.changeDisplayRegion(this.root.querySelector('#splat-settings-solo-region').checked ? this.activeRegionIndex : -1);
    }
    
    /**
     * Sets the initial position of the settings UI to be in the top right corner of the screen, under the navbar and menu button
     */
    setInitialPosition() {
        const navbar = document.querySelector('.desktopMenuBar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const sessionMenuContainer = document.querySelector('#sessionMenuContainer');
        const sessionMenuLeft = sessionMenuContainer ? sessionMenuContainer.offsetLeft : 0;
        if (sessionMenuContainer) { // Avoid the top right menu
            this.root.style.top = `calc(${navbarHeight}px + 2em)`;
            this.root.style.left = `calc(${sessionMenuLeft - this.root.offsetWidth}px - 6em)`;
            return;
        }
        this.root.style.top = `calc(${navbarHeight}px + 2em)`;
        this.root.style.left = `calc(${window.innerWidth - this.root.offsetWidth}px - 2em)`;
        this.snapToFitScreen();
    }
    
    stopPropagationToOutside() {
        // todo Steve: in Splatting.js, we have a window pointerdown listener (probably need to replace later with a more specific element listener or stopPropagation() or smth)
        //  but now we need to do this, to prevent the pointerdown events from leaking outside into window
        this.root.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
        });
    }
    
    setupEventListeners() {
        
        this.stopPropagationToOutside();
        
        // Toggle menu minimization when clicking on the header, but only if not dragging
        this.root.querySelector('.hpa-settings-header').addEventListener('mousedown', event => {
            event.stopPropagation();
            let mouseDownX = event.clientX;
            let mouseDownY = event.clientY;
            const mouseUpListener = event => {
                const mouseUpX = event.clientX;
                const mouseUpY = event.clientY;
                if (mouseDownX === mouseUpX && mouseDownY === mouseUpY) {
                    this.toggleMinimized();
                }
                this.root.querySelector('.hpa-settings-header').removeEventListener('mouseup', mouseUpListener);
            };
            this.root.querySelector('.hpa-settings-header').addEventListener('mouseup', mouseUpListener);
        });

        // Add listeners to aid with clicking checkboxes
        this.root.querySelectorAll('.hpa-settings-section-row-checkbox').forEach((checkbox) => {
            const checkboxContainer = checkbox.parentElement;
            checkboxContainer.addEventListener('click', (event) => {
                event.stopPropagation();
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            });
            checkbox.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent double-counting clicks
            });
        });

        // Add click listeners to selects to stop propagation to rest of app
        this.root.querySelectorAll('.hpa-settings-section-row-select').forEach((select) => {
            select.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        });

        this.addChangeDisplayModeListener();
        this.addEnableRegionListener();
        this.addSoloRegionListener();
    }

    enableDrag() {
        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartLeft = 0;
        let dragStartTop = 0;

        this.root.querySelector('.hpa-settings-header').addEventListener('mousedown', (event) => {
            event.stopPropagation();
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            dragStartLeft = this.root.offsetLeft;
            dragStartTop = this.root.offsetTop;

            const mouseMoveListener = (event) => {
                event.stopPropagation();
                this.root.style.left = `${dragStartLeft + event.clientX - dragStartX}px`;
                this.root.style.top = `${dragStartTop + event.clientY - dragStartY}px`;
                this.snapToFitScreen();
            }
            const mouseUpListener = () => {
                document.removeEventListener('mousemove', mouseMoveListener);
                document.removeEventListener('mouseup', mouseUpListener);
            }
            document.addEventListener('mousemove', mouseMoveListener);
            document.addEventListener('mouseup', mouseUpListener);
        });
    }

    /**
     * If the settings menu is out of bounds, snap it back into the screen
     */
    snapToFitScreen() {
        const navbar = document.querySelector('.desktopMenuBar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        if (this.root.offsetTop < navbarHeight) {
            this.root.style.top = `${navbarHeight}px`;
        }
        if (this.root.offsetLeft < 0) {
            this.root.style.left = '0px';
        }
        if (this.root.offsetLeft + this.root.offsetWidth > window.innerWidth) {
            this.root.style.left = `${window.innerWidth - this.root.offsetWidth}px`;
        }
        // Keep the header visible on the screen off the bottom
        if (this.root.offsetTop + this.root.querySelector('.hpa-settings-header').offsetHeight > window.innerHeight) {
            this.root.style.top = `${window.innerHeight - this.root.querySelector('.hpa-settings-header').offsetHeight}px`;
        }
    }

    show() {
        this.root.classList.remove('hidden');
    }

    hide() {
        this.root.classList.add('hidden');
    }

    toggle() {
        if (this.root.classList.contains('hidden')) {
            this.show();
        } else {
            this.hide();
        }
    }

    minimize() {
        if (this.root.classList.contains('hidden')) {
            return;
        }
        const previousWidth = this.root.offsetWidth;
        this.root.classList.add('hpa-settings-minimized');
        this.root.style.width = `${previousWidth}px`;
        this.root.querySelector('.hpa-settings-header-icon').innerText = '+';
    }

    maximize() {
        if (this.root.classList.contains('hidden')) {
            return;
        }
        this.root.classList.remove('hpa-settings-minimized');
        this.root.querySelector('.hpa-settings-header-icon').innerText = '_';
    }

    toggleMinimized() {
        if (this.root.classList.contains('hpa-settings-minimized')) {
            this.maximize();
        } else {
            this.minimize();
        }
    }
}
