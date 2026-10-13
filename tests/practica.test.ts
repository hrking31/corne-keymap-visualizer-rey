// La práctica (memoria muscular): qué teclas se pueden practicar, cuándo una pulsación
// acierta y cómo avanza la sesión. Solo lógica, sin navegador.
import { describe, expect, it } from "vitest";
import rey from "./keymaps/corne-rey.keymap?raw";
import { envioDeCodigo } from "../src/keymap/codigos";
import { importarKeymap } from "../src/keymap/importar";
import { leerKeymap } from "../src/keymap/leer";
import { acierta, empezar, esSoloModificador, objetivos, responder, type Objetivo, type Pulsacion } from "../src/practica/practica";
import { editarTecla } from "../src/teclados/editar";
import { crearTeclado } from "../src/teclados/plantillas";
import { crearRespaldo, leerRespaldo } from "../src/teclados/respaldo";
import { validarTeclado } from "../src/teclados/validar";
import type { Ajustes, TeclaConfig, TecladoConfig } from "../src/teclados/tipos";

const latino: Ajustes = { distribucion: "dvorak", idioma: "es-LA", so: "windows" };

const pulsar = (key: string, code: string, mods: Partial<Pulsacion> = {}): Pulsacion => ({
  key, code, ctrl: false, shift: false, alt: false, meta: false, altGr: false, ...mods,
});

const tecla = (texto: string, extra: Partial<TeclaConfig> = {}): TeclaConfig => ({ texto, descripcion: "", deCapa: false, ...extra });

// Un teclado pequeño con una tecla de cada caso
const teclado: TecladoConfig = {
  nombre: "",
  ajustes: latino,
  orden: ["base", "capa1"],
  capas: {
    base: {
      corto: "BASE",
      largo: "",
      teclas: {
        0: tecla("Ñ", { envia: "SEMI" }),
        1: tecla("COPY", { envia: "LC(C)" }),
        2: tecla("WIN+E", { envia: "LG(E)" }), // la tecla Windows es del sistema
        3: tecla("CTRL+W", { envia: "LC(W)" }), // cerraría la pestaña
        4: tecla("SHIFT", { envia: "LSHFT" }), // un modificador solo
        5: tecla("NAV", { deCapa: true }),
        6: tecla("A\nNAV", { deCapa: true, envia: "A" }), // tocar A, mantener capa NAV
        7: tecla("GIT"), // una macro: la app no sabe qué envía
        8: tecla("x"), // escrita a mano: un carácter
        9: tecla("´"), // escrita a mano: acento que espera a la vocal
        10: tecla("VOL+", { envia: "C_VOL_UP" }),
        11: tecla("?", { sinReconocer: "&kp NOEXISTE" }),
      },
    },
    capa1: {
      corto: "NUM",
      largo: "",
      teclas: {
        0: tecla("Ñ", { envia: "SEMI", heredada: true }),
        1: tecla("INIT", { envia: "HOME" }),
        2: tecla("COPIAR", { envia: "LC(C)" }), // lo mismo que base 1
      },
    },
  },
};

describe("lo que el navegador recibe de un código de ZMK", () => {
  const sin = { ctrl: false, shift: false, alt: false, altGr: false, gui: false };

  it("la tecla física no depende del idioma", () => {
    expect(envioDeCodigo("A")).toEqual({ code: "KeyA", ...sin });
    expect(envioDeCodigo("SEMI")).toEqual({ code: "Semicolon", ...sin });
    expect(envioDeCodigo("NUMBER_1")).toEqual({ code: "Digit1", ...sin });
    expect(envioDeCodigo("ENTER")).toEqual({ code: "Enter", ...sin });
    expect(envioDeCodigo("HOME")?.code).toBe("Home");
    expect(envioDeCodigo("F5")?.code).toBe("F5");
    expect(envioDeCodigo("KP_N7")?.code).toBe("Numpad7");
  });

  it("los modificadores, y los símbolos con nombre propio (que llevan shift)", () => {
    expect(envioDeCodigo("LC(C)")).toEqual({ code: "KeyC", ...sin, ctrl: true });
    expect(envioDeCodigo("LC(LS(Z))")).toEqual({ code: "KeyZ", ...sin, ctrl: true, shift: true });
    expect(envioDeCodigo("EXCL")).toEqual(envioDeCodigo("LS(N1)"));
    expect(envioDeCodigo("RA(Q)")).toEqual({ code: "KeyQ", ...sin, altGr: true });
    expect(envioDeCodigo("LG(E)")?.gui).toBe(true);
  });

  it("null si no es una tecla que llegue así al navegador", () => {
    for (const codigo of ["LSHFT", "RALT", "C_VOL_UP", "NOEXISTE", ""]) expect(envioDeCodigo(codigo)).toBeNull();
  });
});

