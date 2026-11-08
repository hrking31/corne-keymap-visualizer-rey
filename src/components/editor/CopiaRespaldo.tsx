import { useVentanaEditor } from "./useVentanaEditor";

type Props = {
  // Cómo se llamará el archivo («corne-zmk-rey-2026-11-07.json»)
  archivo: string;
  onDescargar: () => void;
  onCerrar: () => void;
};

// «Copia de respaldo»: antes de descargar, qué lleva el archivo y para qué sirve. Una
// ventana y no un tooltip: en el celular no hay ratón que pase por encima.
export default function CopiaRespaldo({ archivo, onDescargar, onCerrar }: Props) {
  const ventana = useVentanaEditor<HTMLElement>(onCerrar);

  return (
    <aside
      ref={ventana}
      className="fixed left-1/2 z-40 box-border w-[min(360px,calc(100vw-32px))] -translate-x-1/2 overflow-y-auto rounded-md border border-borde bg-panel p-4 text-left text-sm text-texto shadow-xl"
      aria-label="Copia de respaldo"
      onKeyDown={(e) => e.key === "Escape" && onCerrar()}
    >
      <button type="button" className="absolute top-2 right-2 cursor-pointer border-0 bg-transparent text-gris"
        aria-label="Cerrar" onClick={onCerrar}>
        ✕
      </button>
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-base text-naranja-claro uppercase">Copia de respaldo</h2>
        <p className="m-0">
          Crea un archivo con las <strong className="text-hueso">descripciones de las teclas</strong>, las leyendas
          personalizadas, los nombres de las capas y el nombre del teclado.
        </p>
        <p className="m-0">Al restaurar no necesitas actualizar el .keymap.</p>
        <p className="m-0 text-xs break-all text-gris">{archivo}</p>
        <div className="flex justify-between gap-2">
          <button type="button" className="layer-btn" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton-principal"
            onClick={() => {
              onDescargar();
              onCerrar();
            }}
          >
            Descargar
          </button>
        </div>
      </div>
    </aside>
  );
}
