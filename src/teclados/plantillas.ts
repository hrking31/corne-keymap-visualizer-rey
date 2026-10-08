// La capa Base que se crea al configurar un teclado nuevo, y la de ejemplo que ve un
// visitante sin cuenta.
import { DISTRIBUCIONES, textoDe } from "./distribuciones";
import type { Ajustes, CapaConfig, Idioma, SistemaOperativo, TeclaConfig, TecladoConfig } from "./tipos";

// Columnas exteriores y pulgares, como el teclado de ejemplo de ZMK para el Corne.
// Por número de posición: cada fila tiene la columna exterior izquierda (0, 12, 24) y la
// derecha (11, 23, 35); los pulgares son 36–41.
const EXTERIORES: Record<number, string> = {
  0: "TAB",
  11: "BSPC",
  12: "LCTRL",
  23: "SQT",
  24: "LSHFT",
  35: "ESC",
  36: "LGUI",
  38: "SPACE",
  39: "RET",
  41: "RALT",
};
// Las dos teclas de capa del ejemplo de ZMK, en naranja
const DE_CAPA: Record<number, string> = { 37: "LOWER", 40: "RAISE" };

const tecla = (texto: string, deCapa = false): TeclaConfig => ({ texto, descripcion: "", deCapa });

export function crearBase({ distribucion, idioma, so }: Ajustes): CapaConfig {
  const teclas: Record<string, TeclaConfig> = {};
  // Bloque de letras: en cada fila, las posiciones 1–10 (la 0 y la 11 son exteriores)
  DISTRIBUCIONES[distribucion].filas.forEach((fila, f) =>
    fila.forEach((codigo, c) => {
      teclas[f * 12 + 1 + c] = tecla(textoDe(codigo, idioma, so));
    }),
  );
  for (const [pos, codigo] of Object.entries(EXTERIORES)) teclas[pos] = tecla(textoDe(codigo, idioma, so));
  for (const [pos, nombre] of Object.entries(DE_CAPA)) teclas[pos] = tecla(nombre, true);
  return { corto: "BASE", largo: "Base", teclas };
}

// Un teclado nuevo: solo la capa Base y sin nombre (se muestra NOMBRE_POR_DEFECTO)
export function crearTeclado(ajustes: Ajustes, nombre = ""): TecladoConfig {
  return { nombre, ajustes, orden: ["base"], capas: { base: crearBase(ajustes) } };
}

// Lo que se ve arriba en la app: el nombre que puso el usuario o, si no puso ninguno
// (o no tiene cuenta), «Corne ZMK»
export const NOMBRE_POR_DEFECTO = "Corne ZMK";
export const nombreVisible = (teclado: Pick<TecladoConfig, "nombre">) =>
  teclado.nombre.trim() || NOMBRE_POR_DEFECTO;

// Ajustes de la Base de ejemplo para un visitante: QWERTY en el idioma y el sistema de su
// navegador (español de España solo si lo dice; cualquier otro español, Latinoamérica).
export function ajustesDelNavegador(idiomaNavegador: string, plataforma: string): Ajustes {
  const lengua = idiomaNavegador.toLowerCase();
  const idioma: Idioma = lengua.startsWith("es") ? (lengua === "es-es" ? "es-ES" : "es-LA") : "en-US";
  const p = plataforma.toLowerCase();
  const so: SistemaOperativo = /mac|iphone|ipad/.test(p) ? "macos" : /linux|android|cros/.test(p) ? "linux" : "windows";
  return { distribucion: "qwerty", idioma, so };
}
