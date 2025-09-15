import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // fuerza actualización automática de la app
      includeAssets: ['favicon.ico', 'robots.txt'], // archivos extra a cachear
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/ingreso/index.html',
        runtimeCaching: [
          {
            urlPattern: /^\/ingreso\/.*\.(js|css|png|jpg|jpeg|svg|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-assets' }
          }
          // NO cachear HTML
        ]
      }
    })
  ],
  base: '/ingreso/' // tu base path actual
})