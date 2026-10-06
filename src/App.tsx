import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { keymap } from "./data.js";
import { dividirBloques } from "./teclado.js";
import type { Capa, Tecla } from "./tipos";
import Bloque from "./components/Bloque";
import Modal, { type EstadoModal } from "./components/Modal";

const CAPAS: { id: Capa; texto: string }[] = [
  { id: "BASE", texto: "Base" },
  { id: "NUM", texto: "Num" },
  { id: "SYM", texto: "Sym" },
  { id: "NAV", texto: "Nav" },
  { id: "LED", texto: "Led" },
  { id: "FUN", texto: "Fun" },
];

const NOMBRES_CAPA: Record<Capa, string> = {
  BASE: "Capa Base",
  NUM: "Capa Números",
  SYM: "Capa Símbolos",
  NAV: "Capa Navegación",
  LED: "Capa Led RGB",
  FUN: "Capa Funciones",
};

// Por debajo de este ancho el modal no sigue al ratón: sale arriba o abajo
const ANCHO_MOVIL = 768;

const MODAL_INICIAL: EstadoModal = {
  visible: false,
  borde: "",
  capa: "",
  titulo: "",
  desc: "",
  extra: "",
};

export default function App() {
  const [capa, setCapa] = useState<Capa>("BASE");
  const [modal, setModal] = useState<EstadoModal>(MODAL_INICIAL);
  const modalRef = useRef<HTMLDivElement>(null);
  const cursor = useRef({ x: 0, y: 0 });

  const { izquierdo, derecho } = dividirBloques(keymap[capa]);

  // El modal se pega al cursor: a la derecha en la mitad izquierda de la
  // pantalla y a la izquierda en la mitad derecha.
  const colocarModal = () => {
    const el = modalRef.current;
    if (!el || window.innerWidth <= ANCHO_MOVIL) return;

    const { x, y } = cursor.current;
    const separacion = 20;

    el.style.left =
      (x > window.innerWidth / 2 ? x - el.offsetWidth - separacion : x + separacion) + "px";
    el.style.top = y - 100 + "px";
  };

  // Al aparecer, el modal ya mide su ancho real y se puede colocar junto al cursor
  useLayoutEffect(() => {
    if (modal.visible) colocarModal();
  }, [modal]);

  const mostrar = (tecla: Tecla, lado: "izquierdo" | "derecho", e: MouseEvent) => {
    cursor.current = { x: e.clientX, y: e.clientY };
    const movil = window.innerWidth <= ANCHO_MOVIL;

    setModal({
      visible: true,
      borde: movil ? (lado === "derecho" ? "from-bottom" : "from-top") : "",
      capa: NOMBRES_CAPA[capa],
      titulo: tecla.label,
      desc: tecla.desc,
      extra: tecla.extra ?? "",
      extraDisplay: tecla.extra ? "block" : "none",
    });
  };

  const mover = (e: MouseEvent) => {
    cursor.current = { x: e.clientX, y: e.clientY };
    colocarModal();
  };

  const ocultar = () => {
    setModal((anterior) => ({ ...anterior, visible: false, extra: "" }));
    if (modalRef.current) {
      modalRef.current.style.left = "";
      modalRef.current.style.top = "";
    }
  };

  return (
    <>
      <h1>Corne ZMK Visualizer Rey</h1>

      <div className="layer-buttons">
        {CAPAS.map(({ id, texto }) => (
          <button
            key={id}
            className={id === capa ? "layer-btn active" : "layer-btn"}
            data-layer={id}
            onClick={() => setCapa(id)}
          >
            {texto}
          </button>
        ))}
      </div>

      <div className="keyboard-container">
        <Bloque
          id="left-side"
          lado="left"
          capa={capa}
          teclas={izquierdo}
          espejo
          onEntrar={(tecla, e) => mostrar(tecla, "izquierdo", e)}
          onMover={mover}
          onSalir={ocultar}
        />
        <Bloque
          id="right-side"
          lado="right"
          capa={capa}
          teclas={derecho}
          espejo={false}
          onEntrar={(tecla, e) => mostrar(tecla, "derecho", e)}
          onMover={mover}
          onSalir={ocultar}
        />
      </div>

      <Modal estado={modal} ref={modalRef} />
    </>
  );
}
