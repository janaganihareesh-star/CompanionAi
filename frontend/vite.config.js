import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isAppStoreSafe = process.env.VITE_APP_STORE_SAFE === 'true';

  return {
  base: './',
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 15000000, // 15 MB limit
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,ttf,woff,woff2}'] // Aggressive Offline Caching
      },
      manifest: {
        name: 'Companion AI',
        short_name: 'Companion AI',
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
  build: {
    rollupOptions: {
      external: isAppStoreSafe ? ['@capacitor/core', '@capacitor/filesystem', 'child_process'] : [],
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-hot-toast'],
          'vendor-pdf': ['html2pdf.js', 'jspdf', 'html2canvas'],
          'vendor-ppt': ['pptxgenjs'],
          'vendor-code': ['@monaco-editor/react', 'react-syntax-highlighter', '@codesandbox/sandpack-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://closerai-qcj3.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://closerai-qcj3.onrender.com',
        ws: true,
      },
    },
  }
  };
});
