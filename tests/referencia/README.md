# Referencia visual — no editar

Copia congelada de la versión vanilla (`v1.1-vanilla`): `index.html`, `app.js`, `data.js`,
`teclado.js` y `style.css`, sacados con `git archive v1.1-vanilla`.

`tests/visual/diseno.test.ts` abre esta copia y la app actual en el mismo navegador y comprueba
que se ven idénticas. Medir las dos a la vez evita depender de las fuentes de cada equipo
(Courier New no existe en Linux, donde corre la CI).

Si algún día se **aprueba** un cambio de diseño, esta copia deja de servir como referencia:
habrá que actualizarla a propósito, nunca para que la prueba pase.
