/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Configuración de Vite.
// - base './' + HashRouter → la app funciona en GitHub Pages bajo cualquier subruta.
// - El service worker precachea todos los recursos de la compilación (uso sin internet).
export default defineConfig({
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Química Interactiva',
        short_name: 'Química',
        description:
          'Química general, inorgánica y orgánica en 2D/3D: de la preparación preuniversitaria a la química universitaria.',
        lang: 'es-PE',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0b1020',
        theme_color: '#0b1020',
        categories: ['education', 'science'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Se precachea todo lo compilado (incluido el WASM de RDKit cuando exista).
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,wasm,json,sdf,hdr}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    globalSetup: ['src/chem/__tests__/setup-global.ts'],
    globals: false,
  },
});
