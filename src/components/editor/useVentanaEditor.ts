import { useEffect, useLayoutEffect, useRef } from "react";

// Lo que comparten las ventanas del editor (capa y tecla):
// - Dónde salen, medido al abrir y al cambiar el tamaño de la pantalla:
//   · sin `centrarEn` (capa): justo debajo de la última línea de botones de capa;
//   · con `centrarEn` (tecla): centrada sobre esa mitad del teclado, la contraria a la
//     tecla, como el recuadro con la descripción. Nunca tapa los botones de capa ni se
//     sale de la pantalla.
// - Tocar o hacer clic fuera las cierra. Si lo tocado es otra tecla o un botón, su clic
//   sigue funcionando (en el PC, tocar otra tecla abre esa en el editor).
export function useVentanaEditor<T extends HTMLElement>(onCerrar: () => void, centrarEn?: "left-side" | "right-side") {
  const ventana = useRef<T>(null);
  const cerrar = useRef(onCerrar);

  useEffect(() => {
    cerrar.current = onCerrar;
  });

  useLayoutEffect(() => {
    const colocar = () => {
      const el = ventana.current;
      if (!el) return;
      const margen = 8;
      const botones = document.querySelector(".layer-buttons")?.getBoundingClientRect();
      const debajoDeLosBotones = (botones ? botones.bottom : 0) + margen;
      const mitad = centrarEn && document.getElementById(centrarEn)?.getBoundingClientRect();

      if (!mitad) {
        el.style.top = debajoDeLosBotones + "px";
        return;
      }
      const { offsetWidth: ancho, offsetHeight: alto } = el;
      const izquierda = mitad.left + (mitad.width - ancho) / 2;
      const arriba = mitad.top + (mitad.height - alto) / 2;
      el.style.left = Math.min(Math.max(izquierda, margen), window.innerWidth - ancho - margen) + "px";
      // Los botones mandan: si no cabe, antes se sale un poco por abajo que taparlos
      el.style.top = Math.max(Math.min(arriba, window.innerHeight - alto - margen), debajoDeLosBotones) + "px";
    };
    colocar();
    window.addEventListener("resize", colocar);
    return () => window.removeEventListener("resize", colocar);
  }, [centrarEn]);

  useEffect(() => {
    const alTocar = (e: PointerEvent) => {
      if (ventana.current && !ventana.current.contains(e.target as Node)) cerrar.current();
    };
    document.addEventListener("pointerdown", alTocar);
    return () => document.removeEventListener("pointerdown", alTocar);
  }, []);

  return ventana;
}
