// Todo lo que usa Firebase. La app lo importa con import() solo cuando hace falta (al
// pulsar «Entrar» o si ya había una sesión abierta), así los visitantes no lo descargan.
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  FieldPath,
  deleteDoc,
  doc,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { DatosPractica } from "../practica/records";
import type { TeclaConfig, TecladoConfig } from "../teclados/tipos";
import { firebaseConfig } from "./config";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Caché en el dispositivo: el teclado del usuario se ve también sin conexión, y lo que
// edite sin conexión se sube solo al volver la red
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
const proveedor = new GoogleAuthProvider();

export type Usuario = { uid: string; nombre: string };
const usuario = (u: User): Usuario => ({ uid: u.uid, nombre: u.displayName ?? "" });

// Dos documentos por usuario: su teclado, teclados/{uid}, y su práctica (récords y teclas
// difíciles), practica/{uid}. Separados: el editor guarda el teclado entero
const tecladoDe = (uid: string) => doc(db, "teclados", uid);
const practicaDe = (uid: string) => doc(db, "practica", uid);

export function escucharSesion(cambio: (u: Usuario | null) => void) {
  return onAuthStateChanged(auth, (u) => cambio(u ? usuario(u) : null));
}

export async function entrar(): Promise<Usuario> {
  const { user } = await signInWithPopup(auth, proveedor);
  return usuario(user);
}

export const salir = () => signOut(auth);

// Avisa cada vez que el teclado cambia (también con lo que haya en la caché, sin red).
// null: el usuario todavía no ha configurado su teclado.
export function escucharTeclado(uid: string, cambio: (t: TecladoConfig | null) => void, error: (e: Error) => void) {
  return onSnapshot(
    tecladoDe(uid),
    (d) => {
      if (!d.exists()) return cambio(null);
      // La fecha de actualización la maneja el servidor: la app no la necesita
      const datos = d.data();
      delete datos.actualizado;
      cambio(datos as TecladoConfig);
    },
    error,
  );
}

// Guarda el teclado entero (al crearlo o al cambiar capas)
export const guardarTeclado = (uid: string, teclado: TecladoConfig) =>
  setDoc(tecladoDe(uid), { ...teclado, actualizado: serverTimestamp() });

// Guarda solo una tecla: no se reescribe el resto del teclado
export const guardarTecla = (uid: string, capa: string, pos: number, tecla: TeclaConfig) =>
  updateDoc(tecladoDe(uid), new FieldPath("capas", capa, "teclas", String(pos)), tecla, "actualizado", serverTimestamp());

// Avisa cada vez que la práctica cambia. null: aún no ha terminado ninguna ronda con la
// cuenta. `deCache`: viene de la copia del dispositivo, sin confirmar con el servidor. Lo que
// llega se revisa en la app (leerDatosPractica)
export function escucharPractica(uid: string, cambio: (datos: unknown, deCache: boolean) => void, error: (e: Error) => void) {
  return onSnapshot(
    practicaDe(uid),
    { includeMetadataChanges: true },
    (d) => cambio(d.exists() ? d.data() : null, d.metadata.fromCache),
    error,
  );
}

// Guarda la práctica entera al terminar cada ronda (es pequeña: unos pocos KB)
export const guardarPractica = (uid: string, datos: DatosPractica) =>
  setDoc(practicaDe(uid), { records: datos.records, dificultad: datos.dificultad, actualizado: serverTimestamp() });

// Borra el teclado, la práctica y la cuenta (requisito de Google Play). Si Google pide un inicio de
// sesión reciente para borrar la cuenta, se lo pide al usuario y lo intenta otra vez.
export async function borrarCuenta() {
  const u = auth.currentUser;
  if (!u) return;
  await deleteDoc(tecladoDe(u.uid));
  try {
    await deleteDoc(practicaDe(u.uid));
  } catch (e) {
    // Sin las reglas de la práctica publicadas no se puede tocar, pero tampoco pudo
    // guardarse nada: no hay nada que borrar
    if ((e as { code?: string }).code !== "permission-denied") throw e;
  }
  try {
    await deleteUser(u);
  } catch (e) {
    if ((e as { code?: string }).code !== "auth/requires-recent-login") throw e;
    await reauthenticateWithPopup(u, proveedor);
    await deleteUser(u);
  }
}
