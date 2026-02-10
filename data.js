const keymap = {
  DEF: Array.from({ length: 42 }, (_, i) => ({
    label: `K${i + 1}`,
    desc: `Tecla ${i + 1} – Capa Base`,
  })),

  NAV: Array.from({ length: 42 }, (_, i) => ({
    label: `NAV${i + 1}`,
    desc: `Tecla ${i + 1} – Navegación`,
  })),

  SYM: Array.from({ length: 42 }, (_, i) => ({
    label: `SYM${i + 1}`,
    desc: `Tecla ${i + 1} – Símbolos`,
  })),

  NUM: Array.from({ length: 42 }, (_, i) => ({
    label: `NUM${i + 1}`,
    desc: `Tecla ${i + 1} – Números`,
  })),

  LED: Array.from({ length: 42 }, (_, i) => ({
    label: `LED${i + 1}`,
    desc: `Tecla ${i + 1} – Números`,
  })),

  FUN: Array.from({ length: 42 }, (_, i) => ({
    label: `FUN${i + 1}`,
    desc: `Tecla ${i + 1} – Números`,
  })),
};
