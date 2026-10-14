// Práctica de memoria muscular: la app pide una tecla y el usuario la pulsa en su teclado
// físico, sin mirarlo. Aquí va solo la lógica (qué teclas se pueden practicar, si una
// pulsación acierta y cuál es la siguiente pregunta); la pantalla va aparte.
import { envioDeCodigo, modificadorDeCodigo, type Envio } from "../keymap/codigos";
import type { Idioma, TecladoConfig } from "../teclados/tipos";
import { FRASES, PALABRAS, type Lengua } from "./textos";

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
// mano, por el carácter que escribe. Al escribir palabras y frases, por el carácter exacto
// (con su tilde: «á» llega ya compuesto)
type Espera =
  | { tipo: "tecla"; envio: Envio }
  | { tipo: "modificador"; code: string }
  | { tipo: "caracter"; caracter: string; caso?: "minuscula" | "mayuscula" | "exacto" };

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

// ---------- Grupos ----------

// Se practica por grupos para aprender una zona antes de mezclarlas. «Todo» es la mezcla de
// las teclas sueltas. «Palabras» y «Frases» son otra forma: escribir de corrido
export const GRUPOS = ["letras", "mayusculas", "numeros", "simbolos", "otras", "todo", "palabras", "frases"] as const;
export type Grupo = (typeof GRUPOS)[number];
export type GrupoDeTexto = "palabras" | "frases";
export type GrupoDeTeclas = Exclude<Grupo, GrupoDeTexto>;
export const esDeTexto = (g: Grupo): g is GrupoDeTexto => g === "palabras" || g === "frases";
export const NOMBRE_GRUPO: Record<Grupo, string> = {
  letras: "Letras",
  mayusculas: "Mayúsculas",
  numeros: "Números",
  simbolos: "Símbolos",
  otras: "Otras",
  todo: "Todo",
  palabras: "Palabras",
  frases: "Frases",
};

type Clase = Exclude<GrupoDeTeclas, "todo">;

// A qué grupo pertenece una tecla: las de editar, moverse, F1–F10 y los modificadores son
// «otras»; las de un carácter, según el carácter
function clase(o: Objetivo): Clase {
  if (o.espera.tipo === "modificador") return "otras";
  if (o.espera.tipo === "tecla" && CON_NOMBRE.has(o.espera.envio.code)) return "otras";
  if ([...o.texto].length !== 1) return "otras";
  if (/^\p{L}$/u.test(o.texto)) return o.espera.tipo === "tecla" && o.espera.envio.shift ? "mayusculas" : "letras";
  if (/^\p{N}$/u.test(o.texto)) return "numeros";
  return "simbolos";
}

// Una letra como minúscula («ñ») o como mayúscula (shift + ñ = «Ñ»). La tecla es la misma
function conCaso(o: Objetivo, caso: "minuscula" | "mayuscula"): Objetivo | null {
  const texto = caso === "mayuscula" ? o.texto.toLocaleUpperCase() : o.texto.toLocaleLowerCase();
  const lugares = o.lugares.map((l) => ({ ...l }));
  if (o.espera.tipo === "caracter") {
    const espera: Espera = { tipo: "caracter", caracter: o.espera.caracter, caso };
    return { clave: caso === "mayuscula" ? `${o.clave}:M` : o.clave, texto, espera, lugares };
  }
  if (o.espera.tipo !== "tecla" || o.espera.envio.altGr) return null;
  const envio = { ...o.espera.envio, shift: caso === "mayuscula" };
  return { clave: claveDeEnvio(envio), texto, espera: { tipo: "tecla", envio }, lugares };
}

// Las teclas de un grupo. Las mayúsculas salen de las letras: la misma tecla con shift
export function objetivosDeGrupo(teclado: TecladoConfig, grupo: GrupoDeTeclas): Objetivo[] {
  const lista: Objetivo[] = [];
  const vistas = new Set<string>();
  const agregar = (o: Objetivo | null) => {
    if (o && !vistas.has(o.clave)) {
      vistas.add(o.clave);
      lista.push(o);
    }
  };
  const todos = objetivos(teclado);
  const quiere = (c: Clase) => grupo === "todo" || grupo === c;
  for (const o of todos) {
    const c = clase(o);
    if (c === "letras") {
      if (quiere("letras")) agregar(conCaso(o, "minuscula"));
    } else if (quiere(c)) agregar(o);
  }
  if (quiere("mayusculas")) for (const o of todos) if (clase(o) === "letras") agregar(conCaso(o, "mayuscula"));
  return lista;
}

