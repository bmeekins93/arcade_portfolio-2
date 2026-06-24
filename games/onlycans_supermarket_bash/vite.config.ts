/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Strip console/debugger from production bundles only (keep them in dev).
    esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Unit tests cover the game's pure logic (atlas factory, move data, combat
    // math). No DOM/Phaser is needed, so the lightweight node environment is used.
    test: {
      globals: true,
      environment: 'node',
      include: ['game/**/*.test.ts'],
    }
  };
});
