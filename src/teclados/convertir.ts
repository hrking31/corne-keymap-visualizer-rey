// Puentes entre el modelo de la Fase 2 y lo que ya existe.
import type { Keymap } from "../tipos";
import type { CapaConfig, TeclaConfig, TeclaDibujo, TecladoConfig } from "./tipos";

const rango = (desde: number, hasta: number) => Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

// Orden en que se dibujan las teclas: primero el bloque izquierdo (filas 0–5, 12–17,
// 24–29 y pulgares 36–38) y luego el derecho (6–11, 18–23, 30–35 y 39–41). Es el orden
// de data.ts y el que esperan dividirBloques y dividirFilas.
export const ORDEN_DIBUJO: readonly number[] = [
  ...rango(0, 5), ...rango(12, 17), ...rango(24, 29), ...rango(36, 38),
  ...rango(6, 11), ...rango(18, 23), ...rango(30, 35), ...rango(39, 41),
];

const VACIA: TeclaConfig = { texto: "", descripcion: "", deCapa: false };

// Las 42 teclas de una capa en el orden de dibujo; las que no están configuradas salen vacías
export function teclasParaDibujar(capa: CapaConfig): TeclaDibujo[] {
  return ORDEN_DIBUJO.map((pos) => ({ ...VACIA, ...capa.teclas[pos], pos }));
}

// Nombres largos que usaba la versión anterior («Capa Navegación» → «Navegación»)
const NOMBRES: Record<string, string> = {
  BASE: "Base",
  NUM: "Números",
  SYM: "Símbolos",
  NAV: "Navegación",
  LED: "Led RGB",
  FUN: "Funciones",
};

// Pasa data.ts al modelo nuevo, para guardar la configuración del autor en su cuenta.
// El número de posición sale de «Key N»; la descripción, del texto naranja (extra).
export function desdeKeymap(keymap: Keymap, ajustes: TecladoConfig["ajustes"]): TecladoConfig {
  const capas: Record<string, CapaConfig> = {};
  for (const [id, teclas] of Object.entries(keymap)) {
    const config: CapaConfig = { corto: id, largo: NOMBRES[id] ?? id, teclas: {} };
    for (const t of teclas) {
      const pos = Number(t.desc.replace("Key ", ""));
      const texto = t.label.trim();
      if (!texto && !t.extra) continue;
      config.teclas[pos] = { texto, descripcion: t.extra ?? "", deCapa: t.clase === "key-naranja" };
    }
    capas[id.toLowerCase()] = config;
  }
  return { nombre: "Rey", ajustes, orden: Object.keys(keymap).map((id) => id.toLowerCase()), capas };
}
