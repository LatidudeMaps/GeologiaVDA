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
        },
        // Aggiungi configurazione per nomi file più corti
        assetFileNames: 'assets/[name]-[hash:8][extname]',
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js'
      }
    },
    chunkSizeWarningLimit: 1000
  }
})