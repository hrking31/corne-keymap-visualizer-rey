// El lector de .keymap (Fase 3): sintaxis estándar de ZMK, para cualquier usuario.
// Se prueba con el keymap oficial del Corne de ZMK, con el del autor y con uno inventado
// que reúne los casos raros.
import { describe, expect, it } from "vitest";
import oficial from "./keymaps/zmk-corne.keymap?raw";
import rey from "./keymaps/corne-rey.keymap?raw";
import reyMacros from "./keymaps/corne-rey-macros.dtsi?raw";
import { keymap as dataAutor } from "../src/data";
import { desdeKeymap } from "../src/teclados/convertir";
import { crearTeclado } from "../src/teclados/plantillas";
import { validarTeclado } from "../src/teclados/validar";
import type { Ajustes, TecladoConfig } from "../src/teclados/tipos";
import { ErrorKeymap, leerKeymap } from "../src/keymap/leer";
import { importarKeymap } from "../src/keymap/importar";
import { textoDeCodigo } from "../src/keymap/codigos";

const ingles: Ajustes = { distribucion: "qwerty", idioma: "en-US", so: "windows" };
const latino: Ajustes = { distribucion: "dvorak", idioma: "es-LA", so: "windows" };

const importar = (textos: string[], ajustes: Ajustes, actual?: TecladoConfig) =>
  importarKeymap(leerKeymap(textos), actual ?? crearTeclado(ajustes));

const texto = (t: TecladoConfig, capa: number, pos: number) => t.capas[t.orden[capa]].teclas[pos]?.texto ?? "";

describe("keymap oficial del Corne (ZMK)", () => {
  const { teclado, resumen } = importar([oficial], ingles);

  it("lee sus 3 capas de 42 teclas, con sus nombres", () => {
    expect(resumen.capas).toEqual(["BASE", "LOWER", "RAISE"]);
    expect(teclado.capas[teclado.orden[1]].largo).toBe("Lower Layer");
    expect(resumen.desconocidos).toEqual([]);
    expect(validarTeclado(teclado)).toEqual([]);
  });

  it("traduce las teclas y las de capa", () => {
    expect(texto(teclado, 0, 0)).toBe("TAB");
    expect(texto(teclado, 0, 22)).toBe(";");
    expect(texto(teclado, 0, 23)).toBe("'");
    expect(texto(teclado, 0, 36)).toBe("WIN");
    expect(teclado.capas.base.teclas[37]).toMatchObject({ texto: "LOWER", deCapa: true });
    expect(texto(teclado, 1, 12)).toBe("BT CLR");
    expect(texto(teclado, 1, 13)).toBe("BT1");
  });

  it("los símbolos coinciden con los comentarios del propio archivo", () => {
    const fila = (capa: number, desde: number, n: number) => Array.from({ length: n }, (_, i) => texto(teclado, capa, desde + i));
    expect(fila(2, 1, 10)).toEqual(["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"]);
    expect(fila(2, 18, 6)).toEqual(["-", "=", "[", "]", "\\", "`"]);
    expect(fila(2, 30, 6)).toEqual(["_", "+", "{", "}", "|", "~"]);
  });

  it("&trans muestra, en gris, la tecla de la capa desde la que se llega", () => {
    expect(teclado.capas[teclado.orden[1]].teclas[22]).toMatchObject({ texto: ";", heredada: true });
  });
});

