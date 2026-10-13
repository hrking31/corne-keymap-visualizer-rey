// Copia de seguridad: se descarga y se restaura idéntica; un archivo roto, de otra app o
// fuera de los límites se rechaza con un mensaje claro, sin tocar nada.
import { describe, expect, it } from "vitest";
import { crearRespaldo, ErrorRespaldo, leerRespaldo, nombreDeArchivo } from "../src/teclados/respaldo";
import { crearTeclado } from "../src/teclados/plantillas";
import { agregarCapa, editarTecla } from "../src/teclados/editar";
import type { TecladoConfig } from "../src/teclados/tipos";

const fecha = new Date(2026, 9, 13, 10, 30);

function miTeclado(): TecladoConfig {
  let t = crearTeclado({ distribucion: "dvorak", idioma: "es-LA", so: "windows" }, "Rey");
  t = agregarCapa(t).teclado;
  t = editarTecla(t, "base", 0, { texto: "ESC", descripcion: "Cancela lo que estoy haciendo", deCapa: false });
  t.capas.base.teclas[8] = { texto: "NOEXISTE", descripcion: "", deCapa: false, sinReconocer: "&kp NOEXISTE" };
  t.capas[t.orden[1]].teclas[3] = { texto: "TAB", descripcion: "", deCapa: false, heredada: true };
  return t;
}

const archivo = (datos: unknown) => JSON.stringify(datos);

describe("copia de seguridad", () => {
  it("se descarga y se restaura idéntica, con su fecha", () => {
    const t = miTeclado();
    const leida = leerRespaldo(JSON.stringify(crearRespaldo(t, fecha)));
    expect(leida.teclado).toEqual(t);
    expect(leida.fecha?.getTime()).toBe(fecha.getTime());
  });

  it("el archivo lleva el nombre del teclado y la fecha", () => {
    expect(nombreDeArchivo(miTeclado(), fecha)).toBe("corne-zmk-rey-2026-10-13.json");
    const sinNombre = { ...miTeclado(), nombre: "" };
    expect(nombreDeArchivo(sinNombre, fecha)).toBe("corne-zmk-2026-10-13.json");
    expect(nombreDeArchivo({ ...miTeclado(), nombre: "Árbol Ñ!" }, fecha)).toBe("corne-zmk-arbol-n-2026-10-13.json");
  });

  it("rechaza lo que no es una copia de esta app", () => {
    expect(() => leerRespaldo("esto no es json")).toThrow(ErrorRespaldo);
    expect(() => leerRespaldo(archivo({ hola: 1 }))).toThrow(/Corne ZMK Visualizer/);
    expect(() => leerRespaldo(archivo({ ...crearRespaldo(miTeclado()), version: 99 }))).toThrow(/más nueva/);
  });

  it("rechaza una copia dañada o fuera de los límites", () => {
    const copia = crearRespaldo(miTeclado(), fecha);
    const sinTexto = structuredClone(copia) as unknown as { teclado: { capas: { base: { teclas: Record<string, unknown> } } } };
    sinTexto.teclado.capas.base.teclas[0] = { descripcion: "" };
    expect(() => leerRespaldo(archivo(sinTexto))).toThrow(/dañado/);

    const ajustesRaros = structuredClone(copia);
    (ajustesRaros.teclado.ajustes as { idioma: string }).idioma = "klingon";
    expect(() => leerRespaldo(archivo(ajustesRaros))).toThrow(/ajustes/);

    const once = structuredClone(copia);
    for (let i = 0; i < 9; i++) {
      once.teclado.orden.push(`x${i}`);
      once.teclado.capas[`x${i}`] = { corto: `X${i}`, largo: "", teclas: {} };
    }
    expect(() => leerRespaldo(archivo(once))).toThrow(/10 capas/);
  });

  it("solo conserva los campos conocidos (un archivo editado no mete datos raros)", () => {
    const copia = crearRespaldo(miTeclado(), fecha) as unknown as Record<string, Record<string, unknown>>;
    copia.teclado.extra = "malicioso";
    (copia.teclado.capas as Record<string, Record<string, unknown>>).base.oculto = true;
    const { teclado } = leerRespaldo(archivo(copia));
    expect(teclado).toEqual(miTeclado());
  });
});
