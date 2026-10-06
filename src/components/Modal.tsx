import type { Ref } from "react";

export type EstadoModal = {
  visible: boolean;
  // En móvil el modal sale arriba o abajo según la mitad tocada
  borde: "" | "from-top" | "from-bottom";
  capa: string;
  titulo: string;
  desc: string;
  extra: string;
  // Sin valor hasta el primer hover, igual que en la versión vanilla
  extraDisplay?: "block" | "none";
};

type Props = {
  estado: EstadoModal;
  ref: Ref<HTMLDivElement>;
};

// La posición (left/top) no pasa por React: App la escribe directo en el
// elemento en cada mousemove, para no volver a pintar las 42 teclas.
export default function Modal({ estado, ref }: Props) {
  const clases = ["modal", estado.borde, estado.visible ? "" : "hidden"]
    .filter(Boolean)
    .join(" ");

  return (
    <div id="info-modal" className={clases} ref={ref}>
      <div id="modal-layer">{estado.capa}</div>
      <div id="modal-title">{estado.titulo}</div>
      <div id="modal-desc">{estado.desc}</div>
      <p
        id="modal-extra"
        style={estado.extraDisplay ? { display: estado.extraDisplay } : undefined}
      >
        {estado.extra}
      </p>
      {/* Vacío a propósito: es un elemento más de la columna flex del modal y
          le da 11px de aire al pie (gap 6px + margin-top 5px). Quitarlo cambia
          el diseño. El id duplicado se resuelve en el paso 1.4. */}
      <small id="modal-layer"></small>
    </div>
  );
}
