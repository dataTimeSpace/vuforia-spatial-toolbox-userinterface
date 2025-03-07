import { JOINTS, JOINT_CONFIDENCE_THRESHOLD } from './constants.js';
import { setChildHumanPosesVisible } from './draw.js';

export class HumanPoseAnalyzerSettingsUi {
    constructor(humanPoseAnalyzer) {
        this.humanPoseAnalyzer = humanPoseAnalyzer;

        this.root = document.createElement('div');
        this.root.id = 'hpa-settings';

        // Styled via css/humanPoseAnalyzerSettingsUi.css
        this.root.innerHTML = `
            <div class="hpa-settings-header">
                <div class="hpa-settings-title">Analytics Settings</div>
                <div class="hpa-settings-header-icon">&ndash;</div>
            </div>
            <div class="hpa-settings-body">
                <div class="hpa-settings-section">
                    <div class="hpa-settings-section-title">Lens Settings</div>
                    <div class="hpa-settings-section-body">
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Select Lens</div>
                            <select class="hpa-settings-section-row-select" id="hpa-settings-select-lens">
                                <option value="Sample Option">This should only display if something is broken with this.populateSelects()</option>
                            </select>
                        </div>
                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">
                            <div class="hpa-settings-section-row-label">View auxiliary poses</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-child-human-poses">
                        </div>
                        <div class="hpa-settings-section-row">
 <!--                       <div class="hpa-settings-section-row-label">Set joint confidence</div> -->
 <!--                       <input type="text" id="hpa-settings-set-joint-confidence"> --> 
                            <div class="hpa-settings-section-row-label">Filter unreliable joints</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-joint-confidence">
                        </div>
                    </div>
                </div>
                <div class="hpa-settings-section hidden" id="hpa-live-settings">
                    <div class="hpa-settings-section-title">Motion Path Settings</div>
                    <div class="hpa-settings-section-body">
<!--                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">-->
<!--                            <div class="hpa-settings-section-row-label">Toggle Poses</div>-->
<!--                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-poses">-->
<!--                        </div>-->
                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">
                            <div class="hpa-settings-section-row-label">Show Motion Paths</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-live-history-lines">
                        </div>
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-button" id="hpa-settings-reset-history">Clear Live Data</div>
                        </div>
                    </div>
                </div>
                <div class="hpa-settings-section" id="hpa-historical-settings">
                    <div class="hpa-settings-section-title">Motion Path Settings</div>
                    <div class="hpa-settings-section-body">
<!--                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">-->
<!--                            <div class="hpa-settings-section-row-label">Toggle Poses</div>-->
<!--                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-poses">-->
<!--                        </div>-->
                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">
                            <div class="hpa-settings-section-row-label">Show Motion Paths</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-historical-history-lines">
                        </div>
                    </div>
                </div>
                <div class="hpa-settings-section" id="hpa-joint-settings">
                    <div class="hpa-settings-section-title">Joint Settings</div>
                    <div class="hpa-settings-section-body">
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Select Joint</div>
                            <select class="hpa-settings-section-row-select" id="hpa-settings-select-joint">
                                <option value="Sample Option">This should only display if something is broken with this.populateSelects()</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="hpa-settings-section" id="hpa-tag-settings">
                    <div class="hpa-settings-section-title">Tag Settings</div>
                    <div class="hpa-settings-section-body">
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Show Tag Menu</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-tag-menu">
                        </div>
                    </div>
                </div>
                <div class="hpa-settings-section" id="hpa-table-settings">
                    <div class="hpa-settings-section-title">View Settings</div>
                    <div class="hpa-settings-section-body">
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Show Table View</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-table">
                        </div>
                        <div class="hpa-settings-section-row hpa-settings-section-row-checkbox-container">
                            <div class="hpa-settings-section-row-label">Show Motion Map</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-path-map">
                        </div>
                    </div>
                </div>
                <div class="hpa-settings-section" id="hpa-playback-settings">
                    <div class="hpa-settings-section-title">Playback Settings</div>
                    <div class="hpa-settings-section-body">
                        <div class="hpa-settings-section-row">
                            <div class="hpa-settings-section-row-label">Auto Synchronize</div>
                            <input type="checkbox" class="hpa-settings-section-row-checkbox" id="hpa-settings-toggle-sync" checked>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.populateSelects();
        this.setUpEventListeners();
        this.enableDrag();
        document.body.appendChild(this.root);
        this.setInitialPosition();
        this.root.querySelector('#hpa-joint-settings').remove(); // TODO: implement joint selection and remove this line
        this.minimize();
        this.hide(); // It is important to set the menu's position before hiding it, otherwise its width will be calculated as 0
    }

    /**
     * Sets the initial position of the settings UI to be in the top right corner of the screen, under the navbar and menu button
     */
    setInitialPosition() {
        const navbar = document.querySelector('.desktopMenuBar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const sessionMenuContainer = document.querySelector('#sessionMenuContainer');
        const sessionMenuLeft = sessionMenuContainer ? sessionMenuContainer.offsetLeft : 0;
        if (sessionMenuContainer) {
            // Avoid the top right menu
            this.root.style.top = `calc(${navbarHeight}px + 2em)`;
            this.root.style.left = `calc(${sessionMenuLeft - this.root.offsetWidth}px - 6em)`;
            return;
        }
        this.root.style.top = `calc(${navbarHeight}px + 2em)`;
        this.root.style.left = `calc(${window.innerWidth - this.root.offsetWidth}px - 2em)`;
        this.snapToFitScreen();
    }

    populateSelects() {
        this.root.querySelector('#hpa-settings-select-lens').innerHTML =
            this.humanPoseAnalyzer.lenses
                .map((lens) => {
                    return `<option value="${lens.name}">${lens.name}</option>`;
                })
                .join('');

        const jointNames = ['', ...Object.values(JOINTS)];
        this.root.querySelector('#hpa-settings-select-joint').innerHTML = jointNames
            .map((jointName) => {
                return `<option value="${jointName}">${jointName}</option>`;
            })
            .join('');
    }

    setUpEventListeners() {
        // Toggle menu minimization when clicking on the header, but only if not dragging
        this.root.querySelector('.hpa-settings-header').addEventListener('mousedown', (event) => {
            let mouseDownX = event.clientX;
            let mouseDownY = event.clientY;
            const mouseUpListener = (event) => {
                const mouseUpX = event.clientX;
                const mouseUpY = event.clientY;
                if (mouseDownX === mouseUpX && mouseDownY === mouseUpY) {
                    this.toggleMinimized();
                }
                this.root
                    .querySelector('.hpa-settings-header')
                    .removeEventListener('mouseup', mouseUpListener);
            };
            this.root
                .querySelector('.hpa-settings-header')
                .addEventListener('mouseup', mouseUpListener);
        });

        this.root
            .querySelector('#hpa-settings-toggle-live-history-lines')
            .addEventListener('change', (event) => {
                this.humanPoseAnalyzer.setLiveHistoryLinesVisible(event.target.checked);
            });

        this.root
            .querySelector('#hpa-settings-toggle-child-human-poses')
            .addEventListener('change', (event) => {
                setChildHumanPosesVisible(event.target.checked);
            });

        this.root
            .querySelector('#hpa-settings-toggle-historical-history-lines')
            .addEventListener('change', (event) => {
                this.humanPoseAnalyzer.setHistoricalHistoryLinesVisible(event.target.checked);
            });

        this.root.querySelector('#hpa-settings-reset-history').addEventListener('mouseup', () => {
            this.humanPoseAnalyzer.resetLiveHistoryLines();
            this.humanPoseAnalyzer.resetLiveHistoryClones();
        });

        this.root.querySelector('#hpa-settings-select-lens').addEventListener('change', (event) => {
            this.humanPoseAnalyzer.setActiveLensByName(event.target.value);
        });

        this.root
            .querySelector('#hpa-settings-toggle-tag-menu')
            .addEventListener('change', (event) => {
                if (event.target.checked) {
                    this.humanPoseAnalyzer.motionStudy.tagSystemMenu.show();
                    this.humanPoseAnalyzer.motionStudy.tagSystemMenu.maximize();
                } else {
                    this.humanPoseAnalyzer.motionStudy.tagSystemMenu.hide();
                }
            });

        this.root
            .querySelector('#hpa-settings-toggle-table')
            .addEventListener('change', (event) => {
                if (event.target.checked) {
                    this.humanPoseAnalyzer.motionStudy.tableViewMenu.show();
                    this.humanPoseAnalyzer.motionStudy.tableViewMenu.maximize();
                } else {
                    this.humanPoseAnalyzer.motionStudy.tableViewMenu.hide();
                }
            });

        this.root
            .querySelector('#hpa-settings-toggle-path-map')
            .addEventListener('change', (event) => {
                if (event.target.checked) {
                    this.humanPoseAnalyzer.motionStudy.pathMapMenu.show();
                    this.humanPoseAnalyzer.motionStudy.pathMapMenu.maximize();
                } else {
                    this.humanPoseAnalyzer.motionStudy.pathMapMenu.hide();
                }
            });

        this.root.querySelector('#hpa-settings-toggle-sync').addEventListener('change', (event) => {
            realityEditor.motionStudy.setSynchronizationEnabled(event.target.checked);
        });

        /*
        // for debugging purposes
        this.root.querySelector('#hpa-settings-set-joint-confidence').addEventListener('keydown', (event) => {
            event.stopPropagation();
        });
        
        this.root.querySelector('#hpa-settings-set-joint-confidence').addEventListener('change', (event) => {
            let num = parseFloat(event.target.value);
            if(!isNaN(num)) {
                if (num < 0.0) {
                    num = 0.0;
                }
                if (num > 1.0) {
                    num = 1.0;
                }
                this.humanPoseAnalyzer.setJointConfidenceThreshold(num);
                this.setJointConfidenceThreshold(num);
            }
        });
        */

        this.root
            .querySelector('#hpa-settings-toggle-joint-confidence')
            .addEventListener('change', (event) => {
                if (event.target.checked) {
                    this.humanPoseAnalyzer.setJointConfidenceThreshold(JOINT_CONFIDENCE_THRESHOLD);
                } else {
                    this.humanPoseAnalyzer.setJointConfidenceThreshold(0.0);
                }
            });

        this.root
            .querySelector('#hpa-settings-select-joint')
            .addEventListener('change', (event) => {
                this.humanPoseAnalyzer.setActiveJointByName(event.target.value);
            });

        // Add listeners to aid with clicking checkboxes
        this.root.querySelectorAll('.hpa-settings-section-row-checkbox').forEach((checkbox) => {
            const checkboxContainer = checkbox.parentElement;
            checkboxContainer.addEventListener('click', () => {
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
    }

    enableDrag() {
        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartLeft = 0;
        let dragStartTop = 0;

        this.root.querySelector('.hpa-settings-header').addEventListener('mousedown', (event) => {
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            dragStartLeft = this.root.offsetLeft;
            dragStartTop = this.root.offsetTop;

            const mouseMoveListener = (event) => {
                this.root.style.left = `${dragStartLeft + event.clientX - dragStartX}px`;
                this.root.style.top = `${dragStartTop + event.clientY - dragStartY}px`;
                this.snapToFitScreen();
            };
            const mouseUpListener = () => {
                document.removeEventListener('mousemove', mouseMoveListener);
                document.removeEventListener('mouseup', mouseUpListener);
            };
            document.addEventListener('mousemove', mouseMoveListener);
            document.addEventListener('mouseup', mouseUpListener);
        });
    }

    isOutOfBounds() {
        const navbar = document.querySelector('.desktopMenuBar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        if (this.root.offsetTop < navbarHeight) {
            return true;
        }
        if (this.root.offsetLeft < 0) {
            return true;
        }
        if (this.root.offsetLeft + this.root.offsetWidth > window.innerWidth) {
            return true;
        }
        if (
            this.root.offsetTop + this.root.querySelector('.hpa-settings-header').offsetHeight >
            window.innerHeight
        ) {
            return true;
        }
        return false;
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
        if (
            this.root.offsetTop + this.root.querySelector('.hpa-settings-header').offsetHeight >
            window.innerHeight
        ) {
            this.root.style.top = `${window.innerHeight - this.root.querySelector('.hpa-settings-header').offsetHeight}px`;
        }
    }

    show() {
        this.root.classList.remove('hidden');
        if (this.isOutOfBounds()) {
            // Only happens with initial set up of the live analytics menu, since it thinks the session menu has 0
            // offset as it hasn't fully initialized yet, and ends up far to the left of the screen
            this.setInitialPosition();
        }
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
        this.root.querySelector('.hpa-settings-header-icon').innerHTML = '&ndash;';
    }

    toggleMinimized() {
        if (this.root.classList.contains('hpa-settings-minimized')) {
            this.maximize();
        } else {
            this.minimize();
        }
    }

    setActiveLens(lens) {
        this.root.querySelector('#hpa-settings-select-lens').value = lens.name;
    }

    setLiveHistoryLinesVisible(historyLinesVisible) {
        this.root.querySelector('#hpa-settings-toggle-live-history-lines').checked =
            historyLinesVisible;
    }

    setChildHumanPosesVisible(visible) {
        this.root.querySelector('#hpa-settings-toggle-child-human-poses').checked = visible;
    }

    setHistoricalHistoryLinesVisible(historyLinesVisible) {
        this.root.querySelector('#hpa-settings-toggle-historical-history-lines').checked =
            historyLinesVisible;
    }

    setActiveJointByName(_jointName) {
        // this.root.querySelector('#hpa-settings-select-joint').value = jointName; // TODO: re-add once implemented
    }

    /*
    // for debugging purposes
    setJointConfidenceThreshold(confidence) {
        this.root.querySelector('#hpa-settings-set-joint-confidence').value = confidence;
    }
    */
    setJointConfidenceFilter(filterOn) {
        this.root.querySelector('#hpa-settings-toggle-joint-confidence').checked = filterOn;
    }

    markLive() {
        this.root.querySelector('#hpa-live-settings').classList.remove('hidden');
        this.root.querySelector('#hpa-historical-settings').classList.add('hidden');
        this.root.querySelector('.hpa-settings-title').innerText = 'Live Analytics Settings';
    }
}
