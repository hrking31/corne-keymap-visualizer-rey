import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { dividirBloques } from "./teclado";
import { teclasParaDibujar } from "./teclados/convertir";
import { ajustesDelNavegador, crearTeclado, nombreVisible } from "./teclados/plantillas";
import type { TeclaDibujo, TecladoConfig } from "./teclados/tipos";
import Bloque from "./components/Bloque";
import Modal, { type EstadoModal } from "./components/Modal";
import Bienvenida from "./components/Bienvenida";
import { useCuenta } from "./firebase/useCuenta";

// Sin cuenta se ve una capa Base de ejemplo: QWERTY en el idioma y el sistema del navegador
const tecladoDeEjemplo = () =>
  crearTeclado(ajustesDelNavegador(navigator.language, navigator.platform));

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

type Props = {
  // El teclado a mostrar. Sin él, el de ejemplo (más adelante, el de la cuenta del usuario)
  tecladoInicial?: TecladoConfig;
};

export default function App({ tecladoInicial }: Props) {
  // Con datos fijos (la prueba visual) no se usa la cuenta
  const cuenta = useCuenta(!tecladoInicial);
  const [ejemplo] = useState<TecladoConfig>(tecladoDeEjemplo);
  // El teclado que se ve: el fijo, el de la cuenta del usuario o, si no hay, el de ejemplo
  const teclado = tecladoInicial ?? cuenta.teclado ?? ejemplo;
  const [capaElegida, setCapa] = useState<string>(teclado.orden[0]);
  // Al entrar o salir cambia el teclado: si la capa elegida no existe en él, Base
  const capa = teclado.capas[capaElegida] ? capaElegida : teclado.orden[0];
  const [modal, setModal] = useState<EstadoModal>(MODAL_INICIAL);
  const modalRef = useRef<HTMLDivElement>(null);
  const ladoActual = useRef<Lado>("izquierdo");
  // Si la mitad de la tecla tocada está abajo al apilar (el modal sale entonces arriba)
  const mitadAbajo = useRef(false);
  // Apilado: false = izquierda arriba (como siempre), true = derecha arriba
  const [invertido, setInvertido] = useState(leerInvertido);

  const capaActual = teclado.capas[capa];
  // En el panel: «Capa» y el nombre largo («Capa Navegación»)
  const nombreCapa = `Capa ${capaActual.largo || capaActual.corto}`;
  const { izquierdo, derecho } = dividirBloques(teclasParaDibujar(capaActual));

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

  // Una tecla sin texto también abre el panel: muestra la capa y su «Key N»
  const mostrar = (tecla: TeclaDibujo, lado: Lado) => {
    ladoActual.current = lado;
    mitadAbajo.current = estaAbajo(lado);
    const movil = esMovilVertical();

    setModal({
      visible: true,
      borde: movil ? (mitadAbajo.current ? "from-bottom" : "from-top") : "",
      capa: nombreCapa,
      titulo: tecla.texto,
      desc: `Key ${tecla.pos}`,
      extra: tecla.descripcion,
      extraDisplay: tecla.descripcion ? "block" : "none",
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
      {/* Agrupa nombre y botones sin cambiar el diseño (display: contents en style.css) */}
      <header className="cabecera">
        <h1>{nombreVisible(teclado)}</h1>

        <div className="layer-buttons" data-capas={teclado.orden.length}>
          {teclado.orden.map((id) => (
            <button
              key={id}
              className={id === capa ? "layer-btn active" : "layer-btn"}
              data-layer={id}
              aria-pressed={id === capa}
              aria-label={`Capa ${teclado.capas[id].largo || teclado.capas[id].corto}`}
              onClick={() => setCapa(id)}
            >
              {teclado.capas[id].corto}
            </button>
          ))}
        </div>
      </header>

      <div className={invertido ? "keyboard-container invertido" : "keyboard-container"}>
        <Bloque
          id="left-side"
          lado="left"
          capa={capa}
          nombreCapa={nombreCapa}
          teclas={izquierdo}
          espejo
          onMostrar={(tecla) => mostrar(tecla, "izquierdo")}
          onOcultar={ocultar}
        />
        <Bloque
          id="right-side"
          lado="right"
          capa={capa}
          nombreCapa={nombreCapa}
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

      <footer className="firma">
        {/* Entrar / Salir: no aparece con datos fijos (la prueba visual) */}
        {!tecladoInicial && (
          <>
            {cuenta.usuario ? (
              <button type="button" className="enlace" onClick={cuenta.salir}>
                Salir
              </button>
            ) : (
              <button
                type="button"
                className="enlace"
                title="Entra con Google para configurar tu teclado"
                onClick={cuenta.entrar}
              >
                Entrar
              </button>
            )}
            {" · "}
          </>
        )}
        © 2026 CorneRey · Desarrollado por{" "}
        <a href="https://hernandorey-31.web.app/" target="_blank" rel="noopener noreferrer">
          Hernando Rey
        </a>
        {cuenta.error && (
          <span className="firma-error" role="alert">
            {cuenta.error}
          </span>
        )}
      </footer>

      <Modal estado={modal} ref={modalRef} />
      <Bienvenida />
    </>
  );
}
