/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { VitePWA } from "vite-plugin-pwa";
import firebase from "./firebase.json" with { type: "json" };

// Las cabeceras de seguridad de producción (firebase.json, para todas las rutas)
// también en `npm run preview`: lo que se prueba en local es lo que se publica.
const cabecerasProduccion = Object.fromEntries(
  firebase.hosting.headers
    .filter((regla) => regla.source === "**")
    .flatMap((regla) => regla.headers.map(({ key, value }) => [key, value])),
);

export default defineConfig({
  preview: { headers: cabecerasProduccion },
  plugins: [
    react(),
    VitePWA({
      // Al publicar una versión nueva, la app instalada se actualiza sola
      registerType: "autoUpdate",
      // Registro en un archivo aparte (registerSW.js), no incrustado en el HTML:
      // así la Content-Security-Policy puede prohibir los scripts en línea
      injectRegister: "script",
      // Mismos nombre y colores que el manifest.json original; se añade lo que
      // pide Google Play para publicarla como Trusted Web Activity
      manifest: {
        id: "/",
        name: "Corne Rey ZMK",
        short_name: "CorneRey",
        description:
          "Visualizador interactivo del layout de un teclado Corne con firmware ZMK: qué hace cada tecla en cada capa.",
        lang: "es",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#3A3F44",
        theme_color: "#3A3F44",
        categories: ["productivity", "utilities"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          // Para Android: la foto al 90% sobre su propio fondo desenfocado, para que
          // el teclado no se recorte cuando el sistema le da forma de círculo o de gota
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Todo lo necesario para funcionar sin conexión
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],
      },
    }),
  ],
  // Preparar React de antemano: si Vite lo descubre a mitad de la prueba visual,
  // recarga la página y la primera medición falla.
  optimizeDeps: {
    include: ["react", "react/jsx-dev-runtime", "react-dom/client"],
  },
  test: {
    // Por defecto Vitest vacía los CSS; tests/data.test.ts lee style.css con ?raw
    css: { include: [/style\.css/] },
    projects: [
      {
        extends: true,
        test: {
          name: "unitarias",
          include: ["tests/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "visual",
          include: ["tests/visual/*.test.ts"],
          // Mide 4 anchos × 6 capas × ~210 modales en dos versiones de la app
          testTimeout: 120_000,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
