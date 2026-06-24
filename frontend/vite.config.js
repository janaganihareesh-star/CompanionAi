import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000 // 10 MB limit
      },
      manifest: {
        name: 'MEGHA AI',
        short_name: 'MEGHA AI',
        description: 'Advanced AI Assistant',
        theme_color: '#7C3AED',
        background_color: '#0F0F1A',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:6999',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:6999',
        ws: true,
      },
    },
  },
});
