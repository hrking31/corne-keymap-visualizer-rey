// La pantalla OLED de cada mitad mientras se practica: la misma de siempre
// (src/assets/oled-derecha.svg y oled-izquierda.svg) con el marcador en la franja que los
// íconos dejan libre. Hasta que llega la primera pulsación, una ✗ en lugar del ✓ de
// «conectado» y el aviso de conectar el teclado.
// Se dibuja como SVG y se pasa al CSS como imagen (data:, que la CSP permite en img-src):
// así no hay que añadir ningún elemento dentro de .split, donde el escalonado y los pulgares
// cuentan las teclas con nth-child.

const BLANCO = "#f4f1e8";
const TRAZO = `fill="none" stroke="${BLANCO}" stroke-width="3" stroke-linecap="round"`;
const LETRA = `font-family="Montserrat, Arial, Helvetica, sans-serif" font-weight="bold" fill="${BLANCO}"`;

const CONECTADO = `<path d="M38 23 L43 28 L53 16" ${TRAZO} stroke-linejoin="round"/>`;
const SIN_CONECTAR = `<path d="M40 16.5 L51 27.5 M51 16.5 L40 27.5" ${TRAZO}/>`;

// La letra del marcador es la del «100%» de la batería (pedido del autor): 16 dentro de
// dos escalas de 0,7
const LETRA_BATERIA = 16 * 0.7 * 0.7;
// En un móvil la tecla mide poco y esa letra no se leería: se agranda hasta unos 8px, sin
// pasar de lo que cabe en la pantalla (una línea o dos)
const PX_MINIMO = 8;
const LETRA_MAXIMA = [18, 16];

// El tamaño de la letra, en unidades de la pantalla (60 = 1 tecla), según lo que mide una
// tecla en px. Con teclas de 62px o más (un PC) es el de la batería
export function tamanoDeLetra(tecla: number, lineas: number): number {
  const paraLeerse = tecla > 0 ? (PX_MINIMO * 60) / tecla : LETRA_BATERIA;
  const tamano = Math.min(Math.max(LETRA_BATERIA, paraLeerse), LETRA_MAXIMA[lineas - 1] ?? 16);
  return Math.round(tamano * 100) / 100;
}

// La pantalla mide 150 × 56 tumbada y los íconos ocupan hasta y = 16: el texto va centrado
// en lo que queda libre, de y = 20 a y = 52
function texto(lineas: string[], tamano: number): string {
  const centro = 36;
  const alto = tamano * 0.716; // la altura de una mayúscula
  const salto = tamano * 1.25;
  const primera = centro - ((lineas.length - 1) * salto) / 2 + alto / 2;
  return lineas
    .map((linea, i) => {
      const base = Math.round((primera + i * salto) * 100) / 100;
      return `<text x="75" y="${base}" text-anchor="middle" font-size="${tamano}" ${LETRA}>${linea}</text>`;
    })
    .join("");
}

// El valor de CSS (url("data:…")) con la pantalla de una mitad. La izquierda va volteada,
// como su imagen de siempre: toda esa mitad se refleja y así el texto se lee al derecho.
// `tecla`: lo que mide una tecla en px, para el tamaño de la letra
export function pantallaOled(lado: "left" | "right", lineas: string[], conectado: boolean, tecla = 0): string {
  const volteo = lado === "left" ? "translate(56 0) scale(-1 1) " : "";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 150" width="56" height="150">` +
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
    `<path d="M101 11 L94 24 H99 L96 34 L105 20 H100 Z" fill="${BLANCO}"/>` +
    `<text x="144" y="28" text-anchor="end" font-size="16" ${LETRA}>100%</text>` +
    `</g></g>` +
    texto(lineas, tamanoDeLetra(tecla, lineas.length)) +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// El número, separado de su palabra algo más que un espacio (a este tamaño de letra un
// espacio normal mide un par de píxeles y se veía pegado: «FALLOS1»)
const numero = (n: number) => `<tspan dx="0.6em">${n}</tspan>`;

// Lo que muestra cada pantalla: aciertos en la izquierda y fallos en la derecha; sin
// teclado todavía, el aviso en las dos
export function pantallasDePractica(
  aciertos: number,
  fallos: number,
  conectado: boolean,
  tecla = 0,
): { izquierda: string; derecha: string } {
  if (!conectado) {
    const aviso = ["CONECTA TU", "TECLADO"];
    return { izquierda: pantallaOled("left", aviso, false, tecla), derecha: pantallaOled("right", aviso, false, tecla) };
  }
  return {
    izquierda: pantallaOled("left", [`ACIERTOS${numero(aciertos)}`], true, tecla),
    derecha: pantallaOled("right", [`FALLOS${numero(fallos)}`], true, tecla),
  };
}
