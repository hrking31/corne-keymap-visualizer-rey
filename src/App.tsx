import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { keymap } from "./data";
import { dividirBloques } from "./teclado";
import type { Capa, Tecla } from "./tipos";
import Bloque from "./components/Bloque";
import Modal, { type EstadoModal } from "./components/Modal";
import Bienvenida from "./components/Bienvenida";

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
const MOVIL_VERTICAL = "(max-aspect-ratio: 6/5)";
const esMovilVertical = () => window.matchMedia(MOVIL_VERTICAL).matches;

type Lado = "izquierdo" | "derecho";

// Qué mitad va arriba al apilar: se recuerda en este dispositivo. localStorage puede
// fallar (modo privado, datos bloqueados): entonces se usa el orden de siempre.
const CLAVE_ORDEN = "corne-orden-mitades";
const leerInvertido = () => {
  try {
    return localStorage.getItem(CLAVE_ORDEN) === "derecha-arriba";
  } catch {
    return false;
  }
};
const guardarInvertido = (invertido: boolean) => {
  try {
    localStorage.setItem(CLAVE_ORDEN, invertido ? "derecha-arriba" : "izquierda-arriba");
  } catch {
    // Sin almacenamiento solo se pierde el recuerdo; el botón sigue funcionando
  }
};

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
  // Si la mitad de la tecla tocada está abajo al apilar (el modal sale entonces arriba)
  const mitadAbajo = useRef(false);
  // Apilado: false = izquierda arriba (como siempre), true = derecha arriba
  const [invertido, setInvertido] = useState(leerInvertido);

  const { izquierdo, derecho } = dividirBloques(keymap[capa]);

  // ¿Esa mitad está abajo cuando el teclado se apila?
  const estaAbajo = (lado: Lado) => (lado === "derecho") !== invertido;

  const invertir = () => {
    guardarInvertido(!invertido);
    setInvertido(!invertido);
    ocultar();
  };

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
      // Tocar la mitad de abajo lo saca arriba: from-bottom en el CSS
      el.style.top = mitadAbajo.current ? debajoDeLosBotones + "px" : "";
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

  // Al aparecer, el modal ya mide su tamaño real y se puede centrar. Su posición se borra
  // aquí, cuando React ya lo ocultó, y no al salir de la tecla: si se borraba antes, al
  // pasar rápido por varias teclas se pintaba un cuadro con el modal aún visible y sin
  // posición, y aparecía un instante arriba a la izquierda.
  useLayoutEffect(() => {
    const el = modalRef.current;
    if (modal.visible) colocarModal();
    else if (el) {
      el.style.left = "";
      el.style.top = "";
    }
  }, [modal]);

  const mostrar = (tecla: Tecla, lado: Lado) => {
    ladoActual.current = lado;
    mitadAbajo.current = estaAbajo(lado);
    const movil = esMovilVertical();

    setModal({
      visible: true,
      borde: movil ? (mitadAbajo.current ? "from-bottom" : "from-top") : "",
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
      <h1>Corne ZMK Visualizer</h1>

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

      <div className={invertido ? "keyboard-container invertido" : "keyboard-container"}>
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
        {/* Solo se ve con las mitades apiladas: en el hueco entre las dos (style.css) */}
        <button
          type="button"
          className="invertir"
          aria-pressed={invertido}
          aria-label="Invertir el orden de las mitades"
          title="Invertir el orden de las mitades"
          onClick={invertir}
        >
          ⇅
        </button>
      </div>

      <Modal estado={modal} ref={modalRef} />
      <Bienvenida />
    </>
  );
}
