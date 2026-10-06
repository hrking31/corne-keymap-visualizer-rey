// Textos de la interfaz en español. en.ts tiene que tener exactamente las mismas
// claves: si falta una, TypeScript no compila.
export const es = {
  tituloPagina: "Corne Map Interactivo",
  capas: {
    BASE: "Capa Base",
    NUM: "Capa Números",
    SYM: "Capa Símbolos",
    NAV: "Capa Navegación",
    LED: "Capa Led RGB",
    FUN: "Capa Funciones",
  },
  // Etiqueta del selector, que lleva al otro idioma: se escribe en ese idioma
  cambiarIdioma: "View in English",
};

export type Textos = typeof es;
