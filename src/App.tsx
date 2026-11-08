import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { dividirBloques } from "./teclado";
import { teclasParaDibujar } from "./teclados/convertir";
import { caminoDeCapa, marcasDelCamino } from "./teclados/camino";
import { ajustesDelNavegador, nombreVisible, tecladoVacio } from "./teclados/basico";
import { tecladoDeEjemplo } from "./teclados/ejemplo";
import type { Ajustes, TeclaDibujo, TecladoConfig } from "./teclados/tipos";
import { cambiarNombre, editarTecla, renombrarCapa } from "./teclados/editar";
import { validarTeclado } from "./teclados/validar";
import Bloque from "./components/Bloque";
import Modal, { type EstadoModal } from "./components/Modal";
import Ingreso from "./components/Ingreso";
import MenuAjustes, { type OpcionMenu } from "./components/MenuAjustes";
import { useCuenta } from "./firebase/useCuenta";
import Asistente from "./components/editor/Asistente";
import TituloEditable from "./components/editor/TituloEditable";
import ImportarKeymap, { type Importacion } from "./components/editor/ImportarKeymap";
import { leerKeymap } from "./keymap/leer";
import { importarKeymap } from "./keymap/importar";
import CargarTeclado, { type Carga } from "./components/editor/CargarTeclado";
import EditorAjustes from "./components/editor/EditorAjustes";
import { crearRespaldo, leerRespaldo, nombreDeArchivo } from "./teclados/respaldo";
import ConfirmarBorrado from "./components/editor/ConfirmarBorrado";
import EditorCapa from "./components/editor/EditorCapa";
import EditorTecla from "./components/editor/EditorTecla";
import { useApilado, useMovil } from "./components/editor/useApilado";
import { usePantallaOled, usePractica } from "./practica/usePractica";
import TituloPractica, { letrasDelTitulo } from "./components/practica/TituloPractica";
import ElegirPractica from "./components/practica/ElegirPractica";
import RecordsPractica from "./components/practica/RecordsPractica";

// Sin cuenta (la demo) se ve el Corne de ejemplo de ZMK, en el idioma y el sistema del navegador
const ejemploDelNavegador = () => tecladoDeEjemplo(ajustesDelNavegador(navigator.language, navigator.platform));

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

const avisoSinReconocer = (original: string) =>
  `No se reconoció «${original}». Revisa tu .keymap o escribe aquí qué hace.`;

