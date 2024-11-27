import * as turf from '@turf/turf';
import {
    AreaChart,
    Area, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    ResponsiveContainer
} from 'recharts';
import React, { PureComponent } from 'react';
import { createRoot } from 'react-dom/client';
import { locationValues } from '@geomatico/maplibre-cog-protocol';
import maplibregl from 'maplibre-gl';

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
        this._demUrl = 'https://raw.githubusercontent.com/latidudemaps/GeologiaVDA/main/data/DEM_VDA_5m_COG.tif'; // Sostituisci con l'URL del tuo DEM
        this._marker = null;
        this._lineString = null;
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
        this._panel.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        this._panel.style.backdropFilter = 'blur(8px)';
        this._panel.style.WebkitBackdropFilter = 'blur(8px)';
        this._panel.style.borderRadius = '8px';
        this._panel.style.boxShadow = '0 14px 20px rgba(0, 0, 0, 0.2)';
        this._panel.style.width = '800px';
        this._panel.style.height = '400px';
        this._panel.style.position = 'fixed';
        this._panel.style.left = '50%';
        this._panel.style.bottom = '10px'; // Cambiato da top a bottom
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

        // Usa Promise.all per ottenere le elevazioni in parallelo
        const data = await Promise.all(points.map(async (point, i) => {
            const coordinates = point.geometry.coordinates;
            
            try {
                // Ottieni i valori del pixel dal DEM
                const [elevation] = await locationValues(
                    this._demUrl, 
                    {
                        latitude: coordinates[1], 
                        longitude: coordinates[0]
                    }, 
                    this._map.getZoom()
                );

                // Query features per ogni punto
                const features = this._map.queryRenderedFeatures(
                    this._map.project(coordinates), 
                    { layers: ['geologiaVDA'] }
                );

                return {
                    distance: (length * i) / steps,
                    elevation: elevation || 0, // Usa il valore del pixel come elevazione
                    geology: features.length > 0 ? features[0].properties.Sigla : 'N/A'
                };
            } catch (error) {
                console.error('Elevation query failed:', error);
                return {
                    distance: (length * i) / steps,
                    elevation: 0,
                    geology: 'N/A'
                };
            }
        }));

        //console.log('Elevation Data:', data);

        this._createChart(data);
    }

    _getGeologyColors(formations) {
        // Oggetto per memorizzare i colori assegnati
        const colorMap = {
            'N/A': '#cccccc'
        };
    
        // Funzione per generare un colore HSL casuale ma gradevole
        const generateColor = (formation) => {
            // Usa la stringa della formazione per generare un numero deterministico
            let hash = 0;
            for (let i = 0; i < formation.length; i++) {
                hash = formation.charCodeAt(i) + ((hash << 5) - hash);
            }
            
            // Genera HSL con:
            // - Hue: valore completo 0-360
            // - Saturation: 60-80% per colori vivaci ma non troppo
            // - Lightness: 35-65% per colori né troppo scuri né troppo chiari
            const hue = hash % 360;
            const saturation = 60 + (hash % 20); // 60-80%
            const lightness = 35 + (hash % 30);  // 35-65%
            
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };
    
        // Assegna colori a tutte le formazioni
        formations.forEach(formation => {
            if (!colorMap[formation]) {
                colorMap[formation] = generateColor(formation);
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
        header.style.marginBottom = '10px';

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
            const minElevation = Math.floor(Math.min(...elevations));
            const maxElevation = Math.ceil(Math.max(...elevations));
            
            // Calculate a nice interval for the ticks
            const range = maxElevation - minElevation;
            const roughInterval = range / 4; // We want 5 ticks (4 intervals)
            
            // Round the interval to a nice number
            const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));
            const niceInterval = Math.ceil(roughInterval / magnitude) * magnitude;
            
            // Calculate the adjusted min and max for nice round numbers
            const adjustedMin = Math.floor(minElevation / niceInterval) * niceInterval;
            const adjustedMax = Math.ceil(maxElevation / niceInterval) * niceInterval;
            
            // Generate tick values
            const ticks = [];
            for (let tick = adjustedMin; tick <= adjustedMax; tick += niceInterval) {
                ticks.push(tick);
            }
        
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 30, bottom: 30 }}
                        onMouseMove={this._handleChartHover.bind(this)}
                        onMouseLeave={this._handleChartLeave.bind(this)}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} stroke="#ccc"/>
                        <XAxis 
                            dataKey="distance"
                            padding={{ left: 20, right: 20 }} 
                            label={{
                                value: 'Distanza (km)',
                                position: 'bottom',
                                offset: 20
                            }}
                            tickFormatter={(value) => value.toFixed(1)}
                            // Rimuovi interval
                            domain={[0, 'dataMax']} // Aggiungi dominio esplicito
                            ticks={data  // Definisci i tick manualmente
                                .filter((_, i) => i % Math.ceil(data.length / 10) === 0)
                                .map(d => d.distance)}
                        />
                        <YAxis
                            dataKey="elevation"
                            domain={[adjustedMin, adjustedMax]}
                            ticks={ticks}
                            label={{ 
                                value: 'Elevazione (m)', 
                                angle: -90, 
                                position: 'insideLeft',
                                offset: -20,
                                style: {
                                    textAnchor: 'middle'
                                }
                            }}
                            tickFormatter={(value) => value.toFixed(0)}
                        />
                        <Tooltip content={this._customTooltip} />
                        {this._createGeologySegments(data, this._getGeologyColors([...new Set(data.map(d => d.geology))]))}
                        <Legend 
                            verticalAlign="top"
                            align="center"
                            height={36}
                        />
                    </LineChart>
                </ResponsiveContainer>
            );
        };
    
        this._chartRoot = createRoot(chartContainer);
        this._chartRoot.render(<ChartComponent />);

        // Store the line coordinates for later use
        this._lineString = turf.lineString(this._points);

        // Initialize marker if it doesn't exist
        if (!this._marker) {
            this._marker = new maplibregl.Marker({
                color: '#33b5e5',
                scale: 0.8
            }).setLngLat([0, 0]);
        }
    }

    _handleChartHover(e) {
        if (!e || !e.activePayload || !e.activePayload[0]) return;

        const { distance } = e.activePayload[0].payload;
        const point = turf.along(this._lineString, distance, { units: 'kilometers' });
        const coordinates = point.geometry.coordinates;

        // Update marker position and add to map if not already added
        this._marker
            .setLngLat(coordinates)
            .addTo(this._map);
    }

    _handleChartLeave() {
        // Remove marker when mouse leaves the chart
        if (this._marker) {
            this._marker.remove();
        }
    }

    _createGeologySegments(data, colors) {
        // Creiamo una singola Line per ogni diversa formazione geologica
        const uniqueFormations = [...new Set(data.map(d => d.geology))];
        
        return (
            <>
                {uniqueFormations.map(formation => {
                    // Filtriamo i dati per questa formazione
                    const formationData = data.map(d => ({
                        ...d,
                        elevation: d.geology === formation ? d.elevation : null
                    }));
    
                    return (
                        <Line
                            key={formation}
                            type="monotone"
                            dataKey="elevation"
                            data={formationData}
                            stroke={colors[formation]}
                            strokeWidth={3}
                            dot={false}
                            name={formation}
                            isAnimationActive={false}
                            connectNulls={true}
                        />
                    );
                })}
            </>
        );
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
        // Also remove the marker
        if (this._marker) {
            this._marker.remove();
            this._marker = null;
        }
    }
}

export default ProfileControl;