// La cuenta del usuario, para la app. Firebase se carga con import() solo si ya había una
// sesión abierta o el usuario pulsa «Entrar»: un visitante no lo descarga nunca.
import { useEffect, useState } from "react";
import type { TecladoConfig } from "../teclados/tipos";
import { guardarCopia, haySesion, leerCopia, marcarSesion } from "./copia";
import type { Usuario } from "./sesion";

let modulo: Promise<typeof import("./sesion")> | null = null;
const cargarSesion = () => (modulo ??= import("./sesion"));

// Mensajes en lenguaje claro para los errores más comunes al entrar
function mensajeDe(e: unknown): string {
  const codigo = (e as { code?: string }).code ?? "";
  if (codigo === "auth/popup-closed-by-user" || codigo === "auth/cancelled-popup-request") return "";
  if (codigo === "auth/popup-blocked") return "El navegador bloqueó la ventana de Google: permítela e inténtalo otra vez.";
  if (codigo === "auth/network-request-failed") return "Sin conexión: inténtalo cuando vuelva la red.";
  return "No se pudo entrar. Inténtalo otra vez.";
}

export type Cuenta = {
  usuario: Usuario | null;
  // El teclado del usuario; null si no hay sesión o aún no lo ha configurado
  teclado: TecladoConfig | null;
  error: string;
  entrar: () => Promise<void>;
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

  useEffect(() => {
    if (!conectar) return;
    let cancelado = false;
    let dejarSesion = () => {};
    let dejarTeclado = () => {};

    cargarSesion()
      .then((s) => {
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

  const entrar = async () => {
    setError("");
    setConectar(true);
    try {
      await (await cargarSesion()).entrar();
    } catch (e) {
      setError(mensajeDe(e));
    }
  };

  const salir = async () => {
    await (await cargarSesion()).salir();
  };

  return { usuario, teclado, error, entrar, salir };
}
