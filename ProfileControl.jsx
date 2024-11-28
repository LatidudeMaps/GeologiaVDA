import React from 'react';
import { createRoot } from 'react-dom/client';
import * as maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { locationValues } from '@geomatico/maplibre-cog-protocol';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

class ProfileControl {
    constructor() {
        this._container = null;
        this._map = null;
        this._button = null;
        this._panel = null;
        this._isDrawing = false;
        this._points = [];
        this._marker = null;
        this._chartRoot = null;
        this._demUrl = 'https://raw.githubusercontent.com/latidudemaps/GeologiaVDA/main/data/DEM_VDA_5m_COG.tif';
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

        // Create panel
        this._panel = document.createElement('div');
        this._panel.style.padding = '5px';
        this._panel.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        this._panel.style.backdropFilter = 'blur(8px)';
        this._panel.style.WebkitBackdropFilter = 'blur(8px)';
        this._panel.style.borderRadius = '8px';
        this._panel.style.boxShadow = '0 14px 20px rgba(0, 0, 0, 0.2)';
        this._panel.style.width = '600px';
        this._panel.style.height = '300px';
        this._panel.style.position = 'fixed';
        this._panel.style.left = '50%';
        this._panel.style.bottom = '10px';
        this._panel.style.transform = 'translateX(-50%)';
        this._panel.style.display = 'none';
        this._panel.style.zIndex = '1000';
        this._panel.style.fontFamily = 'Rubik';

        // Add click handler for toggle button
        this._button.addEventListener('click', () => {
            this._toggleDrawing();
        });

        // Initialize map source and layer
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

        // Add event listeners
        map.on('click', this._handleMapClick.bind(this));
        map.on('mousemove', this._handleMouseMove.bind(this));

        // Initialize marker
        this._marker = new maplibregl.Marker({
            color: '#33b5e5',
            scale: 0.8
        });

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
            this._updateLine([]);
        } else {
            this._button.classList.remove('active');
            this._map.getCanvas().style.cursor = '';
            this._points = [];
            this._updateLine([]);
            this._panel.style.display = 'none';
            if (this._marker) {
                this._marker.remove();
            }
        }
    }

    _handleMapClick(e) {
        if (!this._isDrawing) return;

        this._points.push([e.lngLat.lng, e.lngLat.lat]);
        this._updateLine(this._points);
        
        if (this._points.length === 2) {
            // Verifichiamo che i punti non siano identici
            const [p1, p2] = this._points;
            if (p1[0] === p2[0] && p1[1] === p2[1]) {
                console.warn('I punti selezionati sono identici');
                this._points.pop(); // Rimuoviamo l'ultimo punto
                return;
            }
            this._isDrawing = false;
            this._map.getCanvas().style.cursor = '';
            this._button.classList.remove('active');
            this._generateProfile();
        }
    }

    _handleMouseMove(e) {
        if (!this._isDrawing || this._points.length === 0) return;

        const currentPoints = [...this._points, [e.lngLat.lng, e.lngLat.lat]];
        this._updateLine(currentPoints);
    }

    _updateLine(coordinates) {
        if (!this._map.getSource('profile-line')) return;

        this._map.getSource('profile-line').setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates
            }
        });
    }

    async _generateProfile() {
        if (!this._points || this._points.length !== 2) {
            console.warn('Servono esattamente 2 punti per generare il profilo');
            return;
        }

        try {
            const line = turf.lineString(this._points);
            const length = turf.length(line, { units: 'kilometers' });
            
            // Se la linea è troppo corta, non generiamo il profilo
            if (length < 0.001) {
                console.warn('La linea è troppo corta per generare un profilo');
                return;
            }

            const steps = 100;
            const points = [];

            for (let i = 0; i <= steps; i++) {
                const point = turf.along(line, (length * i) / steps, { units: 'kilometers' });
                points.push(point);
            }

            const data = await Promise.all(
                points.map(async (point, i) => {
                    const coordinates = point.geometry.coordinates;
                    
                    const [elevation] = await locationValues(
                        this._demUrl,
                        {
                            latitude: coordinates[1],
                            longitude: coordinates[0]
                        },
                        this._map.getZoom()
                    );

                    const features = this._map.queryRenderedFeatures(
                        this._map.project(coordinates),
                        { layers: ['geologiaVDA'] }
                    );

                    return {
                        distance: (length * i) / steps,
                        elevation: elevation || 0,
                        geology: features.length > 0 ? features[0].properties.Sigla : 'N/A',
                        formation: features.length > 0 ? features[0].properties.Name : 'N/A'
                    };
                })
            );

            this._renderChart(data);
            this._panel.style.display = 'block';
        } catch (error) {
            console.error('Error generating profile:', error);
        }
    }

    _renderChart(data) {
        const ProfileChart = () => {
            const totalDistance = data[data.length - 1].distance;
            const elevations = data.map(d => d.elevation);
            const minElevation = Math.min(...elevations);
            const maxElevation = Math.max(...elevations);
            const elevationGain = elevations.reduce((gain, curr, i) => {
                if (i === 0) return 0;
                const diff = curr - elevations[i - 1];
                return gain + (diff > 0 ? diff : 0);
            }, 0);

            const handleMouseMove = (e) => {
                if (!e || !e.activePayload || !e.activePayload[0]) return;
                
                const { distance } = e.activePayload[0].payload;
                
                if (!this._points || this._points.length < 2) return;
                const line = turf.lineString(this._points);
                const point = turf.along(line, distance, { units: 'kilometers' });
                this._marker.setLngLat(point.geometry.coordinates).addTo(this._map);
            };

            return (
                <div style={{ width: '100%', height: '100%' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                    }}>
                        <div>
                            <h3 style={{ 
                                margin: '0 0 4px 0',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}>Elevation profile with geological formations info</h3>
                            <div style={{ 
                                fontSize: '10px',
                                color: '#666'
                            }}>
                                Distance: {totalDistance.toFixed(2)} km • 
                                Min elev.: {Math.round(minElevation)} m • 
                                Max elev.: {Math.round(maxElevation)} m • 
                                Elevation Difference: {Math.round(elevationGain)} m
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                this._panel.style.display = 'none';
                                this._updateLine([]);
                                this._points = [];
                                this._marker.remove();
                            }}
                            style={{
                                border: 'none',
                                background: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                padding: '4px',
                                color: '#666',
                                lineHeight: 1
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div style={{ height: 'calc(100% - 40px)' }}>
                        <ResponsiveContainer>
                            <AreaChart
                                data={data}
                                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => this._marker.remove()}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                                <XAxis
                                    dataKey="distance"
                                    // label={{ 
                                    //     value: 'Distanza (km)',
                                    //     position: 'bottom',
                                    //     offset: -5,
                                    //     style: { fontSize: '10px', fill: '#666' }
                                    // }}
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={val => val.toFixed(1)}
                                    interval={Math.ceil(data.length / 8)}
                                />
                                <YAxis
                                    dataKey="elevation"
                                    domain={['auto', 'auto']}
                                    // label={{
                                    //     value: 'Quota (m)',
                                    //     angle: -90,
                                    //     position: 'insideLeft',
                                    //     offset: 20,
                                    //     style: { fontSize: '10px', fill: '#666' }
                                    // }}
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        const data = payload[0].payload;
                                        return (
                                            <div style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                padding: '8px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>
                                                <div>Distance: {label.toFixed(2)} km</div>
                                                <div>Elevation: {Math.round(data.elevation)} m</div>
                                                <div style={{ 
                                                    borderTop: '1px solid #eee',
                                                    marginTop: '4px',
                                                    paddingTop: '4px'
                                                }}>
                                                    <div>Formation: {data.geology}</div>
                                                    <div style={{ 
                                                        fontSize: '11px',
                                                        color: '#666',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        {data.formation}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="elevation"
                                    stroke="#33b5e5"
                                    fill="#33b5e5"
                                    fillOpacity={0.2}
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        };

        if (!this._chartRoot) {
            this._chartRoot = createRoot(this._panel);
        }
        this._chartRoot.render(<ProfileChart />);
    }

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
        if (this._marker) {
            this._marker.remove();
        }
        this._map = null;
    }
}

export default ProfileControl;