import { describe, expect, it } from "vitest";
import { keymap } from "../src/data";
import { idiomaDeRuta, navegadorEnEspanol, rutaEnIdioma } from "../src/i18n/idioma";
import { teclasEn } from "../src/i18n/teclas.en";
import type { Capa } from "../src/tipos";

describe("idiomaDeRuta", () => {
  it("/en y lo que cuelga de /en/ van en inglés", () => {
    expect(idiomaDeRuta("/en")).toBe("en");
    expect(idiomaDeRuta("/en/")).toBe("en");
  });

  it("todo lo demás va en español", () => {
    expect(idiomaDeRuta("/")).toBe("es");
    expect(idiomaDeRuta("/index.html")).toBe("es");
    expect(idiomaDeRuta("/entrar")).toBe("es");
  });

  it("ida y vuelta: la ruta de cada idioma se reconoce como ese idioma", () => {
    expect(idiomaDeRuta(rutaEnIdioma("en"))).toBe("en");
    expect(idiomaDeRuta(rutaEnIdioma("es"))).toBe("es");
  });
});

describe("navegadorEnEspanol", () => {
  it("mira el idioma preferido, el primero de la lista", () => {
    expect(navegadorEnEspanol(["es-CO", "en"])).toBe(true);
    expect(navegadorEnEspanol(["en-US", "es"])).toBe(false);
    expect(navegadorEnEspanol([])).toBe(false);
  });
});

describe("descripciones en inglés", () => {
  // "CAPA:posición" de cada tecla que tiene descripción en data.ts
  const conDescripcion = Object.entries(keymap).flatMap(([capa, teclas]) =>
    teclas.filter((t) => t.extra).map((t) => `${capa}:${t.desc.slice(4)}`),
  );

  it("toda descripción en español tiene su traducción", () => {
    const sinTraducir = conDescripcion.filter((clave) => !(clave in teclasEn));
    expect(sinTraducir).toEqual([]);
  });

  it("no hay traducciones huérfanas de teclas sin descripción o inexistentes", () => {
    const huerfanas = Object.keys(teclasEn).filter((clave) => {
      const [capa, pos] = clave.split(":");
      const tecla = keymap[capa as Capa]?.find((t) => t.desc === `Key ${pos}`);
      return !tecla?.extra;
    });
    expect(huerfanas).toEqual([]);
  });
});
