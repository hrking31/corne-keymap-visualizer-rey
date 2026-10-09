import { describe, expect, it } from "vitest";
import { medir } from "./medir";

// La regla del proyecto: el diseño no cambia sin autorización.
// Se compara la app actual con la copia congelada de v1.1-vanilla, medidas las dos en el
// mismo navegador. Los anchos cubren escritorio, el corte de 768px y dos móviles.
const TAMAÑOS: [number, number][] = [
  [1280, 900],
  [768, 900],
  [529, 900],
  [375, 800],
];

describe.each(TAMAÑOS)("a %ipx de ancho", (ancho, alto) => {
  it("se ve idéntica a v1.1-vanilla", async () => {
    const original = await medir("/tests/referencia/index.html", ancho, alto);
    // La app con los mismos datos que la original (tests/visual/autor.tsx)
    const actual = await medir("/tests/visual/autor.html", ancho, alto);

    expect.soft(actual.elementos, "título, botones y bloques").toEqual(original.elementos);
    expect.soft(actual.capas, "teclas de cada capa").toEqual(original.capas);
    expect.soft(actual.modales, "modal de cada tecla").toEqual(original.modales);
    expect.soft(actual.colores, "paleta de colores").toEqual(original.colores);
  });
});