describe("qué teclas se pueden practicar", () => {
  const lista = objetivos(teclado);
  const textos = lista.map((o) => o.texto);

  it("entran las que envían una tecla y las escritas a mano de un carácter", () => {
    expect(textos).toEqual(["Ñ", "COPY", "A", "x", "INIT"]);
  });

  it("de una tecla de dos acciones se practica la de tocar", () => {
    const a = lista.find((o) => o.texto === "A");
    expect(a?.espera).toEqual({ tipo: "tecla", envio: envioDeCodigo("A") });
  });

  it("dos teclas que envían lo mismo son un solo objetivo, con sus dos lugares", () => {
    expect(lista.find((o) => o.texto === "COPY")?.lugares).toEqual([
      { capa: "base", pos: 1 },
      { capa: "capa1", pos: 2 },
    ]);
  });

  it("una heredada (&trans) no cuenta: se practica en su capa", () => {
    expect(lista.find((o) => o.texto === "Ñ")?.lugares).toEqual([{ capa: "base", pos: 0 }]);
  });

  it("la Base de plantilla se practica por sus caracteres, y sigue lo que el usuario escriba", () => {
    const plantilla = crearTeclado({ distribucion: "qwerty", idioma: "en-US", so: "windows" });
    const de = objetivos(plantilla).map((o) => o.texto);
    expect(de).toEqual(expect.arrayContaining(["Q", "A", ";", "'", "/"]));
    // Las de varias letras no se sabe qué envían: solo se conocen al importar el .keymap
    for (const fuera of ["TAB", "CTRL", "SHIFT", "WIN", "ALT", "LOWER", "RAISE"]) expect(de).not.toContain(fuera);
    expect(de).toHaveLength(31); // 30 del bloque de letras + la comilla
    // Quien configura a mano cambia la plantilla para que coincida con su teclado
    const cambiada = editarTecla(plantilla, "base", 1, tecla("Ñ"));
    expect(objetivos(cambiada).map((o) => o.texto)).toContain("Ñ");
    expect(objetivos(cambiada).map((o) => o.texto)).not.toContain("Q");
  });

  it("el keymap del autor, recién importado: sus teclas llevan lo que envían", () => {
    const { teclado: suyo } = importarKeymap(leerKeymap(rey), crearTeclado(latino));
    expect(validarTeclado(suyo)).toEqual([]);
    const suyos = objetivos(suyo);
    expect(suyos.length).toBeGreaterThan(60);
    // &kp SEMI se ve «Ñ» en español y se reconoce por la tecla física, no por la letra
    expect(suyos.find((o) => o.texto === "Ñ")?.espera).toEqual({ tipo: "tecla", envio: envioDeCodigo("SEMI") });
    expect(suyos.some((o) => o.texto === "HOME")).toBe(true);
    for (const o of suyos) {
      expect(o.espera.tipo).toBe("tecla");
      if (o.espera.tipo === "tecla") expect(o.espera.envio.gui).toBe(false);
    }
  });
});

describe("si una pulsación acierta", () => {
  const lista = objetivos(teclado);
  const objetivo = (texto: string) => lista.find((o) => o.texto === texto) as Objetivo;

  it("por la tecla física, escriba lo que escriba el sistema", () => {
    expect(acierta(objetivo("Ñ"), pulsar("ñ", "Semicolon"))).toBe(true);
    expect(acierta(objetivo("Ñ"), pulsar(";", "Semicolon"))).toBe(true); // Windows en inglés
    expect(acierta(objetivo("Ñ"), pulsar("n", "KeyN"))).toBe(false);
    expect(acierta(objetivo("Ñ"), pulsar("Ñ", "Semicolon", { shift: true }))).toBe(false);
  });

  it("los atajos piden sus modificadores exactos", () => {
    expect(acierta(objetivo("COPY"), pulsar("c", "KeyC", { ctrl: true }))).toBe(true);
    expect(acierta(objetivo("COPY"), pulsar("c", "KeyC"))).toBe(false);
    expect(acierta(objetivo("COPY"), pulsar("C", "KeyC", { ctrl: true, shift: true }))).toBe(false);
    expect(acierta(objetivo("COPY"), pulsar("c", "KeyC", { ctrl: true, meta: true }))).toBe(false);
  });

  it("AltGr llega como AltGraph, como Alt o como Ctrl + Alt (Windows)", () => {
    const arroba: Objetivo = { clave: "", texto: "@", lugares: [], espera: { tipo: "tecla", envio: envioDeCodigo("RA(Q)")! } };
    expect(acierta(arroba, pulsar("@", "KeyQ", { ctrl: true, alt: true, altGr: true }))).toBe(true);
    expect(acierta(arroba, pulsar("@", "KeyQ", { altGr: true }))).toBe(true);
    expect(acierta(arroba, pulsar("q", "KeyQ"))).toBe(false);
    // Y al revés: con AltGr puesto no vale para una tecla sin modificadores
    expect(acierta(objetivo("A"), pulsar("a", "KeyA", { altGr: true }))).toBe(false);
  });

  it("una tecla escrita a mano, por el carácter (sin distinguir mayúsculas)", () => {
    expect(acierta(objetivo("x"), pulsar("x", "KeyB"))).toBe(true);
    expect(acierta(objetivo("x"), pulsar("X", "KeyB", { shift: true }))).toBe(true);
    expect(acierta(objetivo("x"), pulsar("y", "KeyX"))).toBe(false);
    expect(acierta(objetivo("x"), pulsar("x", "KeyB", { ctrl: true }))).toBe(false);
  });

  it("un modificador solo no es una respuesta", () => {
    expect(esSoloModificador(pulsar("Shift", "ShiftLeft", { shift: true }))).toBe(true);
    expect(esSoloModificador(pulsar("AltGraph", "AltRight"))).toBe(true);
    expect(esSoloModificador(pulsar("a", "KeyA"))).toBe(false);
  });
});