// ---------- Palabras y frases ----------

export const PALABRAS_POR_RONDA = 6;

const lenguaDe = (teclado: TecladoConfig): Lengua => (teclado.ajustes.idioma === "en-US" ? "en" : "es");
// «á» → «a» y su tilde «´»
const sinTilde = (c: string) => c.normalize("NFD").replace(/\p{M}/gu, "");
const TILDES: Record<string, string> = { "́": "´", "̈": "¨", "̀": "`", "̂": "^", "̃": "~" };
const NOMBRES_ESPACIO = new Set(["SPC", "SPACE", "ESPACIO", "␣"]);

// Dónde está, en este teclado, cada carácter que se puede escribir: las letras (en
// minúscula), los signos y el espacio. Una letra con tilde necesita su letra y la tecla de
// la tilde, y se encienden las dos
function mapaDeCaracteres(teclado: TecladoConfig): Map<string, Objetivo["lugares"]> {
  const mapa = new Map<string, Objetivo["lugares"]>();
  for (const capa of teclado.orden) {
    for (const [pos, tecla] of Object.entries(teclado.capas[capa]?.teclas ?? {})) {
      if (tecla.heredada || tecla.sinReconocer) continue;
      const texto = tecla.texto.split("\n")[0].trim();
      const caracter = tecla.envia === "SPACE" || NOMBRES_ESPACIO.has(texto.toUpperCase()) ? " " : texto.toLocaleLowerCase();
      // Una tecla de capa solo cuenta si al tocarla escribe algo (tocar A, mantener NAV)
      if ([...caracter].length !== 1 || (tecla.deCapa && !tecla.envia)) continue;
      mapa.set(caracter, [...(mapa.get(caracter) ?? []), { capa, pos: Number(pos) }]);
    }
  }
  return mapa;
}

function lugaresDe(mapa: Map<string, Objetivo["lugares"]>, c: string): Objetivo["lugares"] | null {
  const minuscula = c.toLocaleLowerCase();
  if (mapa.has(minuscula)) return mapa.get(minuscula)!;
  const base = sinTilde(minuscula);
  const tilde = TILDES[minuscula.normalize("NFD").slice(base.length)];
  if (!tilde || !mapa.has(base) || !mapa.has(tilde)) return null;
  return [...mapa.get(tilde)!, ...mapa.get(base)!];
}

// Las palabras o frases de la lista que se pueden escribir con este teclado
export function textosDeGrupo(teclado: TecladoConfig, grupo: GrupoDeTexto): string[] {
  const mapa = mapaDeCaracteres(teclado);
  const lista = (grupo === "palabras" ? PALABRAS : FRASES)[lenguaDe(teclado)];
  return lista.filter((t) => [...t].every((c) => lugaresDe(mapa, c) !== null));
}

// El texto de una ronda: 6 palabras distintas al azar, o una frase. null si no hay bastantes
export function crearTexto(teclado: TecladoConfig, grupo: GrupoDeTexto, azar: () => number = Math.random): string | null {
  const lista = [...textosDeGrupo(teclado, grupo)];
  const cuantas = grupo === "palabras" ? PALABRAS_POR_RONDA : 1;
  if (lista.length < cuantas) return null;
  const elegidas: string[] = [];
  for (let i = 0; i < cuantas; i++) elegidas.push(lista.splice(Math.floor(azar() * lista.length), 1)[0]);
  return elegidas.join(" ");
}

// Los grupos que tienen algo que practicar en este teclado (los demás salen apagados)
export const gruposDisponibles = (teclado: TecladoConfig): Grupo[] =>
  GRUPOS.filter((g) =>
    esDeTexto(g)
      ? textosDeGrupo(teclado, g).length >= (g === "palabras" ? PALABRAS_POR_RONDA : 1)
      : objetivosDeGrupo(teclado, g).length > 0,
  );

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
    const { caracter, caso } = objetivo.espera;
    if (caso === "exacto") return p.key === caracter;
    if (caso === "minuscula") return p.key === caracter.toLocaleLowerCase();
    if (caso === "mayuscula") return p.key === caracter;
    return p.key.toLocaleUpperCase() === caracter;
  }
  const e = objetivo.espera.envio;
  if (p.code !== e.code || p.shift !== e.shift) return false;
  // AltGr llega como AltGraph, como Alt o, en Windows, como Ctrl + Alt
  if (e.altGr) return p.altGr || p.alt;
  if (p.ctrl !== e.ctrl || p.alt !== e.alt) return false;
  return (e.ctrl && e.alt) || !p.altGr;
}

