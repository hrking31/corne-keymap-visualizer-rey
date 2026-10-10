// Los códigos de tecla de ZMK (dt-bindings/zmk/keys.h) y lo que se ve en la tecla.
// El teclado envía la POSICIÓN de una tecla de un teclado estadounidense; lo que se escribe
// depende del idioma configurado en el sistema: SEMI escribe «;» en inglés y «Ñ» en
// español. Por eso los símbolos se traducen según el idioma, y los modificadores según el
// sistema operativo (la tecla GUI es WIN, CMD o SUPER).
import type { Idioma, SistemaOperativo } from "../teclados/tipos";

// Nombres alternativos de ZMK → el nombre corto que usan las tablas
const ALIAS: Record<string, string> = {
  NUMBER_1: "N1", NUMBER_2: "N2", NUMBER_3: "N3", NUMBER_4: "N4", NUMBER_5: "N5",
  NUMBER_6: "N6", NUMBER_7: "N7", NUMBER_8: "N8", NUMBER_9: "N9", NUMBER_0: "N0",
  SEMICOLON: "SEMI", APOSTROPHE: "SQT", APOS: "SQT", SINGLE_QUOTE: "SQT",
  LEFT_BRACKET: "LBKT", RIGHT_BRACKET: "RBKT", BACKSLASH: "BSLH", SLASH: "FSLH",
  PERIOD: "DOT", NON_US_BACKSLASH: "NUBS", NON_US_BSLH: "NUBS", NON_US_HASH: "NUHS",
  RETURN: "RET", ENTER: "RET", ESCAPE: "ESC", BACKSPACE: "BSPC", DELETE: "DEL",
  INSERT: "INS", SPC: "SPACE", PAGE_UP: "PG_UP", PAGE_DOWN: "PG_DN",
  LEFT_ARROW: "LEFT", RIGHT_ARROW: "RIGHT", UP_ARROW: "UP", DOWN_ARROW: "DOWN",
  CAPSLOCK: "CAPS", CLCK: "CAPS", PRINTSCREEN: "PSCRN", SCROLLLOCK: "SLCK",
  PAUSE_BREAK: "PAUSE", K_CONTEXT_MENU: "K_APP",
  LSHIFT: "LSHFT", LEFT_SHIFT: "LSHFT", RSHIFT: "RSHFT", RIGHT_SHIFT: "RSHFT",
  LCTL: "LCTRL", LEFT_CONTROL: "LCTRL", RCTL: "RCTRL", RIGHT_CONTROL: "RCTRL",
  LEFT_ALT: "LALT", RIGHT_ALT: "RALT",
  LWIN: "LGUI", LCMD: "LGUI", LMETA: "LGUI", LEFT_GUI: "LGUI", LEFT_WIN: "LGUI",
  LEFT_COMMAND: "LGUI", LEFT_META: "LGUI",
  RWIN: "RGUI", RCMD: "RGUI", RMETA: "RGUI", RIGHT_GUI: "RGUI", RIGHT_WIN: "RGUI",
  RIGHT_COMMAND: "RGUI", RIGHT_META: "RGUI",
  C_VOLUME_UP: "C_VOL_UP", C_VOLUME_DOWN: "C_VOL_DN", C_PLAY_PAUSE: "C_PP",
  C_NEXT_TRACK: "C_NEXT", C_PREVIOUS: "C_PREV", C_PREVIOUS_TRACK: "C_PREV",
  C_BRIGHTNESS_INC: "C_BRI_UP", C_BRI_INC: "C_BRI_UP", C_BRIGHTNESS_DEC: "C_BRI_DN",
  C_BRI_DEC: "C_BRI_DN", K_MUTE: "C_MUTE", K_VOLUME_UP: "C_VOL_UP", K_VOLUME_DOWN: "C_VOL_DN",
  KP_NUMBER_1: "KP_N1", KP_NUMBER_2: "KP_N2", KP_NUMBER_3: "KP_N3", KP_NUMBER_4: "KP_N4",
  KP_NUMBER_5: "KP_N5", KP_NUMBER_6: "KP_N6", KP_NUMBER_7: "KP_N7", KP_NUMBER_8: "KP_N8",
  KP_NUMBER_9: "KP_N9", KP_NUMBER_0: "KP_N0", KP_ASTERISK: "KP_MULTIPLY", KP_SLASH: "KP_DIVIDE",
  KP_SUBTRACT: "KP_MINUS", KP_PERIOD: "KP_DOT", KP_RETURN: "KP_ENTER", KP_NUMLOCK: "KP_NLCK",
  KP_NUM: "KP_NLCK",
};

