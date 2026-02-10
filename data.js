const keymap = {
  BASE: [
    // --- BLOQUE DERECHO (Físicamente en left-side, index 0-20) ---
    // Fila 1
    { label: "ESC", desc: "Key   0" },
    { label: ".", desc: "Key   1", extra: ":" },
    { label: ",", desc: "Key   2", extra: ";" },
    { label: "Ñ", desc: "Key   3", extra: "Alt Gr + N" },
    { label: "P", desc: "Key   4" },
    { label: "Y", desc: "Key   5" },
    // Fila 2
    { label: "ALT ", desc: "Key   12" },
    { label: "A", desc: "Key   13" },
    { label: "O", desc: "Key   14" },
    { label: "E", desc: "Key   15" },
    { label: "U", desc: "Key   16" },
    { label: "I", desc: "Key   17" },
    // Fila 3
    { label: "CTRL", desc: "Key  24" },
    { label: "", desc: "Key  25", extra: "Nada Asignado" },
    { label: "Q", desc: "Key   26" },
    { label: "J", desc: "Key   27" },
    { label: "K", desc: "Key 28" },
    { label: "X", desc: "Key 29" },
    // Pulgares
    { label: "SHFT", desc: "Key 36" },
    { label: "NUM", desc: "Key 37" },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE IZQUIERDO (Físicamente en right-side, index 21-41) ---
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
    { label: "SIN", desc: "Key 40" },
    { label: "GUI", desc: "Key 41" },
  ],

  NUM: [
    // --- BLOQUE DERECHO (Físicamente en left-side, index 0-20) ---
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
    { label: "SHFT", desc: "Key 36" },
    { label: "NUM", desc: "Key 37" },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE IZQUIERDO (Físicamente en right-side, index 21-41) ---
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
    { label: "NAV", desc: "Key 40" },
    { label: "FUN", desc: "Key 41" },
  ],

    SYM: [
    // --- BLOQUE DERECHO (Físicamente en left-side, index 0-20) ---
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
    { label: "SHFT", desc: "Key 36" },
    { label: "LED", desc: "Key 37" },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE IZQUIERDO (Físicamente en right-side, index 21-41) ---
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
    { label: "", desc: "Key 41" },
  ],
};
