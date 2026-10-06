import { describe, expect, it } from "vitest";
import { dividirBloques, dividirFilas, tieneAccion } from "../src/teclado";

// 42 teclas falsas numeradas 0..41 en el orden en que las guarda data.ts
const teclas = Array.from({ length: 42 }, (_, i) => ({ label: String(i) }));

describe("dividirBloques", () => {
  it("separa 21 teclas por bloque, primero el izquierdo", () => {
    const { izquierdo, derecho } = dividirBloques(teclas);

    expect(izquierdo).toHaveLength(21);
    expect(derecho).toHaveLength(21);
    expect(izquierdo[0].label).toBe("0");
    expect(derecho[0].label).toBe("21");
  });
});

describe("dividirFilas", () => {
  const { izquierdo } = dividirBloques(teclas);

  it("arma tres filas de 6 teclas y una de 3 pulgares", () => {
    const filas = dividirFilas(izquierdo);

    expect(filas.map((fila) => fila.length)).toEqual([6, 6, 6, 3]);
  });

  it("sin espejo conserva el orden", () => {
    const [primera] = dividirFilas(izquierdo);

    expect(primera.map((t) => t.label)).toEqual(["0", "1", "2", "3", "4", "5"]);
  });

  it("con espejo invierte cada fila", () => {
    const filas = dividirFilas(izquierdo, true);

    expect(filas[0].map((t) => t.label)).toEqual(["5", "4", "3", "2", "1", "0"]);
    expect(filas[3].map((t) => t.label)).toEqual(["20", "19", "18"]);
  });

  it("no modifica el bloque original", () => {
    dividirFilas(izquierdo, true);

    expect(izquierdo[0].label).toBe("0");
  });
});

describe("tieneAccion", () => {
  it("una tecla con etiqueta tiene acción", () => {
    expect(tieneAccion({ label: "ESC" })).toBe(true);
  });

  it("una tecla vacía o solo con espacios no tiene acción", () => {
    expect(tieneAccion({ label: "" })).toBe(false);
    expect(tieneAccion({ label: "  " })).toBe(false);
  });
});
