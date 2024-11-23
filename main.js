import * as pmtiles from "pmtiles";
import * as maplibregl from "maplibre-gl";
import style from './style.json';
import {cogProtocol} from '@geomatico/maplibre-cog-protocol';
import './node_modules/maplibre-gl/dist/maplibre-gl.css';
import LayerControl from './LayerControl';
import MapInfoControl from './MapInfo';
import MinimapControl from './MinimapControls';
import TerrainControls from './TerrainControls';
import GeoInfoPanel from './GeoInfoPanel';
import SettingsControl from './SettingsControl';

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
maplibregl.addProtocol('cog', cogProtocol)

const PMTILES_URL_FIUMI = 'https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/fiumi.pmtiles';
const PMTILES_CITIES_URL = 'https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/cities.pmtiles';

const fiumi_p = new pmtiles.PMTiles(PMTILES_URL_FIUMI);
protocol.add(fiumi_p);

const cities_p = new pmtiles.PMTiles(PMTILES_CITIES_URL);
protocol.add(cities_p);

// MAP
const map = new maplibregl.Map({
    container: 'map',
    hash: true,
    style: style,
    center: [16, 40],
    zoom: 12,
    maxPitch: 85,
    maxBounds: [
        [15.5325, 40.2507],
        [16.2076, 40.5094]
    ]
});

// Add standard controls
map.addControl(new maplibregl.NavigationControl({
    visualizePitch: true
}));

// Modified controls for terrain and hillshade opacity
map.addControl(new TerrainControls(), 'top-right');

// Add settings wrapper control (contains LayerControl, GeoInfoPanel, MapInfoControl, TerrainControls)
map.addControl(new SettingsControl(), 'top-right');

// // Layer Control panel subito dopo i controlli di navigazione
// map.addControl(new LayerControl(), 'top-right');

// // Geo Info Panel
// map.addControl(new GeoInfoPanel(), 'top-right');

// // Map Info Controls
// map.addControl(new MapInfoControl(), 'top-right');

// // Altri controlli in posizioni diverse
// map.addControl(new maplibregl.GeolocateControl({
//     positionOptions: {
//         enableHighAccuracy: true
//     },
//     trackUserLocation: true
// }), 'top-right');

// map.addControl(new maplibregl.FullscreenControl(), 'top-right');

// // Standard 3D Terrain Controls
// map.addControl(new maplibregl.TerrainControl({
//     source: 'terrainSource',
//     exaggeration: 1.5})
// );

map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), 'bottom-right');

// Minimap Custom Controls
map.addControl(new MinimapControl({
    zoomOffset: 5
}), 'top-left');

map.on('load', () => {
    // Add a hover layer
    map.addLayer({
        'id': 'geologiaVDA-hover',
        'type': 'fill',
        'source': 'geoVectorSource',
        'source-layer': 'geoVDA',
        'paint': {
            'fill-color': '#ff0000',
            'fill-opacity': 0.4
        },
        'filter': ['==', ['get', 'id'], -1]  // Start with no features selected
    });

    map.on('mousemove', 'geologiaVDA', (e) => {
        if (e.features.length > 0) {
            const hoveredId = e.features[0].properties.id;
            map.setFilter('geologiaVDA-hover', ['==', ['get', 'id'], hoveredId]);
        }
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'geologiaVDA', () => {
        map.setFilter('geologiaVDA-hover', ['==', ['get', 'id'], -1]);
        map.getCanvas().style.cursor = '';
    });
});