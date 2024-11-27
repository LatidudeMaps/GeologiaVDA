import LayerControl from './LayerControl';
import GeoInfoPanel from './GeoInfoPanel';
import MapInfoControl from './MapInfo';
import ProfileControl from './ProfileControl.jsx';
import * as maplibregl from 'maplibre-gl';

class SettingsControl {
    constructor() {
        this._container = null;
        this._map = null;
        this._isExpanded = false;
        this._controls = [];
        this._controlsContainer = null;
        this._activeButtons = new Set();
        this._controlStates = new Map();
    }

    onAdd(map) {
        this._map = map;
        
        // Create main container
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        this._container.style.position = 'relative';
        
        // Create toggle button
        this._button = document.createElement('button');
        this._button.type = 'button';
        this._button.className = 'maplibregl-ctrl-icon maplibregl-ctrl-settings';
        this._button.setAttribute('aria-label', 'Toggle Settings Controls');
        
        // Add settings icon and animation styles
        this._addStyles();
        
        // Create controls container
        this._controlsContainer = document.createElement('div');
        this._controlsContainer.className = 'settings-controls-container';
        this._controlsContainer.style.position = 'absolute';
        this._controlsContainer.style.right = '0';
        this._controlsContainer.style.top = '100%';
        this._controlsContainer.style.marginTop = '10px';
        this._controlsContainer.style.display = 'flex';
        this._controlsContainer.style.flexDirection = 'column';
        this._controlsContainer.style.gap = '5px';
        this._controlsContainer.style.zIndex = '1';
        this._controlsContainer.style.visibility = 'hidden';
        this._controlsContainer.style.opacity = '0';
        this._controlsContainer.style.transform = 'translateY(-10px)';
        this._controlsContainer.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Add click handler for main settings button
        this._button.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleControls();
        });
        
        // Add click handler to close settings panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this._container.contains(e.target) && 
                !e.target.closest('.maplibregl-canvas-container') && 
                this._isExpanded) {
                this._hideControls();
            }
        });
        
        this._container.appendChild(this._button);
        this._container.appendChild(this._controlsContainer);
        
        this._addWrappedControls(map);
        
        return this._container;
    }

    _addStyles() {
        if (!document.getElementById('maplibregl-ctrl-settings-style')) {
            const style = document.createElement('style');
            style.id = 'maplibregl-ctrl-settings-style';
            style.textContent = `
                .maplibregl-ctrl-settings {
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="3"/%3E%3Cpath d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/%3E%3C/svg%3E');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                    transition: transform 0.3s ease;
                }
                
                .maplibregl-ctrl-settings.active {
                    transform: rotate(180deg);
                    background-color: rgba(51, 181, 229, 0.1);
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2333b5e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="3"/%3E%3Cpath d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/%3E%3C/svg%3E');
                }

                .settings-controls-container .maplibregl-ctrl {
                    width: 30px !important;
                    margin: 0 !important;
                }

                .settings-controls-container button {
                    width: 30px !important;
                    height: 30px !important;
                    background-color: #fff !important;
                    border: 0;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .settings-controls-container button:hover {
                    background-color: #f0f0f0 !important;
                }

                .settings-controls-container button.active {
                    background-color: rgba(51, 181, 229, 0.1) !important;
                }

                .settings-controls-container .maplibregl-ctrl-profile.active {
                    background-color: rgba(51, 181, 229, 0.1) !important;
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2333b5e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M2 12h6l3-9 3 18 3-9h5"/%3E%3C/svg%3E') !important;
                }

                .maplibregl-ctrl-group {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
                }
            `;
            document.head.appendChild(style);
        }
    }

    _addWrappedControls(map) {
        // Add the controls we want to wrap
        const controls = [
            { instance: new LayerControl(), className: 'maplibregl-ctrl-layers' },
            { instance: new GeoInfoPanel(), className: 'maplibregl-ctrl-inspect' },
            { instance: new MapInfoControl(), className: 'maplibregl-ctrl-zoom-info' },
            { instance: new ProfileControl(), className: 'maplibregl-ctrl-profile' },
            { instance: new maplibregl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true
            }), className: 'maplibregl-ctrl-geolocate' },
            { instance: new maplibregl.FullscreenControl(), className: 'maplibregl-ctrl-fullscreen' },
            { instance: new maplibregl.TerrainControl({
                source: 'terrainSource',
                exaggeration: 1.5
            }), className: 'maplibregl-ctrl-terrain' }
        ];

        controls.forEach(control => {
            const controlContainer = control.instance.onAdd(map);
            controlContainer.style.position = 'relative';
            controlContainer.style.marginBottom = '5px';

            // Find the button and associated panel within the control container
            const button = controlContainer.querySelector('button');
            const panel = controlContainer.querySelector('div:not(button)');

            if (button && panel) {
                // Initialize control state
                this._controlStates.set(button, {
                    panel: panel,
                    isActive: false,
                    className: control.className
                });

                // Add click handler for tracking active state
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._toggleControlState(button);
                });
            }

            this._controlsContainer.appendChild(controlContainer);
            this._controls.push(control.instance);
        });
    }

    _toggleControlState(button) {
        const state = this._controlStates.get(button);
        if (!state) return;

        // Toggle the current control
        state.isActive = !state.isActive;
        
        if (state.isActive) {
            button.classList.add('active');
            if (state.panel) {
                state.panel.style.display = 'block';
            }
        } else {
            button.classList.remove('active');
            if (state.panel) {
                state.panel.style.display = 'none';
            }
        }
    }

    _toggleControls() {
        if (this._isExpanded) {
            this._hideControls();
        } else {
            this._showControls();
        }
    }

    _showControls() {
        this._controlsContainer.style.visibility = 'visible';
        this._controlsContainer.style.opacity = '1';
        this._controlsContainer.style.transform = 'translateY(0)';
        this._button.classList.add('active');
        this._isExpanded = true;
    }

    _hideControls() {
        this._controlsContainer.style.opacity = '0';
        this._controlsContainer.style.transform = 'translateY(-10px)';
        this._button.classList.remove('active');
        this._isExpanded = false;
        
        // When hiding the main controls, also hide all sub-panels and deactivate buttons
        this._controlStates.forEach((state, button) => {
            if (state.isActive) {
                state.isActive = false;
                button.classList.remove('active');
                if (state.panel) {
                    state.panel.style.display = 'none';
                }
            }
        });

        setTimeout(() => {
            if (!this._isExpanded) {
                this._controlsContainer.style.visibility = 'hidden';
            }
        }, 300);
    }

    onRemove() {
        this._controls.forEach(control => {
            if (control.onRemove) {
                control.onRemove();
            }
        });

        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        
        this._map = null;
    }
}

export default SettingsControl;