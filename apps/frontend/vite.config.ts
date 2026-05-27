import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      target: 'es2015',
    },
    server: {
      host: true,
      port: parseInt(env.PORT || '3001', 10),
      headers: {
        // Allow service worker to control the root scope
        'Service-Worker-Allowed': '/',
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL ? env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:3200',
          changeOrigin: true,
        },
      },
    },
  };
})
