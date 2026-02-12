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
    { label: "WIN", desc: "Key 41", extra: "Tecla windows" },
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
    {
      label: "EXPL",
      desc: "Key 13",
      extra: "Abre el explorador de archivos de VSC",
    },
    {
      label: "FLDR",
      desc: "Key 14",
      extra: "Crea nueva carpeta en el explorador de archivos de VSC",
    },
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
    {
      label: "FOCO",
      desc: "Key 25",
      extra: "Foco en explorador de archivo de VSC",
    },
    {
      label: "FILE",
      desc: "Key 26",
      extra: "Crea nuevo archivo en el explorador de archivos de VSC",
    },
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
        "Al presionar y mantener junto con la tecla NAV cambia a la capa NAV (navegación)",
    },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    { label: "6", desc: "Key 6" },
    { label: "7", desc: "Key 7" },
    { label: "8", desc: "Key 8" },
    { label: "9", desc: "Key 9" },
    { label: "0", desc: "Key 10" },
    { label: "BSPC", desc: "Key 11" },
    // Fila 2
    { label: "UP", desc: "Key 18", extra: "Tecla de navegación arriba" },
    { label: "COPY", desc: "Key 19" },
    { label: "PASTE", desc: "Key 20" },
    { label: "CUP", desc: "Key 21" },
    { label: "CMT", desc: "Key 22", extra: "Comenta la linea actual en VSC" },
    { label: "DEL", desc: "Key 23" },
    // Fila 3
    {
      label: "DWN",
      desc: "Key 30",
      extra: "Tecla de navegación abajo",
    },
    {
      label: "CONS",
      desc: "Key 31",
      extra: "Abre la consola (terminal) de VSC",
    },
    {
      label: "FILE",
      desc: "Key 32",
      extra: "Mueve el foco a los archivos de VSC",
    },
    {
      label: "GIT",
      desc: "Key 33",
      extra: "Mueve el foco a control de código fuente (git) de VSC",
    },
    {
      label: "EXT",
      desc: "Key 34",
      extra: "Mueve el foco a las extensiones de VSC",
    },
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
    { label: "¡", desc: "Key 1" },
    { label: '"', desc: "Key 2" },
    { label: "#", desc: "Key 3" },
    { label: "$", desc: "Key 4" },
    { label: "%", desc: "Key 5" },
    // Fila 2
    { label: "ALT", desc: "Key 12" },
    { label: "[", desc: "Key 13" },
    { label: "{", desc: "Key 14" },
    { label: "(", desc: "Key 15" },
    { label: "|", desc: "Key 16" },
    { label: "¿", desc: "Key 17" },
    // Fila 3
    { label: "CTRL", desc: "Key 24" },
    { label: "+", desc: "Key 25" },
    { label: "-", desc: "Key 26" },
    { label: "*", desc: "Key 27" },
    { label: "/", desc: "Key 28" },
    { label: "=", desc: "Key 29" },
    // Pulgares
    { label: "SHIFT", desc: "Key 36" },
    {
      label: "LED",
      desc: "Key 37",
      extra:
        "Cambia a la capa LED (luces RGB), debe de estar en capa SYM para funcionar",
    },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    { label: "PRTSC", desc: "Key 6", extra: "Imprime pantalla" },
    { label: "@", desc: "Key 7" },
    { label: "'", desc: "Key 8" },
    { label: "´", desc: "Key 9" },
    { label: "!", desc: "Key 10" },
    { label: "BSPC", desc: "Key 11" },
    // Fila 2
    { label: "?", desc: "Key 18" },
    { label: "&", desc: "Key 19" },
    { label: ")", desc: "Key 20" },
    { label: "}", desc: "Key 21" },
    { label: "]", desc: "Key 22" },
    { label: "DEL", desc: "Key 23" },
    // Fila 3
    { label: "<", desc: "Key 30" },
    { label: ">", desc: "Key 31" },
    { label: `\\`, desc: "Key 32" },
    { label: "_", desc: "Key 33" },
    { label: "°", desc: "Key 34" },
    { label: "TAB", desc: "Key 35" },
    // Pulgares
    { label: "ENT", desc: "Key 39" },
    {
      label: "SYM",
      desc: "Key 40",
      extra:
        "Al presionar y mantener junto con la tecla LED cambia a la capa LED (luces RGB)",
    },
    { label: "", desc: "Key 41" },
  ],

  // ---------------- CAPA Navegación -----------------
  NAV: [
    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    { label: "ESC", desc: "Key 0" },
    { label: "", desc: "Key 1" },
    {
      label: "PGUP",
      desc: "Key 2",
      extra: "Desplaza hacia arriba del documento",
    },
    {
      label: "SL-P",
      desc: "Key 3",
      extra: "Selecciona por palabras hacia la izquierda en VSC",
    },
    { label: "", desc: "Key 4" },
    { label: "", desc: "Key 5" },
    // Fila 2
    { label: "ALT", desc: "Key 12" },
    { label: "", desc: "Key 13" },
    {
      label: "PGDN",
      desc: "Key 14",
      extra: "Desplaza hacia abajo del documento",
    },
    {
      label: "SL-L",
      desc: "Key 15",
      extra: "Selecciona por letras hacia la izquierda en VSC",
    },
    { label: "", desc: "Key 16" },
    { label: "", desc: "Key 17" },
    // Fila 3
    { label: "CTRL", desc: "Key 24" },
    { label: "", desc: "Key 25" },
    {
      label: "<--",
      desc: "Key 26",
      extra: "Tecla de navegación izquierda",
    },
    {
      label: "C-LF",
      desc: "Key 27",
      extra:
        "Mueve la pestaña hacia la izquierda en VSC (dividiendo en dos pestañas la pantalla o en una sola)",
    },
    { label: "", desc: "Key 28" },
    { label: "", desc: "Key 29" },
    // Pulgares
    { label: "SHIFT", desc: "Key 36" },
    { label: "", desc: "Key 37" },
    { label: "SPC", desc: "Key 38" },

    // --- BLOQUE DERECHO ---
    // Fila 1
    {
      label: "M-SL",
      desc: "Key 6",
      extra: "Realiza multiples selecciones en VSC",
    },
    { label: "TABS", desc: "Key 7", extra:"Cambia entre pestañas abiertas en VSC" },
    {
      label: "SL-P",
      desc: "Key 8",
      extra: "Selecciona por palabras hacia la derecha en VSC",
    },
    {
      label: "SL-UP",
      desc: "Key 9",
      extra: "Selecciona por lineas hacia arriba en VSC",
    },
    { label: "", desc: "Key 10" },
    { label: "BSPC", desc: "Key 11" },
    // Fila 2
    {
      label: "OPEN",
      desc: "Key 18",
      extra: "Abre una carpeta en VSC (abre un proyecto)",
    },
    { label: "", desc: "Key 19" },
    {
      label: "SL-L",
      desc: "Key 20",
      extra: "Selecciona por letras hacia la derecha en VSC",
    },
    {
      label: "SL-DN",
      desc: "Key 21",
      extra: "Selecciona por lineas hacia abajo en VSC",
    },
    { label: "", desc: "Key 22" },
    { label: "DEL", desc: "Key 23" },
    // Fila 3
    {
      label: "CLS",
      desc: "Key 30",
      extra: "Cierra la carpeta actual en VSC (cierra un proyecto)",
    },
    { label: "", desc: "Key 31" },
    {
      label: "C-RG",
      desc: "Key 32",
      extra:
        "Mueve la pestaña hacia la derecha en VSC (dividiendo en dos pestañas la pantalla o en una sola)",
    },
    { label: "-->", desc: "Key 33", extra: "Tecla de navegación derecha" },
    { label: "", desc: "Key 34" },
    { label: "TAB", desc: "Key 35" },
    // Pulgares
    { label: "ENT", desc: "Key 39" },
    { label: "", desc: "Key 40" },
    { label: "", desc: "Key 41" },
  ],

  // ---------------- CAPA LED -----------------
  LED: [
    // --- BLOQUE IZQUIERDO  ---
    // Fila 1
    { label: "", desc: "Key 0" },
    { label: "", desc: "Key 1" },
    {
      label: "SP-D",
      desc: "Key 2",
      extra: "Disminuye la velocidad de la animación del efecto de los LED RGB",
    },
    {
      label: "EF-D",
      desc: "Key 3",
      extra: "Invierte el efecto de los LED RGB",
    },
    { label: "", desc: "Key 4" },
    { label: "", desc: "Key 5" },
    // Fila 2
    { label: "", desc: "Key 12" },
    { label: "", desc: "Key 13" },
    {
      label: "SA-D",
      desc: "Key 14",
      extra: "Disminuye la saturación de los LED RGB",
    },
    {
      label: "BR-D",
      desc: "Key 15",
      extra: "Disminuye el brillo de los LED RGB",
    },
    { label: "", desc: "Key 16" },
    { label: "", desc: "Key 17" },
    // Fila 3.
    { label: "", desc: "Key 24" },
    { label: "", desc: "Key 25" },
    {
      label: "RGB",
      desc: "Key 26",
      extra: "Activa o desactiva los LED RGB (ON, OFF)",
    },
    {
      label: "TN-D",
      desc: "Key 27",
      extra: "Disminuye el tono de los LED RGB",
    },
    { label: "", desc: "Key 28" },
    { label: "", desc: "Key 29" },
    // Pulgares
    { label: "", desc: "Key 36" },
    { label: "", desc: "Key 37" },
    { label: "", desc: "Key 38" },

    // --- BLOQUE DERECHO ---
    // Fila 1
    { label: "", desc: "Key 6" },
    { label: "", desc: "Key 7" },
    { label: "EF-I", desc: "Key 8", extra: "Avanza el efecto de los LED RGB" },
    {
      label: "SP-I",
      desc: "Key 9",
      extra: "Aumenta la velocidad de la animación del efecto de los LED RGB",
    },
    { label: "", desc: "Key 10" },
    { label: "", desc: "Key 11" },
    // Fila 2
    { label: "", desc: "Key 18" },
    { label: "", desc: "Key 19" },
    {
      label: "BR-I",
      desc: "Key 20",
      extra: "Aumenta el brillo de los LED RGB",
    },
    {
      label: "SA-I",
      desc: "Key 21",
      extra: "Aumenta la saturación de los LED RGB",
    },
    { label: "", desc: "Key 22" },
    { label: "", desc: "Key 23" },
    // Fila 3
    { label: "", desc: "Key 30" },
    { label: "", desc: "Key 31" },
    {
      label: "TN-I",
      desc: "Key 32",
      extra: "Aumenta el tono de los LED RGB",
    },
    {
      label: "PWR",
      desc: "Key 33",
      extra:
        "Alternar la alimentación externa del CORNE (habilita o deshabilita la alimentación de PANTALLAS y LED RGB) ",
    },
    { label: "", desc: "Key 34" },
    { label: "", desc: "Key 35" },
    // Pulgares
    { label: "", desc: "Key 39" },
    { label: "", desc: "Key 40" },
    { label: "", desc: "Key 41" },
  ],

  // ---------------- CAPA FUNCIONES -----------------
  FUN: [
    // --- BLOQUE IZQUIERDO  ---
    // Fila 1
    { label: "F1", desc: "Key 0" },
    { label: "F2", desc: "Key 1" },
    { label: "F3", desc: "Key 2" },
    { label: "F4", desc: "Key 3" },
    { label: "F5", desc: "Key 4" },
    { label: "F6", desc: "Key 5" },
    // Fila 2
    { label: "", desc: "Key 12" },
    {
      label: "BT1",
      desc: "Key 13",
      extra:
        "Perfil bluetooth 1 (selecciona el 1 dispositivo host vinculado para recibir la entrada del teclado)",
    },
    {
      label: "BT2",
      desc: "Key 14",
      extra:
        "Perfil bluetooth 2 (selecciona el 2 dispositivo host vinculado para recibir la entrada del teclado)",
    },
    {
      label: "BT3",
      desc: "Key 15",
      extra:
        "Perfil bluetooth 3 (selecciona el 3 dispositivo host vinculado para recibir la entrada del teclado)",
    },
    {
      label: "BT4",
      desc: "Key 16",
      extra:
        "Perfil bluetooth 4 (selecciona el 4 dispositivo host vinculado para recibir la entrada del teclado)",
    },
    {
      label: "BT5",
      desc: "Key 17",
      extra:
        "Perfil bluetooth 5 (selecciona el 5 dispositivo host vinculado para recibir la entrada del teclado)",
    },
    // Fila 3.
    { label: "", desc: "Key 24" },
    {
      label: "BTCLR",
      desc: "Key 25",
      extra:
        "Borrar la información del vínculo entre el teclado y el host para el perfil seleccionado",
    },
    { label: "", desc: "Key 26" },
    { label: "", desc: "Key 27" },
    { label: "", desc: "Key 28" },
    { label: "", desc: "Key 29" },
    // Pulgares
    { label: "", desc: "Key 36" },
    { label: "", desc: "Key 37" },
    { label: "", desc: "Key 38" },

    // --- BLOQUE DERECHO ---
    // Fila 1
    { label: "F7", desc: "Key 6" },
    { label: "F8", desc: "Key 7" },
    { label: "F9", desc: "Key 8" },
    { label: "F10", desc: "Key 9" },
    { label: "F11", desc: "Key 10" },
    { label: "F12", desc: "Key 11" },
    // Fila 2
    { label: "PRV", desc: "Key 18", extra: "Reproduce la pista anterior" },
    {
      label: "P/P",
      desc: "Key 19",
      extra: "Reproducir o pausar la pista actual",
    },
    {
      label: "VOL+",
      desc: "Key 20",
      extra: "Aumenta el volumen de reproducción",
    },
    {
      label: "VOL-",
      desc: "Key 21",
      extra: "Disminuye el volumen de reproducción",
    },
    { label: "NXT", desc: "Key 22", extra: "Reproduce la siguiente pista" },
    {
      label: "MUTE",
      desc: "Key 23",
      extra: "Silencia o activa el sonido de reproducción",
    },
    // Fila 3
    { label: "", desc: "Key 30" },
    { label: "", desc: "Key 31" },
    { label: "", desc: "Key 32" },
    { label: "", desc: "Key 33" },
    { label: "", desc: "Key 34" },
    { label: "", desc: "Key 35" },
    // Pulgares
    { label: "", desc: "Key 39" },
    { label: "", desc: "Key 40" },
    { label: "", desc: "Key 41" },
  ],
};
