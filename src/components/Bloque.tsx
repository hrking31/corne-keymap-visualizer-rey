import type { MouseEvent } from "react";
import { dividirFilas, tieneAccion } from "../teclado";
import type { Capa, Tecla } from "../tipos";

type Props = {
  id: "left-side" | "right-side";
  lado: "left" | "right";
  capa: Capa;
  teclas: Tecla[];
  espejo: boolean;
  onEntrar: (tecla: Tecla, e: MouseEvent) => void;
  onMover: (e: MouseEvent) => void;
  onSalir: () => void;
};

// Una mitad del teclado. Las teclas tienen que ser hijas directas de .split:
// el escalonado y el abanico del CSS usan nth-child.
export default function Bloque({ id, lado, capa, teclas, espejo, onEntrar, onMover, onSalir }: Props) {
  const filas = dividirFilas(teclas, espejo);

  return (
    <div className={`split ${lado}`} id={id}>
      {filas.flat().map((tecla, i) => {
        const activa = tieneAccion(tecla);

        return (
          <div
            // La capa va en la key para que React cree teclas nuevas al cambiar de
            // capa, como la versión vanilla. Si las reutilizara, el borde y el color
            // harían la transición de 0.2s del CSS (p. ej. al volverse naranja).
            key={`${capa}-${i}`}
            className={tecla.clase ? `key ${tecla.clase}` : "key"}
            onMouseEnter={activa ? (e) => onEntrar(tecla, e) : undefined}
            onMouseMove={activa ? onMover : undefined}
            onMouseLeave={activa ? onSalir : undefined}
          >
            {tecla.label}
          </div>
        );
      })}
    </div>
  );
}
