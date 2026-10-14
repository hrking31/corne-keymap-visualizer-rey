// La pantalla OLED de cada mitad mientras se practica: la misma de siempre
// (src/assets/oled-derecha.svg y oled-izquierda.svg) con lo de la práctica en la franja que
// los íconos dejan libre. Hasta que llega la primera pulsación, una ✗ en lugar del ✓ de
// «conectado».
// Se dibuja como SVG y se pasa al CSS como imagen (data:, que la CSP permite en img-src):
// así no hay que añadir ningún elemento dentro de .split, donde el escalonado y los pulgares
// cuentan las teclas con nth-child. Los parpadeos son animaciones del propio SVG (SMIL): la
// CSP no deja poner estilos dentro.

const BLANCO = "#f4f1e8";
const TRAZO = `fill="none" stroke="${BLANCO}" stroke-width="3" stroke-linecap="round"`;
const LETRA = `font-family="Montserrat, Arial, Helvetica, sans-serif" font-weight="bold" fill="${BLANCO}"`;

const CONECTADO = `<path d="M38 23 L43 28 L53 16" ${TRAZO} stroke-linejoin="round"/>`;
const SIN_CONECTAR = `<path d="M40 16.5 L51 27.5 M51 16.5 L40 27.5" ${TRAZO}/>`;

// La letra de la práctica es la del «100%» de la batería (pedido del autor): 16 dentro de
// dos escalas de 0,7
const LETRA_BATERIA = 16 * 0.7 * 0.7;
// En un móvil la tecla mide poco y esa letra no se leería: se agranda hasta unos 8px, sin
// pasar de lo que cabe en la pantalla (una línea o dos)
const PX_MINIMO = 8;
const LETRA_MAXIMA = [18, 16];
// La cuenta atrás, lo más grande que cabe en la franja libre
const LETRA_CUENTA = 22;

