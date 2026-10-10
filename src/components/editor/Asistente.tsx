import { useState } from "react";
import { DISTRIBUCIONES, IDIOMAS, SISTEMAS } from "../../teclados/distribuciones";
import { dividirBloques } from "../../teclado";
import { teclasParaDibujar } from "../../teclados/convertir";
import { crearBase } from "../../teclados/plantillas";
import Bloque from "../Bloque";
import type { Ajustes, Distribucion, Idioma, SistemaOperativo } from "../../teclados/tipos";
import { LIMITES } from "../../teclados/validar";

type Props = {
  ajustes: Ajustes;
  nombre: string;
  apilado: boolean;
  guardando: boolean;
  onAjustes: (a: Ajustes) => void;
  onNombre: (n: string) => void;
  onCrear: () => void;
  // Salir sin crear el teclado (cierra la sesión y vuelve a la pantalla de ingreso)
  onCancelar: () => void;
};

// Las opciones de cada pregunta, con su texto
const opciones = <T extends string>(de: Record<T, string>) => Object.entries(de) as [T, string][];
const DISTS = opciones<Distribucion>(
  Object.fromEntries(Object.entries(DISTRIBUCIONES).map(([k, v]) => [k, v.nombre])) as Record<Distribucion, string>,
);

function Grupo<T extends string>(props: { titulo: string; valor: T; lista: [T, string][]; onCambio: (v: T) => void }) {
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 p-0 text-sm font-bold text-hueso">{props.titulo}</legend>
      {props.lista.map(([valor, texto]) => (
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

// Vista previa en el móvil: la mitad izquierda real del teclado (placa, escalonado y
// pulgares), con la capa Base que se va eligiendo. Solo para mirar: no se puede tocar.
function VistaPrevia({ ajustes }: { ajustes: Ajustes }) {
  const { izquierdo } = dividirBloques(teclasParaDibujar(crearBase(ajustes)));
  return (
    <div className="vista-mitad" inert aria-hidden="true">
      <Bloque lado="left" capa="vista" nombreCapa="Capa Base" teclas={izquierdo} espejo onMostrar={() => {}} onOcultar={() => {}} />
    </div>
  );
}

// «Configura tu teclado»: la primera vez que un usuario entra y no tiene teclado. Cada
// elección se ve al momento en el teclado (o en la vista previa, en el móvil).
export default function Asistente(props: Props) {
  const { ajustes, nombre, apilado, guardando, onAjustes, onNombre, onCrear, onCancelar } = props;
  const [paso, setPaso] = useState(0);

  const preguntas = [
    <Grupo key="d" titulo="¿Qué distribución usas?" valor={ajustes.distribucion} lista={DISTS}
      onCambio={(distribucion) => onAjustes({ ...ajustes, distribucion })} />,
    <Grupo key="i" titulo="¿En qué idioma escribe tu computador?" valor={ajustes.idioma} lista={opciones<Idioma>(IDIOMAS)}
      onCambio={(idioma) => onAjustes({ ...ajustes, idioma })} />,
    <Grupo key="s" titulo="¿Qué sistema operativo usas?" valor={ajustes.so} lista={opciones<SistemaOperativo>(SISTEMAS)}
      onCambio={(so) => onAjustes({ ...ajustes, so })} />,
    <label key="n" className="flex flex-col gap-2 text-sm font-bold text-hueso">
      Nombre del teclado
      <input className="campo" value={nombre} maxLength={LIMITES.nombre} placeholder="Nombre teclado"
        onChange={(e) => onNombre(e.target.value)} />
    </label>,
  ];

  const crear = (
    <button type="button" className="boton-principal" disabled={guardando} onClick={onCrear}>
      {guardando ? "Creando…" : "Crear teclado"}
    </button>
  );

  // Móvil: una pregunta por pantalla, a pantalla completa
  if (apilado) {
    const ultimo = paso === preguntas.length - 1;
    return (
      <section className="fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto bg-fondo p-4 text-left" aria-label="Configura tu teclado">
        <h2 className="m-0 flex justify-between text-lg text-hueso">
          Configura tu teclado <span className="text-gris">{paso + 1}/{preguntas.length}</span>
        </h2>
        <VistaPrevia ajustes={ajustes} />
        {preguntas[paso]}
        <div className="mt-auto flex justify-between gap-3">
          {/* En el primer paso no hay a dónde volver: «Cancelar» sale del asistente */}
          <button type="button" className="layer-btn" onClick={() => (paso === 0 ? onCancelar() : setPaso(paso - 1))}>
            {paso === 0 ? "Cancelar" : "Atrás"}
          </button>
          {ultimo ? crear : (
            <button type="button" className="boton-principal" onClick={() => setPaso(paso + 1)}>
              Siguiente
            </button>
          )}
        </div>
      </section>
    );
  }

  // PC y tablet: todo en un panel a la derecha; el teclado, al lado, cambia en vivo
  return (
    <aside className="compacto fixed top-0 right-0 z-40 box-border flex h-full w-[340px] flex-col gap-3 overflow-y-auto border-l border-borde bg-panel p-4 text-left"
      aria-label="Configura tu teclado">
      <h2 className="m-0 text-lg text-hueso">Configura tu teclado</h2>
      {/* El espacio que sobra se reparte entre las secciones: con pantalla alta respiran,
          con pantalla baja se juntan y el panel sigue sin desplazamiento */}
      <div className="flex flex-1 flex-col justify-evenly gap-3">
        {preguntas[3]}
        {preguntas[0]}
        {preguntas[1]}
        {preguntas[2]}
      </div>
      <div className="flex justify-between gap-3">
        <button type="button" className="layer-btn" onClick={onCancelar}>
          Cancelar
        </button>
        {crear}
      </div>
    </aside>
  );
}
