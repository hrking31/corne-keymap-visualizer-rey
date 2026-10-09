// Lo que se guarda en el teléfono, sin Firebase: la marca de que hay una sesión abierta
// y una copia del teclado del usuario. Con esto la app abre al instante con su teclado
// y solo carga Firebase si hace falta (un visitante que nunca entró no lo descarga).
// localStorage puede fallar (modo privado, datos bloqueados): entonces no hay copia.
import type { TecladoConfig } from "../teclados/tipos";

const SESION = "corne-sesion";
const TECLADO = "corne-teclado";

const leer = (clave: string) => {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
};
const escribir = (clave: string, valor: string | null) => {
  try {
    if (valor === null) localStorage.removeItem(clave);
    else localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento solo se pierde la copia: los datos siguen en Firestore
  }
};

export const haySesion = () => leer(SESION) === "1";
export const marcarSesion = (abierta: boolean) => escribir(SESION, abierta ? "1" : null);

export function leerCopia(): TecladoConfig | null {
  const texto = leer(TECLADO);
  if (!texto) return null;
  try {
    return JSON.parse(texto) as TecladoConfig;
  } catch {
    return null;
  }
}
export const guardarCopia = (teclado: TecladoConfig | null) =>
  escribir(TECLADO, teclado ? JSON.stringify(teclado) : null);
