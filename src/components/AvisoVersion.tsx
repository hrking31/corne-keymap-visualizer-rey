import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

// Registra el service worker (la app funciona sin conexión) y, cuando hay una versión
// nueva publicada y ya descargada, la ofrece con un aviso en vez de recargar sola: así
// nunca corta lo que el usuario está haciendo. Fuera de la app (la prueba visual) no se monta.
let actualizar: ((recargar?: boolean) => Promise<void>) | null = null;

export default function AvisoVersion() {
  const [hayNueva, setHayNueva] = useState(false);

  useEffect(() => {
    // Una sola vez aunque React monte dos veces en desarrollo (StrictMode)
    actualizar ??= registerSW({ onNeedRefresh: () => setHayNueva(true) });
  }, []);

  if (!hayNueva) return null;

  return (
    <div
      className="fixed bottom-12 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md border border-naranja bg-panel px-4 py-2 text-sm text-hueso shadow-xl"
      role="status"
    >
      Hay una versión nueva
      <button type="button" className="boton-principal" onClick={() => actualizar?.(true)}>
        Actualizar
      </button>
    </div>
  );
}
