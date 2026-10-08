// La cuenta del usuario, para la app. Firebase se carga con import() solo si ya había una
// sesión abierta o el usuario muestra intención de entrar: un visitante no lo descarga.
import { useEffect, useRef, useState } from "react";
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

export type Cuenta = {
  usuario: Usuario | null;
  // El teclado del usuario; null si no hay sesión o aún no lo ha configurado
  teclado: TecladoConfig | null;
  error: string;
  paso: PasoEntrada;
  // Empieza a descargar Firebase (al pasar el puntero o el dedo por «Entrar»)
  precargar: () => void;
  entrar: () => void;
  salir: () => Promise<void>;
};

// habilitada = false: no se toca Firebase (la prueba visual monta la app con datos fijos)
export function useCuenta(habilitada: boolean): Cuenta {
  const [conectar, setConectar] = useState(() => habilitada && haySesion());
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Mientras Firebase carga, se muestra la copia guardada en el teléfono: abre al instante
  const [teclado, setTeclado] = useState<TecladoConfig | null>(() =>
    habilitada && haySesion() ? leerCopia() : null,
  );
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

    cargarSesion()
      .then((s) => {
        listo.current = s;
        if (cancelado) return;
        dejarSesion = s.escucharSesion((u) => {
          dejarTeclado();
          dejarTeclado = () => {};
          setUsuario(u);
          marcarSesion(Boolean(u));
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
              guardarCopia(t);
            },
            () => setError("No se pudo leer tu teclado. Revisa la conexión."),
          );
        });
      })
      .catch(() => setError("No se pudo conectar. Revisa la conexión."));

    return () => {
      cancelado = true;
      dejarSesion();
      dejarTeclado();
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

  return { usuario, teclado, error, paso, precargar, entrar, salir };
}
