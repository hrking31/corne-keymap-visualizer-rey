import { useState } from "react";
import type { CapaConfig } from "../../teclados/tipos";
import { LIMITES } from "../../teclados/validar";

type Props = {
  capa: CapaConfig;
  esBase: boolean;
  puedeIzquierda: boolean;
  puedeDerecha: boolean;
  apilado: boolean;
  onGuardar: (nombres: Pick<CapaConfig, "corto" | "largo">) => void;
  onMover: (direccion: -1 | 1) => void;
  onBorrar: () => void;
  onCerrar: () => void;
};

// Editar una capa: nombre corto (el botón), nombre largo (el panel), moverla y borrarla.
// Base se puede renombrar en su nombre largo, pero ni se mueve ni se borra.
export default function EditorCapa(props: Props) {
  const { capa, esBase, puedeIzquierda, puedeDerecha, apilado, onGuardar, onMover, onBorrar, onCerrar } = props;
  const [corto, setCorto] = useState(capa.corto);
  const [largo, setLargo] = useState(capa.largo);

  const contenido = (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (corto.trim()) onGuardar({ corto, largo });
      }}
    >
      <h2 className="m-0 text-base text-hueso">Capa {capa.corto}</h2>
      <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
        Nombre corto (el botón, máximo {LIMITES.corto})
        <input className="campo uppercase" value={corto} maxLength={LIMITES.corto} required disabled={esBase}
          onChange={(e) => setCorto(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
        Nombre largo (la primera línea del panel)
        <input className="campo" value={largo} maxLength={LIMITES.largo} placeholder="Navegación"
          onChange={(e) => setLargo(e.target.value)} />
      </label>
      {!esBase && (
        <div className="flex gap-2">
          <button type="button" className="layer-btn" disabled={!puedeIzquierda} onClick={() => onMover(-1)}>
            ← Mover
          </button>
          <button type="button" className="layer-btn" disabled={!puedeDerecha} onClick={() => onMover(1)}>
            Mover →
          </button>
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-2">
        {esBase ? <span /> : (
          <button type="button" className="boton-peligro" onClick={onBorrar}>
            Borrar capa
          </button>
        )}
        <button type="submit" className="boton-principal">
          Guardar
        </button>
      </div>
    </form>
  );

  if (apilado) {
    return (
      <section className="fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto bg-fondo p-4 text-left" aria-label={`Editar la capa ${capa.corto}`}>
        <button type="button" className="layer-btn self-start" onClick={onCerrar}>
          ← Teclado
        </button>
        {contenido}
      </section>
    );
  }

  return (
    <aside
      className="fixed top-28 left-1/2 z-40 box-border w-[340px] -translate-x-1/2 rounded-md border border-borde bg-panel p-4 text-left shadow-xl"
      aria-label={`Editar la capa ${capa.corto}`}
      onKeyDown={(e) => e.key === "Escape" && onCerrar()}
    >
      <button type="button" className="absolute top-2 right-2 cursor-pointer border-0 bg-transparent text-gris"
        aria-label="Cerrar" onClick={onCerrar}>
        ✕
      </button>
      {contenido}
    </aside>
  );
}
