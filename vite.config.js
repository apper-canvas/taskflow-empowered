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
  cacheDir: '.vite',
  optimizeDeps: {
    include: [
      '@reduxjs/toolkit', 
      'react-redux', 
      '@reduxjs/toolkit/query/react'
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis'
      },
      charset: 'utf8',
      logLevel: 'info'
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
      maxParallelFileOps: 3,
      output: {
        manualChunks: {
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  }
})