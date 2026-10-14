// La práctica (memoria muscular): qué teclas se pueden practicar, cuándo una pulsación
// acierta y cómo avanza la sesión. Solo lógica, sin navegador.
import { describe, expect, it } from "vitest";
import rey from "./keymaps/corne-rey.keymap?raw";
import { envioDeCodigo } from "../src/keymap/codigos";
import { importarKeymap } from "../src/keymap/importar";
import { leerKeymap } from "../src/keymap/leer";
import {
  GRUPOS, PALABRAS_POR_RONDA, TECLAS_POR_RONDA, acierta, anotarDificultad, arrancar, crearTexto, empezar, empezarTexto,
  esSoloModificador, gruposDisponibles, objetivos, objetivosDeGrupo, responder, textoDeRonda, textosDeGrupo, tiempoDeRonda,
  type Dificultad, type GrupoDeTeclas, type Objetivo, type Practica, type Pulsacion,
} from "../src/practica/practica";
import { pantallaOled, pantallasDePractica, tamanoDeLetra } from "../src/practica/pantalla";
import { FRASES, PALABRAS } from "../src/practica/textos";
import { editarTecla } from "../src/teclados/editar";
import { crearTeclado } from "../src/teclados/plantillas";
import { crearRespaldo, leerRespaldo } from "../src/teclados/respaldo";
import { validarTeclado } from "../src/teclados/validar";
import type { Ajustes, TeclaConfig, TecladoConfig } from "../src/teclados/tipos";

const latino: Ajustes = { distribucion: "dvorak", idioma: "es-LA", so: "windows" };

const pulsar = (key: string, code: string, mods: Partial<Pulsacion> = {}): Pulsacion => ({
  key, code, ctrl: false, shift: false, alt: false, meta: false, altGr: false, ...mods,
});

