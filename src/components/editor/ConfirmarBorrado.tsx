import { useEffect, useRef, useState } from "react";

type Props = {
  onBorrar: () => Promise<void>;
  onCancelar: () => void;
};

// La única pantalla que detiene todo: borrar la cuenta no tiene vuelta atrás. Es un
// <dialog> de verdad (showModal): oscurece el resto, atrapa el foco y Escape cancela.
export default function ConfirmarBorrado({ onBorrar, onCancelar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [borrando, setBorrando] = useState(false);

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
      <p className="m-0 mb-5 text-sm leading-relaxed">
        Se borrarán tu teclado y tu cuenta de esta app. No se puede deshacer. Tu cuenta de
        Google no se toca.
      </p>
      <div className="flex justify-end gap-3">
        <button type="button" className="layer-btn" autoFocus onClick={onCancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="boton-peligro"
          disabled={borrando}
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
