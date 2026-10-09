// Convierte un .keymap leído en el teclado de la app (TecladoConfig), listo para guardar.
// - Cada capa del archivo es una capa de la app, en el mismo orden (la primera, Base).
// - El texto de cada tecla sale de lo que hace (&kp A → «A»); lo que no se reconoce se
//   muestra tal cual y se avisa en el resumen: nunca se inventa.
// - Las descripciones que el usuario ya escribió se conservan, tecla por tecla.
// - &trans muestra el texto de la capa desde la que se llega a esa (la que tiene el &mo,
//   &lt… que la activa; si no hay, Base), marcado como heredado (gris). Es lo que hace
//   ZMK: la tecla transparente deja pasar la de la capa activa de abajo.
import { LIMITES } from "../teclados/validar";
import type { CapaConfig, TeclaConfig, TecladoConfig } from "../teclados/tipos";
import { textoDeCodigo } from "./codigos";
import { ErrorKeymap, type Binding, type KeymapLeido } from "./leer";

// Solo el Corne de 42 teclas, el único que dibuja la app
export const TECLAS_POR_CAPA = 42;

type Traducida = { texto: string; deCapa: boolean; heredada?: boolean; desconocido?: boolean; macro?: string };

export type ResumenImportacion = {
  capas: string[]; // nombres cortos, en orden
  teclas: number; // teclas con algo que mostrar
  macros: string[]; // macros del usuario: su descripción se escribe en el editor
  desconocidos: { capa: string; pos: number; original: string }[];
  quitadas: string[]; // capas que tenía la app y el archivo ya no trae
};

type Contexto = {
  idioma: TecladoConfig["ajustes"]["idioma"];
  so: TecladoConfig["ajustes"]["so"];
  capas: string[];
  propios: KeymapLeido["propios"];
};

const recortar = (texto: string) => texto.slice(0, LIMITES.texto);

// Una tecla: el código con sus modificadores, traducido al idioma y sistema del usuario
function tecla(codigo: string | undefined, ctx: Contexto): Traducida {
  if (!codigo) return { texto: "", deCapa: false, desconocido: true };
  const { texto, conocido } = textoDeCodigo(codigo, ctx.idioma, ctx.so);
  return { texto, deCapa: false, desconocido: !conocido };
}

const capa = (parametro: string | undefined, ctx: Contexto) => {
  const n = Number(parametro);
  return Number.isInteger(n) && ctx.capas[n] !== undefined ? ctx.capas[n] : `CAPA${parametro ?? "?"}`;
};

// Las opciones de los comportamientos estándar de ZMK que no son teclas
const OPCIONES: Record<string, Record<string, string>> = {
  "&out": { OUT_TOG: "USB/BT", OUT_USB: "USB", OUT_BLE: "BT" },
  "&rgb_ug": {
    RGB_TOG: "RGB", RGB_ON: "RGB ON", RGB_OFF: "RGB OFF", RGB_HUI: "HUE+", RGB_HUD: "HUE-",
    RGB_SAI: "SAT+", RGB_SAD: "SAT-", RGB_BRI: "BRI+", RGB_BRD: "BRI-", RGB_SPI: "SPD+",
    RGB_SPD: "SPD-", RGB_EFF: "EFF+", RGB_EFR: "EFF-",
  },
  "&bl": { BL_TOG: "BL", BL_ON: "BL ON", BL_OFF: "BL OFF", BL_INC: "BL+", BL_DEC: "BL-", BL_CYCLE: "BL CICLO" },
  "&ext_power": { EP_TOG: "EXT PWR", EP_ON: "EXT ON", EP_OFF: "EXT OFF" },
  "&mkp": { LCLK: "CLIC", RCLK: "CLIC DER", MCLK: "CLIC MED", MB1: "CLIC", MB2: "CLIC DER", MB3: "CLIC MED", MB4: "ATRÁS", MB5: "ADELANTE" },
  "&mmv": { MOVE_UP: "MOUSE ↑", MOVE_DOWN: "MOUSE ↓", MOVE_LEFT: "MOUSE ←", MOVE_RIGHT: "MOUSE →" },
  "&msc": { SCRL_UP: "SCROLL ↑", SCRL_DOWN: "SCROLL ↓", SCRL_LEFT: "SCROLL ←", SCRL_RIGHT: "SCROLL →" },
};

