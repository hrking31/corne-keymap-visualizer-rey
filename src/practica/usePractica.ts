// La práctica en marcha: el recorrido de una ronda y lo que pasa con cada pulsación.
// Se entra sin grupo («Elige qué practicar», en el menú ⚙) y, al elegir uno:
//   sinTeclado → (cualquier tecla) → conectado → listo → (cualquier tecla) → cuenta (3, 2, 1,
//   ¡YA!) → ronda → fin
// Ninguna de esas pulsaciones cuenta. «Listo» da tiempo de poner las manos antes de la cuenta
// atrás. Con el teclado ya comprobado se empieza en «listo»; ENT al terminar va directo a la
// cuenta atrás. «Parar» descarta la ronda y vuelve a «listo».
import { useEffect, useMemo, useState } from "react";
import type { TecladoConfig } from "../teclados/tipos";
import {
  NOMBRE_GRUPO, arrancar, crearTexto, empezar, empezarTexto, esDeTexto, objetivosDeGrupo, progreso, responder,
  tiempoDeRonda,
  type Grupo, type Objetivo, type Practica,
} from "./practica";
import { anotarMarca, formatoMarca, formatoTiempo, mejorMarca, type DatosPractica, type Marca } from "./records";
import { guardar, guardarGrupo, leerGrupo, leerGuardado } from "./guardado";
import { pantallaDerecha, pantallaIzquierda, type EstadoPantallas } from "./pantalla";
import type { PracticaEnCuenta } from "../firebase/useCuenta";

export type Fase = "sinGrupo" | "sinTeclado" | "conectado" | "listo" | "cuenta" | "ronda" | "fin";
export type Final = { marca: Marca; nuevoRecord: boolean; mejorAntes: Marca | null };

// Cuánto dura cada paso (ms)
const CONECTADO_MS = 1200; // «Teclado conectado», antes de «Pulsa una tecla para empezar»
const CUENTA_MS = 800; // cada número de la cuenta atrás
const YA_MS = 500; // «¡YA!» en la pantalla, con el reloj ya en marcha
const DESTELLO_MS = 350; // la tecla acertada, encendida antes de pasar a la siguiente
const RELOJ_MS = 250; // cada cuánto se mira el reloj para la pantalla
const MARCA_MS = 4000; // la marca al terminar; después solo queda «Nueva ronda» (pedido del autor)

type Opciones = {
  teclado: TecladoConfig;
  // La capa que se ve: la app muestra la de la tecla que se pide
  setCapa: (capa: string) => void;
  // Con una ventana abierta (elegir grupo, récords) las pulsaciones son de la ventana
  ignorar: boolean;
  // Con cuenta: los récords y las teclas difíciles van en Firestore y se ven en todos los
  // dispositivos. Sin cuenta (demo), o si la cuenta aún no tiene acceso, en el navegador
  nube?: { practica: PracticaEnCuenta; guardar: (datos: DatosPractica) => Promise<void> };
};

