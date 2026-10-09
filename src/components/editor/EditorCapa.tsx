import { useState } from "react";
import { useVentanaEditor } from "./useVentanaEditor";
import type { CapaConfig } from "../../teclados/tipos";
import { LIMITES } from "../../teclados/validar";

type Props = {
  capa: CapaConfig;
  // Su número en ZMK (Base = 0): sin nombre propio, el título es «CAPA 3»
  numero: number;
  esBase: boolean;
  puedeIzquierda: boolean;
  puedeDerecha: boolean;
  onGuardar: (nombres: Pick<CapaConfig, "corto" | "largo">) => void;
  onMover: (direccion: -1 | 1) => void;
  onBorrar: () => void;
  onCerrar: () => void;
};

// Editar una capa: nombre corto (el botón), nombre largo (el panel), moverla y borrarla.
// Ventana flotante centrada, en el PC y en el móvil.
// Base se puede renombrar en su nombre largo, pero ni se mueve ni se borra.
export default function EditorCapa(props: Props) {
  const { capa, numero, esBase, puedeIzquierda, puedeDerecha, onGuardar, onMover, onBorrar, onCerrar } = props;
  // Sale debajo de los botones de capa; tocar fuera la cierra, igual que la ✕ y Escape
  const ventana = useVentanaEditor<HTMLElement>(onCerrar);
  // El nombre de la capa (el largo o, si no tiene, el corto); con el automático de una capa
  // nueva («CAPA6»), «CAPA 6» con su número
  const automatico = /^CAPA ?\d+$/.test(capa.corto);
  const titulo = capa.largo || (automatico ? `CAPA ${numero}` : capa.corto);
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
      <h2 className="m-0 text-base text-naranja-claro uppercase">{titulo}</h2>
      <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
        Nombre corto
        <input className="campo uppercase" value={corto} maxLength={LIMITES.corto} required disabled={esBase}
          onChange={(e) => setCorto(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
        Nombre largo
        <input className="campo" value={largo} maxLength={LIMITES.largo} placeholder="Navegación"
          onChange={(e) => setLargo(e.target.value)} />
      </label>
      {!esBase && (
        // Un solo recuadro: «Mover» en el centro y las flechas, que son los botones, a los lados
        <div className="mover" role="group" aria-label="Mover la capa">
          <button type="button" className="mover-flecha" disabled={!puedeIzquierda}
            aria-label="Mover a la izquierda" title="Mover a la izquierda" onClick={() => onMover(-1)}>
            ←
          </button>
          <span>Mover</span>
          <button type="button" className="mover-flecha" disabled={!puedeDerecha}
            aria-label="Mover a la derecha" title="Mover a la derecha" onClick={() => onMover(1)}>
            →
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

  return (
    <aside
      ref={ventana}
      className="fixed left-1/2 z-40 box-border w-[min(280px,calc(100vw-32px))] -translate-x-1/2 overflow-y-auto rounded-md border border-borde bg-panel p-4 text-left shadow-xl"
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
