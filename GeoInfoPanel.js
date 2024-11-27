import { Clock, Layers, Search, Shell } from "lucide-react";

class GeoInfoPanel {
    constructor() {
        this._container = null;
        this._map = null;
        this._currentFeature = null;
        this._panel = null;
        this._button = null;
        this._isActive = false;  // Nuovo stato per tracciare se il pannello è attivo
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        // Create toggle button
        this._button = document.createElement('button');
        this._button.type = 'button';
        this._button.className = 'maplibregl-ctrl-icon maplibregl-ctrl-inspect';
        this._button.setAttribute('aria-label', 'Toggle Geology Info');

        // Add CSS for the inspect icon
        this._addInspectStyles();
        
        // Create the panel container
        this._panel = document.createElement('div');
        this._panel.style.padding = '15px';
        this._panel.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        this._panel.style.backdropFilter = 'blur(8px)';
        this._panel.style.WebkitBackdropFilter = 'blur(8px)';
        this._panel.style.borderRadius = '8px';
        this._panel.style.boxShadow = '0 14px 20px rgba(0, 0, 0, 0.2)';
        this._panel.style.width = '600px';
        this._panel.style.maxHeight = '500px';
        this._panel.style.overflowY = 'auto';
        this._panel.style.position = 'fixed';
        this._panel.style.left = '10px';
        this._panel.style.bottom = '10px';
        this._panel.style.display = 'none';
        this._panel.style.zIndex = '1';
        this._panel.style.fontFamily = 'Rubik';

        // Aggiunge stili per la scrollbar personalizzata
        this._panel.style.scrollbarWidth = 'thin';
        this._panel.style.scrollbarColor = 'rgba(0, 0, 0, 0.3) transparent';

        // Aggiungi stili per la scrollbar su WebKit (Chrome, Safari, etc.)
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            #geo-info-content::-webkit-scrollbar {
                width: 6px;
            }
            #geo-info-content::-webkit-scrollbar-track {
                background: transparent;
            }
            #geo-info-content::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 3px;
            }
        `;
        document.head.appendChild(styleSheet);

        // Create content container
        const content = document.createElement('div');
        content.id = 'geo-info-content';
        content.style.fontSize = '14px';
        this._panel.appendChild(content);

        // Add click handler for toggle button
        this._button.addEventListener('click', () => {
            this._togglePanel();
        });

        // Append button to container
        this._container.appendChild(this._button);
        
        // Append panel directly to body
        document.body.appendChild(this._panel);

        // Set up event listeners for map interactions
        map.on('click', 'geologiaVDA', this._handleClick.bind(this));
        
        // Add click handler for toggle button
        this._button.addEventListener('click', () => {
            this._isActive = !this._isActive;  // Toggle lo stato attivo
            this._togglePanel();
        });

        // Set up event listeners for map interactions
        map.on('click', 'geologiaVDA', this._handleClick.bind(this));
        
        return this._container;
    }

    _addInspectStyles() {
        if (!document.getElementById('maplibregl-ctrl-inspect-style')) {
            const style = document.createElement('style');
            style.id = 'maplibregl-ctrl-inspect-style';
            style.textContent = `
                .maplibregl-ctrl-inspect {
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="11" cy="11" r="8"/%3E%3Cline x1="21" y1="21" x2="16.65" y2="16.65"/%3E%3C/svg%3E');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                }
                
                .maplibregl-ctrl-inspect.active {
                    background-color: rgba(51, 181, 229, 0.1) !important;
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2333b5e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="11" cy="11" r="8"/%3E%3Cline x1="21" y1="21" x2="16.65" y2="16.65"/%3E%3C/svg%3E') !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    _togglePanel() {
        if (this._isActive) {
            this._panel.style.display = 'block';
            this._button.classList.add('active');
        } else {
            this._panel.style.display = 'none';
            this._button.classList.remove('active');
        }
    }

    _handleClick(e) {
        if (e.features.length > 0) {
            const feature = e.features[0];
            this._updateContent(feature.properties);
            if (this._isActive) {  // Mostra il contenuto solo se il pannello è attivo
                this._panel.style.display = 'block';
            }
        }
    }

    _createSVGIcon(IconComponent) {
        return `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666666"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                ${this._getIconPath(IconComponent)}
            </svg>
        `;
    }

    _getIconPath(IconComponent) {
        switch (IconComponent) {
            case Clock:
                return `
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                `;
            case Layers:
                return `
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                `;
            case Search:
                return `
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                `;
            case Shell:
                return `
                    <path d="M14 11c3.3-1 5.7-3.2 6.8-5.9.4-1-.4-2.1-1.5-2.1C9.8 3 2 9.1 2 16.5c0 4.1 3.4 7.5 7.5 7.5 4 0 7.3-3.2 7.5-7.2.2-3.3-2-6.3-5-7.2"/>
                    <path d="M11 14.5c-1.4.4-2.4 1.6-2.4 3.1 0 1.7 1.3 3 3 3s3-1.3 3-3c0-1.5-1-2.7-2.4-3.1"/>
                    <path d="M15.7 9.5c.6-.5 1.4-.8 2.3-.8 1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5c-.9 0-1.7-.3-2.3-.8"/>
                `;
            default:
                return '';
        }
    }

    _updateContent(properties) {
        const content = document.getElementById('geo-info-content');
        if (!content) return;

        // Clear previous content
        content.innerHTML = '';

        // Header container per Sigla e Nome
        const headerContainer = document.createElement('div');
        headerContainer.style.textAlign = 'center';
        headerContainer.style.marginBottom = '8px';
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'center';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.gap = '5px';

        const sigla = document.createElement('span');
        sigla.textContent = properties.Sigla;
        sigla.style.fontSize = '16px';
        sigla.style.fontWeight = 'bold';
        sigla.style.color = '#393939';
        
        const separator = document.createElement('span');
        separator.textContent = ' - ';
        separator.style.fontSize = '16px';
        separator.style.color = '#666';
        
        const name = document.createElement('span');
        name.textContent = properties.Name;
        name.style.fontSize = '16px';
        name.style.color = '#393939';
        name.style.fontStyle = 'italic';
        name.style.fontWeight = 'bold';

        headerContainer.appendChild(sigla);
        headerContainer.appendChild(separator);
        headerContainer.appendChild(name);
        content.appendChild(headerContainer);

        // Container per età e unità
        const infoContainer = document.createElement('div');
        infoContainer.style.display = 'flex';
        infoContainer.style.justifyContent = 'center';
        infoContainer.style.gap = '20px';
        infoContainer.style.marginBottom = '5px';

        // Età
        const ageContainer = document.createElement('div');
        ageContainer.style.display = 'flex';
        ageContainer.style.alignItems = 'center';
        ageContainer.style.gap = '8px';

        const ageIcon = document.createElement('div');
        ageIcon.innerHTML = this._createSVGIcon(Clock);
        ageIcon.style.display = 'flex';
        ageIcon.style.alignItems = 'center';
        
        const ageText = document.createElement('span');
        ageText.textContent = properties.Approx_Age;
        ageText.style.color = '#393939';

        ageContainer.appendChild(ageIcon);
        ageContainer.appendChild(ageText);

        // Unità
        const unitContainer = document.createElement('div');
        unitContainer.style.display = 'flex';
        unitContainer.style.alignItems = 'center';
        unitContainer.style.gap = '8px';

        const unitIcon = document.createElement('div');
        unitIcon.innerHTML = this._createSVGIcon(Layers);
        unitIcon.style.display = 'flex';
        unitIcon.style.alignItems = 'center';
        
        const unitText = document.createElement('span');
        unitText.textContent = properties.Unit;
        unitText.style.color = '#393939';

        unitContainer.appendChild(unitIcon);
        unitContainer.appendChild(unitText);

        infoContainer.appendChild(ageContainer);
        infoContainer.appendChild(unitContainer);
        content.appendChild(infoContainer);

        // Contenuto fossilifero (se presente)
        if (properties.Fossils) {
            const fossilsContainer = document.createElement('div');
            fossilsContainer.style.display = 'flex';
            fossilsContainer.style.alignItems = 'flex-start';
            fossilsContainer.style.gap = '8px';
            fossilsContainer.style.marginBottom = '5px';

            const fossilIcon = document.createElement('div');
            fossilIcon.innerHTML = this._createSVGIcon(Shell);
            fossilIcon.style.display = 'flex';
            fossilIcon.style.alignItems = 'center';
            fossilIcon.style.flexShrink = '0';
            fossilIcon.style.marginTop = '2px';

            const fossilText = document.createElement('span');
            fossilText.textContent = properties.Fossils;
            fossilText.style.color = '#393939';
            fossilText.style.fontStyle = 'italic';

            fossilsContainer.appendChild(fossilIcon);
            fossilsContainer.appendChild(fossilText);
            content.appendChild(fossilsContainer);
        }

        // Descrizione
        const descContainer = document.createElement('div');
        descContainer.style.display = 'flex';
        descContainer.style.alignItems = 'flex-start';
        descContainer.style.gap = '8px';
        descContainer.style.marginBottom = '0px';

        const descIcon = document.createElement('div');
        descIcon.innerHTML = this._createSVGIcon(Search);
        descIcon.style.display = 'flex';
        descIcon.style.alignItems = 'center';
        descIcon.style.flexShrink = '0';
        descIcon.style.marginTop = '2px';

        const descText = document.createElement('span');
        descText.textContent = properties.Description;
        descText.style.color = '#393939';

        descContainer.appendChild(descIcon);
        descContainer.appendChild(descText);
        content.appendChild(descContainer);
    }

    onRemove() {
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        if (this._panel.parentNode) {
            this._panel.parentNode.removeChild(this._panel);
        }
        if (this._map) {
            this._map.off('click', 'geologiaVDA', this._handleClick);
        }
        this._map = null;
    }
}

export default GeoInfoPanel;