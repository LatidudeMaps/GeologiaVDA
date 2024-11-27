class MapInfoControl {
    constructor() {
        this._container = null;
        this._map = null;
        this._panel = null;
        this._button = null;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        // Create toggle button
        this._button = document.createElement('button');
        this._button.type = 'button';
        this._button.className = 'maplibregl-ctrl-icon maplibregl-ctrl-zoom-info';
        this._button.setAttribute('aria-label', 'Toggle Map Info');

        // Add CSS for the zoom info icon
        this._addZoomInfoStyles();
        
        // Create info box
        this._panel = document.createElement('div');
        this._panel.style.padding = '10px';
        this._panel.style.minWidth = '220px';
        this._panel.style.backgroundColor = 'white';
        this._panel.style.fontFamily = 'monospace';
        this._panel.style.fontSize = '12px';
        this._panel.style.position = 'absolute';
        this._panel.style.right = '40px';
        this._panel.style.bottom = '0';
        this._panel.style.display = 'none';
        this._panel.style.borderRadius = '4px';
        this._panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        
        // Create elements for each parameter
        const zoomInfo = document.createElement('div');
        const boundsInfo = document.createElement('div');
        const bearingInfo = document.createElement('div');
        const pitchInfo = document.createElement('div');
        
        this._panel.appendChild(zoomInfo);
        this._panel.appendChild(boundsInfo);
        this._panel.appendChild(bearingInfo);
        this._panel.appendChild(pitchInfo);
        
        // Update function
        const updateInfo = () => {
            const bounds = map.getBounds();
            
            zoomInfo.textContent = `Zoom: ${map.getZoom().toFixed(2)}`;
            boundsInfo.innerHTML = `Bounds:<br>` +
                `  SW: [${bounds.getWest().toFixed(4)}, ${bounds.getSouth().toFixed(4)}]<br>` +
                `  NE: [${bounds.getEast().toFixed(4)}, ${bounds.getNorth().toFixed(4)}]`;
            bearingInfo.textContent = `Bearing: ${map.getBearing().toFixed(1)}°`;
            pitchInfo.textContent = `Pitch: ${map.getPitch().toFixed(1)}°`;
        };
        
        // Add click handler for toggle button
        this._button.addEventListener('click', () => {
            this._togglePanel();
        });
        
        // Add event listeners for all relevant map movements
        map.on('move', updateInfo);
        map.on('rotate', updateInfo);
        map.on('pitch', updateInfo);
        
        // Initial update
        updateInfo();
        
        this._container.appendChild(this._button);
        this._container.appendChild(this._panel);
        return this._container;
    }

    _addZoomInfoStyles() {
        if (!document.getElementById('maplibregl-ctrl-zoom-info-style')) {
            const style = document.createElement('style');
            style.id = 'maplibregl-ctrl-zoom-info-style';
            style.textContent = `
                .maplibregl-ctrl-zoom-info {
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3Cline x1="2" y1="12" x2="22" y2="12"/%3E%3Cline x1="12" y1="2" x2="12" y2="22"/%3E%3C/svg%3E');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                }

                .maplibregl-ctrl-zoom-info.active {
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2333b5e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3Cline x1="2" y1="12" x2="22" y2="12"/%3E%3Cline x1="12" y1="2" x2="12" y2="22"/%3E%3C/svg%3E');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    _togglePanel() {
        if (this._panel.style.display === 'none') {
            this._panel.style.display = 'block';
            this._button.style.backgroundColor = '#e5e5e5';
        } else {
            this._panel.style.display = 'none';
            this._button.style.backgroundColor = '';
        }
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = null;
    }
}

export default MapInfoControl;