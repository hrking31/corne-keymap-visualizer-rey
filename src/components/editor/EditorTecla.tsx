import { useState } from "react";
import type { TeclaConfig, TeclaDibujo } from "../../teclados/tipos";
import { LIMITES } from "../../teclados/validar";

type Props = {
  nombreCapa: string;
  tecla: TeclaDibujo;
  // En qué mitad está la tecla: en PC el panel sale sobre la otra, para no taparla
  lado: "izquierdo" | "derecho";
  apilado: boolean;
  onGuardar: (t: TeclaConfig) => void;
  onIntercambiar: () => void;
  onCerrar: () => void;
};

// Editar una tecla: su texto, su descripción y si es de capa (naranja). En PC es un panel
// flotante y, al tocar otra tecla, pasa a esa; en el móvil, una pantalla completa.
export default function EditorTecla(props: Props) {
  const { nombreCapa, tecla, lado, apilado, onGuardar, onIntercambiar, onCerrar } = props;
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
      <div className="flex items-baseline justify-between gap-2 text-xs font-bold tracking-wider text-gris uppercase">
        <span>{nombreCapa}</span>
        <span>Key {tecla.pos}</span>
      </div>
      <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
        Texto
        <input className="campo" value={texto} maxLength={LIMITES.texto} autoFocus={!apilado}
          onChange={(e) => setTexto(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold text-hueso">
        Descripción
        <textarea className="campo min-h-24 resize-y" value={descripcion} maxLength={LIMITES.descripcion}
          onChange={(e) => setDescripcion(e.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm text-texto">
        <input type="checkbox" checked={deCapa} onChange={(e) => setDeCapa(e.target.checked)} />
        Tecla de capa (se ve en naranja)
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

  if (apilado) {
    return (
      <section className="fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto bg-fondo p-4 text-left" aria-label={`Editar Key ${tecla.pos}`}>
        <button type="button" className="layer-btn self-start" onClick={onCerrar}>
          ← Teclado
        </button>
        {contenido}
      </section>
    );
  }

  return (
    <aside
      className={`fixed top-28 z-40 box-border w-[320px] rounded-md border border-borde bg-panel p-4 text-left shadow-xl ${
        lado === "izquierdo" ? "right-4" : "left-4"
      }`}
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