describe("keymap del autor (español latino, Windows)", () => {
  const { teclado, resumen } = importar([rey, reyMacros], latino);

  it("lee sus 6 capas y reconoce todo, macros incluidas", () => {
    expect(resumen.capas).toEqual(["BASE", "NUM", "SYM", "NAV", "LED", "FUN"]);
    expect(resumen.desconocidos).toEqual([]);
    expect(resumen.macros).toContain("mcr_git");
    expect(validarTeclado(teclado)).toEqual([]);
  });

  // Nombres que el autor eligió a su gusto en vez del estándar
  const aSuGusto = new Set(["&kp HOME", "&kp DOWN"]);

  it("cada &kp se ve igual que en la configuración que el autor escribió a mano", () => {
    const aMano = desdeKeymap(dataAutor, latino);
    const leido = leerKeymap([rey, reyMacros]);
    const distintas: string[] = [];
    leido.capas.forEach((capa, i) =>
      capa.bindings.forEach((b, pos) => {
        if (b.comportamiento !== "&kp" || /\(/.test(b.parametros[0]) || aSuGusto.has(b.original)) return;
        const esperado = aMano.capas[aMano.orden[i]].teclas[pos]?.texto ?? "";
        const obtenido = texto(teclado, i, pos);
        if (esperado !== obtenido) distintas.push(`${resumen.capas[i]} ${pos} ${b.original}: «${esperado}» ≠ «${obtenido}»`);
      }),
    );
    expect(distintas).toEqual([]);
  });
});

describe("casos raros (un keymap inventado)", () => {
  // Una capa con esas primeras teclas (n) y el resto vacías
  const capa = (nombre: string, primeras: string, n: number) => {
    const resto = Array.from({ length: 42 - n }, () => "&none").join(" ");
    return `${nombre} { display-name = "${nombre}"; bindings = <${primeras} ${resto}>; };`;
  };
  const archivo = `
    #include <behaviors.dtsi>
    #define NAV 1
    #define HOLA(n) &kp n
    / {
      behaviors {
        hm: home_row_mods { compatible = "zmk,behavior-hold-tap"; #binding-cells = <2>; bindings = <&kp>, <&kp>; };
        cmb: coma_morph { compatible = "zmk,behavior-mod-morph"; #binding-cells = <0>; bindings = <&kp COMMA>, <&kp SEMI>; mods = <(MOD_LSFT)>; };
      };
      macros {
        mcr_hola: mcr_hola { compatible = "zmk,behavior-macro"; #binding-cells = <0>; bindings = <&kp H>; };
      };
      keymap {
        compatible = "zmk,keymap";
        ${capa("base_layer", "&lt NAV SPACE &mt LSHFT A &sk LSHFT &hm LCTRL S HOLA(Q) &cmb &mcr_hola &foo 3 &kp NOEXISTE &kp LC(LS(Z)) &kp RA(Q)", 11)}
        ${capa("nav_layer", "&trans &kp LEFT &caps_word &mo 0 &out OUT_TOG &rgb_ug RGB_TOG", 6)}
      };
    };`;
  const { teclado, resumen } = importar([archivo], latino);

  it("entiende los comportamientos estándar, los #define y las plantillas", () => {
    expect(teclado.capas.base.teclas[0]).toMatchObject({ texto: "SPC/NAV", deCapa: true });
    expect(texto(teclado, 0, 1)).toBe("A/SHIFT");
    expect(texto(teclado, 0, 2)).toBe("SK SHIFT");
    expect(texto(teclado, 0, 3)).toBe("S/CTRL");
    expect(texto(teclado, 0, 4)).toBe("Q");
    // Español latino: la tecla SEMI escribe «Ñ»
    expect(texto(teclado, 0, 5)).toBe(",/Ñ");
    expect(texto(teclado, 0, 6)).toBe("HOLA");
    expect(texto(teclado, 0, 9)).toBe("CTRL+SHIFT+Z");
    expect(texto(teclado, 0, 10)).toBe("@");
    expect(resumen.macros).toEqual(["mcr_hola"]);
  });

  it("lo que no reconoce lo muestra tal cual y lo avisa, sin inventar", () => {
    expect(texto(teclado, 0, 7)).toBe("foo 3");
    expect(texto(teclado, 0, 8)).toBe("NOEXISTE");
    expect(resumen.desconocidos.map((d) => d.original)).toEqual(["&foo 3", "&kp NOEXISTE"]);
  });

  it("la capa de abajo de una &trans es la que la activa", () => {
    expect(teclado.capas[teclado.orden[1]].teclas[0]).toMatchObject({ texto: "SPC/NAV", heredada: true });
    expect(texto(teclado, 1, 2)).toBe("CAPS W");
    expect(texto(teclado, 1, 4)).toBe("USB/BT");
  });

  it("solo admite el Corne de 42 teclas y hasta 10 capas", () => {
    const corto = `/ { keymap { compatible = "zmk,keymap"; a { bindings = <&kp A &kp B>; }; }; };`;
    expect(() => importar([corto], latino)).toThrow(ErrorKeymap);
    expect(() => importar(["no es un keymap"], latino)).toThrow(ErrorKeymap);
    const once = Array.from({ length: 11 }, (_, i) => capa(`c${i}`, "&kp A", 1)).join("\n");
    expect(() => importar([`/ { keymap { compatible = "zmk,keymap"; ${once} }; };`], latino)).toThrow(/10/);
  });
});

describe("volver a importar", () => {
  it("conserva las descripciones escritas a mano y avisa de las capas que sobran", () => {
    const actual = crearTeclado(ingles);
    actual.capas.base.teclas[0] = { texto: "X", descripcion: "Mi tabulador", deCapa: false };
    actual.orden.push("a", "b", "c", "d");
    for (const id of ["a", "b", "c", "d"]) actual.capas[id] = { corto: id.toUpperCase(), largo: "", teclas: {} };
    const { teclado, resumen } = importarKeymap(leerKeymap([oficial]), actual);
    expect(teclado.capas.base.teclas[0]).toMatchObject({ texto: "TAB", descripcion: "Mi tabulador" });
    expect(teclado.orden).toEqual(["base", "a", "b"]);
    expect(resumen.quitadas).toEqual(["C", "D"]);
  });
});

describe("códigos de tecla", () => {
  it("se traducen según el idioma y el sistema", () => {
    expect(textoDeCodigo("SEMI", "es-LA", "windows").texto).toBe("Ñ");
    expect(textoDeCodigo("SEMI", "en-US", "windows").texto).toBe(";");
    expect(textoDeCodigo("LGUI", "es-LA", "macos").texto).toBe("CMD");
    expect(textoDeCodigo("AT", "es-LA", "windows").texto).toBe('"');
    expect(textoDeCodigo("RA(N2)", "es-ES", "windows").texto).toBe("@");
    expect(textoDeCodigo("C_VOL_UP", "es-LA", "linux").texto).toBe("VOL+");
  });
});
