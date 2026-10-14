// Monta la app con el teclado de la prueba visual: el keymap del autor importado como lo
// hace la app («Importar .keymap»), con descripciones de prueba de largos distintos para
// medir el panel. Trae teclas de todo tipo: de dos acciones, heredadas (&trans), de capa,
// sin reconocer y vacías.
import { createRoot } from "react-dom/client";
import App from "../../src/App";
import { importarKeymap } from "../../src/keymap/importar";
import { leerKeymap } from "../../src/keymap/leer";
import { crearTeclado } from "../../src/teclados/plantillas";
import type { TecladoConfig } from "../../src/teclados/tipos";
import keymap from "../keymaps/corne-rey.keymap?raw";
import "../../src/style.css";

const { teclado: importado } = importarKeymap(
  leerKeymap(keymap),
  crearTeclado({ distribucion: "dvorak", idioma: "es-LA", so: "windows" }),
);

// Una de cada tres teclas lleva descripción, de una línea a varias
const FRASE = "Texto de prueba para medir el recuadro naranja del panel. ";
const capas = Object.fromEntries(
  Object.entries(importado.capas).map(([id, capa]) => [
    id,
    {
      ...capa,
      teclas: Object.fromEntries(
        Object.entries(capa.teclas).map(([pos, tecla]) => [
          pos,
          Number(pos) % 3 === 0 ? { ...tecla, descripcion: FRASE.repeat((Number(pos) % 4) + 1).trim() } : tecla,
        ]),
      ),
    },
  ]),
);

const teclado: TecladoConfig = {
  ...importado,
  capas,
  // «Corne Visualizer ZMK»: el título de siempre de la prueba
  nombre: "Visualizer",
};

createRoot(document.getElementById("root")!).render(<App tecladoInicial={teclado} />);
