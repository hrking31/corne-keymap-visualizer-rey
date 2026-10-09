// Pasa la configuración del autor (src/data.ts) a SU teclado en Firestore. Usa su propia
// sesión de Google y las mismas reglas de seguridad que la app: solo puede escribir en su
// documento. Es una herramienta local: no se publica.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { keymap } from "../src/data";
import { entrar, escucharSesion, escucharTeclado, guardarTeclado, type Usuario } from "../src/firebase/sesion";
import { desdeKeymap } from "../src/teclados/convertir";
import type { TecladoConfig } from "../src/teclados/tipos";
import { validarTeclado } from "../src/teclados/validar";
import "../src/style.css";
import "../src/editor.css";

// La configuración del autor: Dvorak adaptado al español, en Windows
const miTeclado: TecladoConfig = {
  ...desdeKeymap(keymap, { distribucion: "dvorak", idioma: "es-LA", so: "windows" }),
  nombre: "Rey",
};

function Importar() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // undefined: todavía no se sabe; null: no tiene teclado
  const [actual, setActual] = useState<TecladoConfig | null | undefined>(undefined);
  const [estado, setEstado] = useState("");
  const problemas = validarTeclado(miTeclado);

  useEffect(() => escucharSesion(setUsuario), []);
  useEffect(() => {
    if (!usuario) return;
    return escucharTeclado(usuario.uid, setActual, (e) => setEstado(`No se pudo leer: ${e.message}`));
  }, [usuario]);

  const teclas = Object.values(miTeclado.capas).reduce((n, c) => n + Object.keys(c.teclas).length, 0);

  const importar = async () => {
    if (!usuario) return;
    setEstado("Guardando…");
    try {
      await guardarTeclado(usuario.uid, miTeclado);
      setEstado("Listo: tu configuración ya está en tu cuenta. Ábrela en la app.");
    } catch (e) {
      setEstado(`No se pudo guardar: ${(e as Error).message}`);
    }
  };

  return (
    <main className="mx-auto box-border flex max-w-xl flex-col gap-4 p-6 text-left">
      <h1 className="m-0 text-2xl text-hueso">Importar mi configuración</h1>
      <p className="m-0 text-sm">
        Pasa <code>src/data.ts</code> a tu teclado en la app: «{miTeclado.nombre}», {miTeclado.orden.length} capas
        ({miTeclado.orden.map((id) => miTeclado.capas[id].corto).join(", ")}) y {teclas} teclas con texto o
        descripción.
      </p>
      {problemas.length > 0 && <p className="m-0 text-naranja-claro">No es válido: {problemas.join("; ")}</p>}

      {!usuario ? (
        <button type="button" className="boton-principal self-start" onClick={() => entrar().catch((e) => setEstado(String(e)))}>
          Entrar con Google
        </button>
      ) : (
        <>
          <p className="m-0 text-sm">Sesión: {usuario.nombre || usuario.uid}</p>
          {actual === undefined && <p className="m-0 text-sm text-gris">Leyendo tu teclado…</p>}
          {actual && (
            <p className="m-0 text-sm text-naranja-claro">
              Ya tienes un teclado guardado («{actual.nombre || "sin nombre"}», {actual.orden.length} capas). Importar lo
              reemplaza por completo.
            </p>
          )}
          {actual !== undefined && (
            <button type="button" className="boton-principal self-start" disabled={problemas.length > 0} onClick={importar}>
              {actual ? "Reemplazar por mi configuración" : "Importar mi configuración"}
            </button>
          )}
        </>
      )}
      {estado && <p className="m-0 text-sm text-hueso" role="status">{estado}</p>}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Importar />);
