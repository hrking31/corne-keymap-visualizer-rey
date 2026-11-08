// Convierte un .keymap leído en el teclado de la app (TecladoConfig), listo para guardar.
// - Cada capa del archivo es una capa de la app, en el mismo orden (la primera, Base).
// - El texto de cada tecla sale de lo que hace (&kp A → «A»). Solo se importa el .keymap:
//   un comportamiento que no es de ZMK (&mcr_git) es uno propio del usuario, definido en
//   otro archivo; se muestra con su nombre («GIT») y el usuario escribe qué hace. Lo que
//   está mal escrito (un código de tecla que no existe) se muestra tal cual y se avisa:
//   nunca se inventa.
// - Las descripciones que el usuario ya escribió se conservan, tecla por tecla, y también sus
//   leyendas personalizadas mientras la tecla siga haciendo lo mismo.
// - &trans muestra el texto de la capa desde la que se llega a esa (la que tiene el &mo,
//   &lt… que la activa; si no hay, Base), marcado como heredado (gris). Es lo que hace
//   ZMK: la tecla transparente deja pasar la de la capa activa de abajo.
import { LIMITES } from "../teclados/validar";
import type { CapaConfig, ModoCapa, TeclaConfig, TecladoConfig } from "../teclados/tipos";
import { textoDeCodigo } from "./codigos";
import { ErrorKeymap, type Binding, type KeymapLeido } from "./leer";

// Solo el Corne de 42 teclas, el único que dibuja la app
const TECLAS_POR_CAPA = 42;

type Traducida = {
  texto: string;
  heredada?: boolean;
  desconocido?: boolean;
  propio?: string;
  envia?: string; // el código de ZMK que envía al tocarla, si es una tecla (&kp, o el tocar de &mt, &lt…)
  abre?: { capa: number; modo: ModoCapa }; // la capa a la que lleva (su número en el archivo)
};

export type ResumenImportacion = {
  capas: string[]; // nombres cortos, en orden
  teclas: number; // teclas con algo que mostrar
  propios: string[]; // comportamientos del usuario (macros…): qué hacen se escribe en el editor
  desconocidos: { capa: string; pos: number; original: string }[];
  quitadas: string[]; // capas que tenía la app y el archivo ya no trae
};

type Contexto = {
  idioma: TecladoConfig["ajustes"]["idioma"];
  so: TecladoConfig["ajustes"]["so"];
  capas: string[];
  propios: KeymapLeido["propios"];
};

// Cada línea, como mucho 12 letras (una tecla de dos acciones lleva dos líneas)
const recortar = (texto: string) =>
  texto
    .split("\n")
    .map((linea) => linea.slice(0, 12))
    .join("\n")
    .slice(0, LIMITES.texto);

// Tocar arriba y mantener abajo, en dos líneas («CTRL+N» / «ALT+B»)
const dosLineas = (tocar: string, mantener: string) => `${tocar}\n${mantener}`;

// Una tecla: el código con sus modificadores, traducido al idioma y sistema del usuario
function tecla(codigo: string | undefined, ctx: Contexto): Traducida {
  if (!codigo) return { texto: "", desconocido: true };
  const { texto, conocido } = textoDeCodigo(codigo, ctx.idioma, ctx.so);
  const envia = codigo.replace(/\s+/g, "");
  return { texto, desconocido: !conocido, envia: conocido && envia.length <= LIMITES.envia ? envia : undefined };
}

const capa = (parametro: string | undefined, ctx: Contexto) => {
  const n = Number(parametro);
  return Number.isInteger(n) && ctx.capas[n] !== undefined ? ctx.capas[n] : `CAPA${parametro ?? "?"}`;
};

