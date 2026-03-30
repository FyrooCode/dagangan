import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'assets/media/logos/apple-icon-180x180.png'],
      manifest: {
        name: 'Tracking Dagangan Bell',
        short_name: 'DaganganBell',
        description: 'Aplikasi Manajemen Penjualan dan Retur Bell',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'assets/media/logos/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/media/logos/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'assets/media/logos/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit buat aset Metronic
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})