// Teclas de símbolo: [sin shift, con shift] en cada idioma
const SIMBOLOS: Record<string, Record<Idioma, [string, string]>> = {
  N1: { "en-US": ["1", "!"], "es-LA": ["1", "!"], "es-ES": ["1", "!"] },
  N2: { "en-US": ["2", "@"], "es-LA": ["2", '"'], "es-ES": ["2", '"'] },
  N3: { "en-US": ["3", "#"], "es-LA": ["3", "#"], "es-ES": ["3", "·"] },
  N4: { "en-US": ["4", "$"], "es-LA": ["4", "$"], "es-ES": ["4", "$"] },
  N5: { "en-US": ["5", "%"], "es-LA": ["5", "%"], "es-ES": ["5", "%"] },
  N6: { "en-US": ["6", "^"], "es-LA": ["6", "&"], "es-ES": ["6", "&"] },
  N7: { "en-US": ["7", "&"], "es-LA": ["7", "/"], "es-ES": ["7", "/"] },
  N8: { "en-US": ["8", "*"], "es-LA": ["8", "("], "es-ES": ["8", "("] },
  N9: { "en-US": ["9", "("], "es-LA": ["9", ")"], "es-ES": ["9", ")"] },
  N0: { "en-US": ["0", ")"], "es-LA": ["0", "="], "es-ES": ["0", "="] },
  MINUS: { "en-US": ["-", "_"], "es-LA": ["'", "?"], "es-ES": ["'", "?"] },
  EQUAL: { "en-US": ["=", "+"], "es-LA": ["¿", "¡"], "es-ES": ["¡", "¿"] },
  LBKT: { "en-US": ["[", "{"], "es-LA": ["´", "¨"], "es-ES": ["`", "^"] },
  RBKT: { "en-US": ["]", "}"], "es-LA": ["+", "*"], "es-ES": ["+", "*"] },
  BSLH: { "en-US": ["\\", "|"], "es-LA": ["}", "]"], "es-ES": ["ç", "Ç"] },
  NUHS: { "en-US": ["#", "~"], "es-LA": ["}", "]"], "es-ES": ["ç", "Ç"] },
  SEMI: { "en-US": [";", ":"], "es-LA": ["Ñ", "Ñ"], "es-ES": ["Ñ", "Ñ"] },
  SQT: { "en-US": ["'", '"'], "es-LA": ["{", "["], "es-ES": ["´", "¨"] },
  GRAVE: { "en-US": ["`", "~"], "es-LA": ["|", "°"], "es-ES": ["º", "ª"] },
  COMMA: { "en-US": [",", "<"], "es-LA": [",", ";"], "es-ES": [",", ";"] },
  DOT: { "en-US": [".", ">"], "es-LA": [".", ":"], "es-ES": [".", ":"] },
  FSLH: { "en-US": ["/", "?"], "es-LA": ["-", "_"], "es-ES": ["-", "_"] },
  NUBS: { "en-US": ["\\", "|"], "es-LA": ["<", ">"], "es-ES": ["<", ">"] },
};

// Los símbolos con nombre propio de ZMK son la tecla de abajo con shift (EXCL = LS(N1))
const CON_SHIFT: Record<string, string> = {
  EXCL: "N1", EXCLAMATION: "N1", AT: "N2", AT_SIGN: "N2", HASH: "N3", POUND: "N3",
  DLLR: "N4", DOLLAR: "N4", PRCNT: "N5", PERCENT: "N5", CARET: "N6", AMPS: "N7",
  AMPERSAND: "N7", ASTRK: "N8", ASTERISK: "N8", STAR: "N8", LPAR: "N9",
  LEFT_PARENTHESIS: "N9", RPAR: "N0", RIGHT_PARENTHESIS: "N0", UNDER: "MINUS",
  UNDERSCORE: "MINUS", PLUS: "EQUAL", LBRC: "LBKT", LEFT_BRACE: "LBKT", RBRC: "RBKT",
  RIGHT_BRACE: "RBKT", PIPE: "BSLH", COLON: "SEMI", DQT: "SQT", DOUBLE_QUOTES: "SQT",
  TILDE: "GRAVE", LT: "COMMA", LESS_THAN: "COMMA", GT: "DOT", GREATER_THAN: "DOT",
  QMARK: "FSLH", QUESTION: "FSLH", PIPE2: "NUBS", TILDE2: "NUHS",
};

// AltGr (la Alt derecha) escribe otros símbolos en los teclados en español
const ALTGR: Record<Idioma, Record<string, string>> = {
  "en-US": {},
  "es-LA": { Q: "@", GRAVE: "¬", MINUS: "\\", SQT: "^", BSLH: "`", RBKT: "~" },
  "es-ES": {
    N1: "|", N2: "@", N3: "#", N4: "~", N6: "¬", E: "€", GRAVE: "\\",
    LBKT: "[", RBKT: "]", SQT: "{", BSLH: "}",
  },
};

