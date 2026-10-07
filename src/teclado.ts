// Lógica pura del teclado: no toca el DOM, así se puede probar con Vitest.
import type { Tecla } from "./tipos";

// data.ts guarda primero las 21 teclas del bloque izquierdo y luego las 21 del derecho.
export function dividirBloques<T>(teclas: readonly T[]): { izquierdo: T[]; derecho: T[] } {
  return {
    izquierdo: teclas.slice(0, 21),
    derecho: teclas.slice(21, 42),
  };
}

// Cada bloque tiene tres filas de 6 teclas y una fila de 3 pulgares.
// Con espejo se invierte cada fila (el CSS vuelve a voltear el bloque con scaleX(-1)).
export function dividirFilas<T>(bloque: readonly T[], espejo = false): T[][] {
  const filas = [
    bloque.slice(0, 6),
    bloque.slice(6, 12),
    bloque.slice(12, 18),
    bloque.slice(18, 21),
  ];
  return espejo ? filas.map((fila) => fila.reverse()) : filas;
}

// Una tecla sin etiqueta no hace nada en esa capa: no abre el modal.
export function tieneAccion(tecla: Pick<Tecla, "label">): boolean {
  return tecla.label.trim() !== "";
}
