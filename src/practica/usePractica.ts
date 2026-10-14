// La práctica en marcha: el recorrido de una ronda y lo que pasa con cada pulsación.
//   sinTeclado → (cualquier tecla) → conectado → cuenta (3, 2, 1, ¡YA!) → ronda → fin
// La pulsación que comprueba el teclado y las de la cuenta atrás no cuentan. Con «Nueva
// ronda» o ENT al terminar se salta la conexión: el teclado ya respondió.
import { useEffect, useMemo, useRef, useState } from "react";
import type { TecladoConfig } from "../teclados/tipos";
import {
  arrancar, crearTexto, empezar, empezarTexto, esDeTexto, objetivosDeGrupo, responder, tiempoDeRonda,
  type Grupo, type Objetivo, type Practica,
} from "./practica";
import { anotarMarca, formatoMarca, formatoTiempo, mejorMarca, type DatosPractica, type Marca } from "./records";
import { guardar, guardarGrupo, leerGrupo, leerGuardado } from "./guardado";
import { pantallaDerecha, pantallaIzquierda, type EstadoPantallas } from "./pantalla";

export type Fase = "sinTeclado" | "conectado" | "cuenta" | "ronda" | "fin";
export type Final = { marca: Marca; nuevoRecord: boolean; mejorAntes: Marca | null };

// Cuánto dura cada paso (ms)
const CONECTADO_MS = 1200; // «Teclado conectado», antes de la cuenta atrás
const CUENTA_MS = 800; // cada número de la cuenta atrás
const YA_MS = 500; // «¡YA!» en la pantalla, con el reloj ya en marcha
const DESTELLO_MS = 350; // la tecla acertada, encendida antes de pasar a la siguiente
const RELOJ_MS = 250; // cada cuánto se mira el reloj para la pantalla

type Opciones = {
  teclado: TecladoConfig;
  // La capa que se ve: la app muestra la de la tecla que se pide
  setCapa: (capa: string) => void;
  // Con una ventana abierta (elegir grupo, récords) las pulsaciones son de la ventana
  ignorar: boolean;
};

export function usePractica({ teclado, setCapa, ignorar }: Opciones) {
  const [activa, setActiva] = useState(false);
  const [grupo, setGrupo] = useState<Grupo>(leerGrupo);
  const [fase, setFase] = useState<Fase>("sinTeclado");
  const [cuenta, setCuenta] = useState("3");
  const [ya, setYa] = useState(false);
  const [practica, setPractica] = useState<Practica | null>(null);
  const [datos, setDatos] = useState<DatosPractica>(leerGuardado);
  const [final, setFinal] = useState<Final | null>(null);
  // El número que acaba de cambiar en la pantalla derecha: parpadea
  const [cambia, setCambia] = useState<"aciertos" | "fallos" | null>(null);
  // La tecla recién acertada, encendida un instante
  const [destello, setDestello] = useState<Objetivo["lugares"] | null>(null);
  const [ahora, setAhora] = useState(0);
  // Ya llegó alguna pulsación: hay un teclado conectado (el navegador no lo sabe de otro modo)
  const tecladoVisto = useRef(false);

  const capaDe = (p: Practica) => p.objetivos[p.actual]?.lugares[0]?.capa;

  // Prepara una ronda del grupo; false si no hay nada que practicar
  const preparar = (g: Grupo): boolean => {
    const nueva = esDeTexto(g)
      ? empezarTexto(teclado, crearTexto(teclado, g) ?? "")
      : empezar(objetivosDeGrupo(teclado, g), Math.random, datos.dificultad);
    if (!nueva) return false;
    setPractica(nueva);
    setFinal(null);
    setCambia(null);
    setDestello(null);
    setCuenta("3");
    setFase(tecladoVisto.current ? "cuenta" : "sinTeclado");
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

  const nuevaRonda = () => {
    preparar(grupo);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

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
    setDatos(nuevos);
    guardar(nuevos);
    setFinal({ marca, nuevoRecord, mejorAntes });
    setFase("fin");
  };

  // «Teclado conectado» un momento y, después, la cuenta atrás
  useEffect(() => {
    if (fase !== "conectado") return;
    const t = window.setTimeout(() => setFase("cuenta"), CONECTADO_MS);
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
      if (e.repeat || e.isComposing) return;
      if (fase === "sinTeclado") {
        tecladoVisto.current = true;
        setFase("conectado");
        return;
      }
      // Al terminar, ENT empieza otra ronda (aquí ENT no es una pregunta)
      if (fase === "fin" && e.key === "Enter") nuevaRonda();
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
  if (fase === "sinTeclado" || fase === "conectado") {
    izquierda = derecha = { fase };
  } else if (fase === "cuenta") {
    izquierda = derecha = { fase: "cuenta", texto: cuenta };
  } else {
    izquierda = ya
      ? { fase: "cuenta", texto: "¡YA!" }
      : { fase: "ronda", tiempo: practica ? formatoTiempo(tiempoDeRonda(practica, ahora)) : "0:00", aciertos: 0, fallos: 0, cambia: null };
    derecha = { fase: "ronda", tiempo: "", aciertos, fallos, cambia };
  }
  if (fase === "fin" && final && practica) {
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
    records: datos.records,
    destello,
    pantallas: { izquierda, derecha },
    formato,
    empezar: empezarGrupo,
    nuevaRonda,
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
