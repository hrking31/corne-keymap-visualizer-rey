// El idioma lo decide la URL, como en hernandorey: /en en inglés y el resto en
// español. Así el enlace que se comparte abre siempre en el idioma elegido.
// Funciones puras (sin tocar window al importarlas), para poder probarlas.

export type Idioma = "es" | "en";

export function idiomaDeRuta(ruta: string): Idioma {
  return ruta === "/en" || ruta.startsWith("/en/") ? "en" : "es";
}

// La app tiene una sola pantalla: cada idioma es una sola ruta
export function rutaEnIdioma(idioma: Idioma): string {
  return idioma === "en" ? "/en" : "/";
}

export function navegadorEnEspanol(idiomas: readonly string[]): boolean {
  return (idiomas[0] ?? "").toLowerCase().startsWith("es");
}

// El visitante eligió idioma con el selector o cerró el aviso: no se le vuelve a ofrecer.
const CLAVE = "idioma";

export function guardarEleccion(idioma: Idioma) {
  try {
    localStorage.setItem(CLAVE, idioma);
  } catch {
    // Sin acceso a localStorage: la elección vale solo para esta visita.
  }
}

export function hayEleccion(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== null;
  } catch {
    return false;
  }
}
