// Monta la app con la configuración del autor (data.ts pasada al modelo nuevo). La
// prueba visual la compara con la versión original, que muestra esos mismos datos: así se
// garantiza que la geometría y el aspecto del teclado no cambian.
import { createRoot } from "react-dom/client";
import App from "../../src/App";
import { keymap } from "../../src/data";
import { desdeKeymap } from "../../src/teclados/convertir";
import "../../src/style.css";

const teclado = {
  ...desdeKeymap(keymap, { distribucion: "dvorak", idioma: "es-LA", so: "windows" }),
  // El mismo título que la versión original
  nombre: "Corne ZMK Visualizer",
};

createRoot(document.getElementById("root")!).render(<App tecladoInicial={teclado} />);
