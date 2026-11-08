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

// Una leyenda vaciada a propósito (la del .keymap era otra) no cuenta como vacía: se recuerda
const vacia = (tecla: TeclaConfig) =>
  !tecla.texto.trim() && !tecla.descripcion.trim() && !tecla.abre && tecla.leyendaKeymap === undefined;

// Cambia la leyenda y la descripción de una tecla. Si queda vacía se quita
export function editarTecla(t: TecladoConfig, capa: string, pos: number, tecla: TeclaConfig): TecladoConfig {
  const nuevo = copiar(t);
  const limpia: TeclaConfig = { texto: tecla.texto.trim(), descripcion: tecla.descripcion.trim() };
  const actual = nuevo.capas[capa].teclas[pos];
  // Lo que envía una tecla y la capa a la que lleva no dependen de cómo se llame ni de su
  // descripción: se conservan hasta que se vuelva a importar el .keymap
  if (actual?.envia) limpia.envia = actual.envia;
  if (actual?.abre) limpia.abre = actual.abre;
  // Leyenda personalizada: se recuerda la del .keymap. Si se vuelve a escribir esa, deja de serlo
  const deKeymap = actual?.leyendaKeymap ?? actual?.texto ?? "";
  if (limpia.texto !== deKeymap) limpia.leyendaKeymap = deKeymap;
  if (vacia(limpia)) delete nuevo.capas[capa].teclas[pos];
  else nuevo.capas[capa].teclas[pos] = limpia;
  return nuevo;
}

export const cambiarNombre = (t: TecladoConfig, nombre: string): TecladoConfig => ({ ...copiar(t), nombre: nombre.trim() });
