import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: './', // Ensures assets load correctly on GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Strip console/debugger from production bundles only (keep them in dev).
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
}));