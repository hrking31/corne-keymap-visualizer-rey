// Lo que se puede cambiar a mano en el editor: solo textos. Las capas, su orden, sus nombres
// cortos y lo que hace cada tecla los decide el .keymap. Son funciones puras: devuelven un
// teclado nuevo y no tocan el original, así se pueden probar sin Firebase.
import type { TeclaConfig, TecladoConfig } from "./tipos";

const copiar = (t: TecladoConfig): TecladoConfig => structuredClone(t);

// El nombre largo de una capa: la primera línea del panel («Navegación»)
export function renombrarCapa(t: TecladoConfig, id: string, largo: string): TecladoConfig {
  const nuevo = copiar(t);
  nuevo.capas[id] = { ...nuevo.capas[id], largo: largo.trim() };
  return nuevo;
}

const vacia = (tecla: TeclaConfig) => !tecla.texto.trim() && !tecla.descripcion.trim() && !tecla.abre;

// Cambia el texto y la descripción de una tecla. Si queda vacía se quita
export function editarTecla(t: TecladoConfig, capa: string, pos: number, tecla: TeclaConfig): TecladoConfig {
  const nuevo = copiar(t);
  const limpia: TeclaConfig = { texto: tecla.texto.trim(), descripcion: tecla.descripcion.trim() };
  // Lo que envía una tecla y la capa a la que lleva no dependen de cómo se llame ni de su
  // descripción: se conservan hasta que se vuelva a importar el .keymap
  const { envia, abre } = nuevo.capas[capa].teclas[pos] ?? {};
  if (envia) limpia.envia = envia;
  if (abre) limpia.abre = abre;
  if (vacia(limpia)) delete nuevo.capas[capa].teclas[pos];
  else nuevo.capas[capa].teclas[pos] = limpia;
  return nuevo;
}

export const cambiarNombre = (t: TecladoConfig, nombre: string): TecladoConfig => ({ ...copiar(t), nombre: nombre.trim() });
