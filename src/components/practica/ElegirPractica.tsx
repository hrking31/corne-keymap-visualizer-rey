import { useMemo } from "react";
import type { TecladoConfig } from "../../teclados/tipos";
import { GRUPOS, NOMBRE_GRUPO, esDeTexto, objetivosDeGrupo, textosDeGrupo, type Grupo } from "../../practica/practica";
import { formatoMarca, mejorMarca, type Records } from "../../practica/records";
import { useVentanaEditor } from "../editor/useVentanaEditor";

type Props = {
  teclado: TecladoConfig;
  // El último grupo practicado: sale marcado
  grupo: Grupo;
  records: Records;
  onElegir: (grupo: Grupo) => void;
  onCerrar: () => void;
};

// Practicando, ⚙ → «Qué practicar»: los grupos con cuántas teclas tiene cada uno en
// este teclado y su mejor marca. Un grupo sin nada que practicar sale apagado.
export default function ElegirPractica({ teclado, grupo, records, onElegir, onCerrar }: Props) {
  const ventana = useVentanaEditor<HTMLElement>(onCerrar);
  const grupos = useMemo(
    () =>
      GRUPOS.map((g) => {
        const cuantos = esDeTexto(g) ? textosDeGrupo(teclado, g).length : objetivosDeGrupo(teclado, g).length;
        const minimo = g === "palabras" ? 6 : 1;
        const unidad = g === "palabras" ? "palabras" : g === "frases" ? "frases" : "teclas";
        return { g, cuantos, disponible: cuantos >= minimo, unidad };
      }),
    [teclado],
  );

  return (
    <aside
      ref={ventana}
      className="ventana-practica fixed left-1/2 z-40 box-border w-[min(360px,calc(100vw-32px))] -translate-x-1/2 overflow-y-auto rounded-md border border-borde bg-panel p-4 text-left text-sm text-texto shadow-xl"
      aria-label="Qué practicar"
      onKeyDown={(e) => e.key === "Escape" && onCerrar()}
    >
      <button type="button" className="absolute top-2 right-2 cursor-pointer border-0 bg-transparent text-gris"
        aria-label="Cerrar" onClick={onCerrar}>
        ✕
      </button>
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-base text-naranja-claro uppercase">Practicar</h2>
        <p className="m-0 text-gris">¿Qué quieres practicar?</p>
        <div className="flex flex-col gap-2">
          {grupos.map(({ g, cuantos, disponible, unidad }) => {
            const mejor = mejorMarca(records, g);
            return (
              <button
                key={g}
                type="button"
                className="opcion flex justify-between gap-2"
                aria-pressed={g === grupo}
                disabled={!disponible}
                onClick={() => onElegir(g)}
              >
                <span>{NOMBRE_GRUPO[g]}</span>
                <span className="text-xs font-normal whitespace-nowrap text-gris">
                  {disponible ? `${cuantos} ${unidad} · ${mejor ? formatoMarca(g, mejor) : "sin marcador"}` : "nada que practicar"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
