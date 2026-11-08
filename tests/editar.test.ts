// El editor solo cambia textos: el nombre largo de una capa, el texto y la descripción de
// una tecla y el nombre del teclado. Lo demás lo decide el .keymap.
import { describe, expect, it } from "vitest";
import { cambiarNombre, editarTecla, renombrarCapa } from "../src/teclados/editar";
import { tecladoDeEjemplo } from "../src/teclados/ejemplo";
import type { TecladoConfig } from "../src/teclados/tipos";

// El Corne de ejemplo de ZMK: BASE, LOWER y RAISE
const nuevo = (): TecladoConfig => tecladoDeEjemplo({ idioma: "es-LA", so: "windows" });

describe("capas", () => {
  it("cambia el nombre largo, sin espacios sobrantes; el corto viene del .keymap", () => {
    const t = nuevo();
    const id = t.orden[1];
    const renombrado = renombrarCapa(t, id, " Números ");
    expect(renombrado.capas[id]).toMatchObject({ corto: "LOWER", largo: "Números" });
    // No modifica el original
    expect(t.capas[id].largo).toBe("Lower Layer");
  });
});

describe("teclas", () => {
  it("edita una tecla y conserva lo que envía; si queda vacía, la quita", () => {
    let t = editarTecla(nuevo(), "base", 0, { texto: " ESC ", descripcion: " Cancela " });
    expect(t.capas.base.teclas[0]).toEqual({ texto: "ESC", descripcion: "Cancela", envia: "TAB" });
    t = editarTecla(t, "base", 0, { texto: " ", descripcion: "" });
    expect(t.capas.base.teclas[0]).toBeUndefined();
  });

  it("una tecla de capa sigue llevando a su capa aunque se le cambie el texto", () => {
    const t = nuevo();
    const editado = editarTecla(t, "base", 37, { texto: "NUM", descripcion: "Números" });
    expect(editado.capas.base.teclas[37].abre).toEqual({ capa: t.orden[1], modo: "mantener" });
  });

  it("editar a mano una tecla importada le quita las marcas (gris, sin reconocer)", () => {
    const t = nuevo();
    t.capas.base.teclas[8] = { texto: "NOEXISTE", descripcion: "", heredada: true, sinReconocer: "&kp NOEXISTE" };
    const editado = editarTecla(t, "base", 8, { texto: "B", descripcion: "Mi B" });
    expect(editado.capas.base.teclas[8]).toEqual({ texto: "B", descripcion: "Mi B" });
  });

  it("cambia el nombre del teclado", () => {
    expect(cambiarNombre(nuevo(), "  Rey ").nombre).toBe("Rey");
  });
});
