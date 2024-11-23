class MapInfoControl {
    constructor() {
        this._container = null;
        this._map = null;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        // Create toggle button using MapLibre's native style
        this._button = document.createElement('button');
        this._button.type = 'button';
        this._button.className = 'maplibregl-ctrl-icon maplibregl-ctrl-zoom-info';
        this._button.setAttribute('aria-label', 'Toggle Map Info');

        // Add CSS for the zoom info icon
        this._addZoomInfoStyles();
        
        // Create info box
        const infoBox = document.createElement('div');
        infoBox.style.padding = '10px';
        infoBox.style.minWidth = '220px';
        infoBox.style.backgroundColor = 'white';
        infoBox.style.fontFamily = 'monospace';
        infoBox.style.fontSize = '12px';
        infoBox.style.position = 'absolute';
        infoBox.style.right = '40px';
        infoBox.style.bottom = '0';
        infoBox.style.display = 'none';  // Initially hidden
        infoBox.style.borderRadius = '4px';
        infoBox.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        
        // Create elements for each parameter
        const zoomInfo = document.createElement('div');
        const boundsInfo = document.createElement('div');
        const bearingInfo = document.createElement('div');
        const pitchInfo = document.createElement('div');
        
        infoBox.appendChild(zoomInfo);
        infoBox.appendChild(boundsInfo);
        infoBox.appendChild(bearingInfo);
        infoBox.appendChild(pitchInfo);
        
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
            if (infoBox.style.display === 'none') {
                infoBox.style.display = 'block';
                this._button.style.backgroundColor = '#e5e5e5';
            } else {
                infoBox.style.display = 'none';
                this._button.style.backgroundColor = '';
            }
        });

        // Add click handler to close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this._container.contains(e.target) && infoBox.style.display === 'block') {
                infoBox.style.display = 'none';
                this._button.style.backgroundColor = '';
            }
        });
        
        // Add event listeners for all relevant map movements
        map.on('move', updateInfo);
        map.on('rotate', updateInfo);
        map.on('pitch', updateInfo);
        
        // Initial update
        updateInfo();
        
        this._container.appendChild(this._button);
        this._container.appendChild(infoBox);
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
            `;
            document.head.appendChild(style);
        }
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = null;
    }
}

export default MapInfoControl;