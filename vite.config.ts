/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Por defecto Vitest vacía los CSS; tests/data.test.ts lee style.css con ?raw
    css: { include: [/style\.css/] },
  },
});
