import { useEffect } from "react";

// Tiempo mínimo de la bienvenida, contado desde que se abrió la página, y lo que tarda
// en desvanecerse (igual que la transición de .bienvenida en style.css)
const VISIBLE_MS = 1800;
const SALIDA_MS = 400;

// La bienvenida (la mano izquierda del Corne con los LED en el efecto Swirl de ZMK) está
// en index.html para verse desde el primer instante, mientras carga la app. Este
// componente no dibuja nada: cuando la app ya está lista, la quita en cuanto se cumplen
// los 1,8 s (o enseguida, si la carga tardó más). Tocar o pulsar una tecla la salta.
// Con "reducir movimiento", el CSS ni siquiera la muestra.
export default function Bienvenida() {
  useEffect(() => {
    const el = document.getElementById("bienvenida");
    if (!el) return;

    let quitar: number | undefined;
    const salir = () => {
      if (el.classList.contains("saliendo")) return;
      el.classList.add("saliendo");
      quitar = window.setTimeout(() => el.remove(), SALIDA_MS);
    };

    const espera = window.setTimeout(salir, Math.max(0, VISIBLE_MS - performance.now()));
    el.addEventListener("pointerdown", salir);
    document.addEventListener("keydown", salir);
    return () => {
      clearTimeout(espera);
      clearTimeout(quitar);
      el.removeEventListener("pointerdown", salir);
      document.removeEventListener("keydown", salir);
    };
  }, []);

  return null;
}
