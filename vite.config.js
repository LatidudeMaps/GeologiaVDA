import { defineConfig } from 'vite'

export default defineConfig({
  base: '/GeologiaVDA/', // Replace with your repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})