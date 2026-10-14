// Pruebas de las reglas de seguridad de Firestore (firestore.rules) en el emulador de
// Firebase. Solo corren donde hay emulador (la CI, con Java): en el PC se saltan.
//   npx firebase-tools emulators:exec --only firestore --project demo-corne "npx vitest run --project reglas"
import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { FieldPath, deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { crearTeclado } from "../../src/teclados/plantillas";
import type { TecladoConfig } from "../../src/teclados/tipos";

const hayEmulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

describe.skipIf(!hayEmulador)("reglas de Firestore", () => {
  let entorno: RulesTestEnvironment;

  beforeAll(async () => {
    entorno = await initializeTestEnvironment({
      projectId: "demo-corne",
      firestore: { rules: readFileSync("firestore.rules", "utf8") },
    });
  });
  afterAll(() => entorno?.cleanup());
  beforeEach(() => entorno.clearFirestore());

  const nuevo = (): TecladoConfig => crearTeclado({ distribucion: "qwerty", idioma: "es-LA", so: "windows" });
  const de = (uid: string) => entorno.authenticatedContext(uid).firestore();
  const sinSesion = () => entorno.unauthenticatedContext().firestore();

  // Deja un teclado guardado sin pasar por las reglas, para probar el acceso de otros
  const sembrar = (uid: string) =>
    entorno.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), "teclados", uid), nuevo()));

  // Intenta crear el teclado de "ana" con un cambio inválido
  const crearConCambio = (cambio: (t: TecladoConfig & Record<string, unknown>) => void) => {
    const t = nuevo() as TecladoConfig & Record<string, unknown>;
    cambio(t);
    return setDoc(doc(de("ana"), "teclados/ana"), t);
  };

  it("el dueño crea, lee, edita una tecla y borra su teclado", async () => {
    const ref = doc(de("ana"), "teclados/ana");
    await assertSucceeds(setDoc(ref, { ...nuevo(), actualizado: serverTimestamp() }));
    await assertSucceeds(getDoc(ref));
    // Como lo hace la app (guardarTecla): una tecla y la fecha del servidor
    await assertSucceeds(
      updateDoc(
        ref,
        new FieldPath("capas", "base", "teclas", "0"),
        { texto: "ESC", descripcion: "Salir", deCapa: false },
        "actualizado",
        serverTimestamp(),
      ),
    );
    // Sin tocar la fecha también vale: se queda la que tenía
    await assertSucceeds(updateDoc(ref, "nombre", "Rey"));
    await assertSucceeds(deleteDoc(ref));
  });

  it("al editar no se puede inventar la fecha de actualización", async () => {
    const ref = doc(de("ana"), "teclados/ana");
    await assertSucceeds(setDoc(ref, { ...nuevo(), actualizado: serverTimestamp() }));
    await assertFails(updateDoc(ref, "actualizado", new Date(2000, 0, 1)));
  });

  it("otro usuario no puede leer, escribir ni borrar un teclado ajeno", async () => {
    await sembrar("ana");
    const ref = doc(de("beto"), "teclados/ana");
    await assertFails(getDoc(ref));
    await assertFails(setDoc(ref, nuevo()));
    await assertFails(updateDoc(ref, "nombre", "Robado"));
    await assertFails(deleteDoc(ref));
  });

  it("sin sesión no se puede leer ni escribir nada", async () => {
    await sembrar("ana");
    await assertFails(getDoc(doc(sinSesion(), "teclados/ana")));
    await assertFails(setDoc(doc(sinSesion(), "teclados/ana"), nuevo()));
  });

  it("cualquier otra colección está cerrada", async () => {
    await assertFails(setDoc(doc(de("ana"), "otra/ana"), { hola: 1 }));
    await assertFails(getDoc(doc(de("ana"), "otra/ana")));
  });

  it("acepta 10 capas y rechaza 11", async () => {
    const conCapas = (n: number) => (t: TecladoConfig) => {
      for (let i = 1; i < n; i++) {
        t.orden.push(`c${i}`);
        t.capas[`c${i}`] = { corto: `C${i}`, largo: "", teclas: {} };
      }
    };
    await assertSucceeds(crearConCambio(conCapas(10)));
    await assertFails(crearConCambio(conCapas(11)));
  });

  it("rechaza que Base no sea la primera capa", async () => {
    await assertFails(
      crearConCambio((t) => {
        t.orden = ["num", "base"];
        t.capas.num = { corto: "NUM", largo: "Números", teclas: {} };
      }),
    );
  });

  it("rechaza un orden que no coincide con las capas", async () => {
    await assertFails(crearConCambio((t) => t.orden.push("fantasma")));
  });

  it("rechaza nombres demasiado largos o vacíos", async () => {
    await assertFails(crearConCambio((t) => (t.capas.base.corto = "DEMASIADO")));
    await assertFails(crearConCambio((t) => (t.capas.base.corto = "")));
    await assertFails(crearConCambio((t) => (t.capas.base.largo = "x".repeat(25))));
    await assertFails(crearConCambio((t) => (t.nombre = "x".repeat(13))));
  });

  it("rechaza campos de más y ajustes desconocidos", async () => {
    await assertFails(crearConCambio((t) => (t.admin = true)));
    await assertFails(crearConCambio((t) => ((t.capas.base as Record<string, unknown>).extra = 1)));
    await assertFails(crearConCambio((t) => ((t.ajustes as Record<string, unknown>).idioma = "fr-FR")));
  });

  it("la fecha de actualización solo la puede poner el servidor", async () => {
    await assertFails(crearConCambio((t) => (t.actualizado = new Date(2000, 0, 1))));
  });

  // ---------- La práctica: practica/{uid}, aparte del teclado ----------

  // Récords de Letras con `marcas` rondas y `teclas` teclas anotadas, como los guarda la app
  const practica = (marcas = 1, teclas = 1): Record<string, unknown> => ({
    records: {
      letras: Array.from({ length: marcas }, (_, i) => ({ ms: 40_000 + i, fecha: "2026-10-14T12:00:00.000Z", fallos: 0 })),
    },
    dificultad: Object.fromEntries(Array.from({ length: teclas }, (_, i) => [`t:Key${i}:`, { ms: 900, fallos: 0.1 }])),
  });
  const sembrarPractica = (uid: string) =>
    entorno.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), "practica", uid), practica()));

  it("el dueño guarda, lee y borra su práctica", async () => {
    const ref = doc(de("ana"), "practica/ana");
    // Como lo hace la app (guardarPractica): todo el documento y la fecha del servidor
    await assertSucceeds(setDoc(ref, { ...practica(), actualizado: serverTimestamp() }));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(setDoc(ref, { ...practica(2), actualizado: serverTimestamp() }));
    await assertSucceeds(deleteDoc(ref));
  });

  it("otro usuario, o sin sesión, no puede leer, escribir ni borrar una práctica ajena", async () => {
    await sembrarPractica("ana");
    const ref = doc(de("beto"), "practica/ana");
    await assertFails(getDoc(ref));
    await assertFails(setDoc(ref, practica()));
    await assertFails(deleteDoc(ref));
    await assertFails(getDoc(doc(sinSesion(), "practica/ana")));
    await assertFails(setDoc(doc(sinSesion(), "practica/ana"), practica()));
  });

  it("acepta 10 marcas por grupo y 400 teclas anotadas; rechaza 11 y 401", async () => {
    const ref = doc(de("ana"), "practica/ana");
    await assertSucceeds(setDoc(ref, practica(10, 400)));
    await assertFails(setDoc(ref, practica(11, 1)));
    await assertFails(setDoc(ref, practica(1, 401)));
  });

  it("rechaza grupos desconocidos, campos de más o que falten, y otra forma", async () => {
    const ref = doc(de("ana"), "practica/ana");
    await assertFails(setDoc(ref, { ...practica(), records: { inventado: [] } }));
    await assertFails(setDoc(ref, { ...practica(), admin: true }));
    await assertFails(setDoc(ref, { records: {} }));
    await assertFails(setDoc(ref, { ...practica(), records: { letras: "rápido" } }));
    await assertFails(setDoc(ref, { ...practica(), dificultad: [] }));
  });

  it("la fecha de la práctica también la pone solo el servidor", async () => {
    await assertFails(setDoc(doc(de("ana"), "practica/ana"), { ...practica(), actualizado: new Date(2000, 0, 1) }));
  });
});
