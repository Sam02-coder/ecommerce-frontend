import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Uncomment if your backend doesn't include /api in the path:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    // Increase warning limit slightly for e-commerce bundles
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting — keeps vendor libraries separate so
         * a product code change doesn't bust the React/router cache.
         */
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':  ['@tanstack/react-query'],
          'vendor-ui':     ['lucide-react', 'react-hot-toast', 'framer-motion'],
          'vendor-http':   ['axios'],
          'vendor-store':  ['zustand'],
        },
      },
    },
  },

  // Source maps in production help with error tracking (e.g. Sentry)
  // Set to false if you don't want to expose source in production
  // eslint-disable-next-line no-process-env
  ...(process.env.NODE_ENV === 'production' && {
    build: {
      sourcemap: false, // Set to true if using Sentry or similar
    },
  }),
})
