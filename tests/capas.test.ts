// Capas animadas: a qué capa lleva cada tecla de capa (`abre`), sacado del .keymap.
// Se prueba con el keymap del autor, el oficial de ZMK y keymaps inventados para los
// casos que esos dos no tienen (tocar, capas por combinación).
import { describe, expect, it } from "vitest";
import oficial from "./keymaps/zmk-corne.keymap?raw";
import rey from "./keymaps/corne-rey.keymap?raw";
import { crearTeclado } from "../src/teclados/plantillas";
import { validarTeclado } from "../src/teclados/validar";
import { borrarCapa, editarTecla } from "../src/teclados/editar";
import { crearRespaldo, leerRespaldo } from "../src/teclados/respaldo";
import type { Ajustes, TecladoConfig } from "../src/teclados/tipos";
import { leerKeymap } from "../src/keymap/leer";
import { importarKeymap } from "../src/keymap/importar";

const ingles: Ajustes = { distribucion: "qwerty", idioma: "en-US", so: "windows" };
const latino: Ajustes = { distribucion: "dvorak", idioma: "es-LA", so: "windows" };

const importar = (archivo: string, ajustes: Ajustes) => importarKeymap(leerKeymap(archivo), crearTeclado(ajustes)).teclado;

// La tecla `pos` de la capa número `capa`
const tecla = (t: TecladoConfig, capa: number, pos: number) => t.capas[t.orden[capa]].teclas[pos];

// Un keymap de capas con 42 teclas: los pulgares (36–41) de cada una, el resto &none
const keymap = (capas: string[], extra = "") => {
  const resto = Array.from({ length: 36 }, () => "&none").join(" ");
  const nodos = capas.map((pulgares, i) => `c${i} { display-name = "C${i}"; bindings = <${resto} ${pulgares}>; };`);
  return `/ { ${extra} keymap { compatible = "zmk,keymap"; ${nodos.join(" ")} }; };`;
};

describe("a qué capa lleva cada tecla de capa", () => {
  it("keymap del autor: los pulgares de cada capa", () => {
    const t = importar(rey, latino);
    const [, num, sym, nav, led, fun] = t.orden;
    expect(tecla(t, 0, 37).abre).toEqual({ capa: num, modo: "mantener" });
    expect(tecla(t, 0, 40).abre).toEqual({ capa: sym, modo: "mantener" });
    // Dentro de NUM: la 40 lleva a NAV y la 41 a FUN; dentro de SYM, la 37 lleva a LED
    expect(tecla(t, 1, 40).abre).toEqual({ capa: nav, modo: "mantener" });
    expect(tecla(t, 1, 41).abre).toEqual({ capa: fun, modo: "mantener" });
    expect(tecla(t, 2, 37).abre).toEqual({ capa: led, modo: "mantener" });
    // Las teclas que no son de capa no llevan a ninguna
    expect(tecla(t, 0, 38).abre).toBeUndefined();
    expect(validarTeclado(t)).toEqual([]);
  });

  it("keymap oficial de ZMK: LOWER y RAISE", () => {
    const t = importar(oficial, ingles);
    expect(tecla(t, 0, 37).abre).toEqual({ capa: t.orden[1], modo: "mantener" });
    expect(tecla(t, 0, 40).abre).toEqual({ capa: t.orden[2], modo: "mantener" });
  });

  it("&mo y &lt se mantienen; &tog, &to y &sl se tocan", () => {
    const t = importar(keymap(["&mo 1 &lt 2 SPACE &tog 3 &to 1 &sl 2 &kp A", "&none &none &none &none &none &mo 1", "&trans &trans &trans &trans &trans &trans", "&to 0 &none &none &none &none &none"]), ingles);
    const [, uno, dos, tres] = t.orden;
    expect(tecla(t, 0, 36).abre).toEqual({ capa: uno, modo: "mantener" });
    expect(tecla(t, 0, 37).abre).toEqual({ capa: dos, modo: "mantener" });
    expect(tecla(t, 0, 38).abre).toEqual({ capa: tres, modo: "tocar" });
    expect(tecla(t, 0, 39).abre).toEqual({ capa: uno, modo: "tocar" });
    expect(tecla(t, 0, 40).abre).toEqual({ capa: dos, modo: "tocar" });
    // Volver a Base también se anota (el camino empieza en Base y no la usa)
    expect(tecla(t, 3, 36).abre).toEqual({ capa: "base", modo: "tocar" });
    // Una tecla que lleva a su propia capa no sirve para llegar a ella
    expect(tecla(t, 1, 41).abre).toBeUndefined();
  });

  it("un tocar/mantener propio con una capa al mantener", () => {
    const extra = `behaviors { lh: capa_hold { compatible = "zmk,behavior-hold-tap"; #binding-cells = <2>; bindings = <&mo>, <&kp>; }; };`;
    const t = importar(keymap(["&lh 1 TAB &none &none &none &none &none", "&none &none &none &none &none &none"], extra), ingles);
    expect(tecla(t, 0, 36).abre).toEqual({ capa: t.orden[1], modo: "mantener" });
  });

  it("un número de capa que no existe no lleva a ninguna", () => {
    const t = importar(keymap(["&mo 7 &none &none &none &none &none"]), ingles);
    expect(tecla(t, 0, 36).abre).toBeUndefined();
  });
});

