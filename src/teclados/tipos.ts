// Modelo de la Fase 2: cada usuario configura su propio teclado. Es exactamente lo que
// se guarda en Firestore (un documento por usuario, teclados/{uid}).

// Una tecla de una capa. Las teclas se guardan por su número de posición en ZMK (0…41),
// el mismo orden de los bindings del .keymap: así el «Key N» del panel sigue sirviendo
// para orientarse y para cargar algún día el .keymap.
export type TeclaConfig = {
  texto: string; // lo que se ve en la tecla y es el título del panel
  descripcion: string; // el recuadro naranja del panel
  deCapa: boolean; // tecla que cambia de capa: se pinta en naranja
  // Importada de un &trans del .keymap: hace lo mismo que en la capa de abajo, y muestra
  // su texto en gris. Al editarla a mano deja de serlo
  heredada?: boolean;
};

export type CapaConfig = {
  corto: string; // el botón de capa, máximo 6 letras («NAV»)
  largo: string; // la primera línea del panel («Navegación»)
  // "0"…"41". Una capa recién creada no tiene teclas: el panel solo muestra «Key N»
  teclas: Record<string, TeclaConfig>;
};

export type Distribucion = "qwerty" | "colemak-dh" | "colemak" | "dvorak";
export type Idioma = "es-LA" | "es-ES" | "en-US";
export type SistemaOperativo = "windows" | "macos" | "linux";

export type Ajustes = {
  distribucion: Distribucion;
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
