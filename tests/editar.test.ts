import { describe, expect, it } from "vitest";
import {
  agregarCapa,
  borrarCapa,
  cambiarNombre,
  editarTecla,
  intercambiarTeclas,
  moverCapa,
  puedeAgregarCapa,
  renombrarCapa,
} from "../src/teclados/editar";
import { crearTeclado } from "../src/teclados/plantillas";
import type { TecladoConfig } from "../src/teclados/tipos";
import { validarTeclado } from "../src/teclados/validar";

const nuevo = (): TecladoConfig => crearTeclado({ distribucion: "qwerty", idioma: "es-LA", so: "windows" });
const conCapas = (n: number) => {
  let t = nuevo();
  for (let i = 1; i < n; i++) t = agregarCapa(t).teclado;
  return t;
};

describe("capas", () => {
  it("agrega capas en blanco hasta 10 y luego no deja más", () => {
    const t = conCapas(10);
    expect(t.orden).toHaveLength(10);
    expect(new Set(t.orden).size).toBe(10);
    expect(t.capas[t.orden[9]].teclas).toEqual({});
    expect(puedeAgregarCapa(t)).toBe(false);
    expect(() => agregarCapa(t)).toThrow(/Máximo 10/);
    expect(validarTeclado(t)).toEqual([]);
  });

  it("no modifica el teclado original", () => {
    const t = nuevo();
    agregarCapa(t);
    expect(t.orden).toEqual(["base"]);
  });

  it("borra una capa pero nunca Base", () => {
    const t = conCapas(3);
    const sin = borrarCapa(t, t.orden[1]);
    expect(sin.orden).toEqual(["base", t.orden[2]]);
    expect(sin.capas[t.orden[1]]).toBeUndefined();
    expect(() => borrarCapa(t, "base")).toThrow(/Base/);
  });

  it("mueve capas sin sacar a Base del primer lugar", () => {
    const t = conCapas(3);
    const [, b, c] = t.orden;
    expect(moverCapa(t, c, -1).orden).toEqual(["base", c, b]);
    expect(moverCapa(t, b, -1).orden).toEqual(t.orden); // no puede pasar delante de Base
    expect(moverCapa(t, c, 1).orden).toEqual(t.orden); // ya es la última
    expect(moverCapa(t, "base", 1).orden).toEqual(t.orden);
  });

  it("renombra una capa sin espacios sobrantes", () => {
    const t = renombrarCapa(conCapas(2), "capa1", { corto: " NAV ", largo: " Navegación " });
    expect(t.capas.capa1).toMatchObject({ corto: "NAV", largo: "Navegación" });
  });
});

describe("teclas", () => {
  it("edita una tecla y, si queda vacía, la quita", () => {
    let t = editarTecla(nuevo(), "base", 0, { texto: " ESC ", descripcion: " Cancela ", deCapa: false });
    expect(t.capas.base.teclas[0]).toEqual({ texto: "ESC", descripcion: "Cancela", deCapa: false });
    t = editarTecla(t, "base", 0, { texto: " ", descripcion: "", deCapa: false });
    expect(t.capas.base.teclas[0]).toBeUndefined();
  });

  it("intercambia dos teclas con todo su contenido", () => {
    const t = intercambiarTeclas(nuevo(), "base", 1, 37);
    expect(t.capas.base.teclas[1]).toMatchObject({ texto: "LOWER", deCapa: true });
    expect(t.capas.base.teclas[37]).toMatchObject({ texto: "Q", deCapa: false });
  });

  it("intercambiar con una tecla vacía la mueve", () => {
    let t = agregarCapa(nuevo()).teclado;
    t = editarTecla(t, "capa1", 5, { texto: "F5", descripcion: "", deCapa: false });
    t = intercambiarTeclas(t, "capa1", 5, 20);
    expect(t.capas.capa1.teclas).toEqual({ 20: { texto: "F5", descripcion: "", deCapa: false } });
  });

  it("cambia el nombre del teclado", () => {
    expect(cambiarNombre(nuevo(), "  Corne ZMK Rey ").nombre).toBe("Corne ZMK Rey");
  });
});
