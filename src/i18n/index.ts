import type { Capa, Tecla } from "../tipos";
import { en } from "./en";
import { es } from "./es";
import { idiomaDeRuta } from "./idioma";
import { teclasEn } from "./teclas.en";

// Cambiar de idioma es ir a otra URL (recarga la página), así que el idioma se
// decide una sola vez al arrancar y no hace falta guardarlo en el estado de React.
export const idioma = idiomaDeRuta(window.location.pathname);

export const t = idioma === "en" ? en : es;

// La descripción de una tecla en el idioma actual. data.ts está en español;
// si una tecla no tiene traducción, se muestra en español.
export function extraDe(capa: Capa, tecla: Tecla): string {
  const espanol = tecla.extra ?? "";
  if (idioma === "es") return espanol;
  return teclasEn[`${capa}:${tecla.desc.slice(4)}`] ?? espanol;
}
