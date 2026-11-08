// El teclado de cada usuario, sacado de su .keymap (las capas, las teclas y a qué capa lleva
// cada una) más lo que él escribe (descripciones y nombres). Es exactamente lo que se guarda
// en Firestore (un documento por usuario, teclados/{uid}).

// Una tecla de una capa. Las teclas se guardan por su número de posición en ZMK (0…41),
// el mismo orden de los bindings del .keymap: el «Key N» del panel.
export type TeclaConfig = {
  texto: string; // lo que se ve en la tecla y es el título del panel
  descripcion: string; // el recuadro naranja del panel
  // Importada de un &trans del .keymap: hace lo mismo que en la capa de abajo, y muestra
  // su texto en gris. Al editarla a mano deja de serlo
  heredada?: boolean;
  // Importada de un .keymap con algo que no se reconoce (mal escrito, p. ej. «&kp NOEXISTE»):
  // el binding original. La tecla se marca hasta que se corrija el .keymap o se edite a mano
  sinReconocer?: string;
  // Importada de un .keymap: el código de ZMK que envía al tocarla («A», «LC(C)», «HOME»).
  // Lo usa la práctica para saber si se pulsó. No cambia al editar el texto a mano («INIT»
  // sigue enviando HOME), solo al volver a importar. Las que no envían una tecla (macros…)
  // no lo llevan: se reconocen por su texto, si es un carácter
  envia?: string;
  // Importada de un .keymap: la capa a la que lleva una tecla de capa. Con eso la app sabe
  // qué teclas mantener, y en qué orden, para llegar a cada capa (caminoDeCapa). Es lo único
  // que marca una tecla de capa: no se pintan de naranja, solo se colorean al animarse
  abre?: AbreCapa;
};

// Cómo se usa una tecla de capa:
// - mantener: &mo, el mantener de &lt y de un tocar/mantener propio;
// - tocar: &tog, &to y &sl (se pulsa una vez y se suelta);
// - juntas: una capa por combinación (conditional_layers, p. ej. LOWER + RAISE → ADJUST):
//   esta tecla y la que abrió la capa en la que está se mantienen a la vez, en cualquier orden
export type ModoCapa = "mantener" | "tocar" | "juntas";

// El id de la capa (no su número): así renombrarla no lo rompe
export type AbreCapa = { capa: string; modo: ModoCapa };

export type CapaConfig = {
  corto: string; // el botón de capa, máximo 6 letras («NAV»)
  largo: string; // la primera línea del panel («Navegación»)
  // "0"…"41". Solo las que tienen algo (las &none vacías no se guardan)
  teclas: Record<string, TeclaConfig>;
};

export type Idioma = "es-LA" | "es-ES" | "en-US";
export type SistemaOperativo = "windows" | "macos" | "linux";

// Con qué se leen los textos del .keymap: el idioma del sistema (qué se ve en cada tecla)
// y el sistema operativo (cómo se llaman los modificadores)
export type Ajustes = {
  idioma: Idioma;
  so: SistemaOperativo;
};

export type TecladoConfig = {
  nombre: string;
  ajustes: Ajustes;
  // Orden de los botones de capa. La primera es siempre "base" (la capa 0 de ZMK)
  orden: string[];
  capas: Record<string, CapaConfig>;
};

// Una tecla lista para dibujar: su configuración más su número de posición
export type TeclaDibujo = TeclaConfig & { pos: number };
