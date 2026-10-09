// Las distribuciones se describen como lo que envía el teclado (los códigos de ZMK:
// Q, SEMI, SQT…), no como lo que se ve. Lo que se ve depende del idioma que tenga
// configurado el sistema: el mismo SEMI se ve «;» en inglés y «Ñ» en español. Así una
// distribución sirve para los tres idiomas sin repetirla.
import type { Distribucion, Idioma, SistemaOperativo } from "./tipos";

// Las 30 teclas del bloque de letras (3 filas × 10, de izquierda a derecha, las dos
// mitades seguidas), como códigos de ZMK.
export const DISTRIBUCIONES: Record<Distribucion, { nombre: string; filas: string[][] }> = {
  qwerty: {
    nombre: "QWERTY",
    filas: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "SEMI"],
      ["Z", "X", "C", "V", "B", "N", "M", "COMMA", "DOT", "FSLH"],
    ],
  },
  "colemak-dh": {
    nombre: "Colemak-DH",
    filas: [
      ["Q", "W", "F", "P", "B", "J", "L", "U", "Y", "SEMI"],
      ["A", "R", "S", "T", "G", "M", "N", "E", "I", "O"],
      ["Z", "X", "C", "D", "V", "K", "H", "COMMA", "DOT", "FSLH"],
    ],
  },
  colemak: {
    nombre: "Colemak",
    filas: [
      ["Q", "W", "F", "P", "G", "J", "L", "U", "Y", "SEMI"],
      ["A", "R", "S", "T", "D", "H", "N", "E", "I", "O"],
      ["Z", "X", "C", "V", "B", "K", "M", "COMMA", "DOT", "FSLH"],
    ],
  },
  dvorak: {
    nombre: "Dvorak",
    filas: [
      ["SQT", "COMMA", "DOT", "P", "Y", "F", "G", "C", "R", "L"],
      ["A", "O", "E", "U", "I", "D", "H", "T", "N", "S"],
      ["SEMI", "Q", "J", "K", "X", "B", "M", "W", "V", "Z"],
    ],
  },
};

export const IDIOMAS: Record<Idioma, string> = {
  "es-LA": "Español (Latinoamérica)",
  "es-ES": "Español (España)",
  "en-US": "Inglés (EE. UU.)",
};

export const SISTEMAS: Record<SistemaOperativo, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

// Lo que se ve en la tecla para cada código que no es una letra, según el idioma del
// sistema. Las letras se ven igual en los tres (la Ñ del español está en SEMI).
const SIMBOLOS: Record<string, Record<Idioma, string>> = {
  SEMI: { "en-US": ";", "es-LA": "Ñ", "es-ES": "Ñ" },
  SQT: { "en-US": "'", "es-LA": "{", "es-ES": "´" },
  COMMA: { "en-US": ",", "es-LA": ",", "es-ES": "," },
  DOT: { "en-US": ".", "es-LA": ".", "es-ES": "." },
  FSLH: { "en-US": "/", "es-LA": "-", "es-ES": "-" },
};

// Modificadores: el mismo código tiene otro nombre en cada sistema
const MODIFICADORES: Record<string, Record<SistemaOperativo, string>> = {
  LGUI: { windows: "WIN", macos: "CMD", linux: "SUPER" },
  LALT: { windows: "ALT", macos: "OPT", linux: "ALT" },
  RALT: { windows: "ALT", macos: "OPT", linux: "ALT" },
};

// El texto que se ve en una tecla para un código de ZMK. Falla si el código no se conoce:
// mejor un error claro que una tecla con un texto inventado.
export function textoDe(codigo: string, idioma: Idioma, so: SistemaOperativo): string {
  if (/^[A-Z]$/.test(codigo)) return codigo;
  if (SIMBOLOS[codigo]) return SIMBOLOS[codigo][idioma];
  if (MODIFICADORES[codigo]) return MODIFICADORES[codigo][so];
  const fijos: Record<string, string> = {
    TAB: "TAB",
    LCTRL: "CTRL",
    LSHFT: "SHIFT",
    BSPC: "BSPC",
    ESC: "ESC",
    SPACE: "SPC",
    RET: "ENT",
  };
  if (fijos[codigo]) return fijos[codigo];
  throw new Error(`Código de tecla desconocido: ${codigo}`);
}
