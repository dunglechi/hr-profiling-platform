import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      // Disable HMR overlay to avoid CSP issues
      hmr: {
        overlay: false
      }
    },
    define: {
      global: 'globalThis',
      'process.env': {
        NODE_ENV: JSON.stringify(mode)
      },
    },
    build: {
      rollupOptions: {
        input: './index.html'
      },
    },
    esbuild: {
      // Configure for CSP compliance
      keepNames: true,
      legalComments: 'none',
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
  };
});