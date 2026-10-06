import type { keymap } from "./data.js";

export type Capa = keyof typeof keymap;

export type Tecla = {
  label: string;
  // Por ahora es el índice de posición de ZMK ("Key 13"), no una descripción
  desc: string;
  extra?: string;
  // Clase CSS extra, p. ej. "key-naranja" para las teclas de cambio de capa
  clase?: string;
};
