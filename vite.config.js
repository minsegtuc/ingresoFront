import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // fuerza actualización automática de la app
      includeAssets: ['favicon.ico', 'robots.txt'], // archivos extra a cachear
      manifest: {
        name: 'Mi App React',
        short_name: 'AppReact',
        description: 'Mi app con PWA',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
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