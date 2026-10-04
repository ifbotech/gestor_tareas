/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// `base: './'` hace que el build funcione en cualquier carpeta
// (GitHub Pages, un servidor interno, o abriendo el preview local).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Mojarrita · Gestor de tareas',
        short_name: 'Mojarrita',
        description:
          'Tareas rápidas, proyectos con subtareas y un balde donde cada tarea terminada cae como una mojarrita.',
        lang: 'es',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#cdeefe',
        theme_color: '#7cc8ef',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
