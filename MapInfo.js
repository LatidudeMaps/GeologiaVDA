class MapInfoControl {
    constructor() {
        this._container = null;
        this._map = null;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        // Create info box
        const infoBox = document.createElement('div');
        infoBox.style.padding = '10px';
        infoBox.style.minWidth = '220px';
        infoBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        infoBox.style.fontFamily = 'monospace';
        infoBox.style.fontSize = '12px';
        
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
        
        // Add event listeners for all relevant map movements
        map.on('move', updateInfo);
        map.on('rotate', updateInfo);
        map.on('pitch', updateInfo);
        
        // Initial update
        updateInfo();
        
        this._container.appendChild(infoBox);
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = null;
    }
}

export default MapInfoControl;