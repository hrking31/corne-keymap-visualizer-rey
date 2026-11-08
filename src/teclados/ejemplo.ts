// El teclado de la demo (sin cuenta): el Corne de ejemplo de ZMK, importado con el mismo
// lector que usa cada usuario. Trae capas, así que el visitante ve los botones de capa y
// las capas animadas. Nunca la configuración del autor.
import oficial from "../assets/zmk-corne.keymap?raw";
import { leerKeymap } from "../keymap/leer";
import { importarKeymap } from "../keymap/importar";
import { tecladoVacio } from "./basico";
import type { Ajustes, TecladoConfig } from "./tipos";

export function tecladoDeEjemplo(ajustes: Ajustes): TecladoConfig {
  return importarKeymap(leerKeymap(oficial), tecladoVacio(ajustes)).teclado;
}
