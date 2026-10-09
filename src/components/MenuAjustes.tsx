import { useEffect, useRef, useState } from "react";

export type OpcionMenu = {
  texto: string;
  // Borrar la cuenta: en rojo, como el resto de botones peligrosos
  peligro?: boolean;
  // Entrar con Google: el menú sigue abierto para que se vea «Conectando…» o
  // «Continuar con Google» si Firebase aún no se había descargado
  mantenerAbierto?: boolean;
  alElegir: () => void;
};

type Props = {
  opciones: OpcionMenu[];
  // Al abrir el menú (la demo empieza a descargar Firebase: el usuario quizá quiera entrar)
  onAbrir?: () => void;
};

// El ícono de ajustes de la esquina superior derecha y su menú. Fijo en la esquina, fuera
// del teclado: no cambia su tamaño ni su posición. Se cierra al tocar fuera o con Escape.
export default function MenuAjustes({ opciones, onAbrir }: Props) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alTocar = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", alTocar);
    document.addEventListener("keydown", alPulsar);
    return () => {
      document.removeEventListener("pointerdown", alTocar);
      document.removeEventListener("keydown", alPulsar);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="menu-ajustes">
      <button
        type="button"
        className="menu-boton"
        aria-label="Ajustes"
        title="Ajustes"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => {
          if (!abierto) onAbrir?.();
          setAbierto(!abierto);
        }}
      >
        {/* Engranaje */}
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {abierto && (
        <div role="menu" className="menu-lista">
          {opciones.map((o) => (
            <button
              key={o.texto}
              type="button"
              role="menuitem"
              className={o.peligro ? "menu-opcion peligro" : "menu-opcion"}
              onClick={() => {
                if (!o.mantenerAbierto) setAbierto(false);
                o.alElegir();
              }}
            >
              {o.texto}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
