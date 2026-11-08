import { useRef, useState } from "react";
import type { Ajustes } from "../../teclados/tipos";
import { LIMITES } from "../../teclados/validar";
import { PreguntaIdioma, PreguntaSistema } from "./Opciones";

type Props = {
  ajustes: Ajustes;
  nombre: string;
  apilado: boolean;
  guardando: boolean;
  // Por qué no se pudo crear (un archivo que no es un .keymap, un Corne de 36 teclas…)
  error: string;
  onAjustes: (a: Ajustes) => void;
  onNombre: (n: string) => void;
  // El .keymap elegido: con él se crea el teclado
  onKeymap: (archivo: File) => void;
  // Salir sin crear el teclado (cierra la sesión y vuelve a la pantalla de ingreso)
  onCancelar: () => void;
};

// «Configura tu teclado»: la primera vez que un usuario entra y no tiene teclado. Elige el
// idioma de su computador y su sistema (con ellos se leen los textos del .keymap), le pone
// nombre y carga su .keymap, que trae las capas y las teclas.
export default function Asistente(props: Props) {
  const { ajustes, nombre, apilado, guardando, error, onAjustes, onNombre, onKeymap, onCancelar } = props;
  const [paso, setPaso] = useState(0);
  const selector = useRef<HTMLInputElement>(null);

  const idioma = <PreguntaIdioma key="i" ajustes={ajustes} onAjustes={onAjustes} />;
  const sistema = <PreguntaSistema key="s" ajustes={ajustes} onAjustes={onAjustes} />;
  const nombreYKeymap = (
    <div key="k" className="flex flex-col gap-3">
      <label className="flex flex-col gap-2 text-sm font-bold text-hueso">
        Nombre del teclado
        <input className="campo" value={nombre} maxLength={LIMITES.nombre} placeholder="Nombre teclado"
          onChange={(e) => onNombre(e.target.value)} />
      </label>
      <p className="m-0 text-sm text-texto">
        Carga el <strong className="text-hueso">.keymap</strong> de tu firmware ZMK: está en tu repositorio
        <code> zmk-config</code>, en la carpeta <code>config</code>. De él salen tus capas y tus teclas.
      </p>
      {error && (
        <p className="m-0 text-sm text-naranja-claro" role="alert">
          {error}
        </p>
      )}
    </div>
  );
  const preguntas = [idioma, sistema, nombreYKeymap];

  const elegir = (
    <button type="button" className="boton-principal" disabled={guardando} onClick={() => selector.current?.click()}>
      {guardando ? "Creando…" : ".keymap"}
    </button>
  );
  const archivo = (
    <input
      ref={selector}
      type="file"
      accept=".keymap"
      hidden
      onChange={(e) => {
        const elegido = e.target.files?.[0];
        if (elegido) onKeymap(elegido);
        // Así se puede volver a elegir el mismo archivo después de corregirlo
        e.target.value = "";
      }}
    />
  );

  // Móvil: una pregunta por pantalla, a pantalla completa
  if (apilado) {
    const ultimo = paso === preguntas.length - 1;
    return (
      <section className="fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto bg-fondo p-4 text-left" aria-label="Configura tu teclado">
        <h2 className="m-0 flex justify-between text-lg text-hueso">
          Configura tu teclado <span className="text-gris">{paso + 1}/{preguntas.length}</span>
        </h2>
        {preguntas[paso]}
        <div className="mt-auto flex justify-between gap-3">
          {/* En el primer paso no hay a dónde volver: «Cancelar» sale del asistente */}
          <button type="button" className="layer-btn" onClick={() => (paso === 0 ? onCancelar() : setPaso(paso - 1))}>
            {paso === 0 ? "Cancelar" : "Atrás"}
          </button>
          {ultimo ? elegir : (
            <button type="button" className="boton-principal" onClick={() => setPaso(paso + 1)}>
              Siguiente
            </button>
          )}
        </div>
        {archivo}
      </section>
    );
  }

  // PC y tablet: todo en un panel a la derecha; al lado se ve el teclado de ejemplo
  return (
    <aside className="compacto fixed top-0 right-0 z-40 box-border flex h-full w-[340px] flex-col gap-3 overflow-y-auto border-l border-borde bg-panel p-4 text-left"
      aria-label="Configura tu teclado">
      <h2 className="m-0 text-lg text-hueso">Configura tu teclado</h2>
      {/* El espacio que sobra se reparte entre las secciones: con pantalla alta respiran,
          con pantalla baja se juntan y el panel sigue sin desplazamiento */}
      <div className="flex flex-1 flex-col justify-evenly gap-3">
        {idioma}
        {sistema}
        {nombreYKeymap}
      </div>
      <div className="flex justify-between gap-3">
        <button type="button" className="layer-btn" onClick={onCancelar}>
          Cancelar
        </button>
        {elegir}
      </div>
      {archivo}
    </aside>
  );
}