// A qué capa lleva, si el número es el de una capa del archivo
const abre = (parametro: string | undefined, modo: ModoCapa, ctx: Contexto): Traducida["abre"] => {
  const n = Number(parametro);
  return Number.isInteger(n) && ctx.capas[n] !== undefined ? { capa: n, modo } : undefined;
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

// Los comportamientos de serie de ZMK que se traducen arriba (un &algo que no está aquí
// ni en SIMPLES ni en OPCIONES es uno propio del usuario)
const DE_ZMK = new Set(["&kp", "&none", "&trans", "&mo", "&to", "&tog", "&sl", "&lt", "&mt", "&sk", "&kt", "&bt"]);

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
      return { texto: "" };
    case "&trans":
      return { texto: "", heredada: true };
    case "&mo":
      return { texto: capa(p1, ctx), abre: abre(p1, "mantener", ctx) };
    case "&to":
    case "&tog":
    case "&sl":
      return { texto: capa(p1, ctx), abre: abre(p1, "tocar", ctx) };
    case "&lt": {
      const tocar = tecla(p2, ctx);
      return {
        texto: dosLineas(tocar.texto, capa(p1, ctx)),
        desconocido: tocar.desconocido,
        envia: tocar.envia,
        abre: abre(p1, "mantener", ctx),
      };
    }
    case "&mt": {
      const [tocar, mantener] = [tecla(p2, ctx), tecla(p1, ctx)];
      return {
        texto: dosLineas(tocar.texto, mantener.texto),
        desconocido: tocar.desconocido || mantener.desconocido,
        envia: tocar.envia,
      };
    }
    case "&sk":
    case "&kt": {
      const t = tecla(p1, ctx);
      return { texto: `${b.comportamiento === "&sk" ? "SK" : "TOG"} ${t.texto}`, desconocido: t.desconocido };
    }
    case "&bt": {
      const n = Number(p2);
      if (p1 === "BT_SEL") return { texto: `BT${n + 1}` };
      if (p1 === "BT_DISC") return { texto: `BT${n + 1} OFF` };
      const bt: Record<string, string> = { BT_CLR: "BT CLR", BT_CLR_ALL: "BT CLR ALL", BT_NXT: "BT >", BT_PRV: "BT <" };
      if (p1 && bt[p1]) return { texto: bt[p1] };
      break;
    }
  }
  if (SIMPLES[b.comportamiento]) return { texto: SIMPLES[b.comportamiento] };
  const opcion = OPCIONES[b.comportamiento]?.[p1 ?? ""];
  if (opcion) return { texto: opcion };

  // Comportamientos que el .keymap define dentro (tocar/mantener…) y que se pueden traducir
  const nombre = b.comportamiento.replace(/^&/, "");
  const propio = ctx.propios[nombre];
  if (propio && profundidad < 3) {
    if (propio.tipo === "hold-tap" && propio.bindings.length >= 2) {
      // Como &mt y &lt: tocar arriba, mantener abajo
      const mantener = traducir({ ...propio.bindings[0], parametros: [p1 ?? ""] }, ctx, profundidad + 1);
      const tocar = traducir({ ...propio.bindings[1], parametros: [p2 ?? ""] }, ctx, profundidad + 1);
      return {
        texto: dosLineas(tocar.texto, mantener.texto),
        desconocido: tocar.desconocido || mantener.desconocido,
        envia: tocar.envia,
        // Mantenida, un &mo dentro lleva a su capa (si va en el tocar, se toca: &tog, &to…)
        abre: mantener.abre ? { ...mantener.abre, modo: "mantener" } : tocar.abre,
      };
    }
    if ((propio.tipo === "mod-morph" || propio.tipo === "tap-dance") && propio.bindings.length) {
      const opciones = propio.bindings.slice(0, 2).map((x) => traducir(x, ctx, profundidad + 1));
      return {
        texto: opciones.map((o) => o.texto).join("/"),
        desconocido: opciones.some((o) => o.desconocido),
        abre: opciones.find((o) => o.abre)?.abre,
      };
    }
  }
  // Uno de ZMK con una opción que no se conoce (mal escrita, o de una versión nueva): tal cual
  if (DE_ZMK.has(b.comportamiento) || SIMPLES[b.comportamiento] || OPCIONES[b.comportamiento]) {
    return { texto: b.original.replace(/^&/, ""), desconocido: true };
  }
  // Uno propio del usuario (una macro, casi siempre): su nombre sin el prefijo habitual,
  // «mcr_git» → «GIT», con sus parámetros si los lleva. Qué hace, lo escribe el usuario
  const visible = [nombre.replace(/^(mcr|macro|m)_/i, "").toUpperCase(), ...b.parametros].join(" ");
  return { texto: visible, propio: nombre };
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

  // Se reutilizan los ids de las capas que ya existían, en orden. La primera es siempre «base»
  const orden: string[] = [];
  for (let i = 0; i < leido.capas.length; i++) {
    let id = i === 0 ? "base" : actual.orden[i];
    if (!id) {
      let n = i;
      while (actual.capas[`capa${n}`] || orden.includes(`capa${n}`)) n++;
      id = `capa${n}`;
    }
    orden.push(id);
  }

  const resumen: ResumenImportacion = { capas: cortos, teclas: 0, propios: [], desconocidos: [], quitadas: [] };
  // El texto final de cada tecla, ya resuelto, para que &trans lo copie de la capa de abajo
  const textos: string[][] = [];
  const capas: Record<string, CapaConfig> = {};
  const filas = leido.capas.map((c) => c.bindings.map((b) => traducir(b, ctx)));

  leido.capas.forEach((c, i) => {
    const id = orden[i];
    const anterior = actual.capas[id];
    const fila = filas[i];
    const abajo = capaDeAbajo(leido, i);
    textos.push(fila.map((t, pos) => (t.heredada && abajo !== null ? textos[abajo][pos] : t.texto)));

    const teclas: Record<string, TeclaConfig> = {};
    fila.forEach((t, pos) => {
      const texto = textos[i][pos];
      if (t.desconocido) resumen.desconocidos.push({ capa: cortos[i], pos, original: c.bindings[pos].original });
      if (t.propio && !resumen.propios.includes(t.propio)) resumen.propios.push(t.propio);

      const previa = anterior?.teclas[pos];
      const leyenda = recortar(texto);
      const tecla: TeclaConfig = { texto: leyenda, descripcion: previa?.descripcion ?? "" };
      // Una leyenda personalizada se queda mientras el .keymap dé la misma de antes en esa
      // tecla; si da otra, la tecla ya hace otra cosa y manda la del archivo
      if (previa?.leyendaKeymap !== undefined && previa.leyendaKeymap === leyenda) {
        tecla.texto = previa.texto;
        tecla.leyendaKeymap = leyenda;
      }
      if (t.heredada) tecla.heredada = true;
      // Queda marcada en el teclado hasta que se corrija el .keymap o se edite a mano
      if (t.desconocido) tecla.sinReconocer = c.bindings[pos].original;
      else if (t.envia) tecla.envia = t.envia;
      // Una tecla que lleva a su propia capa no sirve para llegar a ella
      if (t.abre && t.abre.capa !== i) tecla.abre = { capa: orden[t.abre.capa], modo: t.abre.modo };
      if (!tecla.texto && !tecla.descripcion && !tecla.abre) return;
      if (tecla.texto) resumen.teclas++;
      teclas[pos] = tecla;
    });

    capas[id] = {
      corto: cortos[i],
      largo: anterior ? anterior.largo : i === 0 ? "Base" : nombreLargo(c.nombre, cortos[i]),
      teclas,
    };
  });

  ponerCombinaciones(leido, filas, orden, capas, actual);

  resumen.quitadas = actual.orden.slice(leido.capas.length).map((id) => actual.capas[id]?.corto ?? id);
  // Los ajustes, solo con lo que existe hoy (idioma y sistema): el teclado se guarda entero
  return { teclado: { ...actual, ajustes: { idioma: ctx.idioma, so: ctx.so }, orden, capas }, resumen };
}

