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

Cambios de comportamiento que la prueba no mide y por eso no se copiaron: la posición del
panel (fijo sobre la mitad contraria fuera del móvil vertical, debajo de los botones de capa)
y el corte del modo móvil del panel en 912px en vez de 768px (los anchos probados quedan
igual con ambos).
