import { describe, expect, it } from "vitest";
import { keymap } from "../src/data";
import { ORDEN_DIBUJO, desdeKeymap, teclasParaDibujar } from "../src/teclados/convertir";
import { DISTRIBUCIONES, textoDe } from "../src/teclados/distribuciones";
import { ajustesDelNavegador, crearBase, crearTeclado, nombreVisible } from "../src/teclados/plantillas";
import type { Ajustes, CapaConfig, Distribucion, Idioma, SistemaOperativo } from "../src/teclados/tipos";
import { LIMITES, validarTeclado } from "../src/teclados/validar";

const DISTS = Object.keys(DISTRIBUCIONES) as Distribucion[];
const IDIOMAS: Idioma[] = ["es-LA", "es-ES", "en-US"];
const SISTEMAS: SistemaOperativo[] = ["windows", "macos", "linux"];
const texto = (capa: CapaConfig, pos: number) => capa.teclas[pos]?.texto;
const fila = (capa: CapaConfig, f: number) => Array.from({ length: 12 }, (_, c) => texto(capa, f * 12 + c));

describe("distribuciones", () => {
  it.each(DISTS)("%s tiene 30 teclas distintas en 3 filas de 10", (d) => {
    const { filas } = DISTRIBUCIONES[d];
    expect(filas.map((f) => f.length)).toEqual([10, 10, 10]);
    expect(new Set(filas.flat()).size).toBe(30);
  });

  it("falla con un código desconocido en vez de inventar un texto", () => {
    expect(() => textoDe("NO_EXISTE", "es-LA", "windows")).toThrow(/desconocido/);
  });
});

