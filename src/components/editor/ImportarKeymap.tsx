import type { ResumenImportacion } from "../../keymap/importar";
import { useVentanaEditor } from "./useVentanaEditor";

export type Importacion =
  | { archivo: string; resumen: ResumenImportacion; error?: undefined }
  | { archivo: string; error: string; resumen?: undefined };

type Props = {
  importacion: Importacion;
  onAplicar: () => void;
  onCerrar: () => void;
};

// El resumen de un .keymap leído, antes de aplicarlo al teclado: qué capas trae, qué
// comportamientos propios (macros…) hay que describir, qué no se reconoció y qué capas se
// quitarían. Nada cambia
// hasta pulsar «Aplicar». Si el archivo no se pudo leer, explica por qué.
export default function ImportarKeymap({ importacion, onAplicar, onCerrar }: Props) {
  const ventana = useVentanaEditor<HTMLElement>(onCerrar);
  const { archivo, error } = importacion;
  const resumen = importacion.error === undefined ? importacion.resumen : null;
  const sinPrefijo = (macro: string) => macro.replace(/^(mcr|macro|m)_/i, "");

  return (
    <aside
      ref={ventana}
      className="fixed left-1/2 z-40 box-border w-[min(360px,calc(100vw-32px))] -translate-x-1/2 overflow-y-auto rounded-md border border-borde bg-panel p-4 text-left text-sm text-texto shadow-xl"
      aria-label="Importar keymap"
      onKeyDown={(e) => e.key === "Escape" && onCerrar()}
    >
      <button type="button" className="absolute top-2 right-2 cursor-pointer border-0 bg-transparent text-gris"
        aria-label="Cerrar" onClick={onCerrar}>
        ✕
      </button>
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-base text-naranja-claro uppercase">Importar keymap</h2>
        <p className="m-0 text-xs break-all text-gris">{archivo}</p>

        {!resumen ? (
          <p className="m-0 text-naranja-claro" role="alert">{error}</p>
        ) : (
          <>
            <p className="m-0">
              <strong className="text-hueso">{resumen.capas.length} capas:</strong> {resumen.capas.join(" · ")}
              <br />
              <strong className="text-hueso">{resumen.teclas} teclas</strong> con función.
            </p>

            {resumen.propios.length > 0 && (
              <p className="m-0">
                <strong className="text-hueso">{resumen.propios.length} comportamientos propios</strong> (macros…). Se
                muestran con su nombre; escribe qué hace cada uno al editar su tecla.
                <span className="mt-1 block text-xs text-gris">{resumen.propios.map(sinPrefijo).join(", ")}</span>
              </p>
            )}

            {resumen.desconocidos.length > 0 && (
              <div className="text-naranja-claro">
                <strong>{resumen.desconocidos.length} sin reconocer.</strong> Se muestran tal cual:
                <ul className="mt-1 mb-0 pl-5 text-xs">
                  {resumen.desconocidos.slice(0, 8).map((d) => (
                    <li key={`${d.capa}-${d.pos}`}>
                      {d.capa} · Key {d.pos}: <code>{d.original}</code>
                    </li>
                  ))}
                  {resumen.desconocidos.length > 8 && <li>y {resumen.desconocidos.length - 8} más</li>}
                </ul>
              </div>
            )}

            {resumen.quitadas.length > 0 && (
              <p className="m-0 text-naranja-claro">
                Se quitarán las capas que el archivo no trae: {resumen.quitadas.join(", ")}.
              </p>
            )}

            <p className="m-0 text-xs text-gris">Las descripciones que ya escribiste se conservan.</p>
          </>
        )}

        <div className="flex justify-between gap-2">
          <button type="button" className="layer-btn" onClick={onCerrar}>
            {error ? "Cerrar" : "Cancelar"}
          </button>
          {!error && (
            <button type="button" className="boton-principal" onClick={onAplicar}>
              Aplicar
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
