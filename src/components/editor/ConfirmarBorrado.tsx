import { useEffect, useRef, useState } from "react";

type Props = {
  correo: string;
  onBorrar: () => Promise<void>;
  onCancelar: () => void;
};

// Sin mayúsculas ni espacios sobrantes: «Rey@Gmail.com » vale igual que «rey@gmail.com»
const normalizar = (texto: string) => texto.trim().toLowerCase();

// La única pantalla que detiene todo: borrar la cuenta no tiene vuelta atrás. Es un
// <dialog> de verdad (showModal): oscurece el resto, atrapa el foco y Escape cancela.
// Para que no se borre de un toque, «Borrar» se enciende solo al escribir el correo de la
// cuenta (o «BORRAR» si Google no lo dio).
export default function ConfirmarBorrado({ correo, onBorrar, onCancelar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [borrando, setBorrando] = useState(false);
  const [escrito, setEscrito] = useState("");
  const clave = correo || "BORRAR";
  const coincide = normalizar(escrito) === normalizar(clave);

  useEffect(() => {
    dialogo.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogo}
      className="confirmar box-border max-w-sm rounded-md border border-borde bg-panel p-5 text-left text-texto"
      aria-labelledby="titulo-borrar"
      onCancel={onCancelar}
    >
      <h2 id="titulo-borrar" className="m-0 mb-3 text-lg text-hueso">¿Borrar tu cuenta?</h2>
      <p className="m-0 mb-4 text-sm leading-relaxed">
        Se borrarán tu teclado y tu cuenta de esta app. No se puede deshacer.
      </p>
      <label htmlFor="correo-borrar" className="mb-2 block text-sm leading-relaxed">
        Para confirmar, escribe {correo ? "tu correo" : "la palabra"}:
        <br />
        <strong className="break-all text-hueso">{clave}</strong>
      </label>
      <input
        id="correo-borrar"
        className="campo mb-5"
        type={correo ? "email" : "text"}
        autoComplete="off"
        spellCheck={false}
        value={escrito}
        onChange={(e) => setEscrito(e.target.value)}
      />
      <div className="flex justify-end gap-3">
        <button type="button" className="layer-btn" autoFocus onClick={onCancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="boton-peligro"
          disabled={!coincide || borrando}
          onClick={async () => {
            setBorrando(true);
            await onBorrar();
            setBorrando(false);
          }}
        >
          {borrando ? "Borrando…" : "Borrar"}
        </button>
      </div>
    </dialog>
  );
}