// El tamaño de la letra, en unidades de la pantalla (60 = 1 tecla), según lo que mide una
// tecla en px. Con teclas de 62px o más (un PC) es el de la batería
export function tamanoDeLetra(tecla: number, lineas: number): number {
  const paraLeerse = tecla > 0 ? (PX_MINIMO * 60) / tecla : LETRA_BATERIA;
  const tamano = Math.min(Math.max(LETRA_BATERIA, paraLeerse), LETRA_MAXIMA[lineas - 1] ?? 16);
  return Math.round(tamano * 100) / 100;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

// ---------- Parpadeos ----------

// La pantalla se enciende y se apaga de golpe, como un píxel de OLED: el número que cambia
// (0,4 s), el tiempo final (tres veces) y «NUEVO RÉCORD» (sin fin, hasta la siguiente ronda)
export type Parpadeo = "cambio" | "fin" | "siempre";
const PARPADEOS: Record<Parpadeo, string> = {
  cambio: `<animate attributeName="opacity" values="0;1;0;1" dur="0.4s" calcMode="discrete" fill="freeze"/>`,
  fin: `<animate attributeName="opacity" values="0;1;0;1;0;1" dur="1.5s" calcMode="discrete" fill="freeze"/>`,
  siempre: `<animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite"/>`,
};
// Con «reducir movimiento» en el sistema, sin parpadeos
const parpadeo = (tipo: Parpadeo | null | undefined, quieto: boolean) => (tipo && !quieto ? PARPADEOS[tipo] : "");

// ---------- Lo que va en la franja libre ----------
// La pantalla mide 150 × 56 tumbada y los íconos ocupan hasta y = 16: el contenido va
// centrado en lo que queda libre, de y = 20 a y = 52 (centro en 36)

// Texto centrado, en una línea o dos
export function lineas(tecla: number, filas: string[], tipo?: Parpadeo | null, quieto = false): string {
  const tamano = tamanoDeLetra(tecla, filas.length);
  const alto = tamano * 0.716; // la altura de una mayúscula
  const salto = tamano * 1.25;
  const primera = 36 - ((filas.length - 1) * salto) / 2 + alto / 2;
  const textos = filas
    .map((fila, i) => `<text x="75" y="${r2(primera + i * salto)}" text-anchor="middle" font-size="${tamano}" ${LETRA}>${fila}</text>`)
    .join("");
  return `<g>${textos}${parpadeo(tipo, quieto)}</g>`;
}

// La cuenta atrás: 3, 2, 1, «¡YA!», en grande
export const grande = (texto: string): string =>
  `<text x="75" y="${r2(36 + (LETRA_CUENTA * 0.716) / 2)}" text-anchor="middle" font-size="${LETRA_CUENTA}" ${LETRA}>${texto}</text>`;

const medidas = (tecla: number) => {
  const t = tamanoDeLetra(tecla, 1);
  const alto = t * 0.716;
  return { t, alto, base: r2(36 + alto / 2) };
};

// Un cronómetro y el tiempo, centrados juntos. El cronómetro, algo más alto que las letras y
// de trazo fino (con el trazo del ✓ se cerraba en una mancha). El ancho del texto se estima:
// los números de esta letra miden algo más de media letra de alto
export function tiempo(tecla: number, texto: string, tipo?: Parpadeo | null, quieto = false): string {
  const { t, alto, base } = medidas(tecla);
  const escala = (alto * 1.45) / 13.5;
  const icono = 12 * escala;
  const hueco = 0.3 * t;
  const ancho = icono + hueco + t * (0.556 * (texto.length - 1) + 0.333);
  const x = 75 - ancho / 2;
  const reloj =
    `<g transform="translate(${r2(x)} ${r2(36 - 7.9 * escala)}) scale(${escala.toFixed(4)})" fill="none" stroke="${BLANCO}" stroke-width="${(1.05 / escala).toFixed(3)}" stroke-linecap="round">` +
    `<path d="M4 0.8 H8 M6 0.8 V3"/><circle cx="6" cy="8.5" r="5"/><path d="M6 8.5 L8.2 6.3"/></g>`;
  return reloj + `<text x="${r2(x + icono + hueco)}" y="${base}" font-size="${t}" ${LETRA}>${texto}${parpadeo(tipo, quieto)}</text>`;
}

// ✓ N ✗ N, con los íconos del alto de las letras (más grandes que los de «conectado»). El
// número que acaba de cambiar parpadea
export function puntos(tecla: number, aciertos: number, fallos: number, cambia: "aciertos" | "fallos" | null = null, quieto = false): string {
  const { t, alto, base } = medidas(tecla);
  const e = (alto * 1.15) / 12;
  const arriba = r2(36 - (alto * 1.15) / 2);
  const trazo = `fill="none" stroke="${BLANCO}" stroke-width="${(1.6 / e).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round"`;
  const icono = (x: number, d: string) => `<g transform="translate(${r2(x)} ${arriba}) scale(${e.toFixed(4)})"><path d="${d}" ${trazo}/></g>`;
  const numero = (x: number, n: number, suyo: boolean) =>
    `<text x="${x}" y="${base}" font-size="${t}" ${LETRA}>${n}${suyo ? parpadeo("cambio", quieto) : ""}</text>`;
  return (
    icono(50 - 15 * e - 1.5, "M0 7 L5 12 L15 0") + numero(51.5, aciertos, cambia === "aciertos") +
    icono(98 - 13 * e - 1.5, "M1 0 L12 12 M12 0 L1 12") + numero(99.5, fallos, cambia === "fallos")
  );
}

// ---------- La pantalla entera ----------

// Dos imágenes iguales seguidas comparten la animación (el navegador reutiliza la primera,
// ya terminada): las que parpadean llevan un número de serie
let serie = 0;

// El valor de CSS (url("data:…")) con la pantalla de una mitad y `contenido` en la franja
// libre. La izquierda va volteada, como su imagen de siempre: toda esa mitad se refleja y
// así el texto se lee al derecho
export function pantallaOled(lado: "left" | "right", contenido: string, conectado: boolean): string {
  const volteo = lado === "left" ? "translate(56 0) scale(-1 1) " : "";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 150" width="56" height="150">` +
    (contenido.includes("<animate") ? `<!--${++serie}-->` : "") +
    `<g transform="${volteo}matrix(0 -1 1 0 0 150)">` +
    `<rect x="0" y="0" width="150" height="56" rx="3" fill="#000"/>` +
    `<g transform="translate(75 12) scale(0.7) translate(-75 -12)">` +
    `<g transform="translate(-20.2 -6) scale(0.7)">` +
    `<circle cx="18" cy="31" r="2.4" fill="${BLANCO}"/>` +
    `<path d="M13.05 27.05 A7 7 0 0 1 22.95 27.05" ${TRAZO}/>` +
    `<path d="M9.51 23.51 A12 12 0 0 1 26.49 23.51" ${TRAZO}/>` +
    `<path d="M5.98 19.98 A17 17 0 0 1 30.02 19.98" ${TRAZO}/>` +
    (conectado ? CONECTADO : SIN_CONECTAR) +
    `</g>` +
    `<g transform="translate(65.2 -4) scale(0.7)">` +
    // El rayo, al 60 % y centrado en el alto del «100%» (pedido del autor)
    `<path d="M101 11 L94 24 H99 L96 34 L105 20 H100 Z" fill="${BLANCO}" transform="translate(100.6 22.3) scale(0.6) translate(-99.5 -22.5)"/>` +
    `<text x="144" y="28" text-anchor="end" font-size="16" ${LETRA}>100%</text>` +
    `</g></g>` +
    contenido +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// ---------- Lo que muestra cada pantalla en cada momento de la ronda ----------

export type EstadoPantallas =
  | { fase: "sinTeclado" } // antes de la primera pulsación
  | { fase: "conectado" } // la primera pulsación: el teclado responde
  | { fase: "cuenta"; texto: string } // 3, 2, 1, «¡YA!»
  | { fase: "ronda"; tiempo: string; aciertos: number; fallos: number; cambia: "aciertos" | "fallos" | null }
  // Al terminar. `marca`: en Palabras y Frases, las palabras por minuto («41 PPM»)
  | { fase: "fin"; tiempo: string; aciertos: number; fallos: number; record: boolean; marca?: string };

// La izquierda y la derecha por separado: cada una cambia a su ritmo (el reloj cada segundo,
// la puntuación con cada respuesta) y una imagen nueva reinicia su parpadeo
export function pantallaIzquierda(estado: EstadoPantallas, tecla = 0, quieto = false): string {
  switch (estado.fase) {
    case "sinTeclado":
      return pantallaOled("left", lineas(tecla, ["CONECTA TU", "TECLADO"]), false);
    case "conectado":
      return pantallaOled("left", lineas(tecla, ["TECLADO", "CONECTADO"]), true);
    case "cuenta":
      return pantallaOled("left", grande(estado.texto), true);
    case "ronda":
      return pantallaOled("left", tiempo(tecla, estado.tiempo), true);
    case "fin":
      return pantallaOled(
        "left",
        estado.record ? lineas(tecla, ["NUEVO", "RÉCORD"], "siempre", quieto) : tiempo(tecla, estado.tiempo, "fin", quieto),
        true,
      );
  }
}

// Los avisos (conectar, conectado, cuenta atrás) van solo en la izquierda (pedido del autor):
// la derecha se queda con sus íconos
export function pantallaDerecha(estado: EstadoPantallas, tecla = 0, quieto = false): string {
  switch (estado.fase) {
    case "sinTeclado":
      return pantallaOled("right", "", false);
    case "conectado":
    case "cuenta":
      return pantallaOled("right", "", true);
    case "ronda":
      return pantallaOled("right", puntos(tecla, estado.aciertos, estado.fallos, estado.cambia, quieto), true);
    case "fin":
      if (!estado.record) return pantallaOled("right", puntos(tecla, estado.aciertos, estado.fallos), true);
      // Con récord, la marca pasa a la derecha
      return pantallaOled("right", estado.marca ? lineas(tecla, [estado.marca]) : tiempo(tecla, estado.tiempo), true);
  }
}