describe("la sesión de práctica", () => {
  const lista = objetivos(teclado); // Ñ, COPY, A, x, INIT
  const bien: Record<string, Pulsacion> = {
    Ñ: pulsar("ñ", "Semicolon"),
    COPY: pulsar("c", "KeyC", { ctrl: true }),
    A: pulsar("a", "KeyA"),
    x: pulsar("x", "KeyX"),
    INIT: pulsar("Home", "Home"),
  };
  const mal = pulsar("0", "Digit0");
  const pedida = (p: { objetivos: Objetivo[]; actual: number }) => p.objetivos[p.actual].texto;

  it("sin teclas que practicar no empieza", () => {
    expect(empezar([])).toBeNull();
  });

  it("acertar a la primera suma un acierto y pasa a otra tecla", () => {
    const inicio = empezar(lista, () => 0)!;
    expect(pedida(inicio)).toBe("Ñ");
    const { practica, resultado } = responder(inicio, bien.Ñ, () => 0);
    expect(resultado).toBe("acierto");
    expect(practica).toMatchObject({ aciertos: 1, fallos: 0, fallado: false });
    expect(pedida(practica)).not.toBe("Ñ");
    expect(inicio.aciertos).toBe(0); // la sesión anterior no cambia
  });

  it("fallar cuenta un solo fallo y la pregunta sigue hasta pulsar bien", () => {
    let p = empezar(lista, () => 0)!;
    p = responder(p, mal).practica;
    expect(p).toMatchObject({ aciertos: 0, fallos: 1, fallado: true });
    p = responder(p, mal).practica;
    expect(p.fallos).toBe(1);
    expect(pedida(p)).toBe("Ñ");
    // Pulsarla bien después de fallar no suma acierto
    p = responder(p, bien.Ñ, () => 0).practica;
    expect(p).toMatchObject({ aciertos: 0, fallos: 1, fallado: false });
  });

  it("el Shift de camino a un símbolo no cuenta como fallo", () => {
    const inicio = empezar(lista, () => 0)!;
    const { practica, resultado } = responder(inicio, pulsar("Shift", "ShiftLeft", { shift: true }));
    expect(resultado).toBe("ignorada");
    expect(practica).toBe(inicio);
  });

  it("una tecla fallada vuelve después de tres preguntas", () => {
    let p = empezar(lista, () => 0)!; // Ñ
    p = responder(p, mal).practica;
    p = responder(p, bien.Ñ, () => 0).practica;
    const siguientes = [];
    for (let i = 0; i < 4; i++) {
      siguientes.push(pedida(p));
      p = responder(p, bien[pedida(p)], () => 0.99).practica;
    }
    expect(siguientes.slice(0, 3)).not.toContain("Ñ");
    expect(siguientes[3]).toBe("Ñ");
    expect(p.repaso).toEqual([]);
  });

  it("nunca pide dos veces seguidas la misma (si hay más de una)", () => {
    let p = empezar(lista, () => 0.5)!;
    let azar = 0;
    for (let i = 0; i < 200; i++) {
      const antes = pedida(p);
      azar = (azar + 0.37) % 1;
      p = responder(p, bien[antes], () => azar).practica;
      expect(pedida(p)).not.toBe(antes);
    }
    expect(p.aciertos).toBe(200);
  });
});

describe("lo que envía una tecla se conserva", () => {
  it("al editarla a mano: cambia el nombre, no lo que envía", () => {
    const editado = editarTecla(teclado, "capa1", 1, tecla("INICIO", { descripcion: "Va al principio de la línea" }));
    expect(editado.capas.capa1.teclas[1]).toEqual({
      texto: "INICIO",
      descripcion: "Va al principio de la línea",
      deCapa: false,
      envia: "HOME",
    });
  });

  it("en la copia de seguridad", () => {
    const limpio: TecladoConfig = { ...teclado, capas: { ...teclado.capas, base: { ...teclado.capas.base, teclas: { 0: teclado.capas.base.teclas[0] } } } };
    const { teclado: leido } = leerRespaldo(JSON.stringify(crearRespaldo(limpio)));
    expect(leido.capas.base.teclas[0].envia).toBe("SEMI");
    expect(leido.capas.capa1.teclas[1].envia).toBe("HOME");
  });

  it("un código demasiado largo no pasa la validación ni se restaura", () => {
    const largo: TecladoConfig = structuredClone(teclado);
    largo.capas.capa1.teclas[1].envia = "X".repeat(41);
    expect(validarTeclado(largo).join()).toContain("código");
    const copia = JSON.stringify(crearRespaldo(largo));
    expect(leerRespaldo(copia).teclado.capas.capa1.teclas[1].envia).toBeUndefined();
  });
});
