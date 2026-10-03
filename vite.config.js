import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'logo.svg',
        'apple-touch-icon-180x180.png',
      ],

      manifest: {
        id: '/',
        name: 'Meu caminho — Plano de estudos',
        short_name: 'Meu caminho',
        description:
          'Organize sua rotina e construa suas metas de estudo.',

        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',

        theme_color: '#263a58',
        background_color: '#f3f4f6',

        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}',
        ],
      },
    }),
  ],
});