// La cuenta del usuario, para la app. Firebase se carga con import() solo si ya había una
// sesión abierta o el usuario muestra intención de entrar: un visitante no lo descarga.
import { useEffect, useRef, useState } from "react";
import { leerDatosPractica, type DatosPractica } from "../practica/records";
import type { TecladoConfig } from "../teclados/tipos";
import { guardarCopia, haySesion, leerCopia, marcarSesion } from "./copia";
import type { Usuario } from "./sesion";

type Modulo = typeof import("./sesion");
let modulo: Promise<Modulo> | null = null;
const cargarSesion = () => (modulo ??= import("./sesion"));

// Mensajes en lenguaje claro para los errores más comunes al entrar
function mensajeDe(e: unknown): string {
  const codigo = (e as { code?: string }).code ?? "";
  if (codigo === "auth/popup-closed-by-user" || codigo === "auth/cancelled-popup-request") return "";
  if (codigo === "auth/popup-blocked") return "El navegador bloqueó la ventana de Google: permítela e inténtalo otra vez.";
  if (codigo === "auth/network-request-failed") return "Sin conexión: inténtalo cuando vuelva la red.";
  return "No se pudo entrar. Inténtalo otra vez.";
}

// Qué ofrece el botón de entrar: «Entrar», «Conectando…» (descargando Firebase) o
// «Continuar con Google» (ya descargado, falta el clic que abre la ventana)
export type PasoEntrada = "entrar" | "conectando" | "continuar";

// "comprobando": había una sesión guardada en el teléfono y Firebase aún no lo confirma
type EstadoSesion = "comprobando" | "abierta" | "cerrada";

// La práctica del usuario en Firestore (practica/{uid}): llegando, ya leída, o sin acceso
// (las reglas de la práctica aún sin publicar, o un error): entonces la práctica se guarda
// en el dispositivo, como en la demo
export type PracticaEnCuenta = { estado: "cargando" } | { estado: "lista"; datos: DatosPractica } | { estado: "sinAcceso" };

export type Cuenta = {
  usuario: Usuario | null;
  sesion: EstadoSesion;
  // El teclado del usuario; null si no hay sesión o aún no lo ha configurado
  teclado: TecladoConfig | null;
  // true cuando ya se sabe si el usuario tiene teclado (llegó de Firestore o de su caché)
  tecladoCargado: boolean;
  error: string;
  paso: PasoEntrada;
  // Empieza a descargar Firebase (al pasar el puntero o el dedo por «Entrar»)
  precargar: () => void;
  entrar: () => void;
  salir: () => Promise<void>;
  // Guarda el teclado entero del usuario (el editor lo usa en cada cambio)
  guardar: (teclado: TecladoConfig) => Promise<void>;
  practica: PracticaEnCuenta;
  // Guarda la práctica entera (al terminar cada ronda). Falla si el servidor la rechaza
  guardarPractica: (datos: DatosPractica) => Promise<void>;
  borrarCuenta: () => Promise<void>;
};

