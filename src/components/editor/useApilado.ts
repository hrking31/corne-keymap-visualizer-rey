import { useSyncExternalStore } from "react";

// ¿La pantalla cumple una media query? Se actualiza al girar o cambiar el tamaño
function useConsulta(consulta: string): boolean {
  return useSyncExternalStore(
    (cambio) => {
      const m = window.matchMedia(consulta);
      m.addEventListener("change", cambio);
      return () => m.removeEventListener("change", cambio);
    },
    () => window.matchMedia(consulta).matches,
  );
}

// ¿El teclado está apilado (móvil o tablet en vertical)? Mismo corte que style.css.
// Apilado: las pantallas del editor van a pantalla completa; lado a lado, en paneles.
export const useApilado = () => useConsulta("(max-aspect-ratio: 6/5)");

// ¿Es un móvil? Mismo corte que editor.css: el título a la izquierda y los botones de
// acción (⚙, «Parar», ✎ ＋ y ✓) abajo, fuera de la fila de capas
export const useMovil = () => useConsulta("(max-width: 600px)");
