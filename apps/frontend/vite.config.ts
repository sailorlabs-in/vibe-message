import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const rawApiUrl = env.VITE_API_URL || '';
  const isAbsoluteUrl = /^https?:\/\//i.test(rawApiUrl);
  const proxyTarget = isAbsoluteUrl
    ? rawApiUrl.replace(/\/api\/?$/, '')
    : (env.VITE_BACKEND_URL || 'http://localhost:3200');

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
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
})
