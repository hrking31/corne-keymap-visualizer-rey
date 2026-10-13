// Práctica de memoria muscular: la app pide una tecla y el usuario la pulsa en su teclado
// físico, sin mirarlo. Aquí va solo la lógica (qué teclas se pueden practicar, si una
// pulsación acierta y cuál es la siguiente pregunta); la pantalla va aparte.
import { envioDeCodigo, modificadorDeCodigo, type Envio } from "../keymap/codigos";
import type { Idioma, TecladoConfig } from "../teclados/tipos";

// Lo que se lee de un evento de teclado del navegador (KeyboardEvent)
export type Pulsacion = {
  key: string; // el carácter o el nombre de la tecla: «ñ», «Enter», «Shift»
  code: string; // la tecla física: «Semicolon», «Enter», «ShiftLeft»
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  altGr: boolean; // getModifierState("AltGraph")
};

// Cómo se sabe que se pulsó: por la tecla física que envía (si se conoce su código de ZMK);
// si es un modificador solo (Shift, Ctrl, Alt), por esa tecla; y en una tecla escrita a
// mano, por el carácter que escribe
type Espera =
  | { tipo: "tecla"; envio: Envio }
  | { tipo: "modificador"; code: string }
  | { tipo: "caracter"; caracter: string };

export type Objetivo = {
  clave: string; // identifica lo que hay que pulsar: dos teclas que envían lo mismo son un solo objetivo
  texto: string; // lo que se pide en pantalla: «Ñ», «ENT», «INIT»
  espera: Espera;
  lugares: { capa: string; pos: number }[]; // dónde está, para encenderla
};

// ---------- Qué teclas se pueden practicar ----------

// Teclas que escriben un carácter: letras, números y símbolos. Con Shift o AltGr escriben
// otro carácter (shift + 1 → «!»), así que siguen contando
const DE_CARACTER =
  /^(Key[A-Z]|Digit[0-9]|Numpad([0-9]|Add|Subtract|Multiply|Divide|Decimal|Equal|Comma)|Minus|Equal|BracketLeft|BracketRight|Backslash|Semicolon|Quote|Backquote|Comma|Period|Slash|IntlBackslash)$/;
// Las demás que se practican (lista del autor): editar, moverse y F1–F10. Sueltas, sin modificadores
const CON_NOMBRE = new Set([
  "Escape", "Backspace", "Delete", "Tab", "Space", "Enter",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10",
]);

// Se practican teclas, no atajos: nada con Ctrl, Alt o la tecla Windows
function sePractica(e: Envio): boolean {
  if (e.ctrl || e.alt || e.gui) return false;
  if (DE_CARACTER.test(e.code)) return true;
  return !e.shift && !e.altGr && CON_NOMBRE.has(e.code);
}

// Acentos que en un teclado en español esperan a la vocal: el navegador no dice cuál se
// pulsó. Solo afecta a las teclas escritas a mano (las importadas se reconocen por la tecla)
const MUERTAS: Record<Idioma, string> = { "en-US": "", "es-LA": "´¨^`", "es-ES": "´¨^`~" };

const claveDeEnvio = (e: Envio) =>
  `t:${e.code}:${e.ctrl ? "c" : ""}${e.shift ? "s" : ""}${e.alt ? "a" : ""}${e.altGr ? "g" : ""}`;

// Todas las teclas del teclado que se pueden practicar, en el orden de las capas
export function objetivos(teclado: TecladoConfig): Objetivo[] {
  const lista: Objetivo[] = [];
  const porClave = new Map<string, Objetivo>();
  for (const capa of teclado.orden) {
    for (const [pos, tecla] of Object.entries(teclado.capas[capa]?.teclas ?? {})) {
      // Una tecla heredada (&trans) es la de la capa de abajo: se practica allí
      if (tecla.heredada || tecla.sinReconocer) continue;
      // En una tecla de dos acciones se practica la de tocar, que es la primera línea
      const texto = tecla.texto.split("\n")[0].trim();
      if (!texto) continue;

      let espera: Espera | null = null;
      if (tecla.envia) {
        const envio = envioDeCodigo(tecla.envia);
        const modificador = modificadorDeCodigo(tecla.envia);
        if (envio && sePractica(envio)) espera = { tipo: "tecla", envio };
        else if (modificador) espera = { tipo: "modificador", code: modificador };
      } else if (!tecla.deCapa && [...tecla.texto.trim()].length === 1 && !MUERTAS[teclado.ajustes.idioma].includes(texto)) {
        espera = { tipo: "caracter", caracter: texto.toLocaleUpperCase() };
      }
      if (!espera) continue;

      const clave =
        espera.tipo === "tecla" ? claveDeEnvio(espera.envio) : espera.tipo === "modificador" ? `m:${espera.code}` : `c:${espera.caracter}`;
      const lugar = { capa, pos: Number(pos) };
      const repetido = porClave.get(clave);
      if (repetido) repetido.lugares.push(lugar);
      else {
        const objetivo: Objetivo = { clave, texto, espera, lugares: [lugar] };
        porClave.set(clave, objetivo);
        lista.push(objetivo);
      }
    }
  }
  return lista;
}

