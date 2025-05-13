import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: true,
    strictPort: true,
    port: 5173,
    hmr: {
      timeout: 120000
    }
  },
  optimizeDeps: {
    include: ['@reduxjs/toolkit', 'react-redux'],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis'
      }
    },
    force: true,
    disabled: false
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  }
})