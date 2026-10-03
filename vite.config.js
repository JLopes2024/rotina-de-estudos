import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["logo.svg"],
      manifest: {
        id: "/",
        name: "Meu caminho — estudos e metas",
        short_name: "Meu caminho",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#5b21b6",
        background_color: "#f5f3ff",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
    }),
  ],
});
