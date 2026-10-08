import { useState } from "react";
import { LIMITES } from "../../teclados/validar";

type Props = {
  nombre: string;
  apilado: boolean;
  onNombre: (n: string) => void;
  onBorrarCuenta: () => void;
  onListo: () => void;
};

// La franja de arriba mientras se edita. En PC lleva el nombre del teclado y «Borrar mi
// cuenta»; en el móvil esas dos cosas van en la pantalla de Ajustes (⚙).
export default function BarraEdicion({ nombre, apilado, onNombre, onBorrarCuenta, onListo }: Props) {
  const [ajustes, setAjustes] = useState(false);
  const [borrador, setBorrador] = useState(nombre);

  const campoNombre = (
    <label className="flex items-center gap-2 text-sm font-bold text-hueso">
      Nombre
      <input className="campo w-56" value={borrador} maxLength={LIMITES.nombre} placeholder="Corne ZMK"
        onChange={(e) => setBorrador(e.target.value)}
        onBlur={() => borrador !== nombre && onNombre(borrador)} />
    </label>
  );

  if (apilado && ajustes) {
    return (
      <section className="fixed inset-0 z-50 flex flex-col gap-4 bg-fondo p-4 text-left" aria-label="Ajustes">
        <button type="button" className="layer-btn self-start" onClick={() => {
          if (borrador !== nombre) onNombre(borrador);
          setAjustes(false);
        }}>
          ← Teclado
        </button>
        <h2 className="m-0 text-lg text-hueso">Ajustes</h2>
        {campoNombre}
        <div className="mt-auto">
          <button type="button" className="boton-peligro" onClick={onBorrarCuenta}>
            Borrar mi cuenta
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-none flex-wrap items-center justify-center gap-3 border-b border-borde bg-panel px-4 py-2 text-sm">
      <span className="font-bold text-naranja-claro">✎ Editando</span>
      {apilado ? (
        <button type="button" className="layer-btn" aria-label="Ajustes" onClick={() => setAjustes(true)}>
          ⚙
        </button>
      ) : (
        <>
          {campoNombre}
          <button type="button" className="boton-peligro" onClick={onBorrarCuenta}>
            Borrar mi cuenta
          </button>
        </>
      )}
      <button type="button" className="boton-principal" onClick={onListo}>
        Listo
      </button>
    </div>
  );
}
