import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // React 19 features
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ESM support
  esbuild: {
    target: 'es2024',
  },
  build: {
    target: 'es2024',
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
        },
      },
    },
  },
  // HMR optimization
  server: {
    hmr: {
      overlay: true,
    },
  },
  // Performance monitoring
  define: {
    'import.meta.env.VITE_PERFORMANCE_MONITORING': 'true',
  },
})