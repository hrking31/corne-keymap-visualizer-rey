import { useSyncExternalStore } from "react";

// ¿El teclado está apilado (móvil o tablet en vertical)? Mismo corte que style.css.
// Apilado: las pantallas del editor van a pantalla completa; lado a lado, en paneles.
const CONSULTA = "(max-aspect-ratio: 6/5)";

export function useApilado(): boolean {
  return useSyncExternalStore(
    (cambio) => {
      const m = window.matchMedia(CONSULTA);
      m.addEventListener("change", cambio);
      return () => m.removeEventListener("change", cambio);
    },
    () => window.matchMedia(CONSULTA).matches,
  );
}
