import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { keymap } from "./data";
import { dividirBloques } from "./teclado";
import type { Capa, Tecla } from "./tipos";
import { extraDe, t } from "./i18n";
import Bloque, { type Punto } from "./components/Bloque";
import Modal, { type EstadoModal } from "./components/Modal";
import SelectorIdioma from "./components/SelectorIdioma";
import AvisoIdioma from "./components/AvisoIdioma";

// Los rótulos de los botones son los nombres de las capas del firmware: no se traducen
const CAPAS: { id: Capa; texto: string }[] = [
  { id: "BASE", texto: "Base" },
  { id: "NUM", texto: "Num" },
  { id: "SYM", texto: "Sym" },
  { id: "NAV", texto: "Nav" },
  { id: "LED", texto: "Led" },
  { id: "FUN", texto: "Fun" },
];

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

  const mostrar = (tecla: Tecla, lado: "izquierdo" | "derecho", punto: Punto) => {
    cursor.current = punto;
    const movil = window.innerWidth <= ANCHO_MOVIL;

    setModal({
      visible: true,
      borde: movil ? (lado === "derecho" ? "from-bottom" : "from-top") : "",
      capa: t.capas[capa],
      titulo: tecla.label,
      desc: tecla.desc,
      extra: extraDe(capa, tecla),
      extraDisplay: tecla.extra ? "block" : "none",
    });
  };

  const mover = (e: MouseEvent) => {
    cursor.current = { x: e.clientX, y: e.clientY };
    colocarModal();
  };

  const ocultar = () => {
    setModal((anterior) =>
      anterior.visible ? { ...anterior, visible: false, extra: "" } : anterior,
    );
    if (modalRef.current) {
      modalRef.current.style.left = "";
      modalRef.current.style.top = "";
    }
  };

  // En el móvil no hay "salir con el ratón": el modal se cierra al tocar fuera de
  // una tecla. Con teclado, Escape lo cierra sin perder el foco.
  useEffect(() => {
    const alTocar = (e: PointerEvent) => {
      if (!(e.target instanceof Element && e.target.closest(".key"))) ocultar();
    };
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") ocultar();
    };

    document.addEventListener("pointerdown", alTocar);
    document.addEventListener("keydown", alPulsar);
    return () => {
      document.removeEventListener("pointerdown", alTocar);
      document.removeEventListener("keydown", alPulsar);
    };
  }, []);

  return (
    <>
      {/* Primero en el HTML para que Tab lo alcance antes que las capas; va fijo en la esquina */}
      <SelectorIdioma />

      <h1>Corne ZMK Visualizer Rey</h1>

      <div className="layer-buttons">
        {CAPAS.map(({ id, texto }) => (
          <button
            key={id}
            className={id === capa ? "layer-btn active" : "layer-btn"}
            data-layer={id}
            aria-pressed={id === capa}
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
          nombreCapa={t.capas[capa]}
          teclas={izquierdo}
          espejo
          onMostrar={(tecla, punto) => mostrar(tecla, "izquierdo", punto)}
          onMover={mover}
          onOcultar={ocultar}
        />
        <Bloque
          id="right-side"
          lado="right"
          capa={capa}
          nombreCapa={t.capas[capa]}
          teclas={derecho}
          espejo={false}
          onMostrar={(tecla, punto) => mostrar(tecla, "derecho", punto)}
          onMover={mover}
          onOcultar={ocultar}
        />
      </div>

      <Modal estado={modal} ref={modalRef} />
      <AvisoIdioma />
    </>
  );
}
