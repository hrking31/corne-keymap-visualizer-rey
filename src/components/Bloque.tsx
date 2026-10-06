import type { MouseEvent } from "react";
import { dividirFilas, tieneAccion } from "../teclado";
import type { Capa, Tecla } from "../tipos";

export type Punto = { x: number; y: number };

type Props = {
  id: "left-side" | "right-side";
  lado: "left" | "right";
  capa: Capa;
  nombreCapa: string;
  teclas: Tecla[];
  espejo: boolean;
  onMostrar: (tecla: Tecla, punto: Punto) => void;
  onMover: (e: MouseEvent) => void;
  onOcultar: () => void;
};

// Con teclado no hay cursor: el modal se coloca junto al centro de la tecla
const centro = (el: HTMLElement): Punto => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// Una mitad del teclado. Las teclas tienen que ser hijas directas de .split:
// el escalonado y el abanico del CSS usan nth-child.
export default function Bloque(props: Props) {
  const { id, lado, capa, nombreCapa, teclas, espejo, onMostrar, onMover, onOcultar } = props;
  const filas = dividirFilas(teclas, espejo);

  return (
    <div className={`split ${lado}`} id={id}>
      {filas.flat().map((tecla, i) => {
        // La capa va en la key para que React cree teclas nuevas al cambiar de
        // capa, como la versión vanilla. Si las reutilizara, el borde y el color
        // harían la transición de 0.2s del CSS (p. ej. al volverse naranja).
        const key = `${capa}-${i}`;
        const clases = tecla.clase ? `key ${tecla.clase}` : "key";

        // Tecla vacía: no hace nada en esta capa, así que ni se enfoca ni se anuncia
        if (!tieneAccion(tecla)) {
          return (
            <div key={key} className={clases} aria-hidden="true">
              {tecla.label}
            </div>
          );
        }

        return (
          <button
            key={key}
            type="button"
            className={clases}
            aria-label={`${tecla.label.trim()}, ${nombreCapa}`}
            aria-describedby="info-modal"
            onMouseEnter={(e) => onMostrar(tecla, { x: e.clientX, y: e.clientY })}
            onMouseMove={onMover}
            onMouseLeave={onOcultar}
            // Solo con Tab: un clic de ratón también enfoca, pero ahí ya manda el hover
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) onMostrar(tecla, centro(e.currentTarget));
            }}
            onBlur={onOcultar}
            // Toque en el móvil, o Enter/Espacio con teclado (detail 0: sin puntero)
            onClick={(e) =>
              onMostrar(tecla, e.detail === 0 ? centro(e.currentTarget) : { x: e.clientX, y: e.clientY })
            }
          >
            {tecla.label}
          </button>
        );
      })}
    </div>
  );
}