// Lo que mide una tecla en px (el ancho de una columna de la cuadrícula): de eso depende
// el tamaño de la letra de las pantallas de la práctica. Cambia con la ventana
const medirTecla = () => {
  const mitad = document.getElementById("right-side");
  return mitad ? parseFloat(getComputedStyle(mitad).gridTemplateColumns) || 0 : 0;
};
const sinMedir = () => 0;
const alCambiarLaVentana = (avisar: () => void) => {
  window.addEventListener("resize", avisar);
  return () => window.removeEventListener("resize", avisar);
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
  const [ejemplo] = useState<TecladoConfig>(ejemploDelNavegador);
  // Sin sesión solo se ve la pantalla de ingreso, hasta que el usuario entra o pide ver
  // la demo (el teclado de ejemplo)
  const [verDemo, setVerDemo] = useState(false);
  const ingreso = !tecladoInicial && cuenta.sesion === "cerrada" && !verDemo;

  // Asistente: el usuario entró y todavía no tiene teclado. Elige idioma y sistema y carga
  // su .keymap; mientras tanto, al lado se ve el teclado de ejemplo
  const asistente = !tecladoInicial && Boolean(cuenta.usuario) && cuenta.tecladoCargado && !cuenta.teclado;
  const [ajustesAsistente, setAjustesAsistente] = useState<Ajustes>(() =>
    ajustesDelNavegador(navigator.language, navigator.platform),
  );
  const [nombreAsistente, setNombreAsistente] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorAsistente, setErrorAsistente] = useState("");

  // El teclado que se ve: el fijo (la prueba visual), el de la cuenta o, si no hay, el de ejemplo
  const teclado = tecladoInicial ?? cuenta.teclado ?? ejemplo;

  // Modo edición: solo con sesión y un teclado propio
  const [editando, setEditando] = useState(false);
  const mio = cuenta.usuario ? cuenta.teclado : null;
  const modoEdicion = editando && Boolean(mio) && !tecladoInicial;
  const [teclaEditada, setTeclaEditada] = useState<{ pos: number; lado: Lado } | null>(null);
  const [capaEnEdicion, setCapaEnEdicion] = useState(false);
  // «Idioma y sistema» abierto en el editor
  const [ajustesEnEdicion, setAjustesEnEdicion] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  // La fila de botones de capa: al editar con muchas capas se reparte en columnas (abajo)
  const filaCapas = useRef<HTMLDivElement>(null);
  // Editando con más de 6 capas, si la fila es una cuadrícula (teclado apilado, editor.css):
  // tantas columnas como quepan con los nombres reales, de 6 a 3. Así nombres cortos caben
  // 6 + 6, y los largos bajan a 5 o 4 sin salirse de la pantalla. En el móvil no: ✎ 🌐 y ✓
  // van abajo y la fila solo lleva las capas, repartida como fuera de la edición (style.css)
  const movil = useMovil();
  const muchasCapas = modoEdicion && !movil && teclado.orden.length > 6;
  const nombresCapas = teclado.orden.map((id) => teclado.capas[id].corto).join("|");
  useLayoutEffect(() => {
    const fila = filaCapas.current;
    if (!fila || !muchasCapas) return;
    const ajustar = () => {
      fila.style.gridTemplateColumns = "";
      if (getComputedStyle(fila).display !== "grid") return;
      for (const columnas of [6, 5, 4, 3]) {
        fila.style.gridTemplateColumns = `repeat(${columnas}, auto)`;
        if (fila.scrollWidth <= fila.clientWidth) break;
      }
    };
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => {
      window.removeEventListener("resize", ajustar);
      fila.style.gridTemplateColumns = "";
    };
  }, [muchasCapas, nombresCapas]);

  // Importar un .keymap: el resumen y el teclado resultante, hasta que se aplique o cancele
  const [importacion, setImportacion] = useState<(Importacion & { teclado?: TecladoConfig }) | null>(null);
  const [selectorKeymap, setSelectorKeymap] = useState<HTMLInputElement | null>(null);
  // «Cargar teclado desde archivo»: el resumen y el teclado leído, hasta aplicar o cancelar
  const [carga, setCarga] = useState<Carga | null>(null);
  const [selectorArchivo, setSelectorArchivo] = useState<HTMLInputElement | null>(null);
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

  // Práctica (memoria muscular): la app pide una tecla o un texto y se pulsa en el teclado
  // físico. Sus ventanas: elegir qué practicar y los récords
  const [ventanaPractica, setVentanaPractica] = useState<"elegir" | "records" | null>(null);
  const practica = usePractica({
    teclado,
    setCapa,
    ignorar: ventanaPractica !== null,
    // Con cuenta, la práctica se guarda en ella (en la demo, en el navegador)
    nube: cuenta.usuario && !tecladoInicial ? { practica: cuenta.practica, guardar: cuenta.guardarPractica } : undefined,
  });

  const capaActual = teclado.capas[capa];
  // En el panel: «Capa» y el nombre largo («Capa Navegación»)
  const nombreCapa = `Capa ${capaActual.largo || capaActual.corto}`;
  const { izquierdo, derecho } = dividirBloques(teclasParaDibujar(capaActual));
  // Capas animadas: las teclas que hay que usar, y en qué orden, para llegar a esta capa.
  // Solo en la vista normal: al editar el movimiento estorba, y al practicar sería una pista
  const camino = editando || practica.activa ? undefined : marcasDelCamino(caminoDeCapa(teclado, capa));

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
    setAjustesEnEdicion(false);
    setAviso("");
  };

  // En edición, tocar una tecla la abre en el editor
  const elegirTecla = (tecla: TeclaDibujo, lado: Lado) => {
    if (!mio) return;
    setCapaEnEdicion(false);
    setAjustesEnEdicion(false);
    setTeclaEditada({ pos: tecla.pos, lado });
  };

  // Crea el teclado del asistente con el .keymap elegido. Si no se puede (no es un .keymap,
  // otro teclado…), el asistente dice por qué
  const crearConKeymap = async (archivo: File) => {
    setCreando(true);
    setErrorAsistente("");
    try {
      const { teclado: nuevo } = importarKeymap(
        leerKeymap(await archivo.text()),
        tecladoVacio(ajustesAsistente, nombreAsistente.trim()),
      );
      const problemas = validarTeclado(nuevo);
      if (problemas.length) throw new Error(problemas[0]);
      await cuenta.guardar(nuevo);
    } catch (e) {
      setErrorAsistente(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    }
    setCreando(false);
  };

  // «Guardar teclado en archivo»: lo descarga como .json (se genera aquí, sin pasar por ningún servidor)
  const guardarEnArchivo = (actual: TecladoConfig) => {
    const contenido = JSON.stringify(crearRespaldo(actual), null, 2);
    const url = URL.createObjectURL(new Blob([contenido], { type: "application/json" }));
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreDeArchivo(actual);
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // «Cargar teclado desde archivo»: lee el .json y muestra su resumen. Nada cambia hasta pulsar «Aplicar»
  const leerArchivoTeclado = async (archivo: File | undefined) => {
    if (!archivo) return;
    try {
      const { teclado: leido, fecha } = leerRespaldo(await archivo.text());
      setCarga({ archivo: archivo.name, teclado: leido, fecha });
    } catch (e) {
      setCarga({ archivo: archivo.name, error: e instanceof Error ? e.message : "No se pudo leer el archivo." });
    }
  };

  // Lee el .keymap elegido y muestra el resumen. Nada se guarda hasta pulsar «Aplicar».
  // Con `ajustes` (desde «Idioma y sistema»), lo lee con ese idioma y ese sistema
  const leerArchivo = async (archivo: File | undefined, ajustes?: Ajustes) => {
    if (!archivo || !mio) return;
    try {
      const { teclado: nuevo, resumen } = importarKeymap(leerKeymap(await archivo.text()), ajustes ? { ...mio, ajustes } : mio);
      setImportacion({ archivo: archivo.name, resumen, ajustes, teclado: nuevo });
    } catch (e) {
      setImportacion({ archivo: archivo.name, error: e instanceof Error ? e.message : "No se pudo leer el archivo." });
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
    // Practicando se mira el teclado de la pantalla, no las descripciones
    if (practica.activa) return;
    ladoActual.current = lado;
    mitadAbajo.current = estaAbajo(lado);
    const movil = esMovilVertical();

    setModal({
      visible: true,
      borde: movil ? (mitadAbajo.current ? "from-bottom" : "from-top") : "",
      capa: nombreCapa,
      titulo: tecla.texto.replace("\n", " / "),
      desc: `Key ${tecla.pos}`,
      // Si no se reconoció al importar y aún no tiene descripción, el panel lo explica
      extra: tecla.descripcion || (tecla.sinReconocer ? avisoSinReconocer(tecla.sinReconocer) : ""),
      extraDisplay: tecla.descripcion || tecla.sinReconocer ? "block" : "none",
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

  // ⚙ → «Practicar»: entra en la práctica sin grupo; qué practicar se elige en el mismo menú
  const entrarPractica = () => {
    practica.entrar();
    ocultar();
    setAviso("");
  };

  // Empieza a practicar el grupo elegido en la ventana «Practicar»
  const practicar = (grupo: Parameters<typeof practica.empezar>[0]) => {
    setVentanaPractica(null);
    if (!practica.empezar(grupo)) {
      setAviso("Este teclado no tiene nada que practicar en ese grupo.");
      return;
    }
    ocultar();
    setAviso("");
  };

  // Las teclas encendidas de la capa que se ve: la recién acertada o, tras un fallo, la correcta
  const pedida = practica.practica?.objetivos[practica.practica.actual];
  const encendidas = practica.activa
    ? (practica.destello ?? (practica.fase === "ronda" && practica.practica?.fallado && pedida ? pedida.lugares : []))
        .filter((lugar) => lugar.capa === capa)
        .map((lugar) => lugar.pos)
    : undefined;
  // Las pantallas del teclado: el tiempo a la izquierda y la puntuación a la derecha
  const tamanoTecla = useSyncExternalStore(alCambiarLaVentana, practica.activa ? medirTecla : sinMedir);
  const oledIzquierda = usePantallaOled("left", practica.activa ? practica.pantallas.izquierda : undefined, tamanoTecla);
  const oledDerecha = usePantallaOled("right", practica.activa ? practica.pantallas.derecha : undefined, tamanoTecla);

  // Con cuenta (o comprobándola, con la copia del teclado en pantalla) o en la demo
  const conCuenta = !tecladoInicial && cuenta.sesion !== "cerrada";
  const demo = !tecladoInicial && cuenta.sesion === "cerrada";

  // Las opciones del menú de ajustes (⚙). Mientras se edita no aparece: manda «Listo».
  // Practicando: elegir qué practicar, los récords y salir
  const menu: OpcionMenu[] = [];
  const opcionesPractica: OpcionMenu[] = [
    { texto: "Practicar", alElegir: entrarPractica },
    { texto: "Récords", alElegir: () => setVentanaPractica("records") },
  ];
  if (practica.activa) {
    menu.push(
      { texto: "Qué practicar", alElegir: () => setVentanaPractica("elegir") },
      { texto: "Récords", alElegir: () => setVentanaPractica("records") },
      // Sale de la práctica (no de la cuenta: practicando no está esa opción)
      { texto: "Salir", alElegir: practica.salir },
    );
  } else if (conCuenta && cuenta.usuario && !modoEdicion) {
    if (mio) {
      menu.push({ texto: "Editar", alElegir: () => setEditando(true) });
      menu.push(...opcionesPractica);
      // Abre el selector de archivos (en el mismo clic: los navegadores lo exigen)
      menu.push({ texto: "Importar .keymap", alElegir: () => selectorKeymap?.click() });
      menu.push({ texto: "Guardar teclado en archivo", alElegir: () => guardarEnArchivo(mio) });
      menu.push({ texto: "Cargar teclado desde archivo", alElegir: () => selectorArchivo?.click() });
    }
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
  if (demo && !practica.activa) {
    menu.push(
      {
        texto:
          cuenta.paso === "conectando" ? "Conectando…" : cuenta.paso === "continuar" ? "Continuar con Google" : "Entrar con Google",
        mantenerAbierto: true,
        alElegir: cuenta.entrar,
      },
      ...opcionesPractica,
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

  // Los botones de capa; al editar, también el nombre largo de la capa (✎), el idioma y el
  // sistema (🌐) y «Listo» (✓: sale del modo edición; cada cambio ya se guardó al hacerlo),
  // en la misma fila para no gastar otra línea. En el móvil van abajo a la derecha (editor.css)
  const botonesDeCapa = (
    <div
      ref={filaCapas}
      // Editando con más de 6 capas: dos filas de 6 (editor.css). data-capas cuenta las
      // casillas: las capas y, fuera del móvil, ✎🌐 (una sola) y «Listo»
      className={muchasCapas ? "layer-buttons editando-muchas" : "layer-buttons"}
      data-capas={teclado.orden.length + (modoEdicion && !movil ? 2 : 0)}
    >
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
          {/* ✎ y 🌐 comparten una casilla */}
          <span className="par-edicion">
            <button
              type="button"
              className="boton-icono"
              aria-label={`Nombre de la capa ${capaActual.corto}`}
              title={`Nombre de la capa ${capaActual.corto}`}
              onClick={() => {
                setTeclaEditada(null);
                setAjustesEnEdicion(false);
                setCapaEnEdicion(true);
              }}
            >
              ✎
            </button>
            <button
              type="button"
              className="boton-icono"
              aria-label="Idioma y sistema"
              title="Idioma y sistema"
              onClick={() => {
                setTeclaEditada(null);
                setCapaEnEdicion(false);
                setAjustesEnEdicion(true);
              }}
            >
              {/* Un globo: el idioma */}
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
              </svg>
            </button>
          </span>
          <button
            type="button"
            className="boton-icono listo-edicion"
            aria-label="Listo"
            title="Listo: salir de edición"
            onClick={salirDeEdicion}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Agrupa nombre y botones sin cambiar el diseño (display: contents en style.css) */}
      <header className="cabecera">
        <h1
          aria-live={practica.activa ? "polite" : undefined}
          // Practicando, en el móvil la letra se ajusta al largo del título (editor.css)
          className={practica.activa ? "titulo-practica" : undefined}
          style={practica.activa ? ({ "--letras": Math.max(1, letrasDelTitulo(practica)) } as CSSProperties) : undefined}
        >
          {/* Practicando, el título es la pregunta. Editando, el nombre se escribe en el
              propio título: «Corne [Rey] ZMK» */}
          {practica.activa ? (
            <TituloPractica
              fase={practica.fase}
              practica={practica.practica}
              final={practica.final}
              formato={practica.formato}
              marcaVisible={practica.marcaVisible}
              onNuevaRonda={practica.nuevaRonda}
            />
          ) : modoEdicion && mio ? (
            <TituloEditable key={mio.nombre} nombre={mio.nombre} apilado={apilado} onNombre={(n) => guardar(cambiarNombre(mio, n))} />
          ) : (
            nombreVisible(teclado)
          )}
        </h1>

        {botonesDeCapa}
      </header>

      <div className={"keyboard-container" + (invertido ? " invertido" : "") + (practica.activa ? " practicando" : "")}>
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
          elegida={teclaEditada?.pos}
          encendidas={encendidas}
          pantalla={oledIzquierda}
          camino={camino}
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
          elegida={teclaEditada?.pos}
          encendidas={encendidas}
          pantalla={oledDerecha}
          camino={camino}
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

      {/* «Parar», durante la cuenta atrás y la ronda, junto al ⚙ (pedido del autor). Descarta
          la ronda y vuelve a «Pulsa una tecla para empezar» */}
      {practica.activa && (practica.fase === "cuenta" || practica.fase === "ronda") && (
        <button type="button" className="parar-ronda" aria-label="Parar la ronda" title="Parar" onClick={practica.parar}>
          {/* ↺: corta la ronda y vuelve a empezar */}
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12 A8 8 0 1 0 6.34 6.34 L4 8.6" />
            <path d="M4 4 V8.6 H8.6" />
          </svg>
        </button>
      )}

      {menu.length > 0 && (
        // Al entrar o salir cambian las opciones: el menú vuelve a empezar cerrado
        <MenuAjustes
          key={`${cuenta.sesion}-${practica.activa ? "practica" : "normal"}`}
          opciones={menu}
          onAbrir={demo && !practica.activa ? cuenta.precargar : undefined}
        />
      )}

      {/* El marcador de la práctica se ve en las pantallas del teclado, que son imágenes:
          aquí va el mismo dato como texto, para quien usa un lector de pantalla */}
      {practica.activa && (
        <p className="sr-only">
          {practica.fase === "sinGrupo"
            ? "Elige qué practicar en el menú de ajustes"
            : practica.fase === "sinTeclado"
            ? "Conecta tu teclado y pulsa cualquier tecla"
            : practica.fase === "listo"
            ? "Pulsa una tecla para empezar"
            : `Aciertos ${practica.practica?.aciertos ?? 0}, fallos ${practica.practica?.fallos ?? 0}`}
        </p>
      )}

      {ventanaPractica === "elegir" && (
        <ElegirPractica
          teclado={teclado}
          grupo={practica.grupo}
          records={practica.records}
          onElegir={practicar}
          onCerrar={() => setVentanaPractica(null)}
        />
      )}
      {ventanaPractica === "records" && (
        <RecordsPractica records={practica.records} grupo={practica.grupo} onCerrar={() => setVentanaPractica(null)} />
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
            {" · "}
            {/* El código de la app: el logo de GitHub, sin texto (el pie no tiene sitio) */}
            <a
              className="firma-github"
              href="https://github.com/hrking31/corne-keymap-visualizer-rey"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Código en GitHub"
              title="Código en GitHub"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
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
          error={errorAsistente}
          onAjustes={setAjustesAsistente}
          onNombre={setNombreAsistente}
          onKeymap={(archivo) => void crearConKeymap(archivo)}
          onCancelar={() => {
            // Sin teclado creado no hay nada que guardar: vuelve a la pantalla de ingreso
            setVerDemo(false);
            void cuenta.salir();
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
          onCerrar={() => setTeclaEditada(null)}
        />
      )}

      {modoEdicion && mio && capaEnEdicion && (
        <EditorCapa
          key={capa}
          capa={capaActual}
          onGuardar={(largo) => {
            if (guardar(renombrarCapa(mio, capa, largo))) setCapaEnEdicion(false);
          }}
          onCerrar={() => setCapaEnEdicion(false)}
        />
      )}

      {modoEdicion && mio && ajustesEnEdicion && (
        <EditorAjustes
          ajustes={mio.ajustes}
          onKeymap={(archivo, ajustes) => {
            setAjustesEnEdicion(false);
            void leerArchivo(archivo, ajustes);
          }}
          onCerrar={() => setAjustesEnEdicion(false)}
        />
      )}

      {/* El selector de archivos del menú «Importar .keymap»: no se ve */}
      {mio && (
        <input
          ref={setSelectorKeymap}
          type="file"
          accept=".keymap"
          hidden
          onChange={(e) => {
            void leerArchivo(e.target.files?.[0]);
            // Así se puede volver a elegir el mismo archivo después de cambiarlo
            e.target.value = "";
          }}
        />
      )}

      {/* El selector de archivos del menú «Cargar teclado desde archivo»: no se ve */}
      {mio && (
        <input
          ref={setSelectorArchivo}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            void leerArchivoTeclado(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      )}

      {carga && (
        <CargarTeclado
          carga={carga}
          onAplicar={() => {
            if (!mio || !carga.teclado) return;
            // Por si acaso: antes de reemplazarlo, el teclado actual se guarda en un archivo
            guardarEnArchivo(mio);
            if (guardar(carga.teclado)) {
              setCapa("base");
              setCarga(null);
            }
          }}
          onCerrar={() => setCarga(null)}
        />
      )}

      {importacion && (
        <ImportarKeymap
          importacion={importacion}
          onAplicar={() => {
            if (importacion.teclado && guardar(importacion.teclado)) {
              setCapa("base");
              setImportacion(null);
            }
          }}
          onCerrar={() => setImportacion(null)}
        />
      )}

      {confirmarBorrado && (
        <ConfirmarBorrado
          correo={cuenta.usuario?.correo ?? ""}
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
