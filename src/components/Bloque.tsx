import { dividirFilas } from "../teclado";
import type { TeclaDibujo } from "../teclados/tipos";

type Props = {
  // La app los usa para colocar el panel; la vista previa del asistente no lleva id
  id?: "left-side" | "right-side";
  lado: "left" | "right";
  capa: string;
  nombreCapa: string;
  teclas: TeclaDibujo[];
  espejo: boolean;
  onMostrar: (tecla: TeclaDibujo) => void;
  onOcultar: () => void;
  // Modo edición: tocar una tecla la elige (no se muestra el panel de información)
  alElegir?: (tecla: TeclaDibujo) => void;
  // La tecla que se está editando o intercambiando, resaltada
  elegida?: number | null;
};

// Una mitad del teclado. Las teclas tienen que ser hijas directas de .split:
// el escalonado y el abanico del CSS usan nth-child.
export default function Bloque(props: Props) {
  const { id, lado, capa, nombreCapa, teclas, espejo, onMostrar, onOcultar, alElegir, elegida } = props;
  const editando = Boolean(alElegir);
  const filas = dividirFilas(teclas, espejo);

  return (
    <div className={`split ${lado}`} id={id}>
      {filas.flat().map((tecla, i) => {
        // La capa va en la key para que React cree teclas nuevas al cambiar de
        // capa, como la versión vanilla. Si las reutilizara, el borde y el color
        // harían la transición de 0.2s del CSS (p. ej. al volverse naranja).
        const key = `${capa}-${i}`;
        const clases = tecla.deCapa ? "key key-naranja" : "key";
        const texto = tecla.texto.trim();

        // Todas las teclas abren el panel, también las vacías: muestran la capa y su «Key N»
        return (
          <button
            key={key}
            type="button"
            className={clases}
            aria-label={`${texto || `Key ${tecla.pos}`}, ${nombreCapa}`}
            aria-describedby={editando ? undefined : "info-modal"}
            data-elegida={elegida === tecla.pos || undefined}
            onMouseEnter={editando ? undefined : () => onMostrar(tecla)}
            onMouseLeave={editando ? undefined : onOcultar}
            // Solo con Tab: un clic de ratón también enfoca, pero ahí ya manda el hover
            onFocus={(e) => {
              if (!editando && e.currentTarget.matches(":focus-visible")) onMostrar(tecla);
            }}
            onBlur={editando ? undefined : onOcultar}
            // Toque en el móvil, o Enter/Espacio con teclado
            onClick={() => (alElegir ? alElegir(tecla) : onMostrar(tecla))}
          >
            {tecla.texto}
          </button>
        );
      })}
    </div>
  );
}
