/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig(() => {
  const sentryOrg = process.env.SENTRY_ORG
  const sentryProject = process.env.SENTRY_PROJECT
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN
  const hasSentryReleaseConfig =
    Boolean(sentryOrg) && Boolean(sentryProject) && Boolean(sentryAuthToken)

  const sentryPlugins = hasSentryReleaseConfig
    ? sentryVitePlugin({
        org: sentryOrg,
        project: sentryProject,
        authToken: sentryAuthToken,
        telemetry: false
      })
    : []

  return {
    plugins: [react(), tailwindcss(), ...sentryPlugins],
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
      minify: 'terser' as const,
      sourcemap: true
    },
    // Optimización de dependencias
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router', '@tanstack/react-query']
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts'
    }
  }
})
