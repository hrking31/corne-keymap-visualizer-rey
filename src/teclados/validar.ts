// Límites de un teclado. Los mismos se repiten en las reglas de Firestore: aquí sirven
// para avisar al usuario antes de guardar; allí, para que nadie se los salte.
import type { TecladoConfig } from "./tipos";

export const LIMITES = {
  capas: 10,
  corto: 6,
  largo: 24,
  nombre: 40,
  texto: 12,
  descripcion: 300,
} as const;

// Devuelve los problemas encontrados (vacío si el teclado es válido)
export function validarTeclado(t: TecladoConfig): string[] {
  const problemas: string[] = [];
  const largo = (valor: string, max: number, que: string) => {
    if (valor.length > max) problemas.push(`${que}: máximo ${max} caracteres`);
  };

  largo(t.nombre, LIMITES.nombre, "Nombre del teclado");
  if (t.orden.length > LIMITES.capas) problemas.push(`Máximo ${LIMITES.capas} capas`);
  if (t.orden[0] !== "base") problemas.push("La primera capa tiene que ser Base");
  if (new Set(t.orden).size !== t.orden.length) problemas.push("Hay capas repetidas");
  const ids = Object.keys(t.capas);
  if (ids.length !== t.orden.length || !t.orden.every((id) => ids.includes(id)))
    problemas.push("El orden no coincide con las capas");

  for (const id of t.orden) {
    const capa = t.capas[id];
    if (!capa) continue;
    if (!capa.corto.trim()) problemas.push(`Capa ${id}: falta el nombre corto`);
    largo(capa.corto, LIMITES.corto, `Capa ${capa.corto || id}, nombre corto`);
    largo(capa.largo, LIMITES.largo, `Capa ${capa.corto || id}, nombre largo`);
    for (const [pos, tecla] of Object.entries(capa.teclas)) {
      const n = Number(pos);
      if (!Number.isInteger(n) || n < 0 || n > 41) problemas.push(`Capa ${capa.corto}: posición ${pos} no existe`);
      largo(tecla.texto, LIMITES.texto, `Capa ${capa.corto}, tecla ${pos}, texto`);
      largo(tecla.descripcion, LIMITES.descripcion, `Capa ${capa.corto}, tecla ${pos}, descripción`);
    }
  }
  return problemas;
}
