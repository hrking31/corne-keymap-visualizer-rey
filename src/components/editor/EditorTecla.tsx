import { useState } from "react";
import { useVentanaEditor } from "./useVentanaEditor";
import type { TeclaConfig, TeclaDibujo } from "../../teclados/tipos";
import { LIMITES } from "../../teclados/validar";

type Props = {
  nombreCapa: string;
  tecla: TeclaDibujo;
  // En qué mitad está la tecla: en PC el panel sale sobre la otra, para no taparla
  lado: "izquierdo" | "derecho";
  apilado: boolean;
  onGuardar: (t: TeclaConfig) => void;
  // Al marcar o desmarcar «Tecla de capa»: el teclado lo muestra al momento
  onDeCapa: (deCapa: boolean) => void;
  onIntercambiar: () => void;
  onCerrar: () => void;
};

// Editar una tecla: su texto, su descripción y si es de capa (naranja). Ventana flotante
// centrada sobre la mitad contraria a la tecla, en el PC y en el móvil, como el recuadro
// con la descripción (en el PC, al tocar otra tecla pasa a esa).
export default function EditorTecla(props: Props) {
  const { nombreCapa, tecla, lado, apilado, onGuardar, onDeCapa, onIntercambiar, onCerrar } = props;
  // Centrada sobre la mitad contraria a la tecla; tocar fuera la cierra, igual que la ✕ y Escape
  const ventana = useVentanaEditor<HTMLElement>(onCerrar, lado === "izquierdo" ? "right-side" : "left-side");
  const [texto, setTexto] = useState(tecla.texto);
  const [descripcion, setDescripcion] = useState(tecla.descripcion);
  const [deCapa, setDeCapa] = useState(tecla.deCapa);

  const contenido = (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar({ texto, descripcion, deCapa });
      }}
    >
      <div className="flex items-baseline gap-2 text-xs font-bold tracking-wider uppercase">
        <span className="text-naranja-claro">{nombreCapa}</span>
        <span className="text-naranja-claro" aria-hidden="true">·</span>
        <span className="text-naranja-claro">Key {tecla.pos}</span>
      </div>
      <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
        Texto
        {/* Hasta dos líneas: tocar arriba y mantener abajo, como las del .keymap */}
        <textarea className="campo resize-none" rows={2} value={texto} maxLength={LIMITES.texto} autoFocus={!apilado}
          onChange={(e) => setTexto(e.target.value.split("\n").slice(0, 2).join("\n"))} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
        Descripción
        <textarea className="campo min-h-24 resize-y" value={descripcion} maxLength={LIMITES.descripcion}
          onChange={(e) => setDescripcion(e.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm text-texto">
        <input type="checkbox" checked={deCapa} onChange={(e) => {
          setDeCapa(e.target.checked);
          onDeCapa(e.target.checked);
        }} />
        Tecla de capa
      </label>
      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="layer-btn" onClick={onIntercambiar}>
          ⇄ Intercambiar
        </button>
        <button type="submit" className="boton-principal">
          Guardar
        </button>
      </div>
    </form>
  );

  return (
    <aside
      ref={ventana}
      className={`fixed z-40 box-border w-[min(340px,calc(100vw-32px))] overflow-y-auto rounded-md border border-borde bg-panel p-4 text-left shadow-xl`}
      aria-label={`Editar Key ${tecla.pos}`}
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