// ---------- La ronda de práctica ----------

// Una ronda son 30 teclas; la marca es lo que se tarda (los fallos ya cuestan tiempo:
// hay que pulsar la correcta para seguir)
export const TECLAS_POR_RONDA = 30;
// Una tecla fallada vuelve a preguntarse después de estas preguntas
const REPASO = 3;

// Lo que cuesta cada tecla, como medias que olvidan poco a poco lo antiguo: el tiempo que se
// tarda en pulsarla (ms) y cuántas veces se falla (de 0 a 1). Las que cuestan salen más
export type Dificultad = Record<string, { ms: number; fallos: number }>;
const OLVIDO = 0.3; // peso de la última vez en la media

export type Practica = {
  objetivos: Objetivo[];
  actual: number; // índice del objetivo que se está pidiendo
  fallado: boolean; // ya se falló esta pregunta: la tecla correcta se queda encendida
  aciertos: number; // preguntas acertadas a la primera
  fallos: number; // preguntas falladas (una pregunta cuenta un solo fallo)
  repaso: { objetivo: number; faltan: number }[];
  total: number; // preguntas de la ronda
  hechas: number; // preguntas ya respondidas bien
  inicio: number | null; // el «¡YA!» de la cuenta atrás (ms); antes nada cuenta
  desde: number | null; // cuándo empezó la pregunta actual
  fin: number | null; // cuándo terminó la ronda
  dificultad: Dificultad;
  // Palabras y frases: las preguntas son las letras del texto, en orden. No cuentan para
  // las teclas difíciles (una letra dentro de una palabra se escribe de otra manera)
  enOrden: boolean;
};

export type Resultado = "acierto" | "fallo" | "ignorada";

// Las que cuestan pesan más al elegir: hasta +2 por fallar siempre y hasta +2 por tardar
// el triple de lo normal. Las que aún no se han practicado, algo más que las ya sabidas
function peso(d: Dificultad, clave: string, media: number): number {
  const x = d[clave];
  if (!x) return 1.5;
  return 1 + 2 * x.fallos + (x.ms ? Math.min(2, Math.max(0, x.ms / media - 1)) : 0);
}

// Elige una pregunta al azar, con más probabilidad para las que cuestan
function elegir(p: Pick<Practica, "objetivos" | "dificultad">, excepto: number, azar: () => number): number {
  const n = p.objetivos.length;
  if (n === 1) return 0;
  const tiempos = Object.values(p.dificultad).map((x) => x.ms).filter((ms) => ms > 0);
  const media = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 1;
  const pesos = p.objetivos.map((o, i) => (i === excepto ? 0 : peso(p.dificultad, o.clave, media)));
  let r = azar() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < n; i++) {
    if (pesos[i] === 0) continue;
    r -= pesos[i];
    if (r < 0) return i;
  }
  // Por redondeo: la última que se puede elegir
  return pesos.findLastIndex((x) => x > 0);
}

// Prepara una ronda: el reloj no corre ni cuenta nada hasta arrancar() (el «¡YA!»). null si
// el teclado no tiene ninguna tecla que se pueda practicar
export function empezar(
  lista: Objetivo[],
  azar: () => number = Math.random,
  dificultad: Dificultad = {},
  total: number = TECLAS_POR_RONDA,
): Practica | null {
  if (!lista.length) return null;
  return {
    objetivos: lista,
    actual: elegir({ objetivos: lista, dificultad }, -1, azar),
    fallado: false,
    aciertos: 0,
    fallos: 0,
    repaso: [],
    total,
    hechas: 0,
    inicio: null,
    desde: null,
    fin: null,
    dificultad,
    enOrden: false,
  };
}

// Prepara una ronda de escribir un texto (palabras o una frase), letra a letra
export function empezarTexto(teclado: TecladoConfig, texto: string): Practica | null {
  const mapa = mapaDeCaracteres(teclado);
  const letras = [...texto];
  if (!letras.length) return null;
  const lista: Objetivo[] = letras.map((c) => ({
    clave: `x:${c}`,
    texto: c,
    espera: { tipo: "caracter", caracter: c, caso: "exacto" },
    lugares: lugaresDe(mapa, c) ?? [],
  }));
  return { ...empezar(lista, () => 0, {}, lista.length)!, actual: 0, enOrden: true };
}