// Las capas por combinación (conditional_layers: LOWER + RAISE → ADJUST). En ZMK, con LOWER
// mantenida, la tecla de RAISE (casi siempre un &trans en LOWER, que deja pasar el &mo de
// abajo) activa RAISE, y con las dos activas se enciende ADJUST. Se anota en esa tecla de
// LOWER, y en la de LOWER dentro de RAISE, que lleva a ADJUST manteniendo las dos juntas.
// Solo combinaciones de dos capas, la forma estándar; las de más se ignoran.
function ponerCombinaciones(
  leido: KeymapLeido,
  filas: Traducida[][],
  orden: string[],
  capas: Record<string, CapaConfig>,
  actual: TecladoConfig,
) {
  for (const { si, entonces } of leido.combinaciones) {
    if (si.length !== 2 || si[0] === si[1] || !orden[entonces] || si.some((n) => !orden[n])) continue;
    for (const [desde, otra] of [si, [si[1], si[0]]]) {
      if (desde === entonces) continue;
      // Las posiciones donde alguna capa tiene una tecla que lleva a `otra`
      const posiciones = new Set<number>();
      filas.forEach((fila) => fila.forEach((t, pos) => t.abre?.capa === otra && posiciones.add(pos)));
      for (const pos of posiciones) {
        const t = filas[desde][pos];
        // En `desde`, esa tecla tiene que dejar pasar la de abajo o llevar también a `otra`
        if (!t.heredada && t.abre?.capa !== otra) continue;
        const id = orden[desde];
        const tecla = capas[id].teclas[pos] ?? { texto: "", descripcion: actual.capas[id]?.teclas[pos]?.descripcion ?? "" };
        capas[id].teclas[pos] = { ...tecla, abre: { capa: orden[entonces], modo: "juntas" } };
      }
    }
  }
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
