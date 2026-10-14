// Récords de la práctica: los 10 mejores tiempos de cada grupo, el formato del tiempo y la
// lectura de lo guardado. Solo lógica, sin navegador.
import { describe, expect, it } from "vitest";
import {
  MARCAS_POR_GRUPO, anotarMarca, formatoMarca, formatoTiempo, leerDatosPractica, mejorMarca, ppm, type Marca, type Records,
} from "../src/practica/records";

const marca = (ms: number, dia = 1): Marca => ({ ms, fecha: `2026-10-${String(dia).padStart(2, "0")}T12:00:00.000Z`, fallos: 0 });

describe("anotar una ronda", () => {
  it("la primera ronda de un grupo es récord", () => {
    const { records, nuevoRecord, puesto } = anotarMarca({}, "letras", marca(42_000));
    expect(nuevoRecord).toBe(true);
    expect(puesto).toBe(0);
    expect(mejorMarca(records, "letras")?.ms).toBe(42_000);
    expect(mejorMarca(records, "numeros")).toBeNull();
  });

  it("la lista va del más rápido al más lento; empatar no es récord", () => {
    let records: Records = {};
    for (const ms of [40_000, 50_000, 45_000]) records = anotarMarca(records, "letras", marca(ms)).records;
    expect(records.letras?.map((m) => m.ms)).toEqual([40_000, 45_000, 50_000]);
    const empate = anotarMarca(records, "letras", marca(40_000, 2));
    expect(empate.nuevoRecord).toBe(false);
    expect(empate.puesto).toBe(1); // tras la más antigua del mismo tiempo
    const mejor = anotarMarca(records, "letras", marca(39_000));
    expect(mejor.nuevoRecord).toBe(true);
  });

  it("cada grupo tiene sus récords", () => {
    const { records } = anotarMarca({ letras: [marca(30_000)] }, "numeros", marca(60_000));
    expect(anotarMarca(records, "numeros", marca(50_000)).nuevoRecord).toBe(true);
    expect(records.letras?.map((m) => m.ms)).toEqual([30_000]);
  });

  it("solo se guardan las 10 mejores", () => {
    let records: Records = {};
    for (let i = 1; i <= MARCAS_POR_GRUPO; i++) records = anotarMarca(records, "todo", marca(i * 1000)).records;
    const lenta = anotarMarca(records, "todo", marca(99_000));
    expect(lenta.puesto).toBeNull();
    expect(lenta.records.todo).toHaveLength(MARCAS_POR_GRUPO);
    const rapida = anotarMarca(records, "todo", marca(500));
    expect(rapida.records.todo).toHaveLength(MARCAS_POR_GRUPO);
    expect(rapida.records.todo?.at(-1)?.ms).toBe(9000);
  });

  it("no cambia los récords que recibe", () => {
    const antes: Records = { letras: [marca(40_000)] };
    anotarMarca(antes, "letras", marca(30_000));
    expect(antes.letras).toHaveLength(1);
  });
});

describe("palabras y frases: la marca en palabras por minuto", () => {
  // 50 letras en 15 s = 10 palabras en un cuarto de minuto = 40 ppm
  const texto = (ms: number, letras: number, dia = 1): Marca => ({ ...marca(ms, dia), letras });

  it("cada 5 letras, una palabra", () => {
    expect(ppm(texto(15_000, 50))).toBe(40);
    expect(formatoMarca("frases", texto(15_000, 50))).toBe("40 ppm");
    expect(formatoMarca("letras", marca(42_000))).toBe("0:42");
  });

  it("gana la más rápida por letra, no la que menos tarda: cada texto mide distinto", () => {
    let records: Records = {};
    records = anotarMarca(records, "frases", texto(10_000, 25)).records; // 30 ppm
    const larga = anotarMarca(records, "frases", texto(15_000, 50)); // tarda más, pero 40 ppm
    expect(larga.nuevoRecord).toBe(true);
    expect(larga.records.frases?.map(ppm)).toEqual([40, 30]);
    expect(anotarMarca(larga.records, "frases", texto(15_000, 50, 2))).toMatchObject({ nuevoRecord: false, puesto: 1 });
  });

  it("al leer lo guardado, sin el largo del texto la marca no vale", () => {
    const { records } = leerDatosPractica({
      records: { palabras: [texto(30_000, 40), marca(5000), texto(15_000, 50), texto(0, 50)] },
    });
    expect(records.palabras?.map(ppm)).toEqual([40, 16]);
  });
});

describe("el tiempo en pantalla", () => {
  it("minutos y segundos enteros, como un cronómetro", () => {
    expect(formatoTiempo(0)).toBe("0:00");
    expect(formatoTiempo(42_900)).toBe("0:42");
    expect(formatoTiempo(65_000)).toBe("1:05");
    expect(formatoTiempo(-5)).toBe("0:00");
  });
});

describe("leer lo guardado", () => {
  it("si no hay nada o no tiene sentido, vacío", () => {
    for (const datos of [undefined, null, "hola", 42, [], { records: [], dificultad: "x" }]) {
      expect(leerDatosPractica(datos)).toEqual({ records: {}, dificultad: {} });
    }
  });

  it("conserva lo válido, ordenado, y descarta lo demás", () => {
    const { records, dificultad } = leerDatosPractica({
      records: {
        letras: [marca(50_000), { ms: -1, fecha: "2026-10-01", fallos: 0 }, marca(40_000), { ms: 1000, fecha: "ayer", fallos: 0 }],
        inventado: [marca(1000)],
        numeros: "no es una lista",
      },
      dificultad: {
        "t:KeyA:": { ms: 1200, fallos: 0.3 },
        "t:KeyB:": { ms: 1200, fallos: 2 }, // fallos va de 0 a 1
        "t:KeyC:": "nada",
      },
      otro: true,
    });
    expect(records).toEqual({ letras: [marca(40_000), marca(50_000)] });
    expect(dificultad).toEqual({ "t:KeyA:": { ms: 1200, fallos: 0.3 } });
  });

  it("no más de 10 marcas por grupo aunque lleguen más", () => {
    const muchas = Array.from({ length: 15 }, (_, i) => marca((15 - i) * 1000));
    const { records } = leerDatosPractica({ records: { todo: muchas } });
    expect(records.todo).toHaveLength(MARCAS_POR_GRUPO);
    expect(records.todo?.[0].ms).toBe(1000);
  });
});
