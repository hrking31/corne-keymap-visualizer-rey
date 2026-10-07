# Referencia visual — no editar

Copia congelada de la versión vanilla (`v1.1-vanilla`): `index.html`, `app.js`, `data.js`,
`teclado.js` y `style.css`, sacados con `git archive v1.1-vanilla`.

`tests/visual/diseno.test.ts` abre esta copia y la app actual en el mismo navegador y comprueba
que se ven idénticas. Medir las dos a la vez evita depender de las fuentes de cada equipo
(Courier New no existe en Linux, donde corre la CI).

Si algún día se **aprueba** un cambio de diseño, esta copia deja de servir como referencia:
habrá que actualizarla a propósito, nunca para que la prueba pase.

## Cambios aprobados aplicados a esta copia

| Fecha | Cambio | Archivo |
|---|---|---|
| 2026-10-06 | En vista vertical (≤912px), cada mitad se desplaza 0,6 teclas hacia fuera para que los pulgares SPC y ENT no se corten | `style.css` |
| 2026-10-07 | En móvil vertical, el ancho del panel incluye relleno y borde (`box-sizing: border-box`, máximo 404px): ya no se corta 6px por lado por debajo de 436px | `style.css` |
| 2026-10-07 | Título sin «Rey»: «Corne ZMK Visualizer» | `index.html` |
| 2026-10-07 | Etiqueta naranja del panel con letra oscura `#1a1915` en vez de blanca (opción D; contraste 3,2 → 5,5 : 1) | `style.css` |
| 2026-10-07 | Etiqueta naranja con interlineado 1,4 y más relleno: el texto se veía aplastado | `style.css` |
| 2026-10-07 | **Rediseño «ajuste a la pantalla»**: sin scroll, tamaño de tecla según el espacio, apilado según la proporción de la pantalla, letra y panel que crecen, panel más ancho. Afecta a casi todo el CSS, así que **`style.css` de esta copia pasa a ser igual al de `src/`**. Desde aquí la prueba vigila que los cambios de HTML/React no alteren el diseño; los cambios de CSS se revisan y aprueban a propósito | `style.css` |
| 2026-10-07 | **Placa bajo cada mitad** con el contorno que dibujó el autor (Excalidraw, v3) y el acrílico de la OLED; hueco entre mitades y tamaño de tecla recalculados para que quepan las placas. `style.css` copiado de `src/` | `style.css` |
| 2026-10-07 | Placa lisa (la fibra de carbono queda guardada como variante `.carbono`, desactivada); botón ⇅ para el orden de las mitades al apilar y pantalla de bienvenida. Ni el botón (posición absoluta, solo apilado) ni la bienvenida mueven nada de lo que mide la prueba. `style.css` copiado de `src/` | `style.css` |
| 2026-10-07 | Firma al pie en una línea («© 2026 CorneRey · Desarrollado por Hernando Rey», con enlace a su web): le quita ~22px de alto al teclado | `index.html`, `style.css` |

Cambios de comportamiento que la prueba no mide y por eso no se copiaron: la posición del
panel (fijo sobre la mitad contraria fuera del móvil vertical, debajo de los botones de capa)
y el corte del modo móvil del panel en 912px en vez de 768px (los anchos probados quedan
igual con ambos).