export function usePractica({ teclado, setCapa, ignorar, nube }: Opciones) {
  const [activa, setActiva] = useState(false);
  const [grupo, setGrupo] = useState<Grupo>(leerGrupo);
  const [fase, setFase] = useState<Fase>("sinTeclado");
  const [cuenta, setCuenta] = useState("3");
  const [ya, setYa] = useState(false);
  const [practica, setPractica] = useState<Practica | null>(null);
  const [datosLocales, setDatosLocales] = useState<DatosPractica>(leerGuardado);
  const enNube = nube?.practica.estado === "lista" ? nube.practica.datos : null;
  const datos = enNube ?? datosLocales;
  const [final, setFinal] = useState<Final | null>(null);
  // Al terminar, la marca se ve unos segundos y se quita
  const [marcaVisible, setMarcaVisible] = useState(true);
  // El número que acaba de cambiar en la pantalla derecha: parpadea
  const [cambia, setCambia] = useState<"aciertos" | "fallos" | null>(null);
  // La tecla recién acertada, encendida un instante
  const [destello, setDestello] = useState<Objetivo["lugares"] | null>(null);
  const [ahora, setAhora] = useState(0);
  // Ya llegó alguna pulsación: hay un teclado conectado (el navegador no lo sabe de otro modo)
  const [tecladoVisto, setTecladoVisto] = useState(false);

  const capaDe = (p: Practica) => p.objetivos[p.actual]?.lugares[0]?.capa;

  // Prepara una ronda del grupo; false si no hay nada que practicar. `directo`: sin esperar
  // a «listo» (ENT al terminar)
  const preparar = (g: Grupo, directo = false): boolean => {
    const nueva = esDeTexto(g)
      ? empezarTexto(teclado, crearTexto(teclado, g) ?? "")
      : empezar(objetivosDeGrupo(teclado, g), Math.random, datos.dificultad);
    if (!nueva) return false;
    setPractica(nueva);
    setFinal(null);
    setCambia(null);
    setDestello(null);
    setCuenta("3");
    setFase(!tecladoVisto ? "sinTeclado" : directo ? "cuenta" : "listo");
    const capa = capaDe(nueva);
    if (capa) setCapa(capa);
    return true;
  };

  const empezarGrupo = (g: Grupo): boolean => {
    if (!preparar(g)) return false;
    setGrupo(g);
    guardarGrupo(g);
    setActiva(true);
    // El foco vuelve a la página: las pulsaciones no deben activar un botón
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    return true;
  };

  // Entra en la práctica sin ningún grupo: se elige en el menú ⚙ (pedido del autor)
  const entrar = () => {
    setPractica(null);
    setFinal(null);
    setDestello(null);
    setFase("sinGrupo");
    setActiva(true);
  };

  const nuevaRonda = (directo = false) => {
    preparar(grupo, directo);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  // Descarta la ronda en marcha, sin marca, y espera a «Pulsa una tecla para empezar»
  const parar = () => nuevaRonda();

  const salir = () => {
    setActiva(false);
    setPractica(null);
    setFinal(null);
    setDestello(null);
  };

  const terminar = (p: Practica) => {
    const marca: Marca = { ms: tiempoDeRonda(p), fecha: new Date().toISOString(), fallos: p.fallos };
    if (p.enOrden) marca.letras = p.total;
    const mejorAntes = mejorMarca(datos.records, grupo);
    const { records, nuevoRecord } = anotarMarca(datos.records, grupo, marca);
    // Lo que cuesta cada tecla solo se aprende con las teclas sueltas
    const nuevos: DatosPractica = { records, dificultad: p.enOrden ? datos.dificultad : p.dificultad };
    const enDispositivo = () => {
      setDatosLocales(nuevos);
      guardar(nuevos);
    };
    // En la nube, si el servidor la rechaza, la ronda no se pierde: queda en el dispositivo
    if (enNube && nube) nube.guardar(nuevos).catch(enDispositivo);
    else enDispositivo();
    setFinal({ marca, nuevoRecord, mejorAntes });
    setMarcaVisible(true);
    setFase("fin");
  };

  // «Teclado conectado» un momento y, después, «Pulsa una tecla para empezar»
  useEffect(() => {
    if (fase !== "conectado") return;
    const t = window.setTimeout(() => setFase("listo"), CONECTADO_MS);
    return () => window.clearTimeout(t);
  }, [fase]);

  // 3, 2, 1 y «¡YA!»: ahí arranca el reloj
  useEffect(() => {
    if (fase !== "cuenta") return;
    const pasos = ["2", "1"].map((n, i) => window.setTimeout(() => setCuenta(n), (i + 1) * CUENTA_MS));
    const salida = window.setTimeout(() => {
      const momento = Date.now();
      setPractica((p) => (p ? arrancar(p, momento) : p));
      setAhora(momento);
      setYa(true);
      setFase("ronda");
    }, 3 * CUENTA_MS);
    return () => [...pasos, salida].forEach((t) => window.clearTimeout(t));
  }, [fase]);

  // La marca se quita a los pocos segundos: en el título y en las pantallas
  useEffect(() => {
    if (fase !== "fin") return;
    const t = window.setTimeout(() => setMarcaVisible(false), MARCA_MS);
    return () => window.clearTimeout(t);
  }, [fase]);

  // El parpadeo del número que cambia dura 0,4 s; después se borra, para que la pantalla
  // derecha, que en el móvil lleva el reloj, no lo repita al redibujarse cada segundo
  useEffect(() => {
    if (!cambia) return;
    const t = window.setTimeout(() => setCambia(null), 400);
    return () => window.clearTimeout(t);
  }, [cambia, practica?.aciertos, practica?.fallos]);

  // «¡YA!» se queda un instante en la pantalla
  useEffect(() => {
    if (!ya) return;
    const t = window.setTimeout(() => setYa(false), YA_MS);
    return () => window.clearTimeout(t);
  }, [ya]);

  // El reloj de la pantalla
  useEffect(() => {
    if (fase !== "ronda") return;
    const t = window.setInterval(() => setAhora(Date.now()), RELOJ_MS);
    return () => window.clearInterval(t);
  }, [fase]);

  // Practicando, todas las pulsaciones son de la práctica: no hacen lo de siempre en el
  // navegador (Tab no mueve el foco, F5 no recarga…). El menú ⚙ y las ventanas quedan libres
  useEffect(() => {
    if (!activa) return;
    const libre = (e: KeyboardEvent) => ignorar || (e.target instanceof Element && e.target.closest(".menu-ajustes"));
    const alPulsar = (e: KeyboardEvent) => {
      if (libre(e)) return;
      e.preventDefault();
      if (e.repeat || e.isComposing || fase === "sinGrupo") return;
      if (fase === "sinTeclado") {
        setTecladoVisto(true);
        setFase("conectado");
        return;
      }
      if (fase === "listo") {
        setFase("cuenta");
        return;
      }
      // Al terminar, ENT empieza otra ronda (aquí ENT no es una pregunta)
      if (fase === "fin" && e.key === "Enter") nuevaRonda(true);
      if (fase !== "ronda" || !practica) return;

      const { practica: nueva, resultado } = responder(practica, {
        key: e.key,
        code: e.code,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
        altGr: e.getModifierState("AltGraph"),
      });
      if (resultado === "ignorada") return;

      // Acierto o fallo, se muestra dónde está la tecla que se pedía. Acierto: se enciende un
      // instante. Fallo: la correcta queda encendida (fallado). Un número solo cambia la
      // primera vez: un acierto tras fallar no suma, y fallar dos veces cuenta un fallo
      const pedida = practica.objetivos[practica.actual];
      setPractica(nueva);
      if (pedida.lugares[0]) setCapa(pedida.lugares[0].capa);
      setDestello(resultado === "acierto" ? pedida.lugares : null);
      setCambia(practica.fallado ? null : resultado === "acierto" ? "aciertos" : "fallos");
      if (nueva.fin !== null) terminar(nueva);
    };
    // Al soltar Alt, Windows activa el menú del navegador: tampoco
    const alSoltar = (e: KeyboardEvent) => {
      if (!libre(e)) e.preventDefault();
    };
    document.addEventListener("keydown", alPulsar, true);
    document.addEventListener("keyup", alSoltar, true);
    return () => {
      document.removeEventListener("keydown", alPulsar, true);
      document.removeEventListener("keyup", alSoltar, true);
    };
  });

  // La tecla acertada se apaga sola y la pantalla pasa a la capa de la siguiente pregunta
  useEffect(() => {
    if (!destello || !practica) return;
    const siguiente = capaDe(practica);
    const t = window.setTimeout(() => {
      setDestello(null);
      if (siguiente && practica.fin === null) setCapa(siguiente);
    }, DESTELLO_MS);
    return () => window.clearTimeout(t);
  }, [destello, practica, setCapa]);

  // Lo que muestra cada pantalla del teclado. Cada una lleva solo sus datos: si la derecha
  // llevara el tiempo, se redibujaría cada segundo y repetiría el parpadeo del número
  const formato = (m: Marca) => formatoMarca(grupo, m);
  const aciertos = practica?.aciertos ?? 0;
  const fallos = practica?.fallos ?? 0;
  let izquierda: EstadoPantallas;
  let derecha: EstadoPantallas;
  const nombre = NOMBRE_GRUPO[grupo].toUpperCase();
  if (fase === "sinGrupo" || fase === "listo") {
    // Sin grupo, o esperando para empezar, las pantallas solo con sus íconos (pedido del autor)
    izquierda = derecha = { fase: "vacia", conectado: tecladoVisto };
  } else if (fase === "sinTeclado" || fase === "conectado") {
    izquierda = derecha = { fase };
  } else if (fase === "cuenta") {
    izquierda = derecha = { fase: "cuenta", texto: cuenta };
  } else {
    // Qué se practica, cuánto se lleva y el tiempo: la izquierda los muestra y, si el tiempo
    // no le cabe (móvil), lo muestra la derecha
    const enRonda = {
      tiempo: practica ? formatoTiempo(tiempoDeRonda(practica, ahora)) : "0:00",
      rotulo: nombre, // «PALABRAS»
      cuenta: practica ? `${progreso(practica).hechas} / ${progreso(practica).total}` : "", // «2 / 6»
    };
    izquierda = ya ? { fase: "cuenta", texto: "¡YA!" } : { fase: "ronda", ...enRonda, aciertos: 0, fallos: 0, cambia: null };
    derecha = { fase: "ronda", ...enRonda, aciertos, fallos, cambia };
  }
  if (fase === "fin" && !marcaVisible) {
    izquierda = derecha = { fase: "vacia", conectado: true };
  } else if (fase === "fin" && final && practica) {
    izquierda = derecha = {
      fase: "fin",
      tiempo: formatoTiempo(final.marca.ms),
      aciertos: practica.aciertos,
      fallos: practica.fallos,
      record: final.nuevoRecord,
      marca: esDeTexto(grupo) ? formato(final.marca).toUpperCase() : undefined,
    };
  }

  return {
    activa,
    grupo,
    fase,
    practica,
    final,
    marcaVisible,
    records: datos.records,
    destello,
    pantallas: { izquierda, derecha },
    formato,
    empezar: empezarGrupo,
    entrar,
    nuevaRonda: () => nuevaRonda(),
    parar,
    salir,
  };
}

// La imagen de una pantalla, solo cuando cambia lo que muestra: una imagen nueva reinicia
// su parpadeo, y la app se vuelve a pintar cada cuarto de segundo por el reloj
export function usePantallaOled(lado: "left" | "right", estado: EstadoPantallas | undefined, tecla: number): string | undefined {
  const clave = estado ? JSON.stringify(estado) : "";
  return useMemo(() => {
    if (!clave) return undefined;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const e = JSON.parse(clave) as EstadoPantallas;
    return lado === "left" ? pantallaIzquierda(e, tecla, quieto) : pantallaDerecha(e, tecla, quieto);
  }, [lado, clave, tecla]);
}
