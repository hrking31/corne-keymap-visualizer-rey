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

// Móvil vertical: el modal sale arriba o abajo, por CSS. Misma condición que la
// media query de .modal en style.css; en horizontal se comporta como en el PC.
const MOVIL_VERTICAL = "(max-width: 912px) and (orientation: portrait)";
const esMovilVertical = () => window.matchMedia(MOVIL_VERTICAL).matches;

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

  // El modal nunca tapa los botones de capa: empieza, como muy arriba, justo debajo
  // de ellos (se mide en cada momento, porque el título cambia de alto según la pantalla).
  // - Móvil vertical: el CSS lo pone arriba o abajo; arriba se baja hasta los botones.
  // - Móvil horizontal y PC: quieto sobre la mitad contraria a la tecla, centrado en
  //   ella a lo ancho y a media altura de la pantalla. Nunca tapa la tecla que se toca
  //   y no persigue al dedo ni al ratón.
  const colocarModal = () => {
    const el = modalRef.current;
    if (!el) return;

    const margen = 8;
    const botones = document.querySelector(".layer-buttons")?.getBoundingClientRect();
    const debajoDeLosBotones = Math.max((botones?.bottom ?? 0) + margen, margen);

    if (esMovilVertical()) {
      // Tocar la mitad de abajo (derecha) lo saca arriba: from-bottom en el CSS
      el.style.top = ladoActual.current === "derecho" ? debajoDeLosBotones + "px" : "";
      return;
    }

    const contraria = document.getElementById(
      ladoActual.current === "izquierdo" ? "right-side" : "left-side",
    );
    if (!contraria) return;

    const mitad = contraria.getBoundingClientRect();
    const anchoMaximo = window.innerWidth - el.offsetWidth - margen;
    const centrado = (window.innerHeight - el.offsetHeight) / 2;
    const tope = window.innerHeight - el.offsetHeight - margen;

    el.style.left =
      Math.min(Math.max(mitad.left + (mitad.width - el.offsetWidth) / 2, margen), anchoMaximo) + "px";
    // Los botones mandan: si no cabe centrado, antes se sale un poco por abajo que taparlos
    el.style.top = Math.max(Math.min(centrado, tope), debajoDeLosBotones) + "px";
  };

  // Al aparecer, el modal ya mide su tamaño real y se puede centrar
  useLayoutEffect(() => {
    if (modal.visible) colocarModal();
  }, [modal]);

  const mostrar = (tecla: Tecla, lado: Lado) => {
    ladoActual.current = lado;
    const movil = esMovilVertical();

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