// Teclas que se ven igual en cualquier idioma
const FIJAS: Record<string, string> = {
  RET: "ENT", ESC: "ESC", BSPC: "BSPC", TAB: "TAB", SPACE: "SPC", DEL: "DEL", INS: "INS",
  HOME: "HOME", END: "END", PG_UP: "PG UP", PG_DN: "PG DN", LEFT: "LEFT", RIGHT: "RIGHT",
  UP: "UP", DOWN: "DOWN", CAPS: "CAPS", PSCRN: "PRT SC", SLCK: "SCR LK", PAUSE: "PAUSE",
  K_APP: "MENU",
  C_VOL_UP: "VOL+", C_VOL_DN: "VOL-", C_MUTE: "MUTE", C_PP: "P/P", C_NEXT: "NXT",
  C_PREV: "PRV", C_STOP: "STOP", C_BRI_UP: "BRI+", C_BRI_DN: "BRI-",
  KP_PLUS: "+", KP_MINUS: "-", KP_MULTIPLY: "*", KP_DIVIDE: "/", KP_DOT: ".",
  KP_ENTER: "ENT", KP_EQUAL: "=", KP_NLCK: "NUM LK", KP_COMMA: ",",
};

type Modificador = "CTRL" | "SHIFT" | "ALT" | "ALTGR" | "GUI";

// Funciones de modificador de ZMK: LC(X) = Ctrl + X, RA(X) = AltGr + X…
const FUNCIONES: Record<string, Modificador> = {
  LC: "CTRL", RC: "CTRL", LS: "SHIFT", RS: "SHIFT", LA: "ALT", RA: "ALTGR", LG: "GUI", RG: "GUI",
};

const MODIFICADORES: Record<string, Modificador> = {
  LCTRL: "CTRL", RCTRL: "CTRL", LSHFT: "SHIFT", RSHFT: "SHIFT", LALT: "ALT", RALT: "ALTGR",
  LGUI: "GUI", RGUI: "GUI",
};

function nombreModificador(m: Modificador, idioma: Idioma, so: SistemaOperativo): string {
  if (m === "GUI") return { windows: "WIN", macos: "CMD", linux: "SUPER" }[so];
  if (m === "ALT") return so === "macos" ? "OPT" : "ALT";
  // La Alt derecha es AltGr en los teclados en español (en Mac, Option igual)
  if (m === "ALTGR") return so === "macos" ? "OPT" : idioma === "en-US" ? "ALT" : "ALTGR";
  return m;
}

// Lee «LC(LS(Z))» → modificadores [CTRL, SHIFT] y tecla «Z»
function separar(codigo: string): { mods: Modificador[]; tecla: string } {
  const mods: Modificador[] = [];
  let resto = codigo.replace(/\s+/g, "");
  for (;;) {
    const m = /^([A-Z]{2})\((.*)\)$/.exec(resto);
    if (!m || !FUNCIONES[m[1]]) break;
    mods.push(FUNCIONES[m[1]]);
    resto = m[2];
  }
  return { mods, tecla: ALIAS[resto] ?? resto };
}

// El texto de una tecla sola (sin modificadores), o null si el código no se conoce
function textoSimple(tecla: string, idioma: Idioma, so: SistemaOperativo, shift = false): string | null {
  if (/^[A-Z]$/.test(tecla)) return tecla;
  if (SIMBOLOS[tecla]) return SIMBOLOS[tecla][idioma][shift ? 1 : 0];
  if (CON_SHIFT[tecla]) return SIMBOLOS[CON_SHIFT[tecla]][idioma][1];
  if (MODIFICADORES[tecla]) return nombreModificador(MODIFICADORES[tecla], idioma, so);
  if (FIJAS[tecla]) return FIJAS[tecla];
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(tecla)) return tecla;
  const kp = /^KP_N([0-9])$/.exec(tecla);
  if (kp) return kp[1];
  return null;
}

// Lo que se ve en la tecla para un código de ZMK, con sus modificadores. `conocido` es
// false si el código no está en las tablas: entonces se muestra tal cual.
export function textoDeCodigo(
  codigo: string,
  idioma: Idioma,
  so: SistemaOperativo,
): { texto: string; conocido: boolean } {
  const { mods, tecla } = separar(codigo);
  const unicos = [...new Set(mods)];

  // Solo shift sobre un símbolo: el símbolo de arriba de esa tecla (LS(N1) → «!»)
  if (unicos.length === 1 && unicos[0] === "SHIFT") {
    const conShift = textoSimple(tecla, idioma, so, true);
    if (conShift !== null && (SIMBOLOS[tecla] || /^[A-Z]$/.test(tecla))) return { texto: conShift, conocido: true };
  }
  // Solo AltGr, en un teclado que lo usa para ese símbolo (RA(Q) → «@» en Latinoamérica)
  if (unicos.length === 1 && unicos[0] === "ALTGR" && ALTGR[idioma][tecla]) {
    return { texto: ALTGR[idioma][tecla], conocido: true };
  }

  const base = textoSimple(tecla, idioma, so);
  if (base === null) return { texto: codigo, conocido: false };
  if (!unicos.length) return { texto: base, conocido: true };
  // Ctrl + C → «CTRL+C»; con varios modificadores se acortan para que quepa
  const nombres = unicos.map((m) => nombreModificador(m, idioma, so));
  const largo = [...nombres, base].join("+");
  const texto = largo.length <= 12 ? largo : [...nombres.map((n) => n.slice(0, 1)), base].join("+");
  return { texto, conocido: true };
}
