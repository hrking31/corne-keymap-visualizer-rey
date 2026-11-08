import { useState } from "react";
import { useVentanaEditor } from "./useVentanaEditor";
import type { CapaConfig } from "../../teclados/tipos";
import { LIMITES } from "../../teclados/validar";

type Props = {
  capa: CapaConfig;
  onGuardar: (largo: string) => void;
  onCerrar: () => void;
};

// Editar una capa: su nombre largo (la primera línea del panel, «Navegación»). El nombre
// corto (el botón) y el orden de las capas vienen del .keymap. Ventana flotante centrada.
export default function EditorCapa({ capa, onGuardar, onCerrar }: Props) {
  // Sale debajo de los botones de capa; tocar fuera la cierra, igual que la ✕ y Escape
  const ventana = useVentanaEditor<HTMLElement>(onCerrar);
  const [largo, setLargo] = useState(capa.largo);

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
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onGuardar(largo);
        }}
      >
        <h2 className="m-0 text-base text-naranja-claro uppercase">{capa.corto}</h2>
        <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
          Nombre largo
          <input className="campo" value={largo} maxLength={LIMITES.largo} placeholder="Navegación" autoFocus
            onChange={(e) => setLargo(e.target.value)} />
        </label>
        <div className="flex justify-between gap-2">
          <button type="button" className="layer-btn" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className="boton-principal">
            Guardar
          </button>
        </div>
      </form>
    </aside>
  );
}