// ---------- Si una pulsación acierta ----------

const MODIFICADORES = new Set(["Shift", "Control", "Alt", "AltGraph", "Meta", "OS", "Fn", "Hyper", "Super"]);

// Pulsar solo un modificador (el Shift antes de un símbolo) no es todavía una respuesta,
// salvo que lo que se pida sea precisamente un modificador
export const esSoloModificador = (p: Pulsacion) => MODIFICADORES.has(p.key);

export function acierta(objetivo: Objetivo, p: Pulsacion): boolean {
  if (p.meta) return false;
  if (objetivo.espera.tipo === "modificador") return p.code === objetivo.espera.code;
  if (objetivo.espera.tipo === "caracter") {
    // Ctrl y Alt juntos son AltGr en Windows; uno solo es un atajo, no escribir el carácter
    if (p.ctrl !== p.alt) return false;
    return p.key.toLocaleUpperCase() === objetivo.espera.caracter;
  }
  const e = objetivo.espera.envio;
  if (p.code !== e.code || p.shift !== e.shift) return false;
  // AltGr llega como AltGraph, como Alt o, en Windows, como Ctrl + Alt
  if (e.altGr) return p.altGr || p.alt;
  if (p.ctrl !== e.ctrl || p.alt !== e.alt) return false;
  return (e.ctrl && e.alt) || !p.altGr;
}

// ---------- La sesión de práctica ----------

// Una tecla fallada vuelve a preguntarse después de estas preguntas
const REPASO = 3;

export type Practica = {
  objetivos: Objetivo[];
  actual: number; // índice del objetivo que se está pidiendo
  fallado: boolean; // ya se falló esta pregunta: la tecla correcta se queda encendida
  aciertos: number; // preguntas acertadas a la primera
  fallos: number; // preguntas falladas (una pregunta cuenta un solo fallo)
  repaso: { objetivo: number; faltan: number }[];
};

export type Resultado = "acierto" | "fallo" | "ignorada";

// Empieza una sesión. null si el teclado no tiene ninguna tecla que se pueda practicar
export function empezar(lista: Objetivo[], azar: () => number = Math.random): Practica | null {
  if (!lista.length) return null;
  return { objetivos: lista, actual: Math.floor(azar() * lista.length), fallado: false, aciertos: 0, fallos: 0, repaso: [] };
}

function siguiente(p: Practica, azar: () => number): Pick<Practica, "actual" | "repaso"> {
  const repaso = p.repaso.map((r) => ({ ...r, faltan: r.faltan - 1 }));
  const toca = repaso.findIndex((r) => r.faltan <= 0 && r.objetivo !== p.actual);
  if (toca >= 0) return { actual: repaso.splice(toca, 1)[0].objetivo, repaso };
  const n = p.objetivos.length;
  if (n === 1) return { actual: 0, repaso };
  // Cualquiera menos el que se acaba de pedir
  const otro = Math.floor(azar() * (n - 1));
  return { actual: otro >= p.actual ? otro + 1 : otro, repaso };
}

// Aplica una pulsación: si acierta pasa a la siguiente pregunta; si falla, la pregunta
// sigue hasta que se pulse bien. No cambia la sesión que recibe
export function responder(
  p: Practica,
  pulsacion: Pulsacion,
  azar: () => number = Math.random,
): { practica: Practica; resultado: Resultado } {
  const { espera } = p.objetivos[p.actual];
  if (esSoloModificador(pulsacion)) {
    // De camino a otra tecla (shift + 1 para «!») un modificador no acierta ni falla
    if (espera.tipo !== "modificador") return { practica: p, resultado: "ignorada" };
    // En Windows, AltGr llega precedido de un Ctrl izquierdo que nadie pulsó
    if (espera.code === "AltRight" && pulsacion.code === "ControlLeft") return { practica: p, resultado: "ignorada" };
  }
  if (!acierta(p.objetivos[p.actual], pulsacion)) {
    return { practica: p.fallado ? p : { ...p, fallado: true, fallos: p.fallos + 1 }, resultado: "fallo" };
  }
  const { actual, repaso } = siguiente(p, azar);
  if (p.fallado && !repaso.some((r) => r.objetivo === p.actual)) repaso.push({ objetivo: p.actual, faltan: REPASO });
  return {
    practica: { ...p, actual, repaso, fallado: false, aciertos: p.aciertos + (p.fallado ? 0 : 1) },
    resultado: "acierto",
  };
}