// Una ronda ya arrancada, como tras el «¡YA!» de la cuenta atrás
const ya = (p: Practica | null, ahora = 0) => arrancar(p!, ahora);

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
        1: tecla("ENT", { envia: "RET" }),
        2: tecla("WIN+E", { envia: "LG(E)" }), // un atajo con la tecla Windows
        3: tecla("CTRL+C", { envia: "LC(C)" }), // un atajo: se practican teclas, no atajos
        4: tecla("SHIFT", { envia: "LSHFT" }), // un modificador solo: también se practica
        5: tecla("NAV", { deCapa: true }),
        6: tecla("A\nNAV", { deCapa: true, envia: "A" }), // tocar A, mantener capa NAV
        7: tecla("GIT"), // una macro: la app no sabe qué envía
        8: tecla("x"), // escrita a mano: un carácter
        9: tecla("´"), // escrita a mano: acento que espera a la vocal
        10: tecla("VOL+", { envia: "C_VOL_UP" }),
        11: tecla("?", { sinReconocer: "&kp NOEXISTE" }),
        12: tecla("F11", { envia: "F11" }), // fuera de la lista: solo F1–F10
        13: tecla("SHIFT+LEFT", { envia: "LS(LEFT)" }), // una flecha con modificador ya es un atajo
        14: tecla("ALT+D", { envia: "LA(D)" }),
        15: tecla("!", { envia: "EXCL" }), // un símbolo con shift sigue siendo un carácter
        16: tecla("@", { envia: "RA(Q)" }), // y con AltGr
        17: tecla("WIN", { envia: "LGUI" }), // la tecla Windows es del sistema
      },
    },
    capa1: {
      corto: "NUM",
      largo: "",
      teclas: {
        0: tecla("Ñ", { envia: "SEMI", heredada: true }),
        1: tecla("INIT", { envia: "HOME" }),
        2: tecla("INTRO", { envia: "RET" }), // lo mismo que base 1
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

  it("entran los caracteres, las de editar y moverse, los modificadores solos y las escritas a mano de un carácter", () => {
    expect(textos).toEqual(["Ñ", "ENT", "SHIFT", "A", "x", "!", "@", "INIT"]);
    expect(lista.find((o) => o.texto === "SHIFT")?.espera).toEqual({ tipo: "modificador", code: "ShiftLeft" });
  });

  it("los atajos quedan fuera: nada con Ctrl, Alt o la tecla Windows, ni teclas con nombre con shift", () => {
    for (const fuera of ["WIN+E", "CTRL+C", "ALT+D", "SHIFT+LEFT", "F11", "WIN"]) expect(textos).not.toContain(fuera);
  });

  it("de una tecla de dos acciones se practica la de tocar", () => {
    const a = lista.find((o) => o.texto === "A");
    expect(a?.espera).toEqual({ tipo: "tecla", envio: envioDeCodigo("A") });
  });

  it("dos teclas que envían lo mismo son un solo objetivo, con sus dos lugares", () => {
    expect(lista.find((o) => o.texto === "ENT")?.lugares).toEqual([
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
    // &kp SEMI se ve «Ñ» en español y se reconoce por la tecla física, no por la letra
    expect(suyos.find((o) => o.texto === "Ñ")?.espera).toEqual({ tipo: "tecla", envio: envioDeCodigo("SEMI") });
    // Aparte de letras, números y símbolos, solo estas (la lista que pidió el autor)
    const conNombre = suyos.map((o) => o.texto).filter((t) => [...t].length > 1);
    expect(conNombre.sort()).toEqual(
      [
        "ESC", "BSPC", "DEL", "TAB", "SPC", "ENT", "LEFT", "RIGHT", "UP", "DOWN", "HOME", "END", "PG UP", "PG DN",
        "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10",
        "ALT", "CTRL", "SHIFT",
      ].sort(),
    );
    expect(suyos.length - conNombre.length).toBe(66); // sus letras, números y símbolos
    for (const o of suyos) {
      expect(o.espera.tipo).not.toBe("caracter");
      if (o.espera.tipo === "tecla") expect(o.espera.envio).toMatchObject({ ctrl: false, alt: false, gui: false });
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

  it("los modificadores tienen que ser exactos", () => {
    // Un símbolo con shift pide el shift
    expect(acierta(objetivo("!"), pulsar("!", "Digit1", { shift: true }))).toBe(true);
    expect(acierta(objetivo("!"), pulsar("1", "Digit1"))).toBe(false);
    // Una tecla suelta no vale si llega con Ctrl, Alt o la tecla Windows
    expect(acierta(objetivo("ENT"), pulsar("Enter", "Enter"))).toBe(true);
    expect(acierta(objetivo("ENT"), pulsar("Enter", "Enter", { ctrl: true }))).toBe(false);
    expect(acierta(objetivo("ENT"), pulsar("Enter", "Enter", { alt: true }))).toBe(false);
    expect(acierta(objetivo("ENT"), pulsar("Enter", "Enter", { meta: true }))).toBe(false);
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
  const lista = objetivos(teclado); // Ñ, ENT, SHIFT, A, x, !, @, INIT
  const bien: Record<string, Pulsacion> = {
    Ñ: pulsar("ñ", "Semicolon"),
    ENT: pulsar("Enter", "Enter"),
    SHIFT: pulsar("Shift", "ShiftLeft", { shift: true }),
    A: pulsar("a", "KeyA"),
    x: pulsar("x", "KeyX"),
    "!": pulsar("!", "Digit1", { shift: true }),
    "@": pulsar("@", "KeyQ", { ctrl: true, alt: true, altGr: true }),
    INIT: pulsar("Home", "Home"),
  };
  const mal = pulsar("0", "Digit0");
  const pedida = (p: { objetivos: Objetivo[]; actual: number }) => p.objetivos[p.actual].texto;

  it("sin teclas que practicar no empieza", () => {
    expect(empezar([])).toBeNull();
  });

  it("acertar a la primera suma un acierto y pasa a otra tecla", () => {
    const inicio = ya(empezar(lista, () => 0));
    expect(pedida(inicio)).toBe("Ñ");
    const { practica, resultado } = responder(inicio, bien.Ñ, () => 0);
    expect(resultado).toBe("acierto");
    expect(practica).toMatchObject({ aciertos: 1, fallos: 0, fallado: false });
    expect(pedida(practica)).not.toBe("Ñ");
    expect(inicio.aciertos).toBe(0); // la sesión anterior no cambia
  });

  it("fallar cuenta un solo fallo y la pregunta sigue hasta pulsar bien", () => {
    let p = ya(empezar(lista, () => 0));
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
    const inicio = ya(empezar(lista, () => 0));
    const { practica, resultado } = responder(inicio, pulsar("Shift", "ShiftLeft", { shift: true }));
    expect(resultado).toBe("ignorada");
    expect(practica).toBe(inicio);
  });

  it("un modificador solo cuenta como respuesta únicamente cuando se pide uno", () => {
    const shift = lista.findIndex((o) => o.texto === "SHIFT");
    const pidiendoShift = { ...ya(empezar(lista, () => 0)), actual: shift };
    // Acierta con su tecla…
    expect(responder(pidiendoShift, bien.SHIFT, () => 0).resultado).toBe("acierto");
    // …y falla con otro modificador o con cualquier otra tecla
    expect(responder(pidiendoShift, pulsar("Control", "ControlLeft", { ctrl: true })).resultado).toBe("fallo");
    expect(responder(pidiendoShift, bien.A).resultado).toBe("fallo");
    // Pidiendo otra cosa, el mismo Shift se ignora
    expect(responder(ya(empezar(lista, () => 0)), bien.SHIFT).resultado).toBe("ignorada");
  });

  it("pidiendo AltGr, el Ctrl que Windows envía delante no cuenta como fallo", () => {
    const altGr: Objetivo = { clave: "m:AltRight", texto: "ALTGR", lugares: [], espera: { tipo: "modificador", code: "AltRight" } };
    const sesion = ya(empezar([altGr, ...lista], () => 0));
    expect(responder(sesion, pulsar("Control", "ControlLeft", { ctrl: true })).resultado).toBe("ignorada");
    expect(responder(sesion, pulsar("AltGraph", "AltRight", { ctrl: true, alt: true }), () => 0).resultado).toBe("acierto");
  });

  it("una tecla fallada vuelve después de tres preguntas", () => {
    let p = ya(empezar(lista, () => 0)); // Ñ
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
    let p = ya(empezar(lista, () => 0.5, {}, Infinity)); // una ronda sin fin
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

describe("los grupos", () => {
  const textos = (g: GrupoDeTeclas) => objetivosDeGrupo(teclado, g).map((o) => o.texto);

  it("cada tecla en su grupo; las letras, en minúscula", () => {
    expect(textos("letras")).toEqual(["ñ", "a", "x"]);
    expect(textos("numeros")).toEqual([]);
    expect(textos("simbolos")).toEqual(["!", "@"]);
    expect(textos("otras")).toEqual(["ENT", "SHIFT", "INIT"]);
  });

  it("las mayúsculas son las mismas teclas con shift", () => {
    const mayusculas = objetivosDeGrupo(teclado, "mayusculas");
    expect(mayusculas.map((o) => o.texto)).toEqual(["Ñ", "A", "X"]);
    expect(mayusculas[0].espera).toEqual({ tipo: "tecla", envio: { ...envioDeCodigo("SEMI")!, shift: true } });
    expect(mayusculas[0].lugares).toEqual([{ capa: "base", pos: 0 }]);
  });

  it("minúscula y mayúscula se distinguen al pulsar", () => {
    const [enie, , x] = objetivosDeGrupo(teclado, "letras");
    const [ENIE, , X] = objetivosDeGrupo(teclado, "mayusculas");
    expect(acierta(enie, pulsar("ñ", "Semicolon"))).toBe(true);
    expect(acierta(enie, pulsar("Ñ", "Semicolon", { shift: true }))).toBe(false);
    expect(acierta(ENIE, pulsar("Ñ", "Semicolon", { shift: true }))).toBe(true);
    expect(acierta(ENIE, pulsar("ñ", "Semicolon"))).toBe(false);
    // Las escritas a mano, por el carácter exacto
    expect(acierta(x, pulsar("x", "KeyB"))).toBe(true);
    expect(acierta(x, pulsar("X", "KeyB", { shift: true }))).toBe(false);
    expect(acierta(X, pulsar("X", "KeyB", { shift: true }))).toBe(true);
    expect(acierta(X, pulsar("x", "KeyB"))).toBe(false);
  });

  it("«Todo» es la suma de los demás, y los grupos sin teclas salen apagados", () => {
    expect(textos("todo")).toEqual(["ñ", "ENT", "SHIFT", "a", "x", "!", "@", "INIT", "Ñ", "A", "X"]);
    expect(gruposDisponibles(teclado)).toEqual(["letras", "mayusculas", "simbolos", "otras", "todo"]);
  });

  it("con el keymap del autor: ningún grupo vacío, y «otras» son sus 27 teclas con nombre", () => {
    const { teclado: suyo } = importarKeymap(leerKeymap(rey), crearTeclado(latino));
    expect(gruposDisponibles(suyo)).toEqual([...GRUPOS]);
    const de = (g: GrupoDeTeclas) => objetivosDeGrupo(suyo, g);
    expect(de("otras")).toHaveLength(27);
    expect(de("mayusculas")).toHaveLength(de("letras").length);
    for (const o of de("letras")) expect(o.texto).toBe(o.texto.toLocaleLowerCase());
    for (const o of de("numeros")) expect(o.texto).toMatch(/^\d$/);
    const suma = (["letras", "mayusculas", "numeros", "simbolos", "otras"] as const).reduce((n, g) => n + de(g).length, 0);
    expect(de("todo")).toHaveLength(suma);
  });
});

describe("la ronda: 30 teclas contra el reloj", () => {
  const lista = objetivos(teclado); // Ñ, ENT, SHIFT, A, x, !, @, INIT
  const bien: Record<string, Pulsacion> = {
    Ñ: pulsar("ñ", "Semicolon"),
    ENT: pulsar("Enter", "Enter"),
    SHIFT: pulsar("Shift", "ShiftLeft", { shift: true }),
    A: pulsar("a", "KeyA"),
    x: pulsar("x", "KeyX"),
    "!": pulsar("!", "Digit1", { shift: true }),
    "@": pulsar("@", "KeyQ", { ctrl: true, alt: true, altGr: true }),
    INIT: pulsar("Home", "Home"),
  };
  const mal = pulsar("0", "Digit0");
  const pedida = (p: Practica) => p.objetivos[p.actual].texto;

  it("son 30 por defecto", () => {
    expect(TECLAS_POR_RONDA).toBe(30);
    expect(empezar(lista)!.total).toBe(30);
  });

  it("antes del «¡YA!» nada cuenta; desde ahí corre el reloj", () => {
    let p = empezar(lista, () => 0)!;
    expect(tiempoDeRonda(p, 5000)).toBe(0);
    // La pulsación que comprueba el teclado y las de la cuenta atrás no son respuestas
    for (const pulsacion of [mal, bien.Ñ]) {
      const antes = responder(p, pulsacion, () => 0, 1000);
      expect(antes.resultado).toBe("ignorada");
      expect(antes.practica).toBe(p);
    }
    p = arrancar(p, 2000);
    expect(arrancar(p, 9000)).toBe(p); // solo arranca una vez
    expect(tiempoDeRonda(p, 3500)).toBe(1500);
    expect(responder(p, mal, () => 0, 3000).resultado).toBe("fallo");
  });

  it("termina al acertar la última: el reloj se para y ya no cuenta nada más", () => {
    let p = ya(empezar(lista, () => 0, {}, 3), 1000);
    let t = 1000;
    for (let i = 0; i < 3; i++) {
      expect(p.fin).toBeNull();
      if (i === 1) p = responder(p, mal, () => 0, (t += 100)).practica; // un fallo por el camino
      p = responder(p, bien[pedida(p)], () => 0, (t += 1000)).practica;
    }
    expect(p).toMatchObject({ hechas: 3, aciertos: 2, fallos: 1, inicio: 1000, fin: 4100 });
    expect(tiempoDeRonda(p, 99_999)).toBe(3100);
    const despues = responder(p, bien[pedida(p)], () => 0, 5000);
    expect(despues.resultado).toBe("ignorada");
    expect(despues.practica).toBe(p);
  });

  it("anota lo que cuesta cada tecla, también la primera (cuenta desde el «¡YA!»)", () => {
    let p = ya(empezar(lista, () => 0)); // Ñ
    p = responder(p, bien.Ñ, () => 0, 1000).practica; // pasa a ENT
    expect(p.dificultad).toEqual({ [lista[0].clave]: { ms: 1000, fallos: 0 } });
    p = responder(p, mal, () => 0, 1500).practica;
    p = responder(p, bien.ENT, () => 0, 3000).practica;
    expect(p.dificultad[lista[1].clave]).toEqual({ ms: 2000, fallos: 1 });
  });

  it("las medias olvidan poco a poco: mejorar se nota sin borrar lo anterior", () => {
    let d: Dificultad = anotarDificultad({}, "k", true, 3000);
    d = anotarDificultad(d, "k", false, 1000);
    expect(d.k.ms).toBeCloseTo(2400);
    expect(d.k.fallos).toBeCloseTo(0.7);
    // Sin tiempo (primera pregunta), el tiempo no cambia
    expect(anotarDificultad(d, "k", false, null).k.ms).toBeCloseTo(2400);
  });

  it("las teclas que cuestan salen más a menudo", () => {
    const sabida = { ms: 1000, fallos: 0 };
    const dificultad: Dificultad = Object.fromEntries(lista.map((o) => [o.clave, sabida]));
    dificultad[lista[3].clave] = { ms: 3000, fallos: 1 }; // la A
    const veces = Array<number>(lista.length).fill(0);
    for (let i = 0; i < 1000; i++) veces[empezar(lista, () => i / 1000, dificultad)!.actual]++;
    expect(veces[3] / 1000).toBeGreaterThan(0.3); // al azar sería 1 de 8 (0,125)
    for (const [i, n] of veces.entries()) if (i !== 3) expect(n).toBeGreaterThan(0);
  });
});

describe("palabras y frases", () => {
  const { teclado: suyo } = importarKeymap(leerKeymap(rey), crearTeclado(latino));

  it("las listas: sin repetidas, palabras en minúscula y frases con mayúscula y punto", () => {
    for (const lengua of ["es", "en"] as const) {
      expect(PALABRAS[lengua].length).toBeGreaterThanOrEqual(250);
      expect(FRASES[lengua].length).toBeGreaterThanOrEqual(50);
      expect(new Set(FRASES[lengua]).size).toBe(FRASES[lengua].length);
      for (const p of PALABRAS[lengua]) expect(p).toMatch(/^\p{Ll}+$/u);
      for (const f of FRASES[lengua]) expect(f).toMatch(/^\p{Lu}[\p{L} ,]*\.$/u);
    }
  });

  it("con el keymap del autor se escriben casi todas, con tildes y ñ", () => {
    const palabras = textosDeGrupo(suyo, "palabras");
    expect(palabras.length / PALABRAS.es.length).toBeGreaterThan(0.95);
    expect(palabras).toContain("mañana");
    expect(palabras).toContain("lápiz");
    expect(textosDeGrupo(suyo, "frases")).toEqual(FRASES.es);
  });

  it("solo lo que el teclado puede escribir: sin espacio no hay frases", () => {
    expect(textosDeGrupo(teclado, "frases")).toEqual([]);
    expect(gruposDisponibles(teclado)).not.toContain("palabras");
  });

  it("en inglés, las listas en inglés; la Base de plantilla basta", () => {
    const ingles = crearTeclado({ distribucion: "qwerty", idioma: "en-US", so: "windows" });
    expect(textosDeGrupo(ingles, "frases").length).toBeGreaterThan(0);
    for (const f of textosDeGrupo(ingles, "frases")) expect(FRASES.en).toContain(f);
    expect(gruposDisponibles(ingles)).toContain("palabras");
  });

  it("una ronda de palabras son 6 distintas al azar, separadas por espacios", () => {
    let azar = 0;
    const texto = crearTexto(suyo, "palabras", () => (azar = (azar + 0.37) % 1))!;
    const palabras = texto.split(" ");
    expect(PALABRAS_POR_RONDA).toBe(6);
    expect(palabras).toHaveLength(6);
    expect(new Set(palabras).size).toBe(6);
    expect(crearTexto(suyo, "frases", () => 0)).toBe(FRASES.es[0]);
  });

  it("se escribe letra a letra y en orden; la tilde que espera a su vocal no es un fallo", () => {
    const texto = "Ñu, á.";
    let p = ya(empezarTexto(suyo, texto), 0);
    expect(textoDeRonda(p)).toBe(texto);
    expect(p.total).toBe([...texto].length);
    const escribir = (key: string, mods: Partial<Pulsacion> = {}) => responder(p, pulsar(key, "", mods), () => 0, 1000);
    expect(escribir("ñ").resultado).toBe("fallo"); // la mayúscula, exacta
    p = escribir("Ñ", { shift: true }).practica;
    for (const c of "u, ") p = escribir(c).practica;
    expect(escribir("Dead").resultado).toBe("ignorada");
    p = escribir("á").practica;
    p = escribir(".").practica;
    expect(p).toMatchObject({ hechas: 6, aciertos: 6, fallos: 0, fin: 1000 });
    expect(p.dificultad).toEqual({}); // no cuenta para las teclas difíciles
  });

  it("cada letra sabe dónde está: «á» enciende la tilde y la a; el espacio, su tecla", () => {
    const p = empezarTexto(suyo, "á ")!;
    const enBase = (o: Objetivo) => o.lugares.filter((l) => l.capa === suyo.orden[0]).map((l) => suyo.capas[l.capa].teclas[l.pos].texto.split("\n")[0]);
    expect(enBase(p.objetivos[0]).sort()).toEqual(["A", "´"].sort());
    expect(p.objetivos[1].lugares.length).toBeGreaterThan(0);
  });
});

describe("el marcador en las pantallas del teclado", () => {
  const svg = (valor: string) => decodeURIComponent(valor.replace(/^url\("data:image\/svg\+xml,/, "").replace(/"\)$/, ""));
  const CHULO = "M38 23 L43 28 L53 16";
  const EQUIS = "M40 16.5 L51 27.5 M51 16.5 L40 27.5";

  it("aciertos en la izquierda y fallos en la derecha, con el ✓ de conectado", () => {
    const { izquierda, derecha } = pantallasDePractica(12, 3, true);
    expect(izquierda).toMatch(/^url\("data:image\/svg\+xml,[^"]+"\)$/);
    // El número va separado de la palabra más que un espacio, que a ese tamaño no se veía
    expect(svg(izquierda)).toContain('>ACIERTOS<tspan dx="0.6em">12</tspan><');
    expect(svg(derecha)).toContain('>FALLOS<tspan dx="0.6em">3</tspan><');
    expect(svg(izquierda)).toContain(CHULO);
    expect(svg(izquierda)).not.toContain(EQUIS);
  });

  it("sin teclado todavía: el aviso en las dos y una ✗ en lugar del ✓", () => {
    const { izquierda, derecha } = pantallasDePractica(0, 0, false);
    for (const pantalla of [izquierda, derecha]) {
      expect(svg(pantalla)).toContain(">CONECTA TU<");
      expect(svg(pantalla)).toContain(">TECLADO<");
      expect(svg(pantalla)).toContain(EQUIS);
      expect(svg(pantalla)).not.toContain(CHULO);
    }
  });

  it("la letra es la del «100%» de la batería; en móviles se agranda para que se lea, sin salirse", () => {
    const bateria = 16 * 0.7 * 0.7; // 7,84
    for (const tecla of [62, 80, 100]) expect(tamanoDeLetra(tecla, 1)).toBeCloseTo(bateria, 2);
    // Móvil: la tecla mide ~34px y la letra sube hasta unos 8px (8 × 60 / 34 unidades)
    expect(tamanoDeLetra(34, 1)).toBeCloseTo(14.12, 2);
    // Nunca más de lo que cabe: 18 en una línea, 16 en dos
    expect(tamanoDeLetra(20, 1)).toBe(18);
    expect(tamanoDeLetra(20, 2)).toBe(16);
    // Sin medida (no debería pasar), la de la batería
    expect(tamanoDeLetra(0, 1)).toBeCloseTo(bateria, 2);
    expect(svg(pantallasDePractica(1, 0, true, 80).izquierda)).toContain('font-size="7.84"');
    expect(svg(pantallasDePractica(1, 0, true, 34).izquierda)).toContain('font-size="14.12"');
  });

  it("la izquierda va volteada, como su imagen de siempre, y ninguna lleva estilos en línea (CSP)", () => {
    expect(svg(pantallaOled("left", ["X"], true))).toContain('transform="translate(56 0) scale(-1 1) matrix(0 -1 1 0 0 150)"');
    expect(svg(pantallaOled("right", ["X"], true))).toContain('transform="matrix(0 -1 1 0 0 150)"');
    expect(svg(pantallaOled("right", ["X"], true))).not.toMatch(/style=|<style/);
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
