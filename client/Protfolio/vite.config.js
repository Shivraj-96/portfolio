import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // ── Code splitting: manual chunks ──────────────────────────
    // Separates vendor libs from app code so users can cache them
    // independently — vendor chunk only re-downloads when deps change.
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — cached long-term, almost never changes
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },

    // ── Asset optimization ────────────────────────────────────
    // Warn if any single chunk exceeds 400kb
    chunkSizeWarningLimit: 400,

    // Minify with esbuild (default, fastest)
    minify: 'esbuild',

    // Generate source maps for production debugging (optional — remove to save size)
    sourcemap: false,

    // Inline assets smaller than 4kb as base64 (avoids extra HTTP requests)
    assetsInlineLimit: 4096,
  },

  // ── Dev server ───────────────────────────────────────────────
  server: {
    port: 5173,
    // Proxy API calls to Express in dev — avoids CORS issues
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});