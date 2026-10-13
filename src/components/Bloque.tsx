import type { CSSProperties } from "react";
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
  // Mientras se edita: si la elegida está marcada como tecla de capa (toda naranja) o no
  // (sin naranja), aunque todavía no se haya guardado
  deCapaElegida?: boolean;
  // Práctica: las teclas encendidas (la que se acaba de acertar, o la correcta tras un fallo)
  encendidas?: number[];
  // Práctica: lo que muestra la pantalla OLED de esta mitad (una imagen para el CSS, con el
  // marcador). Sin ella, la pantalla de siempre
  pantalla?: string;
};

// Una mitad del teclado. Las teclas tienen que ser hijas directas de .split:
// el escalonado y el abanico del CSS usan nth-child.
export default function Bloque(props: Props) {
  const { id, lado, capa, nombreCapa, teclas, espejo, onMostrar, onOcultar, alElegir, elegida, deCapaElegida, encendidas, pantalla } = props;
  const editando = Boolean(alElegir);
  const filas = dividirFilas(teclas, espejo);

  return (
    // --oled la usa editor.css para la pantalla mientras se practica
    <div className={`split ${lado}`} id={id} style={pantalla ? ({ "--oled": pantalla } as CSSProperties) : undefined}>
      {filas.flat().map((tecla, i) => {
        // La capa va en la key para que React cree teclas nuevas al cambiar de
        // capa, como la versión vanilla. Si las reutilizara, el borde y el color
        // harían la transición de 0.2s del CSS (p. ej. al volverse naranja).
        const key = `${capa}-${i}`;
        const vistaPrevia = elegida === tecla.pos && deCapaElegida !== undefined;
        const clases = vistaPrevia
          ? deCapaElegida
            ? "key key-capa-editando"
            : "key"
          : tecla.deCapa
            ? "key key-naranja"
            : "key";
        // Importada de un &trans: hace lo de la capa de abajo, con el texto en gris. Importada
        // con algo que no se reconoció: borde punteado y «?»
        const claseHeredada =
          (tecla.heredada && !vistaPrevia ? " key-heredada" : "") +
          (tecla.sinReconocer && !vistaPrevia ? " key-sin-reconocer" : "") +
          (encendidas?.includes(tecla.pos) ? " key-encendida" : "");
        const texto =
          tecla.sinReconocer && !vistaPrevia ? "Sin reconocer" : tecla.texto.trim().replace("\n", " / ");

        // Todas las teclas abren el panel, también las vacías: muestran la capa y su «Key N»
        return (
          <button
            key={key}
            type="button"
            className={clases + claseHeredada}
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
            {/* Sin reconocer: solo un «?», que llama la atención; el panel dice qué falló */}
            {tecla.sinReconocer && !vistaPrevia ? "?" : tecla.texto}
          </button>
        );
      })}
    </div>
  );
}
