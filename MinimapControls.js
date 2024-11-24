import * as maplibregl from "maplibre-gl";

class MinimapControl {
    constructor(options = {}) {
        this._container = null;
        this._minimap = null;
        this._minimapCanvas = null;
        this._mainMap = null;
        this._width = options.width || 200;
        this._height = options.height || 200;
        this._zoomOffset = options.zoomOffset || 4;
    }

    onAdd(map) {
        this._mainMap = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        const minimapContainer = document.createElement('div');
        minimapContainer.style.width = this._width + 'px';
        minimapContainer.style.height = this._height + 'px';
        minimapContainer.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        minimapContainer.style.borderRadius = '8px';
        minimapContainer.style.position = 'relative';
        minimapContainer.style.background = '#fff';
        minimapContainer.style.overflow = 'hidden'; // Per mantenere gli angoli arrotondati
        minimapContainer.style.backdropFilter = 'blur(8px)';
        minimapContainer.style.WebkitBackdropFilter = 'blur(8px)';
        minimapContainer.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        
        if (map.loaded()) {
            this._initMinimap(minimapContainer);
        } else {
            map.on('load', () => this._initMinimap(minimapContainer));
        }

        this._container.appendChild(minimapContainer);
        return this._container;
    }

    _initMinimap(container) {
        // Clone the main map's style
        const mainStyle = this._mainMap.getStyle();
        const minimapStyle = {
            version: 8,
            sources: {},
            layers: [],
            glyphs: mainStyle.glyphs
        };

        // Only copy the basemap source and layer
        if (mainStyle.sources.basemap) {
            minimapStyle.sources.basemap = mainStyle.sources.basemap;
            
            // Find and copy the basemap layer
            const basemapLayer = mainStyle.layers.find(layer => layer.id === 'basemap');
            if (basemapLayer) {
                minimapStyle.layers.push(basemapLayer);
            }
        }

        // Initialize the minimap
        this._minimap = new maplibregl.Map({
            container: container,
            style: minimapStyle,
            center: this._mainMap.getCenter(),
            zoom: this._mainMap.getZoom() - this._zoomOffset,
            interactive: false,
            attributionControl: false,
            pitchWithRotate: false,
            pitch: 0,
            bearing: 0
        });

        // Create and add the canvas overlay
        this._minimapCanvas = document.createElement('canvas');
        this._minimapCanvas.style.position = 'absolute';
        this._minimapCanvas.style.top = '0';
        this._minimapCanvas.style.left = '0';
        this._minimapCanvas.style.pointerEvents = 'none';
        this._minimapCanvas.width = this._width;
        this._minimapCanvas.height = this._height;
        container.appendChild(this._minimapCanvas);

        // Set up event listeners
        this._minimap.on('load', () => {
            this._mainMap.on('move', this._updateMinimap.bind(this));
            this._mainMap.on('pitch', this._updateMinimap.bind(this));
            this._mainMap.on('rotate', this._updateMinimap.bind(this));
            this._updateMinimap();
        });
    }

    onRemove() {
        if (this._minimap) {
            this._minimap.remove();
        }
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        this._mainMap = null;
    }

    _updateMinimap() {
        if (!this._minimap || !this._mainMap) return;
    
        // Update minimap position
        this._minimap.setCenter(this._mainMap.getCenter());
        this._minimap.setZoom(this._mainMap.getZoom() - this._zoomOffset);
    
        const ctx = this._minimapCanvas.getContext('2d');
        ctx.clearRect(0, 0, this._width, this._height);
    
        const viewport = this._mainMap.getContainer();
        const pitch = this._mainMap.getPitch();
        
        // Calculate viewport corners
        const MAX_Y_OFFSET = viewport.offsetHeight * 0.5;
        
        const corners = [
            [0, 0],
            [viewport.offsetWidth, 0],
            [viewport.offsetWidth, viewport.offsetHeight],
            [0, viewport.offsetHeight]
        ].map(point => {
            // Adjust top points when pitch is high
            if (point[1] === 0 && pitch > 70) {
                const factor = (pitch - 70) / 20;
                const limitedY = Math.min(MAX_Y_OFFSET * factor, MAX_Y_OFFSET);
                return this._mainMap.unproject([point[0], limitedY]);
            }
            return this._mainMap.unproject(point);
        });
    
        // Convert to minimap points
        const minimapPoints = corners.map(lngLat => 
            this._minimap.project(lngLat)
        );
    
        // Calculate middle points for gradient
        const topMidPoint = {
            x: (minimapPoints[0].x + minimapPoints[1].x) / 2,
            y: (minimapPoints[0].y + minimapPoints[1].y) / 2
        };
        
        const bottomMidPoint = {
            x: (minimapPoints[2].x + minimapPoints[3].x) / 2,
            y: (minimapPoints[2].y + minimapPoints[3].y) / 2
        };
    
        // Create gradient
        const gradient = ctx.createLinearGradient(
            bottomMidPoint.x, bottomMidPoint.y,
            topMidPoint.x, topMidPoint.y
        );
        
        if (pitch > 70) {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        }
    
        // Draw viewport polygon
        ctx.beginPath();
        minimapPoints.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
    
        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        
        ctx.fill();
        ctx.stroke();
    }
}

export default MinimapControl;