// El «¡YA!» de la cuenta atrás: desde aquí corre el reloj y cuenta la primera tecla
export const arrancar = (p: Practica, ahora: number = Date.now()): Practica =>
  p.inicio === null ? { ...p, inicio: ahora, desde: ahora } : p;

// El texto de una ronda de palabras o frases, para pintarlo
export const textoDeRonda = (p: Practica): string => (p.enOrden ? p.objetivos.map((o) => o.texto).join("") : "");

function siguiente(p: Practica, azar: () => number): Pick<Practica, "actual" | "repaso"> {
  const repaso = p.repaso.map((r) => ({ ...r, faltan: r.faltan - 1 }));
  const toca = repaso.findIndex((r) => r.faltan <= 0 && r.objetivo !== p.actual);
  if (toca >= 0) return { actual: repaso.splice(toca, 1)[0].objetivo, repaso };
  // Cualquiera menos el que se acaba de pedir
  return { actual: elegir(p, p.actual, azar), repaso };
}

// Anota lo que costó una tecla: si se falló y, si se sabe, cuánto se tardó
export function anotarDificultad(d: Dificultad, clave: string, fallo: boolean, ms: number | null): Dificultad {
  const antes = d[clave];
  const f = fallo ? 1 : 0;
  if (!antes) return { ...d, [clave]: { ms: ms ?? 0, fallos: f } };
  const media = (a: number, b: number) => a * (1 - OLVIDO) + b * OLVIDO;
  const nuevoMs = ms === null ? antes.ms : antes.ms ? media(antes.ms, ms) : ms;
  return { ...d, [clave]: { ms: nuevoMs, fallos: media(antes.fallos, f) } };
}

// Aplica una pulsación: si acierta pasa a la siguiente pregunta; si falla, la pregunta
// sigue hasta que se pulse bien. Antes del «¡YA!» y después de la última no cuenta nada;
// la que completa la ronda para el reloj. No cambia la ronda que recibe
export function responder(
  p: Practica,
  pulsacion: Pulsacion,
  azar: () => number = Math.random,
  ahora: number = Date.now(),
): { practica: Practica; resultado: Resultado } {
  if (p.inicio === null || p.fin !== null) return { practica: p, resultado: "ignorada" };
  const objetivo = p.objetivos[p.actual];
  const { espera } = objetivo;
  if (esSoloModificador(pulsacion)) {
    // De camino a otra tecla (shift + 1 para «!») un modificador no acierta ni falla
    if (espera.tipo !== "modificador") return { practica: p, resultado: "ignorada" };
    // En Windows, AltGr llega precedido de un Ctrl izquierdo que nadie pulsó
    if (espera.code === "AltRight" && pulsacion.code === "ControlLeft") return { practica: p, resultado: "ignorada" };
  }
  // La tilde que espera a su vocal («´» y luego «a» = «á») tampoco es todavía una respuesta
  if (p.enOrden && pulsacion.key === "Dead") return { practica: p, resultado: "ignorada" };
  if (!acierta(objetivo, pulsacion)) {
    const fallada = p.fallado ? {} : { fallado: true, fallos: p.fallos + 1 };
    return { practica: { ...p, ...fallada }, resultado: "fallo" };
  }
  const dificultad = p.enOrden
    ? p.dificultad
    : anotarDificultad(p.dificultad, objetivo.clave, p.fallado, p.desde === null ? null : ahora - p.desde);
  const hechas = p.hechas + 1;
  const aciertos = p.aciertos + (p.fallado ? 0 : 1);
  const comun = { dificultad, hechas, aciertos, fallado: false };
  if (hechas >= p.total) {
    return { practica: { ...p, ...comun, repaso: [], desde: null, fin: ahora }, resultado: "acierto" };
  }
  if (p.enOrden) return { practica: { ...p, ...comun, actual: hechas, desde: ahora }, resultado: "acierto" };
  const { actual, repaso } = siguiente({ ...p, dificultad }, azar);
  if (p.fallado && !repaso.some((r) => r.objetivo === p.actual)) repaso.push({ objetivo: p.actual, faltan: REPASO });
  return { practica: { ...p, ...comun, actual, repaso, desde: ahora }, resultado: "acierto" };
}

// Lo que lleva la ronda, o lo que duró si ya terminó. 0 antes del «¡YA!»
export function tiempoDeRonda(p: Practica, ahora: number = Date.now()): number {
  if (p.inicio === null) return 0;
  return (p.fin ?? ahora) - p.inicio;
}
