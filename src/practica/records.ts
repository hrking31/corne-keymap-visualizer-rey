// Récords de la práctica: los mejores tiempos de cada grupo y lo que cuesta cada tecla.
// Solo lógica; dónde se guardan (Firestore o el navegador) va aparte
import { GRUPOS, esDeTexto, type Dificultad, type Grupo } from "./practica";

// Una ronda terminada
export type Marca = {
  ms: number; // lo que duró
  fecha: string; // cuándo (ISO)
  fallos: number;
  letras?: number; // en Palabras y Frases: lo largo que era el texto
};

// Las mejores marcas de cada grupo, de la más rápida a la más lenta
export type Records = Partial<Record<Grupo, Marca[]>>;

// Lo que se guarda de la práctica de cada usuario
export type DatosPractica = { records: Records; dificultad: Dificultad };

export const MARCAS_POR_GRUPO = 10;
// Topes al leer lo guardado: nadie tarda una hora en 30 teclas y ningún teclado tiene
// tantas teclas que practicar
const MS_MAXIMO = 60 * 60 * 1000;
const CLAVES_MAXIMAS = 400;
const LETRAS_MAXIMAS = 1000;

export const mejorMarca = (records: Records, grupo: Grupo): Marca | null => records[grupo]?.[0] ?? null;

// Palabras por minuto, la medida de siempre: cada 5 letras (espacios incluidos), una palabra
export const ppm = (m: Pick<Marca, "ms" | "letras">): number => ((m.letras ?? 0) / 5) / (Math.max(1, m.ms) / 60_000);

// Cuánto tarda por letra: en las teclas sueltas todas las rondas son de 30 y basta el tiempo;
// en Palabras y Frases cada texto mide distinto y se compara la velocidad
const coste = (grupo: Grupo, m: Marca) => (esDeTexto(grupo) ? 1 / ppm(m) : m.ms);

// Anota una ronda. Es récord si es más rápida que la mejor (empatar no cuenta); puesto es
// su lugar en la lista (0 = la mejor) o null si no entra entre las 10 mejores
export function anotarMarca(
  records: Records,
  grupo: Grupo,
  marca: Marca,
): { records: Records; nuevoRecord: boolean; puesto: number | null } {
  const antes = records[grupo] ?? [];
  // Tras las de su misma marca: a igual marca, la más antigua va primero
  const puesto = antes.filter((m) => coste(grupo, m) <= coste(grupo, marca)).length;
  const lista = [...antes.slice(0, puesto), marca, ...antes.slice(puesto)].slice(0, MARCAS_POR_GRUPO);
  return {
    records: { ...records, [grupo]: lista },
    nuevoRecord: !antes.length || coste(grupo, marca) < coste(grupo, antes[0]),
    puesto: puesto < MARCAS_POR_GRUPO ? puesto : null,
  };
}

// «0:42», «1:05». Se cuentan los segundos enteros, como un cronómetro
export function formatoTiempo(ms: number): string {
  const s = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// La marca como se muestra: «0:42» o, en Palabras y Frases, «41 ppm»
export const formatoMarca = (grupo: Grupo, m: Marca): string =>
  esDeTexto(grupo) ? `${Math.round(ppm(m))} ppm` : formatoTiempo(m.ms);

// ---------- Leer lo guardado ----------

// Lo que llega de Firestore o del navegador puede venir de otra versión de la app o estar
// roto: solo se conserva lo que tiene la forma esperada

const esObjeto = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const numero = (x: unknown, max: number): x is number => typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= max;

// En Palabras y Frases la marca necesita lo largo del texto
function leerMarca(x: unknown, grupo: Grupo): Marca | null {
  if (!esObjeto(x) || !numero(x.ms, MS_MAXIMO) || !numero(x.fallos, 10_000)) return null;
  if (typeof x.fecha !== "string" || Number.isNaN(Date.parse(x.fecha))) return null;
  if (!esDeTexto(grupo)) return { ms: x.ms, fecha: x.fecha, fallos: x.fallos };
  if (!numero(x.letras, LETRAS_MAXIMAS) || x.letras < 1 || x.ms < 1) return null;
  return { ms: x.ms, fecha: x.fecha, fallos: x.fallos, letras: x.letras };
}

export function leerDatosPractica(datos: unknown): DatosPractica {
  const records: Records = {};
  const dificultad: Dificultad = {};
  if (!esObjeto(datos)) return { records, dificultad };
  if (esObjeto(datos.records)) {
    for (const grupo of GRUPOS) {
      const lista = datos.records[grupo];
      if (!Array.isArray(lista)) continue;
      const marcas = lista.map((m) => leerMarca(m, grupo)).filter((m): m is Marca => m !== null);
      if (marcas.length) records[grupo] = marcas.sort((a, b) => coste(grupo, a) - coste(grupo, b)).slice(0, MARCAS_POR_GRUPO);
    }
  }
  if (esObjeto(datos.dificultad)) {
    for (const [clave, x] of Object.entries(datos.dificultad).slice(0, CLAVES_MAXIMAS)) {
      if (clave.length > 60 || !esObjeto(x) || !numero(x.ms, MS_MAXIMO) || !numero(x.fallos, 1)) continue;
      dificultad[clave] = { ms: x.ms, fallos: x.fallos };
    }
  }
  return { records, dificultad };
}
