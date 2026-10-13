import type { TecladoConfig } from "../../teclados/tipos";
import { nombreVisible } from "../../teclados/plantillas";
import { useVentanaEditor } from "./useVentanaEditor";

export type Restauracion =
  | { archivo: string; teclado: TecladoConfig; fecha: Date | null; error?: undefined }
  | { archivo: string; error: string; teclado?: undefined; fecha?: undefined };

type Props = {
  restauracion: Restauracion;
  onAplicar: () => void;
  onCerrar: () => void;
};

// El resumen de una copia de seguridad antes de restaurarla: de qué teclado es, sus capas y
// de cuándo es. Nada cambia hasta pulsar «Aplicar»; antes se descarga una copia del actual.
export default function RestaurarCopia({ restauracion, onAplicar, onCerrar }: Props) {
  const ventana = useVentanaEditor<HTMLElement>(onCerrar);
  const { archivo, teclado, fecha, error } = restauracion;

  return (
    <aside
      ref={ventana}
      className="fixed left-1/2 z-40 box-border w-[min(360px,calc(100vw-32px))] -translate-x-1/2 overflow-y-auto rounded-md border border-borde bg-panel p-4 text-left text-sm text-texto shadow-xl"
      aria-label="Restaurar copia"
      onKeyDown={(e) => e.key === "Escape" && onCerrar()}
    >
      <button type="button" className="absolute top-2 right-2 cursor-pointer border-0 bg-transparent text-gris"
        aria-label="Cerrar" onClick={onCerrar}>
        ✕
      </button>
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-base text-naranja-claro uppercase">Restaurar copia</h2>
        <p className="m-0 text-xs break-all text-gris">{archivo}</p>

        {!teclado ? (
          <p className="m-0 text-naranja-claro" role="alert">{error}</p>
        ) : (
          <>
            <p className="m-0">
              <strong className="text-hueso">{nombreVisible(teclado)}</strong>
              {fecha && <> · copia del {fecha.toLocaleDateString("es")}</>}
              <br />
              <strong className="text-hueso">{teclado.orden.length} capas:</strong>{" "}
              {teclado.orden.map((id) => teclado.capas[id].corto).join(" · ")}
            </p>
            <p className="m-0 text-naranja-claro">Reemplazará tu teclado actual.</p>
            <p className="m-0 text-xs text-gris">Antes se descargará una copia de tu teclado actual, por si acaso.</p>
          </>
        )}

        <div className="flex justify-between gap-2">
          <button type="button" className="layer-btn" onClick={onCerrar}>
            {error ? "Cerrar" : "Cancelar"}
          </button>
          {teclado && (
            <button type="button" className="boton-principal" onClick={onAplicar}>
              Aplicar
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
