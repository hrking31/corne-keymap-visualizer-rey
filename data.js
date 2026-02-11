const keymap = {
  // ---------------- CAPA BASE -----------------
  BASE: [
    // --- BLOQUE DERECHO ---
    // Fila 1
    { label: "ESC", desc: "Key 0" },
    { label: ".", desc: "Key 1", extra: "Con SHIFT = :" },
    { label: ",", desc: "Key 2", extra: "Con SHIFT = ;" },
    { label: "Ñ", desc: "Key 3" },
    { label: "P", desc: "Key 4" },
    { label: "Y", desc: "Key 5" },
    // Fila 2
    { label: "ALT ", desc: "Key 12" },
    { label: "A", desc: "Key 13" },
    { label: "O", desc: "Key 14" },
    { label: "E", desc: "Key 15" },
    { label: "U", desc: "Key 16" },
    { label: "I", desc: "Key 17" },
    // Fila 3
    { label: "CTRL", desc: "Key 24" },
    { label: "´", desc: "Key 25", extra: "Tilde" },
    { label: "Q", desc: "Key 26" },
    { label: "J", desc: "Key 27" },
    { label: "K", desc: "Key 28" },
    { label: "X", desc: "Key 29" },
    // Pulgares
    { label: "SHIFT", desc: "Key 36" },
    { label: "NUM", desc: "Key 37", extra: "Cambia a la capa NUM (números)" },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    { label: "F", desc: "Key 6" },
    { label: "G", desc: "Key 7" },
    { label: "C", desc: "Key 8" },
    { label: "H", desc: "Key 9" },
    { label: "L", desc: "Key 10" },
    { label: "BSPC", desc: "Key 11" },
    // Fila 2
    { label: "D", desc: "Key 18" },
    { label: "R", desc: "Key 19" },
    { label: "T", desc: "Key 20" },
    { label: "N", desc: "Key 21" },
    { label: "S", desc: "Key 22" },
    { label: "DEL", desc: "Key 23" },
    // Fila 3
    { label: "B", desc: "Key 30" },
    { label: "M", desc: "Key 31" },
    { label: "W", desc: "Key 32" },
    { label: "V", desc: "Key 33" },
    { label: "Z", desc: "Key 34" },
    { label: "TAB", desc: "Key 35" },
    // Pulgares
    { label: "ENT", desc: "Key 39" },
    { label: "SIN", desc: "Key 40", extra: "Cambia a la capa SYM (símbolos)" },
    { label: "WIN", desc: "Key 41" },
  ],

  // ---------------- CAPA NÚMEROS -----------------
  NUM: [
    // --- BLOQUE DERECHO ---
    // Fila 1
    { label: "ESC", desc: "Key 0" },
    { label: "1", desc: "Key 1" },
    { label: "2", desc: "Key 2" },
    { label: "3", desc: "Key 3" },
    { label: "4", desc: "Key 4" },
    { label: "5", desc: "Key 5" },
    // Fila 2
    { label: "ALT", desc: "Key 12" },
    { label: "FOCO", desc: "Key 13", extra: "Foco en archivo de VSC" },
    { label: "FLDR", desc: "Key 14", extra: "Abrir nueva carpeta en VSC" },
    {
      label: "INI",
      desc: "Key 15",
      extra: "Me lleva al inicio de la linea en VSC",
    },
    {
      label: "C-UP",
      desc: "Key 16",
      extra: "Mueve la linea actual hacia arriba en VSC",
    },
    {
      label: "UNDO",
      desc: "Key 16",
      extra: "Deshace la última acción en VSC",
    },
    // Fila 3
    { label: "CTRL", desc: "Key 24" },
    { label: "", desc: "Key 25" },
    { label: "FILE", desc: "Key 26", extra: "Abre nuevo archivo en VSC" },
    {
      label: "END",
      desc: "Key 27",
      extra: "Me lleva al final de la linea en VSC",
    },
    {
      label: "C-DN",
      desc: "Key 28",
      extra: "Mueve la linea actual hacia abajo en VSC",
    },
    {
      label: "REDO",
      desc: "Key 29",
      extra: "Rehace la última acción en VSC",
    },
    // Pulgares
    { label: "SHIFT", desc: "Key 36" },
    {
      label: "NUM",
      desc: "Key 37",
      extra:
        "Al presionar y mantener junto con NAV cambia a la capa NAV (navegación)",
    },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    { label: "Key6", desc: "Key 6" },
    { label: "Key7", desc: "Key 7" },
    { label: "Key8", desc: "Key 8" },
    { label: "Key9", desc: "Key 9" },
    { label: "Key10", desc: "Key 10" },
    { label: "BSPC", desc: "Key 11" },
    // Fila 2
    { label: "Key18", desc: "Key 18" },
    { label: "Key19", desc: "Key 19" },
    { label: "Key20", desc: "Key 20" },
    { label: "Key21", desc: "Key 21" },
    { label: "Key22", desc: "Key 22" },
    { label: "DEL", desc: "Key 23" },
    // Fila 3
    { label: "Key30", desc: "Key 30" },
    { label: "Key31", desc: "Key 31" },
    { label: "Key32", desc: "Key 32" },
    { label: "Key33", desc: "Key 33" },
    { label: "Key34", desc: "Key 34" },
    { label: "TAB", desc: "Key 35" },
    // Pulgares
    { label: "ENT", desc: "Key 39" },
    {
      label: "NAV",
      desc: "Key 40",
      extra:
        "Cambia a la capa NAV (navegación), debe de estar en capa NUM para funcionar",
    },
    {
      label: "FUN",
      desc: "Key 41",
      extra:
        "Cambia a la capa FUN (funciones), debe de estar en capa NUM para funcionar",
    },
  ],

  // ---------------- CAPA SÍMBOLOS -----------------
  SYM: [
    // --- BLOQUE DERECHO ---
    // Fila 1
    { label: "ESC", desc: "Key 0" },
    { label: "P", desc: "Key 1" },
    { label: "Ñ", desc: "Key 2" },
    { label: ",", desc: "Key 3" },
    { label: ".", desc: "Key 4" },
    { label: "ESC", desc: "Key 5" },
    // Fila 2
    { label: "ALT", desc: "Key 12" },
    { label: "Key16", desc: "Key 13" },
    { label: "Key15", desc: "Key 14" },
    { label: "Key14", desc: "Key 15" },
    { label: "Key13", desc: "Key 16" },
    { label: "Key12", desc: "Key 17" },
    // Fila 3
    { label: "CTRL", desc: "Key 24" },
    { label: "Key28", desc: "Key 25" },
    { label: "Key27", desc: "Key 26" },
    { label: "Key26", desc: "Key 27" },
    { label: "Key25", desc: "Key 28" },
    { label: "Key24", desc: "Key 29" },
    // Pulgares
    { label: "SHIFT", desc: "Key 36" },
    { label: "LED", desc: "Key 37" },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    { label: "Key6", desc: "Key 6" },
    { label: "Key7", desc: "Key 7" },
    { label: "Key8", desc: "Key 8" },
    { label: "Key9", desc: "Key 9" },
    { label: "Key10", desc: "Key 10" },
    { label: "BSPC", desc: "Key 11" },
    // Fila 2
    { label: "Key18", desc: "Key 18" },
    { label: "Key19", desc: "Key 19" },
    { label: "Key20", desc: "Key 20" },
    { label: "Key21", desc: "Key 21" },
    { label: "Key22", desc: "Key 22" },
    { label: "DEL", desc: "Key 23" },
    // Fila 3
    { label: "Key30", desc: "Key 30" },
    { label: "Key31", desc: "Key 31" },
    { label: "Key32", desc: "Key 32" },
    { label: "Key33", desc: "Key 33" },
    { label: "Key34", desc: "Key 34" },
    { label: "TAB", desc: "Key 35" },
    // Pulgares
    { label: "ENT", desc: "Key 39" },
    { label: "SYM", desc: "Key 40" },
    { label: "WIN", desc: "Key 41" },
  ],
};
