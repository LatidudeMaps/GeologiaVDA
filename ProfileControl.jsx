import * as turf from '@turf/turf';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    ResponsiveContainer,
    Area
} from 'recharts';
import React from 'react';
import { createRoot } from 'react-dom/client';

class ProfileControl {
    constructor() {
        this._container = null;
        this._map = null;
        this._isDrawing = false;
        this._lineString = null;
        this._points = [];
        this._panel = null;
        this._button = null;
        this._drawLine = null;
        this._chartRoot = null;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        
        // Create toggle button
        this._button = document.createElement('button');
        this._button.type = 'button';
        this._button.className = 'maplibregl-ctrl-icon maplibregl-ctrl-profile';
        this._button.setAttribute('aria-label', 'Create Profile');

        // Add CSS for the profile icon
        this._addProfileStyles();
        
        // Create the panel container
        this._panel = document.createElement('div');
        this._panel.style.padding = '15px';
        this._panel.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        this._panel.style.backdropFilter = 'blur(8px)';
        this._panel.style.WebkitBackdropFilter = 'blur(8px)';
        this._panel.style.borderRadius = '8px';
        this._panel.style.boxShadow = '0 14px 20px rgba(0, 0, 0, 0.2)';
        this._panel.style.width = '800px';
        this._panel.style.height = '400px';
        this._panel.style.position = 'fixed';
        this._panel.style.left = '50%';
        this._panel.style.bottom = '20px'; // Cambiato da top a bottom
        this._panel.style.transform = 'translateX(-50%)'; // Rimosso translateY
        this._panel.style.display = 'none';
        this._panel.style.zIndex = '1000';
        this._panel.style.fontFamily = 'Rubik';

        // Create content container
        const content = document.createElement('div');
        content.id = 'profile-content';
        content.style.width = '100%';
        content.style.height = '100%';
        this._panel.appendChild(content);

        // Add click handler for toggle button
        this._button.addEventListener('click', () => {
            this._toggleDrawing();
        });

        // Setup map click handler
        this._map.on('click', this._handleMapClick.bind(this));
        
        // Setup mousemove handler for line preview
        this._map.on('mousemove', this._handleMouseMove.bind(this));

        // Add line source and layer
        map.on('load', () => {
            map.addSource('profile-line', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: []
                    }
                }
            });