// Comportamientos sin parámetros
const SIMPLES: Record<string, string> = {
  "&caps_word": "CAPS W", "&key_repeat": "REPEAT", "&sys_reset": "RESET", "&bootloader": "BOOT",
  "&studio_unlock": "STUDIO", "&soft_off": "APAGAR", "&gresc": "ESC",
};

function traducir(b: Binding, ctx: Contexto, profundidad = 0): Traducida {
  const [p1, p2] = b.parametros;
  switch (b.comportamiento) {
    case "&kp":
      return tecla(p1, ctx);
    case "&none":
      return { texto: "", deCapa: false };
    case "&trans":
      return { texto: "", deCapa: false, heredada: true };
    case "&mo":
    case "&to":
    case "&tog":
    case "&sl":
      return { texto: capa(p1, ctx), deCapa: true };
    case "&lt":
      return { texto: `${tecla(p2, ctx).texto}/${capa(p1, ctx)}`, deCapa: true };
    case "&mt":
      return { texto: `${tecla(p2, ctx).texto}/${tecla(p1, ctx).texto}`, deCapa: false };
    case "&sk":
      return { texto: `SK ${tecla(p1, ctx).texto}`, deCapa: false };
    case "&kt":
      return { texto: `TOG ${tecla(p1, ctx).texto}`, deCapa: false };
    case "&bt": {
      const n = Number(p2);
      if (p1 === "BT_SEL") return { texto: `BT${n + 1}`, deCapa: false };
      if (p1 === "BT_DISC") return { texto: `BT${n + 1} OFF`, deCapa: false };
      const bt: Record<string, string> = { BT_CLR: "BT CLR", BT_CLR_ALL: "BT CLR ALL", BT_NXT: "BT >", BT_PRV: "BT <" };
      if (p1 && bt[p1]) return { texto: bt[p1], deCapa: false };
      break;
    }
  }
  if (SIMPLES[b.comportamiento]) return { texto: SIMPLES[b.comportamiento], deCapa: false };
  const opcion = OPCIONES[b.comportamiento]?.[p1 ?? ""];
  if (opcion) return { texto: opcion, deCapa: false };

  // Comportamientos que define el propio archivo
  const nombre = b.comportamiento.replace(/^&/, "");
  const propio = ctx.propios[nombre];
  if (propio && profundidad < 3) {
    if (propio.tipo === "macro") {
      // «mcr_git» → «GIT»: el nombre sin el prefijo habitual. Qué hace, lo escribe el usuario
      return { texto: nombre.replace(/^(mcr|macro|m)_/i, "").toUpperCase(), deCapa: false, macro: nombre };
    }
    if (propio.tipo === "hold-tap" && propio.bindings.length >= 2) {
      // Como &mt y &lt: «tocar/mantener»
      const mantener = traducir({ ...propio.bindings[0], parametros: [p1 ?? ""] }, ctx, profundidad + 1);
      const tocar = traducir({ ...propio.bindings[1], parametros: [p2 ?? ""] }, ctx, profundidad + 1);
      return { texto: `${tocar.texto}/${mantener.texto}`, deCapa: mantener.deCapa || tocar.deCapa };
    }
    if ((propio.tipo === "mod-morph" || propio.tipo === "tap-dance") && propio.bindings.length) {
      const opciones = propio.bindings.slice(0, 2).map((x) => traducir(x, ctx, profundidad + 1));
      return { texto: opciones.map((o) => o.texto).join("/"), deCapa: opciones.some((o) => o.deCapa) };
    }
  }
  // Desconocido: tal cual, sin «&»
  return { texto: b.original.replace(/^&/, ""), deCapa: false, desconocido: true };
}

// El nombre corto de una capa: la primera es siempre BASE; las demás, su nombre del archivo
// sin «layer» («Lower Layer» → «LOWER», «number_layer» → «NUMBER»), en mayúsculas
function nombreCorto(nombre: string, indice: number, usados: Set<string>): string {
  if (indice === 0) return "BASE";
  let corto = nombre.replace(/[_\s-]*layer$/i, "").replace(/[_-]+/g, " ").trim().toUpperCase();
  corto = corto.slice(0, LIMITES.corto).trim() || `CAPA${indice}`;
  while (usados.has(corto)) corto = `${corto.slice(0, LIMITES.corto - 1)}${indice}`;
  usados.add(corto);
  return corto;
}

