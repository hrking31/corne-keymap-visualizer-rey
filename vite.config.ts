/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [react()],
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
