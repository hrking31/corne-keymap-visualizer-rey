import { useState } from "react";
import { GRUPOS, NOMBRE_GRUPO, type Grupo } from "../../practica/practica";
import { aciertosDe, formatoMarca, type Records } from "../../practica/records";
import { useVentanaEditor } from "../editor/useVentanaEditor";

type Props = {
  records: Records;
  // Abre en el grupo que se está practicando (o el último)
  grupo: Grupo;
  onCerrar: () => void;
};

// «14 oct»; el año, solo si no es el actual («14 oct 2025»): así la fila cabe en un móvil
const fecha = (iso: string) => {
  const d = new Date(iso);
  const otroAno = d.getFullYear() !== new Date().getFullYear();
  return d.toLocaleDateString("es", { day: "numeric", month: "short", ...(otroAno ? { year: "numeric" } : {}) });
};

// ⚙ → «Récords»: los 10 mejores de cada grupo, del más rápido al más lento, con sus aciertos,
// sus fallos y su fecha.
// Más ancha que las demás ventanas: caben 4 grupos por fila (editor.css)
export default function RecordsPractica({ records, grupo: inicial, onCerrar }: Props) {
  const ventana = useVentanaEditor<HTMLElement>(onCerrar);
  const [grupo, setGrupo] = useState(inicial);
  const lista = records[grupo] ?? [];

  return (
    <aside
      ref={ventana}
      className="ventana-practica fixed left-1/2 z-40 box-border w-[min(470px,calc(100vw-32px))] -translate-x-1/2 overflow-y-auto rounded-md border border-borde bg-panel p-4 text-left text-sm text-texto shadow-xl"
      aria-label="Récords"
      onKeyDown={(e) => e.key === "Escape" && onCerrar()}
    >
      <button type="button" className="absolute top-2 right-2 cursor-pointer border-0 bg-transparent text-gris"
        aria-label="Cerrar" onClick={onCerrar}>
        ✕
      </button>
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-base text-naranja-claro uppercase">Récords</h2>
        <div className="fichas-records">
          {GRUPOS.map((g: Grupo) => (
            <button key={g} type="button" className={g === grupo ? "layer-btn active" : "layer-btn"} aria-pressed={g === grupo}
              onClick={() => setGrupo(g)}>
              {NOMBRE_GRUPO[g]}
            </button>
          ))}
        </div>
        {lista.length === 0 ? (
          <p className="m-0 py-2 text-gris">Aún no hay rondas en este grupo.</p>
        ) : (
          <table className="tabla-records w-full border-collapse tabular-nums" aria-label={`Mejores marcas de ${NOMBRE_GRUPO[grupo]}`}>
            <tbody>
              {lista.map((m, i) => (
                <tr key={m.fecha + i} className={i === 0 ? "text-naranja-claro" : undefined}>
                  <td className={"w-8 border-t border-borde px-1 py-1.5" + (i === 0 ? "" : " text-gris")}>{i + 1}.</td>
                  <td className={"border-t border-borde px-1 py-1.5 font-bold whitespace-nowrap" + (i === 0 ? "" : " text-hueso")}>{formatoMarca(grupo, m)}</td>
                  <td className="border-t border-borde px-1 py-1.5 whitespace-nowrap text-gris" aria-label={`${aciertosDe(grupo, m)} aciertos, ${m.fallos} fallos`}>
                    ✓ {aciertosDe(grupo, m)} ✗ {m.fallos}
                  </td>
                  <td className="border-t border-borde px-1 py-1.5 text-right whitespace-nowrap text-gris">{fecha(m.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </aside>
  );
}
