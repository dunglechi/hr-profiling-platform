import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  esbuild: {
    // Disable eval in development to avoid CSP issues
    keepNames: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      // Disable eval to fix CSP issues
      target: 'es2020',
      supported: {
        'top-level-await': true
      },
    }
  }
})