describe("crearBase", () => {
  const combinaciones = DISTS.flatMap((d) => IDIOMAS.flatMap((i) => SISTEMAS.map((s) => ({ distribucion: d, idioma: i, so: s }) as Ajustes)));

  it.each(combinaciones)("llena las 42 teclas: $distribucion, $idioma, $so", (ajustes) => {
    const base = crearBase(ajustes);
    expect(Object.keys(base.teclas).map(Number).sort((a, b) => a - b)).toEqual(Array.from({ length: 42 }, (_, i) => i));
    Object.values(base.teclas).forEach((t) => expect(t.texto.length).toBeGreaterThan(0));
    expect(base).toMatchObject({ corto: "BASE", largo: "Base" });
  });

  it("QWERTY en español de Latinoamérica con Windows, fila por fila", () => {
    const base = crearBase({ distribucion: "qwerty", idioma: "es-LA", so: "windows" });
    expect(fila(base, 0)).toEqual(["TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "BSPC"]);
    expect(fila(base, 1)).toEqual(["CTRL", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ", "{"]);
    expect(fila(base, 2)).toEqual(["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "-", "ESC"]);
    expect([36, 37, 38, 39, 40, 41].map((p) => texto(base, p))).toEqual(["WIN", "LOWER", "SPC", "ENT", "RAISE", "ALT"]);
  });

  it("el idioma cambia lo que se ve en las mismas teclas", () => {
    const en = crearBase({ distribucion: "qwerty", idioma: "en-US", so: "windows" });
    const es = crearBase({ distribucion: "qwerty", idioma: "es-ES", so: "windows" });
    expect([22, 23, 34].map((p) => texto(en, p))).toEqual([";", "'", "/"]);
    expect([22, 23, 34].map((p) => texto(es, p))).toEqual(["Ñ", "´", "-"]);
  });

  it("el sistema cambia el nombre de los modificadores", () => {
    const mac = crearBase({ distribucion: "qwerty", idioma: "en-US", so: "macos" });
    const linux = crearBase({ distribucion: "qwerty", idioma: "en-US", so: "linux" });
    expect([texto(mac, 36), texto(mac, 41)]).toEqual(["CMD", "OPT"]);
    expect([texto(linux, 36), texto(linux, 41)]).toEqual(["SUPER", "ALT"]);
  });

  it("solo LOWER y RAISE son teclas de capa", () => {
    const base = crearBase({ distribucion: "colemak-dh", idioma: "es-LA", so: "linux" });
    const deCapa = Object.entries(base.teclas).filter(([, t]) => t.deCapa).map(([p]) => Number(p));
    expect(deCapa).toEqual([37, 40]);
  });

  it("Dvorak en español: SEMI y SQT se ven como en el sistema", () => {
    const base = crearBase({ distribucion: "dvorak", idioma: "es-LA", so: "windows" });
    expect(fila(base, 0).slice(1, 6)).toEqual(["{", ",", ".", "P", "Y"]);
    expect(texto(base, 25)).toBe("Ñ");
  });
});

describe("ajustesDelNavegador", () => {
  it.each([
    ["es-CO", "Win32", "es-LA", "windows"],
    ["es-ES", "MacIntel", "es-ES", "macos"],
    ["es", "Linux x86_64", "es-LA", "linux"],
    ["en-GB", "iPhone", "en-US", "macos"],
    ["fr-FR", "Linux armv8l", "en-US", "linux"],
  ])("%s en %s → %s, %s", (lengua, plataforma, idioma, so) => {
    expect(ajustesDelNavegador(lengua, plataforma)).toEqual({ distribucion: "qwerty", idioma, so });
  });
});

describe("teclasParaDibujar", () => {
  it("devuelve 42 teclas en el orden de dibujo, con las vacías incluidas", () => {
    const vacia: CapaConfig = { corto: "NUM", largo: "Números", teclas: { 13: { texto: "1", descripcion: "", deCapa: false } } };
    const teclas = teclasParaDibujar(vacia);
    expect(teclas.map((t) => t.pos)).toEqual([...ORDEN_DIBUJO]);
    expect(teclas.filter((t) => t.texto)).toEqual([{ texto: "1", descripcion: "", deCapa: false, pos: 13 }]);
  });
});

describe("desdeKeymap (data.ts → modelo nuevo)", () => {
  const teclado = desdeKeymap(keymap, { distribucion: "dvorak", idioma: "es-LA", so: "windows" });

  it("pasa las 6 capas en el mismo orden", () => {
    expect(teclado.orden).toEqual(["base", "num", "sym", "nav", "led", "fun"]);
    expect(teclado.capas.nav).toMatchObject({ corto: "NAV", largo: "Navegación" });
  });

  it("cada tecla queda en su número de posición de ZMK", () => {
    expect(texto(teclado.capas.base, 0)).toBe("ESC");
    expect(texto(teclado.capas.base, 11)).toBe("BSPC");
    expect(teclado.capas.base.teclas[0].descripcion).toBe("cancela, detiene o aborta una acción en curso");
  });

  it("conserva las teclas de capa (naranja) y no pierde ninguna con texto", () => {
    for (const [id, teclas] of Object.entries(keymap)) {
      const capa = teclado.capas[id.toLowerCase()];
      expect(Object.values(capa.teclas).filter((t) => t.deCapa)).toHaveLength(teclas.filter((t) => t.clase).length);
      expect(Object.values(capa.teclas).filter((t) => t.texto)).toHaveLength(teclas.filter((t) => t.label.trim()).length);
    }
  });

  it("es un teclado válido", () => {
    expect(validarTeclado(teclado)).toEqual([]);
  });
});

describe("validarTeclado", () => {
  const ajustes: Ajustes = { distribucion: "qwerty", idioma: "es-LA", so: "windows" };

  it("un teclado nuevo es válido", () => {
    expect(validarTeclado(crearTeclado(ajustes))).toEqual([]);
  });

  it("sin nombre se muestra «Corne ZMK»; con nombre, en medio: «Corne Rey ZMK»", () => {
    expect(nombreVisible(crearTeclado(ajustes))).toBe("Corne ZMK");
    expect(nombreVisible({ nombre: "   " })).toBe("Corne ZMK");
    expect(nombreVisible({ nombre: " Rey " })).toBe("Corne Rey ZMK");
  });

  it("detecta más de 10 capas, Base fuera de lugar y textos demasiado largos", () => {
    const t = crearTeclado(ajustes);
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
