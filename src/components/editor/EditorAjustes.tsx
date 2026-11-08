import { useRef, useState } from "react";
import { useVentanaEditor } from "./useVentanaEditor";
import { PreguntaIdioma, PreguntaSistema } from "./Opciones";
import type { Ajustes } from "../../teclados/tipos";

type Props = {
  ajustes: Ajustes;
  // El .keymap elegido y los ajustes nuevos: se vuelve a importar con ellos (antes de aplicar
  // se ve el resumen, como en «Importar .keymap»)
  onKeymap: (archivo: File, ajustes: Ajustes) => void;
  onCerrar: () => void;
};

// «Idioma y sistema», en el editor. Los textos de las teclas se calculan al importar el
// .keymap con estos dos ajustes (SEMI es «Ñ» en español y «;» en inglés; LGUI es WIN, CMD o
// SUPER), así que cambiarlos pide volver a cargar el .keymap. Las descripciones se conservan.
export default function EditorAjustes({ ajustes: actuales, onKeymap, onCerrar }: Props) {
  const ventana = useVentanaEditor<HTMLElement>(onCerrar);
  const [ajustes, setAjustes] = useState(actuales);
  const selector = useRef<HTMLInputElement>(null);

  return (
    <aside
      ref={ventana}
      className="fixed left-1/2 z-40 box-border w-[min(320px,calc(100vw-32px))] -translate-x-1/2 overflow-y-auto rounded-md border border-borde bg-panel p-4 text-left text-sm text-texto shadow-xl"
      aria-label="Idioma y sistema"
      onKeyDown={(e) => e.key === "Escape" && onCerrar()}
    >
      <button type="button" className="absolute top-2 right-2 cursor-pointer border-0 bg-transparent text-gris"
        aria-label="Cerrar" onClick={onCerrar}>
        ✕
      </button>
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-base text-naranja-claro uppercase">Idioma y sistema</h2>
        <PreguntaIdioma ajustes={ajustes} onAjustes={setAjustes} />
        <PreguntaSistema ajustes={ajustes} onAjustes={setAjustes} />
        <p className="m-0 text-xs text-gris">
          Para aplicarlo, vuelve a cargar tu .keymap: los textos de las teclas salen de él. Tus descripciones se
          conservan.
        </p>
        <div className="flex justify-between gap-2">
          <button type="button" className="layer-btn" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className="boton-principal" onClick={() => selector.current?.click()}>
            Elegir mi .keymap
          </button>
        </div>
      </div>
      <input
        ref={selector}
        type="file"
        accept=".keymap"
        hidden
        onChange={(e) => {
          const elegido = e.target.files?.[0];
          if (elegido) onKeymap(elegido, ajustes);
          e.target.value = "";
        }}
      />
    </aside>
  );
}
