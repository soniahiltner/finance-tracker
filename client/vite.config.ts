import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Optimizaciones para reducir el tamaño del bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendors grandes en chunks independientes
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts']
        }
      }
    },
    // Tamaño máximo de chunk antes de warning (500kb)
    chunkSizeWarningLimit: 500,
    // Minificar para producción
    minify: 'terser'
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router', '@tanstack/react-query']
  }
})