describe("capas por combinación (conditional_layers)", () => {
  // El «tri-layer» del Corne: LOWER (1) + RAISE (2) → ADJUST (3), con los nombres en #define
  const archivo = `
    #define LOWER 1
    #define RAISE 2
    #define ADJUST 3
    ${keymap(
      [
        "&kp LGUI &mo LOWER &kp SPACE &kp RET &mo RAISE &kp RALT",
        "&trans &trans &trans &trans &trans &trans",
        "&trans &trans &trans &trans &trans &trans",
        "&none &none &none &none &none &none",
      ],
      `conditional_layers { compatible = "zmk,conditional-layers"; tri_layer { if-layers = <LOWER RAISE>; then-layer = <ADJUST>; }; };`,
    )}`;

  it("el lector las encuentra", () => {
    expect(leerKeymap(archivo).combinaciones).toEqual([{ si: [1, 2], entonces: 3 }]);
  });

  it("en LOWER, la tecla de RAISE lleva a ADJUST manteniendo las dos; y al revés", () => {
    const t = importar(archivo, ingles);
    const adjust = t.orden[3];
    expect(tecla(t, 1, 40).abre).toEqual({ capa: adjust, modo: "juntas" });
    expect(tecla(t, 2, 37).abre).toEqual({ capa: adjust, modo: "juntas" });
    // Se queda el texto heredado (gris) de la tecla: el nombre de la capa 2 («C2»)
    expect(tecla(t, 1, 40)).toMatchObject({ texto: "C2", heredada: true });
    // En Base, LOWER y RAISE siguen llevando a su capa
    expect(tecla(t, 0, 37).abre).toEqual({ capa: t.orden[1], modo: "mantener" });
    expect(validarTeclado(t)).toEqual([]);
  });

  it("las de más de dos capas se ignoran", () => {
    const tres = archivo.replace("<LOWER RAISE>", "<LOWER RAISE 3>");
    const t = importar(tres, ingles);
    expect(tecla(t, 1, 40).abre).toBeUndefined();
  });
});

describe("el dato se conserva", () => {
  const t = importar(rey, latino);
  const nav = t.orden[3];

  it("al editar el texto o la descripción de una tecla", () => {
    const editado = editarTecla(t, t.orden[1], 40, { texto: "NAVEG", descripcion: "Flechas y ventanas", deCapa: true });
    expect(tecla(editado, 1, 40).abre).toEqual({ capa: nav, modo: "mantener" });
  });

  it("al borrar una capa, las teclas que llevaban a ella ya no llevan a ninguna", () => {
    const sin = borrarCapa(t, nav);
    expect(tecla(sin, 1, 40).abre).toBeUndefined();
    expect(tecla(sin, 1, 41).abre).toEqual({ capa: t.orden[5], modo: "mantener" });
  });

  it("en la copia de seguridad, revisado", () => {
    const leido = leerRespaldo(JSON.stringify(crearRespaldo(t))).teclado;
    expect(tecla(leido, 1, 40).abre).toEqual({ capa: nav, modo: "mantener" });

    const rara = structuredClone(t);
    (rara.capas[rara.orden[1]].teclas[40] as unknown as { abre: unknown }).abre = { capa: nav, modo: "volar" };
    (rara.capas[rara.orden[1]].teclas[41] as unknown as { abre: unknown }).abre = { capa: "x".repeat(21), modo: "tocar" };
    const limpia = leerRespaldo(JSON.stringify(crearRespaldo(rara))).teclado;
    expect(tecla(limpia, 1, 40).abre).toBeUndefined();
    expect(tecla(limpia, 1, 41).abre).toBeUndefined();
  });
});