            map.addLayer({
                id: 'profile-line',
                type: 'line',
                source: 'profile-line',
                paint: {
                    'line-color': '#33b5e5',
                    'line-width': 3
                }
            });
        });

        // Append button and panel
        this._container.appendChild(this._button);
        document.body.appendChild(this._panel);
        
        return this._container;
    }

    _addProfileStyles() {
        if (!document.getElementById('maplibregl-ctrl-profile-style')) {
            const style = document.createElement('style');
            style.id = 'maplibregl-ctrl-profile-style';
            style.textContent = `
                .maplibregl-ctrl-profile {
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M2 12h6l3-9 3 18 3-9h5"/%3E%3C/svg%3E');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                }
                
                .maplibregl-ctrl-profile.active {
                    background-color: rgba(51, 181, 229, 0.1) !important;
                    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2333b5e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M2 12h6l3-9 3 18 3-9h5"/%3E%3C/svg%3E') !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    _toggleDrawing() {
        this._isDrawing = !this._isDrawing;
        
        if (this._isDrawing) {
            this._button.classList.add('active');
            this._points = [];
            this._map.getCanvas().style.cursor = 'crosshair';
            
            // Reset line
            this._updateLine([]);
        } else {
            this._button.classList.remove('active');
            this._map.getCanvas().style.cursor = '';
            
            if (this._points.length > 1) {
                this._createProfile();
            }
        }
    }

    _handleMapClick(e) {
        if (!this._isDrawing) return;

        const coord = [e.lngLat.lng, e.lngLat.lat];
        this._points.push(coord);
        
        if (this._points.length === 2) {
            this._toggleDrawing(); // Automatically stop drawing after second point
        }
    }

    _handleMouseMove(e) {
        if (!this._isDrawing || this._points.length === 0) return;

        const coord = [e.lngLat.lng, e.lngLat.lat];
        this._updateLine([...this._points, coord]);
    }

    _updateLine(coordinates) {
        if (!this._map.getSource('profile-line')) return;

        this._map.getSource('profile-line').setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            }
        });
    }

    async _createProfile() {
        this._panel.style.display = 'block';
    
        const line = turf.lineString(this._points);
        const length = turf.length(line, {units: 'kilometers'});
        const steps = 100;
        const points = [];
    
        for (let i = 0; i <= steps; i++) {
            const point = turf.along(line, (length * i) / steps, {units: 'kilometers'});
            points.push(point);
        }
    
        // Ottieni le elevazioni e applica la correzione
        const data = points.map((point, i) => {
            const rawElevation = this._map.queryTerrainElevation(point.geometry.coordinates) || 0;
            
            // Funzione di correzione basata sui valori osservati
            // Converte i valori negativi/errati in valori realistici
            const correctedElevation = rawElevation < 0 
                ? Math.abs(rawElevation) + 500  // Converte valori negativi in positivi e aggiunge base elevation
                : rawElevation + 500;           // Aggiunge base elevation ai valori positivi
    
            const features = this._map.queryRenderedFeatures(
                this._map.project(point.geometry.coordinates),
                { layers: ['geologiaVDA'] }
            );
    
            return {
                distance: (length * i) / steps,
                elevation: correctedElevation,
                geology: features[0]?.properties?.Sigla || 'N/A'
            };
        });
    
        console.log('Corrected elevation range:', {
            min: Math.min(...data.map(d => d.elevation)),
            max: Math.max(...data.map(d => d.elevation))
        });
    
        this._createChart(data);
    }

    _getGeologyColors(formations) {
        const colorMap = {
            'N/A': '#cccccc'
        };

        // Cerca il layer della geologia nello stile della mappa
        const geoLayer = this._map.getStyle().layers.find(layer => 
            layer.id === 'geologiaVDA');

        if (geoLayer && geoLayer.paint && geoLayer.paint['fill-color']) {
            // Se il layer usa un'espressione per i colori, estraili
            const colorExpression = geoLayer.paint['fill-color'];
            if (Array.isArray(colorExpression) && colorExpression[0] === 'match') {
                for (let i = 1; i < colorExpression.length; i += 2) {
                    if (i + 1 < colorExpression.length) {
                        const formation = colorExpression[i];
                        const color = colorExpression[i + 1];
                        colorMap[formation] = color;
                    }
                }
            }
        }

        // Per formazioni non mappate
        formations.forEach((formation) => {
            if (!colorMap[formation]) {
                colorMap[formation] = `hsl(${Math.random() * 360}, 70%, 50%)`;
            }
        });

        return colorMap;
    }

    _createChart(data) {
        const content = document.getElementById('profile-content');
        content.innerHTML = '';

        // Create header with controls
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '15px';

        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Profilo Topografico';
        title.style.margin = '0';
        header.appendChild(title);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '5px 10px';
        closeButton.onclick = () => {
            this._panel.style.display = 'none';
            this._updateLine([]); // Clear the line from the map
            if (this._chartRoot) {
                this._chartRoot.unmount();
            }
        };
        header.appendChild(closeButton);

        content.appendChild(header);

        // Create chart container
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '100%';
        chartContainer.style.height = 'calc(100% - 50px)';
        chartContainer.style.minWidth = '200px';
        chartContainer.style.minHeight = '200px';
        content.appendChild(chartContainer);

        // Create the chart component
        const ChartComponent = () => {
            const elevations = data.map(d => d.elevation);
            console.log('Elevations array:', elevations);
            
            const minElevation = Math.floor(Math.min(...elevations));
            const maxElevation = Math.ceil(Math.max(...elevations));
            const elevationRange = maxElevation - minElevation;
            const padding = Math.round(elevationRange * 0.1);
    
            console.log('Elevation range:', { min: minElevation, max: maxElevation, padding });
    
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 50, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="distance" 
                            label={{ value: 'Distanza (km)', position: 'bottom', offset: 10 }}
                            tickFormatter={(value) => value.toFixed(1)}
                            interval={Math.ceil(data.length / 10)} // Mostra circa 10 tick
                        />
                        <YAxis 
                            domain={[minElevation - padding, maxElevation + padding]}
                            label={{ 
                                value: 'Elevazione (m)', 
                                angle: -90, 
                                position: 'insideLeft',
                                offset: -20
                            }}
                            tickFormatter={(value) => Math.round(value)}
                        />
                        <Tooltip content={this._customTooltip} />
                        <Line 
                            type="monotone" 
                            dataKey="elevation" 
                            stroke="#000000" 
                            dot={false} 
                            strokeWidth={2}
                            name="Elevazione"
                        />
                        {this._createGeologySegments(data, this._getGeologyColors([...new Set(data.map(d => d.geology))]))}
                        <Legend />
                    </LineChart>
                </ResponsiveContainer>
            );
        };
    
        this._chartRoot = createRoot(chartContainer);
        this._chartRoot.render(<ChartComponent />);
    }

    _createGeologySegments(data, colors) {
        // Crea segmenti colorati per le diverse formazioni geologiche
        const segments = [];
        let currentFormation = data[0].geology;
        let startIndex = 0;

        data.forEach((point, index) => {
            if (point.geology !== currentFormation || index === data.length - 1) {
                segments.push({
                    formation: currentFormation,
                    start: startIndex,
                    end: index
                });
                currentFormation = point.geology;
                startIndex = index;
            }
        });

        // Crea le aree colorate per ogni segmento
        return segments.map((segment, index) => {
            const segmentData = data.slice(segment.start, segment.end + 1);
            return (
                <Area
                    key={index}
                    dataKey="elevation"
                    data={segmentData}
                    fill={colors[segment.formation]}
                    fillOpacity={0.3}
                    stroke="none"
                    name={segment.formation}
                />
            );
        });
    }

    _customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}>
                    <p style={{ margin: '0 0 5px 0' }}>
                        <strong>Distanza:</strong> {label.toFixed(2)} km
                    </p>
                    <p style={{ margin: '0 0 5px 0' }}>
                        <strong>Elevazione:</strong> {Math.round(data.elevation)}m
                    </p>
                    <p style={{ margin: 0 }}>
                    <strong>Formazione:</strong> {data.geology}
                    </p>
                </div>
            );
        }
        return null;
    };

    onRemove() {
        if (this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        if (this._panel.parentNode) {
            this._panel.parentNode.removeChild(this._panel);
        }
        if (this._map) {
            this._map.off('click', this._handleMapClick);
            this._map.off('mousemove', this._handleMouseMove);
            if (this._map.getLayer('profile-line')) {
                this._map.removeLayer('profile-line');
            }
            if (this._map.getSource('profile-line')) {
                this._map.removeSource('profile-line');
            }
        }
        if (this._chartRoot) {
            this._chartRoot.unmount();
        }
        this._map = null;
    }
}

export default ProfileControl;