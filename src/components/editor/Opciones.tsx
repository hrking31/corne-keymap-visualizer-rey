import { IDIOMAS, SISTEMAS } from "../../teclados/basico";
import type { Ajustes, Idioma, SistemaOperativo } from "../../teclados/tipos";

// Una pregunta con sus opciones como botones; la elegida, con ✓
function Grupo<T extends string>(props: { titulo: string; valor: T; lista: Record<T, string>; onCambio: (v: T) => void }) {
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 p-0 text-sm font-bold text-hueso">{props.titulo}</legend>
      {(Object.entries(props.lista) as [T, string][]).map(([valor, texto]) => (
        <button
          key={valor}
          type="button"
          className="opcion"
          aria-pressed={valor === props.valor}
          onClick={() => props.onCambio(valor)}
        >
          {texto}
          {valor === props.valor && " ✓"}
        </button>
      ))}
    </fieldset>
  );
}

// El idioma del sistema y el sistema operativo: con ellos se leen los textos del .keymap.
// Los usan el asistente (la primera vez) y la ventana «Idioma y sistema» del editor
export function PreguntaIdioma({ ajustes, onAjustes }: { ajustes: Ajustes; onAjustes: (a: Ajustes) => void }) {
  return (
    <Grupo<Idioma> titulo="¿En qué idioma escribe tu computador?" valor={ajustes.idioma} lista={IDIOMAS}
      onCambio={(idioma) => onAjustes({ ...ajustes, idioma })} />
  );
}

export function PreguntaSistema({ ajustes, onAjustes }: { ajustes: Ajustes; onAjustes: (a: Ajustes) => void }) {
  return (
    <Grupo<SistemaOperativo> titulo="¿Qué sistema operativo usas?" valor={ajustes.so} lista={SISTEMAS}
      onCambio={(so) => onAjustes({ ...ajustes, so })} />
  );
}
