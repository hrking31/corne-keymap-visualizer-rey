import { describe, expect, it } from "vitest";
import { ORDEN_DIBUJO, teclasParaDibujar } from "../src/teclados/convertir";
import { ajustesDelNavegador, nombreVisible, tecladoVacio } from "../src/teclados/basico";
import { tecladoDeEjemplo } from "../src/teclados/ejemplo";
import type { Ajustes, CapaConfig } from "../src/teclados/tipos";
import { LIMITES, validarTeclado } from "../src/teclados/validar";

const ajustes: Ajustes = { idioma: "es-LA", so: "windows" };

describe("ajustesDelNavegador", () => {
  it.each([
    ["es-CO", "Win32", "es-LA", "windows"],
    ["es-ES", "MacIntel", "es-ES", "macos"],
    ["es", "Linux x86_64", "es-LA", "linux"],
    ["en-GB", "iPhone", "en-US", "macos"],
    ["fr-FR", "Linux armv8l", "en-US", "linux"],
  ])("%s en %s → %s, %s", (lengua, plataforma, idioma, so) => {
    expect(ajustesDelNavegador(lengua, plataforma)).toEqual({ idioma, so });
  });
});

describe("el teclado de la demo", () => {
  it("es el Corne de ejemplo de ZMK, con sus capas y sus teclas de capa", () => {
    const t = tecladoDeEjemplo(ajustes);
    expect(t.orden.map((id) => t.capas[id].corto)).toEqual(["BASE", "LOWER", "RAISE"]);
    expect(t.nombre).toBe("");
    expect(t.capas.base.teclas[37]).toMatchObject({ texto: "LOWER", abre: { capa: t.orden[1] } });
    expect(validarTeclado(t)).toEqual([]);
  });

  it("se lee con el idioma y el sistema del visitante", () => {
    const linux = tecladoDeEjemplo({ idioma: "en-US", so: "linux" });
    expect(linux.capas.base.teclas[36].texto).toBe("SUPER");
    expect(linux.capas.base.teclas[22].texto).toBe(";");
    expect(tecladoDeEjemplo(ajustes).capas.base.teclas[22].texto).toBe("Ñ");
  });
});

describe("teclasParaDibujar", () => {
  it("devuelve 42 teclas en el orden de dibujo, con las vacías incluidas", () => {
    const vacia: CapaConfig = { corto: "NUM", largo: "Números", teclas: { 13: { texto: "1", descripcion: "" } } };
    const teclas = teclasParaDibujar(vacia);
    expect(teclas.map((t) => t.pos)).toEqual([...ORDEN_DIBUJO]);
    expect(teclas.filter((t) => t.texto)).toEqual([{ texto: "1", descripcion: "", pos: 13 }]);
  });
});

describe("validarTeclado", () => {
  it("sin nombre se muestra «Corne ZMK»; con nombre, en medio: «Corne Rey ZMK»", () => {
    expect(nombreVisible(tecladoVacio(ajustes))).toBe("Corne ZMK");
    expect(nombreVisible({ nombre: "   " })).toBe("Corne ZMK");
    expect(nombreVisible({ nombre: " Rey " })).toBe("Corne Rey ZMK");
  });

  it("detecta más de 10 capas, Base fuera de lugar y textos demasiado largos", () => {
    const t = tecladoDeEjemplo(ajustes);
    for (let i = 1; i <= LIMITES.capas; i++) {
      t.orden.push(`c${i}`);
      t.capas[`c${i}`] = { corto: `C${i}`, largo: "", teclas: {} };
    }
    t.orden.reverse();
    t.capas.base.teclas[0].texto = "X".repeat(LIMITES.texto + 1);
    const problemas = validarTeclado(t).join(" | ");
    expect(problemas).toMatch(/Máximo 10 capas/);
    expect(problemas).toMatch(/primera capa tiene que ser Base/);
    expect(problemas).toMatch(/tecla 0, texto/);
  });
});
