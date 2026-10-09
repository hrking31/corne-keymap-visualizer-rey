import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { dividirBloques } from "./teclado";
import { teclasParaDibujar } from "./teclados/convertir";
import { ajustesDelNavegador, crearTeclado, nombreVisible } from "./teclados/plantillas";
import type { Ajustes, TeclaDibujo, TecladoConfig } from "./teclados/tipos";
import {
  agregarCapa,
  borrarCapa,
  cambiarNombre,
  editarTecla,
  intercambiarTeclas,
  moverCapa,
  puedeAgregarCapa,
  renombrarCapa,
} from "./teclados/editar";
import { validarTeclado } from "./teclados/validar";
import Bloque from "./components/Bloque";
import Modal, { type EstadoModal } from "./components/Modal";
import Ingreso from "./components/Ingreso";
import MenuAjustes, { type OpcionMenu } from "./components/MenuAjustes";
import { useCuenta } from "./firebase/useCuenta";
import Asistente from "./components/editor/Asistente";
import TituloEditable from "./components/editor/TituloEditable";
import ConfirmarBorrado from "./components/editor/ConfirmarBorrado";
import EditorCapa from "./components/editor/EditorCapa";
import EditorTecla from "./components/editor/EditorTecla";
import { useApilado } from "./components/editor/useApilado";

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
  const apilado = useApilado();
  const [ejemplo] = useState<TecladoConfig>(tecladoDeEjemplo);
  // Sin sesión solo se ve la pantalla de ingreso, hasta que el usuario entra o pide ver
  // la demo (el teclado de ejemplo)
  const [verDemo, setVerDemo] = useState(false);
  const ingreso = !tecladoInicial && cuenta.sesion === "cerrada" && !verDemo;

  // Asistente: el usuario entró y todavía no tiene teclado. Lo que elige se ve en vivo
  const asistente = !tecladoInicial && Boolean(cuenta.usuario) && cuenta.tecladoCargado && !cuenta.teclado;
  const [ajustesAsistente, setAjustesAsistente] = useState<Ajustes>(() =>
    ajustesDelNavegador(navigator.language, navigator.platform),
  );
  const [nombreAsistente, setNombreAsistente] = useState("");
  const [creando, setCreando] = useState(false);

  // El teclado que se ve: el fijo, el del asistente, el de la cuenta o, si no hay, el de ejemplo
  const teclado =
    tecladoInicial ?? (asistente ? crearTeclado(ajustesAsistente, nombreAsistente) : cuenta.teclado) ?? ejemplo;

  // Modo edición: solo con sesión y un teclado propio
  const [editando, setEditando] = useState(false);
  const mio = cuenta.usuario ? cuenta.teclado : null;
  const modoEdicion = editando && Boolean(mio) && !tecladoInicial;
  const [teclaEditada, setTeclaEditada] = useState<{ pos: number; lado: Lado } | null>(null);
  // «Tecla de capa» marcada o no en el editor, aún sin guardar (null: la de la tecla)
  const [vistaDeCapa, setVistaDeCapa] = useState<boolean | null>(null);
  const [capaEnEdicion, setCapaEnEdicion] = useState(false);
  const [intercambiando, setIntercambiando] = useState<number | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [aviso, setAviso] = useState("");
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

  // Guarda un cambio del editor si el teclado sigue siendo válido; si no, avisa por qué
  const guardar = (nuevo: TecladoConfig) => {
    const problemas = validarTeclado(nuevo);
    if (problemas.length) {
      setAviso(problemas[0]);
      return false;
    }
    setAviso("");
    void cuenta.guardar(nuevo);
    return true;
  };

  const salirDeEdicion = () => {
    setEditando(false);
    setTeclaEditada(null);
    setCapaEnEdicion(false);
    setIntercambiando(null);
    setAviso("");
  };

  // En edición, tocar una tecla la abre en el editor; si se está intercambiando, la cambia
  // de lugar con la elegida antes
  const elegirTecla = (tecla: TeclaDibujo, lado: Lado) => {
    if (!mio) return;
    if (intercambiando !== null) {
      guardar(intercambiarTeclas(mio, capa, intercambiando, tecla.pos));
      setIntercambiando(null);
      return;
    }
    setCapaEnEdicion(false);
    setVistaDeCapa(null);
    setTeclaEditada({ pos: tecla.pos, lado });
  };

  const agregar = () => {
    if (!mio) return;
    const { teclado: nuevo, id } = agregarCapa(mio);
    if (guardar(nuevo)) {
      setCapa(id);
      setTeclaEditada(null);
      setCapaEnEdicion(true);
    }
  };

  // Con el asistente abierto en PC, la página deja sitio al panel de la derecha
  useEffect(() => {
    document.body.classList.toggle("con-panel", asistente && !apilado);
    return () => document.body.classList.remove("con-panel");
  }, [asistente, apilado]);

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

  // Con cuenta (o comprobándola, con la copia del teclado en pantalla) o en la demo
  const conCuenta = !tecladoInicial && cuenta.sesion !== "cerrada";
  const demo = !tecladoInicial && cuenta.sesion === "cerrada";

  // Las opciones del menú de ajustes (⚙). Mientras se edita no aparece: manda «Listo»
  const menu: OpcionMenu[] = [];
  if (conCuenta && cuenta.usuario && !modoEdicion) {
    if (mio) menu.push({ texto: "Editar", alElegir: () => setEditando(true) });
    menu.push(
      { texto: "Borrar mi cuenta", peligro: true, alElegir: () => setConfirmarBorrado(true) },
      {
        texto: "Salir",
        alElegir: () => {
          // Al salir vuelve la pantalla de ingreso
          salirDeEdicion();
          setVerDemo(false);
          void cuenta.salir();
        },
      },
    );
  }
  if (demo) {
    menu.push(
      {
        texto:
          cuenta.paso === "conectando" ? "Conectando…" : cuenta.paso === "continuar" ? "Continuar con Google" : "Entrar con Google",
        mantenerAbierto: true,
        alElegir: cuenta.entrar,
      },
      // Vuelve a la pantalla de ingreso
      { texto: "Atrás", alElegir: () => setVerDemo(false) },
    );
  }

  if (ingreso) {
    return (
      <Ingreso
        paso={cuenta.paso}
        error={cuenta.error}
        onPrecargar={cuenta.precargar}
        onEntrar={cuenta.entrar}
        onDemo={() => setVerDemo(true)}
      />
    );
  }

  // La tecla en edición: toda naranja si está marcada como de capa, sin naranja si no
  const deCapaElegida = teclaEditada
    ? (vistaDeCapa ?? teclasParaDibujar(capaActual).find((t) => t.pos === teclaEditada.pos)?.deCapa)
    : undefined;

  // Los botones de capa; al editar, también editar la capa (✎), agregar una (＋) y «Listo»
  // (sale del modo edición; cada cambio ya se guardó al hacerlo), en la misma fila para
  // no gastar otra línea en el móvil
  const botonesDeCapa = (
    <div className="layer-buttons" data-capas={teclado.orden.length + (modoEdicion ? 3 : 0)}>
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
      {modoEdicion && mio && (
        <>
          <button
            type="button"
            className="boton-icono"
            aria-label={`Editar la capa ${capaActual.corto}`}
            title={`Editar la capa ${capaActual.corto}`}
            onClick={() => {
              setTeclaEditada(null);
              setCapaEnEdicion(true);
            }}
          >
            ✎
          </button>
          {puedeAgregarCapa(mio) && (
            <button type="button" className="boton-icono" aria-label="Agregar una capa" title="Agregar una capa" onClick={agregar}>
              ＋
            </button>
          )}
          <button
            type="button"
            className="boton-principal"
            title="Salir de edición"
            onClick={salirDeEdicion}
          >
            Listo
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Agrupa nombre y botones sin cambiar el diseño (display: contents en style.css) */}
      <header className="cabecera">
        <h1>
          {/* Editando, el nombre se escribe en el propio título: «Corne [Rey] ZMK» */}
          {modoEdicion && mio ? (
            <TituloEditable key={mio.nombre} nombre={mio.nombre} apilado={apilado} onNombre={(n) => guardar(cambiarNombre(mio, n))} />
          ) : (
            nombreVisible(teclado)
          )}
        </h1>

        {botonesDeCapa}
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
          alElegir={modoEdicion ? (tecla) => elegirTecla(tecla, "izquierdo") : undefined}
          elegida={teclaEditada?.pos ?? intercambiando}
          deCapaElegida={deCapaElegida}
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
          alElegir={modoEdicion ? (tecla) => elegirTecla(tecla, "derecho") : undefined}
          elegida={teclaEditada?.pos ?? intercambiando}
          deCapaElegida={deCapaElegida}
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

      {menu.length > 0 && (
        // Al entrar o salir cambian las opciones: el menú vuelve a empezar cerrado
        <MenuAjustes key={cuenta.sesion} opciones={menu} onAbrir={demo ? cuenta.precargar : undefined} />
      )}

      <footer className="firma">
        © 2026 Corne ZMK Visualizer
        {/* El nombre del autor, solo en la demo (y con datos fijos, la prueba visual) */}
        {!conCuenta && (
          <>
            {" · "}
            <a href="https://hernandorey-31.web.app/" target="_blank" rel="noopener noreferrer">
              Hernando Rey
            </a>
          </>
        )}
        {(aviso || cuenta.error) && (
          <span className="firma-error" role="alert">
            {aviso || cuenta.error}
          </span>
        )}
      </footer>

      {asistente && (
        <Asistente
          ajustes={ajustesAsistente}
          nombre={nombreAsistente}
          apilado={apilado}
          guardando={creando}
          onAjustes={setAjustesAsistente}
          onNombre={setNombreAsistente}
          onCrear={async () => {
            setCreando(true);
            await cuenta.guardar(crearTeclado(ajustesAsistente, nombreAsistente.trim()));
            setCreando(false);
          }}
        />
      )}

      {modoEdicion && mio && teclaEditada && (
        <EditorTecla
          key={`${capa}-${teclaEditada.pos}`}
          // Solo el nombre de la capa, sin «Capa» delante
          nombreCapa={capaActual.largo || capaActual.corto}
          tecla={teclasParaDibujar(capaActual).find((t) => t.pos === teclaEditada.pos)!}
          lado={teclaEditada.lado}
          apilado={apilado}
          onGuardar={(t) => {
            if (guardar(editarTecla(mio, capa, teclaEditada.pos, t))) setTeclaEditada(null);
          }}
          onDeCapa={setVistaDeCapa}
          onIntercambiar={() => {
            setIntercambiando(teclaEditada.pos);
            setTeclaEditada(null);
          }}
          onCerrar={() => setTeclaEditada(null)}
        />
      )}

      {modoEdicion && mio && capaEnEdicion && (
        <EditorCapa
          key={capa}
          capa={capaActual}
          numero={mio.orden.indexOf(capa)}
          esBase={capa === "base"}
          puedeIzquierda={mio.orden.indexOf(capa) > 1}
          puedeDerecha={capa !== "base" && mio.orden.indexOf(capa) < mio.orden.length - 1}
          onGuardar={(nombres) => {
            if (guardar(renombrarCapa(mio, capa, nombres))) setCapaEnEdicion(false);
          }}
          onMover={(direccion) => guardar(moverCapa(mio, capa, direccion))}
          onBorrar={() => {
            if (guardar(borrarCapa(mio, capa))) {
              setCapa("base");
              setCapaEnEdicion(false);
            }
          }}
          onCerrar={() => setCapaEnEdicion(false)}
        />
      )}

      {modoEdicion && intercambiando !== null && (
        <div
          className="fixed bottom-12 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-md border border-naranja bg-panel px-4 py-2 text-sm text-hueso shadow-xl"
          role="status"
        >
          Toca la tecla con la que quieres intercambiar la Key {intercambiando}
          <button type="button" className="layer-btn" onClick={() => setIntercambiando(null)}>
            Cancelar
          </button>
        </div>
      )}

      {confirmarBorrado && (
        <ConfirmarBorrado
          onBorrar={async () => {
            await cuenta.borrarCuenta();
            setConfirmarBorrado(false);
            salirDeEdicion();
            setVerDemo(false);
          }}
          onCancelar={() => setConfirmarBorrado(false)}
        />
      )}

      <Modal estado={modal} ref={modalRef} />
    </>
  );
}
