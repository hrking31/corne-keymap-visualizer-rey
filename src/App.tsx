import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { keymap } from "./data";
import { dividirBloques } from "./teclado";
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

// Por debajo de este ancho (móvil vertical) el modal sale arriba o abajo, por CSS
const ANCHO_MOVIL = 768;

type Lado = "izquierdo" | "derecho";

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
  const ladoActual = useRef<Lado>("izquierdo");

  const { izquierdo, derecho } = dividirBloques(keymap[capa]);

  // Fuera del móvil vertical, el modal se queda quieto sobre la mitad contraria a la
  // tecla (centrado en ella a lo ancho y a media altura de la pantalla): nunca tapa
  // la tecla que se toca y no persigue al dedo ni al ratón.
  const colocarModal = () => {
    const el = modalRef.current;
    if (!el || window.innerWidth <= ANCHO_MOVIL) return;

    const contraria = document.getElementById(
      ladoActual.current === "izquierdo" ? "right-side" : "left-side",
    );
    if (!contraria) return;

    const mitad = contraria.getBoundingClientRect();
    const margen = 8;
    const dentro = (valor: number, maximo: number) => Math.min(Math.max(valor, margen), maximo - margen);

    el.style.left =
      dentro(mitad.left + (mitad.width - el.offsetWidth) / 2, window.innerWidth - el.offsetWidth) + "px";
    el.style.top =
      dentro((window.innerHeight - el.offsetHeight) / 2, window.innerHeight - el.offsetHeight) + "px";
  };

  // Al aparecer, el modal ya mide su tamaño real y se puede centrar
  useLayoutEffect(() => {
    if (modal.visible) colocarModal();
  }, [modal]);

  const mostrar = (tecla: Tecla, lado: Lado) => {
    ladoActual.current = lado;
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
          nombreCapa={NOMBRES_CAPA[capa]}
          teclas={izquierdo}
          espejo
          onMostrar={(tecla) => mostrar(tecla, "izquierdo")}
          onOcultar={ocultar}
        />
        <Bloque
          id="right-side"
          lado="right"
          capa={capa}
          nombreCapa={NOMBRES_CAPA[capa]}
          teclas={derecho}
          espejo={false}
          onMostrar={(tecla) => mostrar(tecla, "derecho")}
          onOcultar={ocultar}
        />
      </div>

      <Modal estado={modal} ref={modalRef} />
    </>
  );
}
