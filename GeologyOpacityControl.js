class GeologyOpacityControl {
    constructor() {
        this._container = null;
        this._map = null;
        this._button = null;
        this._panel = null;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        // Create toggle button
        this._button = document.createElement('button');
        this._button.type = 'button';
        this._button.className = 'maplibregl-ctrl-icon maplibregl-ctrl-opacity';
        this._button.setAttribute('title', 'Adjust geology layer opacity');

        // Add CSS for the opacity icon
        this._addOpacityStyles();
        
        // Create the panel container
        this._panel = document.createElement('div');
        this._panel.style.padding = '10px';
        this._panel.style.backgroundColor = 'white';
        this._panel.style.borderRadius = '4px';
        this._panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        this._panel.style.position = 'absolute';
        this._panel.style.right = '40px';
        this._panel.style.top = '0';
        this._panel.style.display = 'none';
        this._panel.style.minWidth = '200px';
        
        // Create opacity control container
        const opacityDiv = document.createElement('div');
        opacityDiv.style.display = 'flex';
        opacityDiv.style.alignItems = 'center';
        opacityDiv.style.gap = '8px';
        
        // Add label
        const opacityLabel = document.createElement('label');
        opacityLabel.textContent = 'Geology: ';
        opacityLabel.style.fontSize = '12px';
        opacityLabel.style.color = '#666';
        opacityDiv.appendChild(opacityLabel);
        
        // Create slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.style.flex = '1';
        sliderContainer.style.display = 'flex';
        sliderContainer.style.alignItems = 'center';
        
        // Add slider
        const opacitySlider = document.createElement('input');
        opacitySlider.type = 'range';
        opacitySlider.min = '0';
        opacitySlider.max = '1';
        opacitySlider.step = '0.05';
        opacitySlider.value = '0.7';
        opacitySlider.style.width = '100%';
        opacitySlider.style.margin = '0';
        
        // Add value display
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = '70%';
        valueDisplay.style.marginLeft = '8px';
        valueDisplay.style.fontSize = '12px';
        valueDisplay.style.color = '#666';
        valueDisplay.style.minWidth = '40px';
        
        // Add event listener for slider
        opacitySlider.oninput = (e) => {
            const value = parseFloat(e.target.value);
            map.setPaintProperty('geologia', 'raster-opacity', value);
            map.setPaintProperty('geologiaVDA', 'fill-opacity', value === 0 ? 0 : 0.7);
            valueDisplay.textContent = `${Math.round(value * 100)}%`;
        };
        
        sliderContainer.appendChild(opacitySlider);
        sliderContainer.appendChild(valueDisplay);
        opacityDiv.appendChild(sliderContainer);
        
        this._panel.appendChild(opacityDiv);
        
        // Add click handler for toggle button
        this._button.addEventListener('click', () => {
            this._togglePanel();
        });
        
        this._container.appendChild(this._button);
        this._container.appendChild(this._panel);
        
        return this._container;
    }

    _addOpacityStyles() {
        if (!document.getElementById('maplibregl-ctrl-opacity-style')) {
            const style = document.createElement('style');
            style.id = 'maplibregl-ctrl-opacity-style';
            style.textContent = `
                .maplibregl-ctrl-opacity {
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="%23333"%3E%3Cpath d="M6.225 1.227A7.5 7.5 0 0 1 10.5 8a7.5 7.5 0 0 1-4.275 6.773 7 7 0 1 0 0-13.546zM4.187.966a8 8 0 1 1 7.627 14.069A8 8 0 0 1 4.186.964z"/%3E%3C/svg%3E');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                }
                
                .maplibregl-ctrl-opacity.active {
                    background-color: rgba(51, 181, 229, 0.1) !important;
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg width="20" height="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="%2333b5e5"%3E%3Cpath d="M6.225 1.227A7.5 7.5 0 0 1 10.5 8a7.5 7.5 0 0 1-4.275 6.773 7 7 0 1 0 0-13.546zM4.187.966a8 8 0 1 1 7.627 14.069A8 8 0 0 1 4.186.964z"/%3E%3C/svg%3E') !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    _togglePanel() {
        if (this._panel.style.display === 'none') {
            this._panel.style.display = 'block';
            this._button.classList.add('active');
        } else {
            this._panel.style.display = 'none';
            this._button.classList.remove('active');
        }
    }
    
    onRemove() {
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        this._map = null;
    }
}

export default GeologyOpacityControl;