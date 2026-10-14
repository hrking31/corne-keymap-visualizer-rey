import { describe, expect, it } from "vitest";
import { medir } from "./medir";

// La regla del proyecto: el diseño no cambia sin autorización.
// Se mide la app (tests/visual/prueba.tsx) y se compara con las medidas aprobadas, guardadas
// en __snapshots__/. Se tomaron cuando la app medía exactamente lo mismo que la versión
// original (v1.1-vanilla). Tras un cambio de diseño APROBADO se actualizan con
// `npm run test:visual -- -u`. Los anchos cubren escritorio, el corte de 768px y dos móviles.
const TAMAÑOS: [number, number][] = [
  [1280, 900],
  [768, 900],
  [529, 900],
  [375, 800],
];

describe.each(TAMAÑOS)("a %ipx de ancho", (ancho, alto) => {
  it("se ve como el diseño aprobado", async () => {
    const actual = await medir("/tests/visual/prueba.html", ancho, alto);

    expect.soft(actual.elementos, "título, botones y bloques").toMatchSnapshot();
    expect.soft(actual.capas, "teclas de cada capa").toMatchSnapshot();
    expect.soft(actual.modales, "panel de cada tecla").toMatchSnapshot();
    expect.soft(actual.colores, "paleta de colores").toMatchSnapshot();
  });
});
