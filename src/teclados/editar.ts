// Operaciones del editor sobre un teclado. Son funciones puras: devuelven un teclado nuevo
// y no tocan el original, así se pueden probar y deshacer sin Firebase.
import { LIMITES } from "./validar";
import type { CapaConfig, TeclaConfig, TecladoConfig } from "./tipos";

const copiar = (t: TecladoConfig): TecladoConfig => structuredClone(t);

export const puedeAgregarCapa = (t: TecladoConfig) => t.orden.length < LIMITES.capas;

// Agrega una capa en blanco al final, con un id que no exista y un nombre provisional
export function agregarCapa(t: TecladoConfig): { teclado: TecladoConfig; id: string } {
  if (!puedeAgregarCapa(t)) throw new Error(`Máximo ${LIMITES.capas} capas`);
  const nuevo = copiar(t);
  let n = nuevo.orden.length;
  while (nuevo.capas[`capa${n}`]) n++;
  const id = `capa${n}`;
  nuevo.orden.push(id);
  nuevo.capas[id] = { corto: `CAPA${n}`.slice(0, LIMITES.corto), largo: "", teclas: {} };
  return { teclado: nuevo, id };
}

// Base no se borra: es la capa 0 de ZMK
export function borrarCapa(t: TecladoConfig, id: string): TecladoConfig {
  if (id === "base") throw new Error("La capa Base no se puede borrar");
  const nuevo = copiar(t);
  nuevo.orden = nuevo.orden.filter((c) => c !== id);
  delete nuevo.capas[id];
  return nuevo;
}

// Mueve una capa a la izquierda (-1) o a la derecha (+1). Base se queda siempre primera
export function moverCapa(t: TecladoConfig, id: string, direccion: -1 | 1): TecladoConfig {
  const i = t.orden.indexOf(id);
  const j = i + direccion;
  if (id === "base" || i < 0 || j < 1 || j >= t.orden.length) return t;
  const nuevo = copiar(t);
  [nuevo.orden[i], nuevo.orden[j]] = [nuevo.orden[j], nuevo.orden[i]];
  return nuevo;
}

export function renombrarCapa(t: TecladoConfig, id: string, nombres: Pick<CapaConfig, "corto" | "largo">): TecladoConfig {
  const nuevo = copiar(t);
  nuevo.capas[id] = { ...nuevo.capas[id], corto: nombres.corto.trim(), largo: nombres.largo.trim() };
  return nuevo;
}

const vacia = (tecla: TeclaConfig) => !tecla.texto.trim() && !tecla.descripcion.trim() && !tecla.deCapa;

// Cambia una tecla. Si queda vacía se quita (así una capa en blanco no guarda 42 teclas vacías)
export function editarTecla(t: TecladoConfig, capa: string, pos: number, tecla: TeclaConfig): TecladoConfig {
  const nuevo = copiar(t);
  const limpia = { texto: tecla.texto.trim(), descripcion: tecla.descripcion.trim(), deCapa: tecla.deCapa };
  if (vacia(limpia)) delete nuevo.capas[capa].teclas[pos];
  else nuevo.capas[capa].teclas[pos] = limpia;
  return nuevo;
}

// Intercambia dos teclas de una capa, con su texto, su descripción y si son de capa
export function intercambiarTeclas(t: TecladoConfig, capa: string, a: number, b: number): TecladoConfig {
  if (a === b) return t;
  const nuevo = copiar(t);
  const teclas = nuevo.capas[capa].teclas;
  const [ta, tb] = [teclas[a], teclas[b]];
  delete teclas[a];
  delete teclas[b];
  if (tb) teclas[a] = tb;
  if (ta) teclas[b] = ta;
  return nuevo;
}

export const cambiarNombre = (t: TecladoConfig, nombre: string): TecladoConfig => ({ ...copiar(t), nombre: nombre.trim() });
