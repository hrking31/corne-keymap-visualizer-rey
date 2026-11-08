// Lo básico de un teclado: los idiomas y sistemas que se pueden elegir, el teclado vacío
// sobre el que se importa el .keymap y el nombre que se ve arriba.
import type { Ajustes, Idioma, SistemaOperativo, TecladoConfig } from "./tipos";

// El idioma del sistema decide qué se ve en cada tecla: el mismo SEMI es «;» en inglés y
// «Ñ» en español. El sistema, el nombre de los modificadores (WIN, CMD o SUPER)
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

// Sin capas: el .keymap las trae todas (importarKeymap)
export function tecladoVacio(ajustes: Ajustes, nombre = ""): TecladoConfig {
  return { nombre, ajustes, orden: [], capas: {} };
}

// El título de arriba en la app: «Corne ZMK», con el nombre que puso el usuario en medio
// («Rey» → «Corne Rey ZMK»). Sin nombre (o sin cuenta), solo «Corne ZMK»
const NOMBRE_POR_DEFECTO = "Corne ZMK";
export function nombreVisible(teclado: Pick<TecladoConfig, "nombre">) {
  const nombre = teclado.nombre.trim();
  return nombre ? `Corne ${nombre} ZMK` : NOMBRE_POR_DEFECTO;
}

// El idioma y el sistema del navegador, para empezar con ellos ya marcados (español de
// España solo si lo dice; cualquier otro español, Latinoamérica)
export function ajustesDelNavegador(idiomaNavegador: string, plataforma: string): Ajustes {
  const lengua = idiomaNavegador.toLowerCase();
  const idioma: Idioma = lengua.startsWith("es") ? (lengua === "es-es" ? "es-ES" : "es-LA") : "en-US";
  const p = plataforma.toLowerCase();
  const so: SistemaOperativo = /mac|iphone|ipad/.test(p) ? "macos" : /linux|android|cros/.test(p) ? "linux" : "windows";
  return { idioma, so };
}
