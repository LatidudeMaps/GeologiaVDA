import { defineConfig } from 'vite'

export default defineConfig({
  base: '/GeologiaVDA/',
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
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})