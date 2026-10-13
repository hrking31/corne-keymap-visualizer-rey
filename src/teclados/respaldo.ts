// Copia de seguridad del teclado: un archivo .json que el usuario descarga y puede
// restaurar después. Al leerlo se revisa todo y solo se conservan los campos conocidos:
// un archivo editado a mano o de otra app no puede meter datos raros en la cuenta.
import { DISTRIBUCIONES, IDIOMAS, SISTEMAS } from "./distribuciones";
import { LIMITES, validarTeclado } from "./validar";
import type { CapaConfig, TeclaConfig, TecladoConfig } from "./tipos";

const FORMATO = "corne-zmk-visualizer";
const VERSION = 1;

export type Respaldo = {
  formato: typeof FORMATO;
  version: number;
  fecha: string; // cuándo se descargó (ISO 8601)
  teclado: TecladoConfig;
};

export class ErrorRespaldo extends Error {}

export function crearRespaldo(teclado: TecladoConfig, fecha = new Date()): Respaldo {
  return { formato: FORMATO, version: VERSION, fecha: fecha.toISOString(), teclado };
}

// «corne-zmk-rey-2026-10-13.json» (sin nombre: «corne-zmk-2026-10-13.json»)
export function nombreDeArchivo(teclado: TecladoConfig, fecha = new Date()): string {
  const nombre = teclado.nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const dia = [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()].map((n) => String(n).padStart(2, "0")).join("-");
  return ["corne-zmk", nombre, dia].filter(Boolean).join("-") + ".json";
}

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const texto = (v: unknown, que: string) => {
  if (typeof v !== "string") throw new ErrorRespaldo(`El archivo está dañado: falta ${que}.`);
  return v;
};

function leerTecla(v: unknown, donde: string): TeclaConfig {
  if (!esObjeto(v)) throw new ErrorRespaldo(`El archivo está dañado: ${donde}.`);
  const tecla: TeclaConfig = {
    texto: texto(v.texto, `el texto de ${donde}`),
    descripcion: texto(v.descripcion, `la descripción de ${donde}`),
    deCapa: v.deCapa === true,
  };
  if (v.heredada === true) tecla.heredada = true;
  if (typeof v.sinReconocer === "string") tecla.sinReconocer = v.sinReconocer;
  if (typeof v.envia === "string" && v.envia && v.envia.length <= LIMITES.envia) tecla.envia = v.envia;
  return tecla;
}

function leerCapa(v: unknown, id: string): CapaConfig {
  if (!esObjeto(v) || !esObjeto(v.teclas)) throw new ErrorRespaldo(`El archivo está dañado: la capa «${id}».`);
  const teclas: Record<string, TeclaConfig> = {};
  for (const [pos, t] of Object.entries(v.teclas)) teclas[pos] = leerTecla(t, `la tecla ${pos} de «${id}»`);
  return { corto: texto(v.corto, `el nombre de la capa «${id}»`), largo: texto(v.largo, `el nombre largo de «${id}»`), teclas };
}

// Lee un archivo de copia. Lanza ErrorRespaldo, con un mensaje claro, si no lo es o no es válido
export function leerRespaldo(contenido: string): { teclado: TecladoConfig; fecha: Date | null } {
  let datos: unknown;
  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new ErrorRespaldo("No es una copia de seguridad: el archivo no se puede leer.");
  }
  if (!esObjeto(datos) || datos.formato !== FORMATO || !esObjeto(datos.teclado)) {
    throw new ErrorRespaldo("No es una copia de seguridad de Corne ZMK Visualizer.");
  }
  if (typeof datos.version !== "number" || datos.version > VERSION) {
    throw new ErrorRespaldo("La copia es de una versión más nueva de la app: actualízala e inténtalo otra vez.");
  }

  const t = datos.teclado;
  const ajustes = esObjeto(t.ajustes) ? t.ajustes : {};
  if (
    !(String(ajustes.distribucion) in DISTRIBUCIONES) ||
    !(String(ajustes.idioma) in IDIOMAS) ||
    !(String(ajustes.so) in SISTEMAS)
  ) {
    throw new ErrorRespaldo("El archivo está dañado: los ajustes del teclado no son válidos.");
  }
  if (!Array.isArray(t.orden) || !t.orden.every((id) => typeof id === "string") || !esObjeto(t.capas)) {
    throw new ErrorRespaldo("El archivo está dañado: faltan las capas.");
  }

  const capas: Record<string, CapaConfig> = {};
  for (const id of t.orden as string[]) capas[id] = leerCapa((t.capas as Record<string, unknown>)[id], id);
  const teclado: TecladoConfig = {
    nombre: texto(t.nombre, "el nombre del teclado"),
    ajustes: {
      distribucion: ajustes.distribucion as TecladoConfig["ajustes"]["distribucion"],
      idioma: ajustes.idioma as TecladoConfig["ajustes"]["idioma"],
      so: ajustes.so as TecladoConfig["ajustes"]["so"],
    },
    orden: [...(t.orden as string[])],
    capas,
  };

  const problemas = validarTeclado(teclado);
  if (problemas.length) throw new ErrorRespaldo(`La copia no es válida: ${problemas[0]}.`);

  const fecha = typeof datos.fecha === "string" ? new Date(datos.fecha) : null;
  return { teclado, fecha: fecha && !Number.isNaN(fecha.getTime()) ? fecha : null };
}
