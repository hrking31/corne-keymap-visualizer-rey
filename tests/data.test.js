import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { keymap } from "../src/data.js";

const CAPAS = ["BASE", "NUM", "SYM", "NAV", "LED", "FUN"];

// Índices de posición de ZMK en el orden en que data.js guarda las teclas:
// primero el bloque izquierdo (filas 0–5, 12–17, 24–29 y pulgares 36–38)
// y luego el derecho (6–11, 18–23, 30–35 y 39–41).
const rango = (desde, hasta) =>
  Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

const ORDEN_ESPERADO = [
  ...rango(0, 5),
  ...rango(12, 17),
  ...rango(24, 29),
  ...rango(36, 38),
  ...rango(6, 11),
  ...rango(18, 23),
  ...rango(30, 35),
  ...rango(39, 41),
];

const css = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");

describe("keymap", () => {
  it("tiene exactamente las 6 capas", () => {
    expect(Object.keys(keymap)).toEqual(CAPAS);
  });

  describe.each(CAPAS)("capa %s", (capa) => {
    const teclas = keymap[capa];

    it("tiene 42 teclas", () => {
      expect(teclas).toHaveLength(42);
    });

    it("guarda las teclas en el orden de posiciones de ZMK", () => {
      const posiciones = teclas.map((tecla) => {
        expect(tecla.desc).toMatch(/^Key \d+$/);
        return Number(tecla.desc.slice(4));
      });

      expect(posiciones).toEqual(ORDEN_ESPERADO);
    });

    it("cada tecla tiene una etiqueta de texto", () => {
      teclas.forEach((tecla) => expect(typeof tecla.label).toBe("string"));
    });

    it("toda clase usada existe en style.css", () => {
      teclas
        .filter((tecla) => tecla.clase)
        .forEach((tecla) => expect(css).toContain(`.${tecla.clase}`));
    });
  });
});
