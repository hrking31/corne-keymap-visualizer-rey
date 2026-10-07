import { useEffect, useState } from "react";
import teclado from "../assets/bienvenida.svg";

// Cuánto se ve la bienvenida y cuánto tarda en desvanecerse (igual que en style.css)
// TEMPORAL (2026-10-07): 2 minutos para que el autor pruebe el efecto. Lo normal: 1800
const VISIBLE_MS = 120_000;
const SALIDA_MS = 400;

type Fase = "visible" | "saliendo" | "fuera";

// Pantalla de bienvenida al abrir la app: la mano izquierda del Corne con los LED en
// el efecto Swirl de ZMK, acostada en todas las pantallas.
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
      <img className="bienvenida-teclado" src={teclado} alt="" />
      <p className="bienvenida-titulo">Corne ZMK</p>
      <footer className="bienvenida-pie">
        <p>© 2026 CorneRey — Hecho con amor y café</p>
        <p>Desarrollado por Hernando Rey</p>
      </footer>
    </div>
  );
}
