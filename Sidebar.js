class Sidebar {
    constructor() {
        this._container = null;
        this._map = null;
        this._sidebarContent = null;
        this._toggleButton = null;
        this._isOpen = true;
    }

    add(map) {
        this._map = map;
        const mapContainer = map.getContainer();
        
        // Make sure the map container can handle absolute positioning
        mapContainer.style.position = 'relative';
        
        // Main container
        this._container = document.createElement('div');
        this._container.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 350px;
            z-index: 999;
        `;
        
        // Sidebar content
        this._sidebarContent = document.createElement('div');
        this._sidebarContent.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 100%;
            background: white;
            overflow-y: auto;
            box-shadow: 3px 0 10px rgba(0,0,0,0.2);
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            transition: transform 0.3s ease;
        `;
        
        // Toggle button
        this._toggleButton = document.createElement('button');
        this._toggleButton.style.cssText = `
            position: absolute;
            left: 350px;
            top: 10px;
            z-index: 1000;
            padding: 8px 12px;
            border: none;
            border-radius: 0 4px 4px 0;
            background: white;
            box-shadow: 3px 0 10px rgba(0,0,0,0.2);
            cursor: pointer;
            font-size: 16px;
        `;
        this._toggleButton.innerHTML = '☰';
        this._toggleButton.onclick = () => this._toggleSidebar();
        
        // Panel containers con stili espliciti
        const layerControlSection = document.createElement('div');
        layerControlSection.id = 'sidebar-layer-control';
        layerControlSection.style.cssText = `
            flex: 0 0 auto;
            width: 100%;
            min-height: 50px;
        `;
        
        const geoInfoSection = document.createElement('div');
        geoInfoSection.id = 'sidebar-geo-info';
        geoInfoSection.style.cssText = `
            flex: 1 1 auto;
            width: 100%;
            min-height: 50px;
        `;
        
        this._sidebarContent.appendChild(layerControlSection);
        this._sidebarContent.appendChild(geoInfoSection);
        
        this._container.appendChild(this._sidebarContent);
        this._container.appendChild(this._toggleButton);
        
        // Aggiungi la sidebar al container della mappa
        mapContainer.appendChild(this._container);
        
        // Debug log
        console.log('Sidebar added to map container:', this._container);
    }

    _toggleSidebar() {
        this._isOpen = !this._isOpen;
        if (this._isOpen) {
            this._sidebarContent.style.transform = 'translateX(0)';
            this._toggleButton.style.left = '350px';
        } else {
            this._sidebarContent.style.transform = 'translateX(-100%)';
            this._toggleButton.style.left = '0';
        }
    }

    addPanel(panelElement, position = 'top') {
        const container = position === 'top' ? 
            document.getElementById('sidebar-layer-control') : 
            document.getElementById('sidebar-geo-info');
            
        if (container && panelElement) {
            // Rimuovi tutti gli stili precedenti che potrebbero interferire
            panelElement.classList.remove('maplibregl-ctrl');
            panelElement.classList.remove('maplibregl-ctrl-group');
            panelElement.style.cssText = `
                margin: 0;
                padding: 10px;
                width: 100%;
                background: white;
                border: none;
                box-shadow: none;
            `;
            
            container.appendChild(panelElement);
            
            // Debug log
            console.log(`Panel added to ${position} section:`, panelElement);
        } else {
            console.warn('Container not found for position:', position);
        }
    }

    remove() {
        if (this._container && this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        this._map = null;
    }
}

export default Sidebar;