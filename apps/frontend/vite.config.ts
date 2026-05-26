import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
  },
  server: {
    host: true,
    port: 3001,
    headers: {
      // Allow service worker to control the root scope
      'Service-Worker-Allowed': '/',
    },
    proxy: {
      '/api': {
        target: 'http://192.168.1.8:3000',
        changeOrigin: true,
      },
    },
  },
})
