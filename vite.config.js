import { defineConfig } from 'vite'

export default defineConfig({
  base: '/GeologiaVDA/',  // Assicurati che questo corrisponda esattamente al nome del repository
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'maplibre-gl',
            'pmtiles',
            '@geomatico/maplibre-cog-protocol',
            '@turf/turf',
            'recharts'
          ],
          controls: [
            './LayerControl.js',
            './MapInfo.js',
            './GeoInfoPanel.js',
            './MinimapControls.js',
            './TerrainControls.js',
            './SettingsControl.js',
            './CopyrightControl.js',
            './ProfileControl.jsx'
          ]
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          return `assets/${info[0]}-[hash:8].${ext}`;
        }
      }
    }
  }
})