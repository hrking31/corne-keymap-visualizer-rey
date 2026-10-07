export type Capa = "BASE" | "NUM" | "SYM" | "NAV" | "LED" | "FUN";

export type Tecla = {
  label: string;
  // Por ahora es el índice de posición de ZMK ("Key 13"), no una descripción
  desc: string;
  extra?: string;
  // Clase CSS extra: solo las que existen en style.css (lo vigila tests/data.test.ts)
  clase?: "key-naranja";
};

// Cada capa guarda 42 teclas: primero las 21 del bloque izquierdo y luego las 21 del derecho
export type Keymap = Record<Capa, Tecla[]>;
