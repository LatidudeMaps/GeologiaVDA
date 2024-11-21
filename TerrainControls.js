// Modified controls for terrain and hillshade opacity
class TerrainControls {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        // Terrain exaggeration control
        const terrainDiv = document.createElement('div');
        terrainDiv.style.padding = '5px';
        
        const terrainLabel = document.createElement('label');
        terrainLabel.textContent = 'Terrain: ';
        terrainDiv.appendChild(terrainLabel);
        
        const terrainSlider = document.createElement('input');
        terrainSlider.type = 'range';
        terrainSlider.min = '0';
        terrainSlider.max = '2';
        terrainSlider.step = '0.1';
        terrainSlider.value = '1.5';
        terrainSlider.style.width = '100px';
        
        terrainSlider.oninput = (e) => {
            const value = parseFloat(e.target.value);
            map.setTerrain({
                source: 'terrainSource',
                exaggeration: value
            });
        };
        
        terrainDiv.appendChild(terrainSlider);
        this._container.appendChild(terrainDiv);

        // Hillshade opacity control
        const hillshadeDiv = document.createElement('div');
        hillshadeDiv.style.padding = '5px';
        
        const hillshadeLabel = document.createElement('label');
        hillshadeLabel.textContent = 'Hillshade: ';
        hillshadeDiv.appendChild(hillshadeLabel);
        
        const hillshadeSlider = document.createElement('input');
        hillshadeSlider.type = 'range';
        hillshadeSlider.min = '0';
        hillshadeSlider.max = '1';
        hillshadeSlider.step = '0.05';
        hillshadeSlider.value = '0.3';
        hillshadeSlider.style.width = '100px';
        
        hillshadeSlider.oninput = (e) => {
            const value = parseFloat(e.target.value);
            map.setPaintProperty('hillshade', 'raster-opacity', value);
        };
        
        hillshadeDiv.appendChild(hillshadeSlider);
        this._container.appendChild(hillshadeDiv);
        
        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
    }
}

export default TerrainControls;