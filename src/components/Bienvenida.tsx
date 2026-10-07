import { useEffect, useState } from "react";
import horizontal from "../assets/bienvenida-horizontal.svg";
import vertical from "../assets/bienvenida-vertical.svg";

// Cuánto se ve la bienvenida y cuánto tarda en desvanecerse (igual que en style.css)
// TEMPORAL (2026-10-07): 2 minutos para que el autor pruebe el efecto. Lo normal: 1800
const VISIBLE_MS = 120_000;
const SALIDA_MS = 400;

type Fase = "visible" | "saliendo" | "fuera";

// Pantalla de bienvenida al abrir la app: la mano izquierda del Corne con los LED en
// el efecto Swirl de ZMK. De pie en el móvil vertical (la pantalla OLED arriba) y
// acostada en el PC y en horizontal; el CSS elige cuál de las dos se ve.
// La animación va dentro del SVG. Tocar o pulsar una tecla la salta, y no aparece si
// el sistema pide reducir el movimiento.
export default function Bienvenida() {
  const [fase, setFase] = useState<Fase>(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "fuera" : "visible",
  );

  useEffect(() => {
    if (fase === "fuera") return;
    const siguiente = fase === "visible" ? "saliendo" : "fuera";
    const espera = setTimeout(() => setFase(siguiente), fase === "visible" ? VISIBLE_MS : SALIDA_MS);

    const saltar = () => setFase((f) => (f === "visible" ? "saliendo" : f));
    document.addEventListener("keydown", saltar);
    return () => {
      clearTimeout(espera);
      document.removeEventListener("keydown", saltar);
    };
  }, [fase]);

  if (fase === "fuera") return null;

  return (
    <div
      className={fase === "saliendo" ? "bienvenida saliendo" : "bienvenida"}
      aria-hidden="true"
      onPointerDown={() => setFase("saliendo")}
    >
      <img className="bienvenida-horizontal" src={horizontal} alt="" />
      <img className="bienvenida-vertical" src={vertical} alt="" />
    </div>
  );
}
