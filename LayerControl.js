class LayerControl {
    constructor() {
        this._map = null;
        this._container = null;
        this._layerStates = new Map();
        this._panel = null;
        this._button = null;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

        // Create toggle button using MapLibre's native style
        this._button = document.createElement('button');
        this._button.type = 'button';
        this._button.className = 'maplibregl-ctrl-icon maplibregl-ctrl-layers';
        this._button.setAttribute('title', 'Toggle layer visibility');

        // Add CSS for the layers icon
        this._addLayersStyles();
        
        // Create the control panel container
        this._panel = document.createElement('div');
        this._panel.style.padding = '10px';
        this._panel.style.backgroundColor = 'white';
        this._panel.style.borderRadius = '4px';
        this._panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        this._panel.style.minWidth = '200px';
        this._panel.style.position = 'absolute';
        this._panel.style.right = '40px';
        this._panel.style.top = '0';
        this._panel.style.display = 'none';  // Initially hidden

        // Add title
        const title = document.createElement('div');
        title.textContent = 'Layer Controls';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        title.style.borderBottom = '1px solid #ccc';
        title.style.paddingBottom = '5px';
        this._panel.appendChild(title);

        // Wait for the map to load before adding layer controls
        if (map.loaded()) {
            this._addLayerControls(this._panel);
        } else {
            map.on('load', () => this._addLayerControls(this._panel));
        }

        // Add click handler for toggle button
        this._button.addEventListener('click', () => {
            this._togglePanel();
        });

        this._container.appendChild(this._button);
        this._container.appendChild(this._panel);
        return this._container;
    }

    _addLayersStyles() {
        if (!document.getElementById('maplibregl-ctrl-layers-style')) {
            const style = document.createElement('style');
            style.id = 'maplibregl-ctrl-layers-style';
            style.textContent = `
                .maplibregl-ctrl-layers {
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpolygon points="12 2 2 7 12 12 22 7 12 2"/%3E%3Cpolyline points="2 17 12 22 22 17"/%3E%3Cpolyline points="2 12 12 17 22 12"/%3E%3C/svg%3E');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                }

                .maplibregl-ctrl-layers.active {
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2333b5e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpolygon points="12 2 2 7 12 12 22 7 12 2"/%3E%3Cpolyline points="2 17 12 22 22 17"/%3E%3Cpolyline points="2 12 12 17 22 12"/%3E%3C/svg%3E');
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

    _addLayerControls(panel) {
        const style = this._map.getStyle();
        const layers = style.layers;

        // Group layers by their source
        const layerGroups = new Map();

        layers.forEach(layer => {
            // Skip the basemap layer
            if (layer.id === 'basemap') return;

            const sourceName = layer.source || 'Other';
            if (!layerGroups.has(sourceName)) {
                layerGroups.set(sourceName, []);
            }
            layerGroups.get(sourceName).push(layer);
        });

        // Create controls for each group
        layerGroups.forEach((layers, sourceName) => {
            // Create group container
            const groupDiv = document.createElement('div');
            groupDiv.style.marginBottom = '10px';

            // Add group title if there's more than one layer in the group
            if (layers.length > 1) {
                const groupTitle = document.createElement('div');
                groupTitle.textContent = this._formatSourceName(sourceName);
                groupTitle.style.fontWeight = 'bold';
                groupTitle.style.marginBottom = '5px';
                groupTitle.style.fontSize = '0.9em';
                groupTitle.style.color = '#666';
                groupDiv.appendChild(groupTitle);
            }

            // Add layer toggles
            layers.forEach(layer => {
                const layerDiv = document.createElement('div');
                layerDiv.style.marginBottom = '5px';
                layerDiv.style.display = 'flex';
                layerDiv.style.alignItems = 'center';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `layer-${layer.id}`;
                checkbox.checked = this._map.getLayoutProperty(layer.id, 'visibility') !== 'none';
                
                const label = document.createElement('label');
                label.htmlFor = `layer-${layer.id}`;
                label.textContent = this._formatLayerName(layer.id);
                label.style.marginLeft = '5px';
                label.style.fontSize = '0.9em';
                label.style.cursor = 'pointer';

                // Store initial state
                this._layerStates.set(layer.id, checkbox.checked);

                // Add event listener
                checkbox.addEventListener('change', (e) => {
                    const visibility = e.target.checked ? 'visible' : 'none';
                    this._map.setLayoutProperty(layer.id, 'visibility', visibility);
                    this._layerStates.set(layer.id, e.target.checked);
                });

                layerDiv.appendChild(checkbox);
                layerDiv.appendChild(label);
                groupDiv.appendChild(layerDiv);
            });

            panel.appendChild(groupDiv);
        });

        // Add separator
        const separator = document.createElement('hr');
        separator.style.margin = '10px 0';
        separator.style.border = 'none';
        separator.style.borderTop = '1px solid #eee';
        panel.appendChild(separator);

        // Add "Toggle All" controls
        const toggleAllDiv = document.createElement('div');
        toggleAllDiv.style.display = 'flex';
        toggleAllDiv.style.justifyContent = 'space-between';
        toggleAllDiv.style.marginTop = '5px';

        const showAllButton = this._createButton('Show All');
        showAllButton.addEventListener('click', () => this._toggleAllLayers(true));

        const hideAllButton = this._createButton('Hide All');
        hideAllButton.addEventListener('click', () => this._toggleAllLayers(false));

        toggleAllDiv.appendChild(showAllButton);
        toggleAllDiv.appendChild(hideAllButton);
        panel.appendChild(toggleAllDiv);
    }

    _createButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '4px 8px';
        button.style.fontSize = '0.8em';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = '#f5f5f5';
        button.style.border = '1px solid #ccc';
        button.style.borderRadius = '3px';
        button.style.transition = 'background-color 0.2s';
        
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#e5e5e5';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#f5f5f5';
        });

        return button;
    }

    _toggleAllLayers(show) {
        this._layerStates.forEach((_, layerId) => {
            this._map.setLayoutProperty(layerId, 'visibility', show ? 'visible' : 'none');
            const checkbox = document.getElementById(`layer-${layerId}`);
            if (checkbox) checkbox.checked = show;
            this._layerStates.set(layerId, show);
        });
    }

    _formatSourceName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    _formatLayerName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    onRemove() {
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        this._map = null;
    }
}

export default LayerControl;