// habilitada = false: no se toca Firebase (la prueba visual monta la app con datos fijos)
export function useCuenta(habilitada: boolean): Cuenta {
  const [conectar, setConectar] = useState(() => habilitada && haySesion());
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sesion, setSesion] = useState<EstadoSesion>(() =>
    habilitada && haySesion() ? "comprobando" : "cerrada",
  );
  // Mientras Firebase carga, se muestra la copia guardada en el teléfono: abre al instante
  const [teclado, setTeclado] = useState<TecladoConfig | null>(() =>
    habilitada && haySesion() ? leerCopia() : null,
  );
  const [tecladoCargado, setTecladoCargado] = useState(false);
  const [practica, setPractica] = useState<PracticaEnCuenta>({ estado: "cargando" });
  const [error, setError] = useState("");
  const [paso, setPaso] = useState<PasoEntrada>("entrar");
  // El módulo ya descargado: entrar() lo usa sin esperar nada
  const listo = useRef<Modulo | null>(null);

  const precargar = () => {
    if (!habilitada || listo.current) return;
    cargarSesion().then(
      (m) => {
        listo.current = m;
        setPaso((p) => (p === "conectando" ? "continuar" : p));
      },
      () => setError("No se pudo conectar. Revisa la conexión."),
    );
  };

  useEffect(() => {
    if (!conectar) return;
    let cancelado = false;
    let dejarSesion = () => {};
    let dejarTeclado = () => {};
    let dejarPractica = () => {};

    cargarSesion()
      .then((s) => {
        listo.current = s;
        if (cancelado) return;
        dejarSesion = s.escucharSesion((u) => {
          dejarTeclado();
          dejarTeclado = () => {};
          dejarPractica();
          dejarPractica = () => {};
          setPractica({ estado: "cargando" });
          setUsuario(u);
          setSesion(u ? "abierta" : "cerrada");
          marcarSesion(Boolean(u));
          setTecladoCargado(false);
          if (!u) {
            setTeclado(null);
            guardarCopia(null);
            return;
          }
          setPaso("entrar");
          dejarTeclado = s.escucharTeclado(
            u.uid,
            (t) => {
              setTeclado(t);
              setTecladoCargado(true);
              guardarCopia(t);
            },
            () => setError("No se pudo leer tu teclado. Revisa la conexión."),
          );
          // Solo se usa cuando el servidor la confirmó una vez: la copia del dispositivo puede
          // estar vacía (un móvil sin red que nunca practicó) y la ronda siguiente pisaría los
          // récords de la nube. Desde ahí, también los cambios sin red (los suyos, pendientes).
          // Lo que llega se revisa: solo se conserva lo que tiene la forma esperada
          let confirmada = false;
          dejarPractica = s.escucharPractica(
            u.uid,
            (datos, deCache) => {
              if (!deCache) confirmada = true;
              if (confirmada) setPractica({ estado: "lista", datos: leerDatosPractica(datos) });
            },
            () => setPractica({ estado: "sinAcceso" }),
          );
        });
      })
      .catch(() => setError("No se pudo conectar. Revisa la conexión."));

    return () => {
      cancelado = true;
      dejarSesion();
      dejarTeclado();
      dejarPractica();
    };
  }, [conectar]);

  // Los navegadores solo dejan abrir la ventana de Google en el mismo clic: si Firebase
  // ya está descargado se abre ahora mismo, sin esperar nada antes; si no, se descarga
  // y el botón pasa a «Continuar con Google» para un segundo clic.
  const entrar = () => {
    setError("");
    setConectar(true);
    const m = listo.current;
    if (!m) {
      setPaso("conectando");
      precargar();
      return;
    }
    m.entrar().then(
      () => setPaso("entrar"),
      (e) => {
        setPaso("entrar");
        setError(mensajeDe(e));
      },
    );
  };

  const salir = async () => {
    await (await cargarSesion()).salir();
  };

  const guardar = async (nuevo: TecladoConfig) => {
    if (!usuario) return;
    setError("");
    try {
      await (await cargarSesion()).guardarTeclado(usuario.uid, nuevo);
    } catch {
      setError("No se pudo guardar. Revisa la conexión e inténtalo otra vez.");
    }
  };

  const guardarPractica = async (datos: DatosPractica) => {
    if (!usuario) throw new Error("Sin sesión");
    try {
      await (await cargarSesion()).guardarPractica(usuario.uid, datos);
    } catch (e) {
      // El servidor no la acepta (reglas sin publicar): desde aquí, en el dispositivo
      setPractica({ estado: "sinAcceso" });
      throw e;
    }
  };

  const borrarCuenta = async () => {
    setError("");
    try {
      await (await cargarSesion()).borrarCuenta();
      guardarCopia(null);
      marcarSesion(false);
    } catch {
      setError("No se pudo borrar la cuenta. Inténtalo otra vez.");
    }
  };

  return {
    usuario, sesion, teclado, tecladoCargado, error, paso, precargar, entrar, salir, guardar, practica, guardarPractica, borrarCuenta,
  };
}
