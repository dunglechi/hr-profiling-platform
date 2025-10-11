import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: [],
    },
    sourcemap: false,
    minify: 'esbuild',
  },
  esbuild: {
    // Disable eval in development to avoid CSP issues
    keepNames: true,
    target: 'es2020',
    format: 'esm',
    platform: 'browser',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@mui/icons-material', 'axios'],
    esbuildOptions: {
      // Disable eval to fix CSP issues
      target: 'es2020',
      format: 'esm',
      platform: 'browser',
      supported: {
        'top-level-await': true
      },
    }
  },
  css: {
    devSourcemap: false
  }
})