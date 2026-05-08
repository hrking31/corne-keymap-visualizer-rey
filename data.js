const keymap = {
  // ---------------- CAPA BASE -----------------
  BASE: [
    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    {
      label: "ESC",
      desc: "Key 0",
      extra: "cancela, detiene o aborta una acción en curso",
    },
    { label: ".", desc: "Key 1", extra: "Con SHIFT = :" },
    { label: ",", desc: "Key 2", extra: "Con SHIFT = ;" },
    { label: "Ñ", desc: "Key 3" },
    { label: "P", desc: "Key 4" },
    { label: "Y", desc: "Key 5" },
    // Fila 2
    {
      label: "ALT ",
      desc: "Key 12",
      extra:
        "Permite acceder a funciones alternativas en los menús de las aplicaciones",
    },
    { label: "A", desc: "Key 13" },
    { label: "O", desc: "Key 14" },
    { label: "E", desc: "Key 15" },
    { label: "U", desc: "Key 16" },
    { label: "I", desc: "Key 17" },
    // Fila 3
    {
      label: "CTRL",
      desc: "Key 24",
      extra:
        "En combinación con otras teclas para ejecutar comandos de software",
    },
    { label: "´", desc: "Key 25", extra: "Tilde" },
    { label: "Q", desc: "Key 26" },
    { label: "J", desc: "Key 27" },
    { label: "K", desc: "Key 28" },
    { label: "X", desc: "Key 29" },
    // Pulgares
    {
      label: "SHIFT",
      desc: "Key 36",
      extra:
        "Se mantiene presionada mientras se escribe una letra, esta sale en MAYÚSCULA",
    },
    { label: "NUM", desc: "Key 37", extra: "Cambia a la capa NUM (NÚMEROS)" },
    { label: "SPC", desc: "Key 38", extra: "Tecla de espacio" },

    // --- BLOQUE DERECHO ---
    // Fila 1
    { label: "F", desc: "Key 6" },
    { label: "G", desc: "Key 7" },
    { label: "C", desc: "Key 8" },
    { label: "H", desc: "Key 9" },
    { label: "L", desc: "Key 10" },
    {
      label: "BSPC",
      desc: "Key 11",
      extra:
        "Elimina el carácter situado a la dercha del cursor o la selección actual en un texto",
    },
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
    {
      label: "ENT",
      desc: "Key 39",
      extra:
        "Confirma una acción, ejecuta comandos, inicia un proceso o crear saltos de línea en texto",
    },
    { label: "SIN", desc: "Key 40", extra: "Cambia a la capa SYM (SÍMBOLOS)" },
    { label: "WIN", desc: "Key 41", extra: "Tecla windows" },
  ],

  // ---------------- CAPA NÚMEROS -----------------
  NUM: [
    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    {
      label: "ESC",
      desc: "Key 0",
      extra: "cancela, detiene o aborta una acción en curso",
    },
    { label: "1", desc: "Key 1" },
    { label: "2", desc: "Key 2" },
    { label: "3", desc: "Key 3" },
    { label: "4", desc: "Key 4" },
    { label: "5", desc: "Key 5" },
    // Fila 2
    { label: "LEFT", desc: "Key 12", extra: "Tecla de navegación izquierda" },
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
      label: "INIT",
      desc: "Key 15",
      extra: "Me lleva al inicio de la linea en VSC",
    },
    {
      label: "CODE UP",
      desc: "Key 16",
      extra: "Mueve la linea actual hacia arriba en VSC",
    },
    {
      label: "UNDO",
      desc: "Key 16",
      extra: "Deshace la última acción en VSC",
    },
    // Fila 3
    { label: "RIGHT", desc: "Key 24", extra: "Tecla de navegación derecha" },
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
      label: "CODE DN",
      desc: "Key 28",
      extra: "Mueve la linea actual hacia abajo en VSC",
    },
    {
      label: "REDO",
      desc: "Key 29",
      extra: "Rehace la última acción en VSC",
    },
    // Pulgares
    {
      label: "WIN-NAV",
      desc: "Key 36",
      extra:
        "Tecla hold-tap, presiona rápido para abrir nueva ventana, mantén presionado para abrir la primera ventana del navegador, KOMOREBI",
    },
    {
      label: "NUM",
      clase: "key-naranja",
      desc: "Key 37",
      extra:
        "Al presionar y mantener junto con la tecla NAV cambia a la capa NAV, NAVEGACIÓN",
    },
    { label: "SPC", desc: "Key 38", extra: "Tecla de espacio" },

    // --- BLOQUE DERECHO ---
    // Fila 1
    { label: "6", desc: "Key 6" },
    { label: "7", desc: "Key 7" },
    { label: "8", desc: "Key 8" },
    { label: "9", desc: "Key 9" },
    { label: "0", desc: "Key 10" },
    {
      label: "BSPC",
      desc: "Key 11",
      extra:
        "Elimina el carácter situado a la izquierda del cursor o la selección actual en un texto",
    },
    // Fila 2
    { label: "UP", desc: "Key 18", extra: "Tecla de navegación arriba" },
    { label: "COPY", desc: "Key 19" },
    { label: "PASTE", desc: "Key 20" },
    { label: "CUP", desc: "Key 21" },
    { label: "CMT", desc: "Key 22", extra: "Comenta la linea actual en VSC" },
    {
      label: "DEL",
      desc: "Key 23",
      extra:
        "Elimina el carácter situado delante del cursor o la selección actual en un texto",
    }, // Fila 3
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
    {
      label: "QUIT-VSC",
      desc: "Key 35",
      extra:
        "Tecla hold-tap, presiona rápido para cerrar una ventana, mantén presionado para abrir VSC.exe, KOMOREBI",
    },
    // Pulgares
    {
      label: "ENT",
      desc: "Key 39",
      extra:
        "Confirma una acción, ejecuta comandos, inicia un proceso o crear saltos de línea en texto",
    },
    {
      label: "NAV",
      desc: "Key 40",
      extra:
        "Cambia a la capa NAV (NAVEGACIÓN), debe de estar en capa NUM para funcionar y mantener presionada la tecla NUM",
    },
    {
      label: "FUN",
      desc: "Key 41",
      extra:
        "Cambia a la capa FUN (FUNCIONES), debe de estar en capa NUM para funcionar y mantener presionada la tecla NUM",
    },
  ],

  // ---------------- CAPA SÍMBOLOS -----------------
  SYM: [
    // --- BLOQUE IZQUIERDO ---
    // Fila 1
    {
      label: "",
      desc: "Key 0",
    },
    { label: "¡", desc: "Key 1" },
    { label: '"', desc: "Key 2" },
    { label: "#", desc: "Key 3" },
    { label: "$", desc: "Key 4" },
    { label: "%", desc: "Key 5" },
    // Fila 2
    { label: "", desc: "Key 12" },
    { label: "[", desc: "Key 13" },
    { label: "{", desc: "Key 14" },
    { label: "(", desc: "Key 15" },
    { label: "|", desc: "Key 16" },
    { label: "¿", desc: "Key 17" },
    // Fila 3
    { label: "", desc: "Key 24" },
    { label: "+", desc: "Key 25" },
    { label: "-", desc: "Key 26" },
    { label: "*", desc: "Key 27" },
    { label: "/", desc: "Key 28" },
    { label: "=", desc: "Key 29" },
    // Pulgares
    { label: "", desc: "Key 36" },
    {
      label: "LED",
      desc: "Key 37",
      extra:
        "Cambia a la capa LED (luces RGB), debe de estar en capa SYM para funcionar y mantener precionada la tecla SYM",
    },
    { label: "SPC", desc: "Key 38", extra: "Tecla de espacio" },

    // --- BLOQUE DERECHO ---
    // Fila 1
    { label: "PRT SC", desc: "Key 6", extra: "Imprime pantalla" },
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
    { label: "", desc: "Key 35" },
    // Pulgares
    {
      label: "ENT",
      desc: "Key 39",
      extra:
        "Confirma una acción, ejecuta comandos, inicia un proceso o crear saltos de línea en texto",
    },
    {
      label: "SYM",
      clase: "key-naranja",
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
    {
      label: "FLO WIN",
      desc: "Key 0",
      extra:
        "Manipulación de estado de ventana (convierte en flotante) KOMOREBI",
    },
    {
      label: "WIN DIV",
      desc: "Key 1",
      extra:
        "Mueve la ventana enfocada a la izquierda dividiendo en dos el area de trabajo en VSC(si la ventana del código esta en la parte derecha, la mueve a la parte izquierda, si esta en la parte izquierda, la mueve a la parte derecha)",
    },
    {
      label: "SEL PAL",
      desc: "Key 2",
      extra: "Selecciona por palabras hacia la izquierda en VSC",
    },
    {
      label: "DES WIN",
      desc: "Key 3",
      extra:
        "Des apila ventanas en KOMOREBI (si hay ventanas apiladas, las separa en ventanas individuales)",
    },
    {
      label: "FOC MON L",
      desc: "Key 4",
      extra:
        "Cambia el foco al siguiente monitor en KOMOREBI (si hay mas de un monitor a la izquierda del monitor actual, cambia el foco al siguiente monitor en sentido antihorario)",
    },
    {
      label: "FOC MON R",
      desc: "Key 5",
      extra:
        "Cambia el foco al siguiente monitor en KOMOREBI (si hay mas de un monitor a la derecha del monitor actual, cambia el foco al siguiente monitor en sentido horario)",
    },
    // Fila 2
    {
      label: "PG UP",
      desc: "Key 12",
      extra: "Desplaza hacia arriba del documento",
    },
    {
      label: "WIN TAB",
      desc: "Key 13",
      extra:
        "Cambia entre pestañas abiertas en VSC (Desplazamiento Secuencial)",
    },
    {
      label: "SEL LET",
      desc: "Key 14",
      extra: "Selecciona por letras hacia la izquierda en VSC",
    },
    {
      label: "MAX WIN",
      desc: "Key 15",
      extra:
        "Maximiza ventanas en pila en KOMOREBI (si la ventana enfocada no esta maximizada, la maximiza, si ya esta maximizada, la restaura a su tamaño original)",
    },
    {
      label: "CMB WIN L",
      desc: "Key 16",
      extra:
        "Cambia entre ventanas apiladas a la izquierda en KOMOREBI (si hay ventanas apiladas, cambia el foco entre las ventanas apiladas)",
    },
    {
      label: "CMB WIN R",
      desc: "Key 17",
      extra:
        "Cambia entre ventanas apiladas a la derecha en KOMOREBI (si hay ventanas apiladas, cambia el foco entre las ventanas apiladas)",
    },
    // Fila 3
    {
      label: "PG DN",
      desc: "Key 24",
      extra: "Desplaza hacia abajo del documento",
    },
    {
      label: "CORRE",
      desc: "Key 25",
      extra:
        "Corrector ortográfico para VSC (Alterna entre la palabra correcta y las sugerencias de corrección)",
    },
    {
      label: "EJE X/Y",
      desc: "Key 26",
      extra:
        "Tecla hold-tap, presiona rápido invierte el orden de las ventana en el eje X, mantén presionado invierte el orden de las ventana en el eje Y, KOMOREBI",
    },
    {
      label: "[MAX]",
      desc: "Key 27",
      extra:
        "Maximiza la ventanas enfocada en KOMOREBI (Pantalla Completa), (no usar con ventanas en pila)",
    },
    {
      label: "APILA L",
      desc: "Key 28",
      extra:
        "Apila ventanas hacia la izquierda en KOMOREBI (si hay ventanas sin apilar las agrupa en una sola ventana hacia la izquierda)",
    },
    {
      label: "APILA R",
      desc: "Key 29",
      extra:
        "Apila ventanas hacia la derecha en KOMOREBI (si hay ventanas sin apilar las agrupa en una sola ventana hacia la derecha)",
    },
    // Pulgares
    {
      label: "MON WIN",
      desc: "Key 36",
      extra:
        "Mueve la ventana activa al siguiente monitor hacia la izquierda en KOMOREBI (si hay mas de un monitor a la izquierda del monitor actual, la mueve al siguiente monitor en sentido antihorario)",
    },
    { label: "NUM", desc: "Key 37", clase: "key-naranja" },
    { label: "SPC", desc: "Key 38", extra: "Tecla de espacio" },

    // --- BLOQUE DERECHO ---
    // Fila 1
    {
      label: "FOCO L-R",
      desc: "Key 6",
      extra:
        "Tecla hold-tap, presiona rápido mueve el foco a la ventana de la izquierda, mantén presionado mueve el foco a la ventana de la derecha, KOMOREBI",
    },
    {
      label: "MOVE 1",
      desc: "Key 7",
      extra: "Mueve la ventana activa al escritorio 1 en KOMOREBI",
    },
    {
      label: "MOVE 2",
      desc: "Key 8",
      extra: "Mueve la ventana activa al escritorio 2 en KOMOREBI",
    },
    {
      label: "SEL PAL",
      desc: "Key 9",
      extra: "Selecciona por palabras hacia la derecha en VSC",
    },
    {
      label: "WIN DIV",
      desc: "Key 10",
      extra:
        "Mueve la ventana enfocada a la derecha dividiendo en dos el area de trabajo en VSC(si la ventana del código esta en la parte derecha, la mueve a la parte izquierda, si esta en la parte izquierda, la mueve a la parte derecha)",
    },
    {
      label: "SEL MULT",
      desc: "Key 11",
      extra: "Realiza multiples selecciones de coincidencias en VSC",
    },
    // Fila 2
    {
      label: "FOCO N-S",
      desc: "Key 18",
      extra:
        "Tecla hold-tap, presiona rápido mueve el foco a la ventana de abajo, mantén presionado mueve el foco a la ventana de arriba, KOMOREBI",
    },
    {
      label: "MOV 3",
      desc: "Key 19",
      extra: "Mueve la ventana activa al escritorio 3 en KOMOREBI",
    },
    {
      label: "MOV 4",
      desc: "Key 20",
      extra: "Mueve la ventana activa al escritorio 4 en KOMOREBI",
    },
    {
      label: "SEL LET",
      desc: "Key 21",
      extra: "Selecciona por letras hacia la derecha en VSC",
    },
    {
      label: "LINE UP",
      desc: "Key 22",
      extra: "Selecciona por linea hacia arriba en VSC",
    },
    {
      label: "OPEN FOL",
      desc: "Key 23",
      extra: "Abre nueva carpeta de proyecto en VSC",
    },
    // Fila 3
    {
      label: "WIN X -",
      desc: "Key 30",
      extra: "Disminuye el tamaño de la ventanas de KOMOREBI (en el eje x)",
    },
    {
      label: "WIN X +",
      desc: "Key 31",
      extra: "Aumenta el tamaño de la ventanas de KOMOREBI (en el eje x)",
    },
    {
      label: "WIN Y +",
      desc: "Key 32",
      extra: "Aumenta el tamaño de la ventanas de KOMOREBI (en el eje y)",
    },
    {
      label: "WIN Y -",
      desc: "Key 33",
      extra: "Disminuye el tamaño de la ventanas de KOMOREBI (en el eje y)",
    },
    {
      label: "LINE DOW",
      desc: "Key 34",
      extra: "Selecciona por linea hacia abajo en VSC",
    },
    {
      label: "CLOSE FOL",
      desc: "Key 35",
      extra: "Cierra carpeta de proyecto activo en VSC",
    },
    // Pulgares
    {
      label: "ENT",
      desc: "Key 39",
      extra:
        "Confirma una acción, ejecuta comandos, inicia un proceso o crear saltos de línea en texto",
    },
    { label: "NAV", desc: "Key 40", clase: "key-naranja" },
    {
      label: "MON WIN",
      desc: "Key 36",
      extra:
        "Mueve la ventana activa al siguiente monitor hacia la derecha en KOMOREBI (si hay mas de un monitor a la derecha del monitor actual, la mueve al siguiente monitor en sentido horario)",
    },
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
    {
      label: "ESCR 1",
      desc: "Key 4",
      extra:
        "Cambia el foco al monitor donde se encuentre el escritorio 1 en KOMOREBI",
    },
    {
      label: "ESCR 2",
      desc: "Key 5",
      extra:
        "Cambia el foco al monitor donde se encuentre el escritorio 2 en KOMOREBI",
    },
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
    {
      label: "ESCR 3",
      desc: "Key 17",
      extra:
        "Cambia el foco al monitor donde se encuentre el escritorio 3 en KOMOREBI",
    },
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
    {
      label: "ESCR 4",
      desc: "Key 29",
      extra:
        "Cambia el foco al monitor donde se encuentre el escritorio 4 en KOMOREBI",
    },
    // Pulgares
    { label: "", desc: "Key 36" },
    { label: "LED", desc: "Key 37", clase: "key-naranja" },
    { label: "", desc: "Key 38" },

    // --- BLOQUE DERECHO ---
    // Fila 1
    {
      label: "ESCR 5",
      desc: "Key 6",
      extra:
        "Cambia el foco al monitor donde se encuentre el escritorio 5 en KOMOREBI",
    },
    {
      label: "ESCR 8",
      desc: "Key 7",
      extra:
        "Cambia el foco al monitor donde se encuentre el escritorio 8 en KOMOREBI",
    },
    { label: "EF-I", desc: "Key 8", extra: "Avanza el efecto de los LED RGB" },
    {
      label: "SP-I",
      desc: "Key 9",
      extra: "Aumenta la velocidad de la animación del efecto de los LED RGB",
    },
    { label: "", desc: "Key 10" },
    { label: "", desc: "Key 11" },
    // Fila 2
    {
      label: "ESCR 6",
      desc: "Key 18",
      extra:
        "Cambia el foco al monitor donde se encuentre el escritorio 6 en KOMOREBI",
    },
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
    {
      label: "ESCR 7",
      desc: "Key 30",
      extra:
        "Cambia el foco al monitor donde se encuentre el escritorio 7 en KOMOREBI",
    },
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
    { label: "SYM", desc: "Key 40", clase: "key-naranja" },
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
    {
      label: "BT CLR",
      desc: "Key 12",
      extra:
        "Borrar la información del vínculo entre el teclado y el host para el perfil seleccionado",
    },
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
    {
      label: "REST KOM",
      desc: "Key 24",
      extra: "Recarga la configuración propia de KOMOREBI",
    },
    {
      label: "REST",
      desc: "Key 25",
      extra: "Reset a la configuración visual de KOMOREBI",
    },
    {
      label: "WIN KOM",
      desc: "Key 26",
      extra:
        "Muestra ventana con información de los comandos de KOMOREBI",
    },
    { label: "", desc: "Key 27" },
    { label: "", desc: "Key 28" },
    { label: "", desc: "Key 29" },
    // Pulgares
    { label: "", desc: "Key 36" },
    { label: "NUM", desc: "Key 37", clase: "key-naranja" },
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
    { label: "FUN", desc: "Key 41", clase: "key-naranja" },
  ],
};
