import { Clock, Layers, Search, Shell } from "lucide-react";

class GeoInfoPanel {
    constructor() {
        this._container = null;
        this._map = null;
        this._currentFeature = null;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        // Create the panel container
        const panel = document.createElement('div');
        panel.style.padding = '15px';
        panel.style.backgroundColor = 'white';
        panel.style.borderRadius = '4px';
        panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        panel.style.width = '300px';
        panel.style.maxHeight = '500px';
        panel.style.overflowY = 'auto';

        // Create content container
        const content = document.createElement('div');
        content.id = 'geo-info-content';
        content.style.fontSize = '14px';
        panel.appendChild(content);

        this._container.appendChild(panel);

        // Set up event listeners
        map.on('click', 'geologiaVDA', this._handleClick.bind(this));
        
        return this._container;
    }

    _handleClick(e) {
        if (e.features.length > 0) {
            const feature = e.features[0];
            this._updateContent(feature.properties);
        }
    }

    _updateContent(properties) {
        const content = document.getElementById('geo-info-content');
        if (!content) return;

        // Clear previous content
        content.innerHTML = '';

        // Define the order and structure of fields we want to show
        const fieldsToShow = [
            {
                mainField: 'Sigla',
                subField: 'Name',
                style: {
                    marginBottom: '15px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            {
                field: 'Approx_Age',
                icon: Clock,
                label: 'Età',
                style: {
                    marginBottom: '10px'
                }
            },
            {
                field: 'Unit',
                icon: Layers,
                label: 'Unità',
                style: {
                    marginBottom: '10px'
                }
            },
            {
                field: 'Fossils',
                icon: Shell,
                label: 'Contenuto fossilifero',
                conditional: true,
                style: {
                    marginBottom: '10px'
                }
            },
            {
                field: 'Description',
                icon: Search,
                label: 'Descrizione',
                style: {
                    marginBottom: '10px',
                    lineHeight: '1.4'
                }
            }
        ];

        // Create formatted content
        fieldsToShow.forEach(fieldInfo => {
            if (fieldInfo.mainField && fieldInfo.subField) {
                // Special handling for Sigla + Name combination
                const field = document.createElement('div');
                Object.assign(field.style, fieldInfo.style);
                
                const sigla = document.createElement('span');
                sigla.textContent = properties[fieldInfo.mainField];
                
                const name = document.createElement('span');
                name.textContent = ` - ${properties[fieldInfo.subField]}`;
                name.style.fontWeight = 'normal';
                
                field.appendChild(sigla);
                field.appendChild(name);
                content.appendChild(field);
            } else {
                // Handle conditional fields
                if (fieldInfo.conditional && !properties[fieldInfo.field]) {
                    return; // Skip if conditional and empty/null
                }

                const field = document.createElement('div');
                Object.assign(field.style, fieldInfo.style);
                field.style.display = 'flex';
                field.style.alignItems = 'center';
                field.style.gap = '8px';

                // Create icon if specified
                if (fieldInfo.icon) {
                    const icon = document.createElement('div');
                    icon.style.display = 'flex';
                    icon.style.alignItems = 'center';
                    icon.style.justifyContent = 'center';
                    icon.style.width = '20px';
                    icon.style.height = '20px';
                    
                    const IconComponent = fieldInfo.icon;
                    const svgString = IconComponent.render({
                        size: 18,
                        color: '#666',
                        strokeWidth: 1.5
                    });
                    
                    icon.innerHTML = svgString;
                    field.appendChild(icon);
                }

                const valueSpan = document.createElement('span');
                valueSpan.textContent = properties[fieldInfo.field];
                valueSpan.style.color = '#666';

                field.appendChild(valueSpan);
                content.appendChild(field);
            }
        });
    }

    onRemove() {
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        if (this._map) {
            this._map.off('click', 'geologiaVDA', this._handleClick);
        }
        this._map = null;
    }
}

export default GeoInfoPanel;