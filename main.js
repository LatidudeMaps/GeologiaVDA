import * as pmtiles from "pmtiles";
import * as maplibregl from "maplibre-gl";
import style from './style.json';
import {cogProtocol} from '@geomatico/maplibre-cog-protocol';
import './node_modules/maplibre-gl/dist/maplibre-gl.css';
import LayerControl from './LayerControl';
import MapInfoControl from './MapInfo';
//import MinimapControl from './MinimapControls';
import TerrainControls from './TerrainControls';

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
maplibregl.addProtocol('cog', cogProtocol)

// const PMTILES_URL = 'https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/DEM_90_Basilicata2.pmtiles';
// const PMTILES_URL_HS = 'https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/HS_90_Basilicata2.pmtiles';
const PMTILES_URL_FIUMI = 'https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/fiumi.pmtiles';

const PMTILES_CITIES_URL = 'https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/cities.pmtiles';

// COG URL
const COG_URL = 'https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/South_Italy_COG.tif#dem';
const HILLSHADE_COG_URL = 'https://raw.githubusercontent.com/latidudemaps/MountainAtlas/main/data/HS_COG.tif';

// const p = new pmtiles.PMTiles(PMTILES_URL);
// protocol.add(p);
// const p2 = new pmtiles.PMTiles(PMTILES_URL_HS);
// protocol.add(p2);

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
    visualizePitch: true  // This adds a pitch control to the navigation control
}));
  
map.addControl(new maplibregl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

map.addControl(new maplibregl.ScaleControl({ unit: "metric" }));
map.addControl(new maplibregl.FullscreenControl());

// Layer Control panel
map.addControl(new LayerControl(), 'top-left');

// Standard 3D Terrain Controls
map.addControl(new maplibregl.TerrainControl({
    source: 'terrainSource',
    exaggeration: 1.5})
);

// Modified controls for terrain and hillshade opacity
map.addControl(new TerrainControls(), 'top-right');

// Minimap Custom Controls
// map.addControl(new MinimapControl({
//     // width: 250,  // Custom width in pixels
//     // height: 250, // Custom height in pixels
//     zoomOffset: 5 // How many zoom levels to subtract from main map
// }), 'bottom-right');

// Map Info Controls
map.addControl(new MapInfoControl(), 'bottom-left');

// Add this code in main.js after map initialization

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
            // Use the 'id' from properties
            const hoveredId = e.features[0].properties.id;
            map.setFilter('geologiaVDA-hover', ['==', ['get', 'id'], hoveredId]);
        }
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'geologiaVDA', () => {
        map.setFilter('geologiaVDA-hover', ['==', ['get', 'id'], -1]);
        map.getCanvas().style.cursor = '';
    });

    // Click handler for popup
    map.on('click', 'geologiaVDA', (e) => {
        if (e.features.length > 0) {
            const coordinates = e.lngLat;
            const properties = e.features[0].properties;

            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(Object.entries(properties)
                    .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                    .join('<br>'))
                .addTo(map);
        }
    });
});