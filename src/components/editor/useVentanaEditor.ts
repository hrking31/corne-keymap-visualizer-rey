import { useEffect, useLayoutEffect, useRef } from "react";

// Móvil: vertical (mitades apiladas, como en style.css) o un teléfono en horizontal
const MOVIL = "(max-aspect-ratio: 6/5), (orientation: landscape) and (max-height: 500px)";

// Lo que comparten las ventanas del editor (capa y tecla):
// - Dónde salen, medido al abrir y al cambiar el tamaño de la pantalla:
//   · sin `centrarEn` (capa): justo debajo de la última línea de botones de capa;
//   · con `centrarEn` (tecla), en el PC: centrada sobre esa mitad del teclado, la
//     contraria a la tecla, como el recuadro con la descripción;
//   · con `centrarEn`, en el móvil: justo debajo del título (tapa los botones de capa
//     mientras se edita), centrada a lo ancho (con su ancho de siempre). Así
//     no tapa las teclas de abajo y cabe entera cuando sale el teclado del teléfono.
//   Si no cabe en el alto, se desplaza por dentro.
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
      const limitarAlto = (arriba: number) => {
        el.style.maxHeight = window.innerHeight - arriba - margen + "px";
      };

      if (centrarEn && window.matchMedia(MOVIL).matches) {
        el.style.left = (window.innerWidth - el.offsetWidth) / 2 + "px";
        const titulo = document.querySelector("h1")?.getBoundingClientRect();
        const debajoDelTitulo = (titulo ? titulo.bottom : 0) + margen;
        el.style.top = debajoDelTitulo + "px";
        limitarAlto(debajoDelTitulo);
        return;
      }

      const mitad = centrarEn && document.getElementById(centrarEn)?.getBoundingClientRect();
      if (!mitad) {
        el.style.top = debajoDeLosBotones + "px";
        limitarAlto(debajoDeLosBotones);
        return;
      }
      const { offsetWidth: ancho, offsetHeight: alto } = el;
      const izquierda = mitad.left + (mitad.width - ancho) / 2;
      const arriba = mitad.top + (mitad.height - alto) / 2;
      el.style.left = Math.min(Math.max(izquierda, margen), window.innerWidth - ancho - margen) + "px";
      // Los botones mandan: si no cabe, se queda debajo de ellos y se desplaza por dentro
      const top = Math.max(Math.min(arriba, window.innerHeight - alto - margen), debajoDeLosBotones);
      el.style.top = top + "px";
      limitarAlto(top);
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