// El nombre largo de una capa nueva: el del archivo, si dice más que el corto («Lower Layer»)
function nombreLargo(nombre: string, corto: string): string {
  const limpio = nombre.replace(/[_-]+/g, " ").trim();
  return limpio.toUpperCase() === corto ? "" : limpio.slice(0, LIMITES.largo);
}

export function importarKeymap(
  leido: KeymapLeido,
  actual: TecladoConfig,
): { teclado: TecladoConfig; resumen: ResumenImportacion } {
  if (leido.capas.length > LIMITES.capas) {
    throw new ErrorKeymap(`El archivo tiene ${leido.capas.length} capas y la app admite ${LIMITES.capas} como máximo.`);
  }
  const otra = leido.capas.find((c) => c.bindings.length !== TECLAS_POR_CAPA);
  if (otra) {
    throw new ErrorKeymap(
      `La capa «${otra.nombre}» tiene ${otra.bindings.length} teclas. La app solo admite el Corne de ${TECLAS_POR_CAPA} teclas.`,
    );
  }

  const usados = new Set<string>(["BASE"]);
  const cortos = leido.capas.map((c, i) => nombreCorto(c.nombre, i, usados));
  const ctx: Contexto = { idioma: actual.ajustes.idioma, so: actual.ajustes.so, capas: cortos, propios: leido.propios };

  // Se reutilizan los ids de las capas que ya existían, en orden (Base primero)
  const orden: string[] = [];
  for (let i = 0; i < leido.capas.length; i++) {
    let id = actual.orden[i];
    if (!id) {
      let n = i;
      while (actual.capas[`capa${n}`] || orden.includes(`capa${n}`)) n++;
      id = `capa${n}`;
    }
    orden.push(id);
  }

  const resumen: ResumenImportacion = { capas: cortos, teclas: 0, macros: [], desconocidos: [], quitadas: [] };
  // El texto final de cada tecla, ya resuelto, para que &trans lo copie de la capa de abajo
  const textos: string[][] = [];
  const capas: Record<string, CapaConfig> = {};

  leido.capas.forEach((c, i) => {
    const id = orden[i];
    const anterior = actual.capas[id];
    const fila = c.bindings.map((b) => traducir(b, ctx));
    const abajo = capaDeAbajo(leido, i);
    textos.push(fila.map((t, pos) => (t.heredada && abajo !== null ? textos[abajo][pos] : t.texto)));

    const teclas: Record<string, TeclaConfig> = {};
    fila.forEach((t, pos) => {
      const texto = textos[i][pos];
      if (t.desconocido) resumen.desconocidos.push({ capa: cortos[i], pos, original: c.bindings[pos].original });
      if (t.macro && !resumen.macros.includes(t.macro)) resumen.macros.push(t.macro);

      const descripcion = anterior?.teclas[pos]?.descripcion ?? "";
      const tecla: TeclaConfig = { texto: recortar(texto), descripcion, deCapa: t.deCapa };
      if (t.heredada) tecla.heredada = true;
      if (!tecla.texto && !tecla.descripcion && !tecla.deCapa) return;
      if (tecla.texto) resumen.teclas++;
      teclas[pos] = tecla;
    });

    capas[id] = {
      corto: cortos[i],
      largo: anterior ? anterior.largo : i === 0 ? "" : nombreLargo(c.nombre, cortos[i]),
      teclas,
    };
  });

  resumen.quitadas = actual.orden.slice(leido.capas.length).map((id) => actual.capas[id]?.corto ?? id);
  return { teclado: { ...actual, orden, capas }, resumen };
}

// La capa desde la que se activa la capa `i` (la de menor número que la nombra en un &mo,
// &lt, &to, &tog, &sl o un tocar/mantener); si ninguna lo hace, Base. null para Base.
function capaDeAbajo(leido: KeymapLeido, i: number): number | null {
  if (i === 0) return null;
  const deCapa = new Set(["&mo", "&lt", "&to", "&tog", "&sl"]);
  for (let j = 0; j < i; j++) {
    const activa = leido.capas[j].bindings.some((b) => {
      if (deCapa.has(b.comportamiento)) return Number(b.parametros[0]) === i;
      const propio = leido.propios[b.comportamiento.replace(/^&/, "")];
      return propio?.tipo === "hold-tap" && deCapa.has(propio.bindings[0]?.comportamiento) && Number(b.parametros[0]) === i;
    });
    if (activa) return j;
  }
  return 0;
}
