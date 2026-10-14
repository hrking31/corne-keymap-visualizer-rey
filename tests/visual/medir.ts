// Mide una versión de la app dentro de un iframe del tamaño pedido: dónde queda cada
// tecla, qué muestra el modal de cada una y qué colores se usan. Lo usa diseno.test.ts
// para comparar la app con las medidas aprobadas.
import negrita from "@fontsource/courier-prime/files/courier-prime-latin-700-normal.woff2?url";
import normal from "@fontsource/courier-prime/files/courier-prime-latin-400-normal.woff2?url";

export type Medicion = {
  // Cajas del título, los botones de capa y las dos mitades del teclado
  elementos: Record<string, string>;
  // Por capa: caja de cada tecla, sus clases, texto y fuente, y cuántas se crearon nuevas
  capas: Record<string, { cajas: string[]; contenido: string[]; teclasNuevas: number }>;
  // Por tecla con acción: tamaño del modal y lo que muestra cada una de sus partes
  modales: Record<string, string>;
  colores: string[];
};

// Los botones de capa se recorren por su posición. Empieza en el 2.º y termina en el 1.º
// (Base): así cada clic cambia de verdad de capa (la app arranca en Base) y se ve que las
// teclas se recrean.
const ordenCapas = (n: number) => [...Array.from({ length: n - 1 }, (_, i) => i + 1), 0];

// La letra de la app, Courier New, no está en todos los sistemas: el servidor de la CI
// (Linux) no la tiene y pondría otra, con otras medidas. Para medir lo mismo en cualquier
// máquina, la página medida usa con ese nombre una letra que viaja con las pruebas
// (Courier Prime, licencia OFL). La app no cambia: esto solo pasa dentro de la prueba
async function letraDeLaPrueba(doc: Document, win: Window & typeof globalThis) {
  for (const [archivo, peso] of [[normal, "400"], [negrita, "700"]]) {
    const cara = new win.FontFace("Courier New", `url(${archivo})`, { weight: peso });
    doc.fonts.add(cara);
    await cara.load();
  }
  await doc.fonts.ready;
}

// Los textos se comparan sin espacios sobrantes: «ALT » y «ALT» se ven igual
const texto = (el: Element) => (el.textContent ?? "").trim();

const redondear = (n: number) => Math.round(n * 100) / 100;

const caja = (el: Element) => {
  const r = el.getBoundingClientRect();
  return [r.x, r.y, r.width, r.height].map(redondear).join(",");
};

// Espera a que React (o la versión vanilla) termine de pintar
async function esperar(condicion: () => boolean, que: string) {
  for (let i = 0; i < 500; i++) {
    if (condicion()) return;
    await new Promise((listo) => setTimeout(listo, 0));
  }
  throw new Error(`Tiempo agotado esperando: ${que}`);
}

function anotarColores(win: Window, elementos: Iterable<Element>, colores: Set<string>) {
  for (const el of elementos) {
    const estilo = win.getComputedStyle(el);
    colores.add(estilo.color);
    colores.add(estilo.backgroundColor);
    colores.add(estilo.borderColor);
    colores.add(estilo.boxShadow);
  }
}

export async function medir(url: string, ancho: number, alto: number): Promise<Medicion> {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = `position:absolute;left:0;top:0;border:0;width:${ancho}px;height:${alto}px`;
  const cargado = new Promise((listo) => (iframe.onload = listo));
  iframe.src = url;
  document.body.appendChild(iframe);

  try {
    await cargado;
    const doc = iframe.contentDocument!;
    // Los eventos se crean con el MouseEvent del iframe, no con el de la página de pruebas
    const win = iframe.contentWindow! as Window & typeof globalThis;
    await esperar(() => doc.querySelectorAll(".key").length === 42, `las 42 teclas en ${url}`);
    await letraDeLaPrueba(doc, win);

    // Sin transiciones, los colores se leen en su valor final y no a mitad de animación
    const sinAnimaciones = doc.createElement("style");
    sinAnimaciones.textContent =
      "*,*::before,*::after{transition:none!important;animation:none!important}";
    doc.head.appendChild(sinAnimaciones);

    const medicion: Medicion = { elementos: {}, capas: {}, modales: {}, colores: [] };
    const colores = new Set<string>();

    for (const selector of ["h1", ".layer-buttons", ".keyboard-container", "#left-side", "#right-side"]) {
      medicion.elementos[selector] = caja(doc.querySelector(selector)!);
    }
    doc.querySelectorAll(".layer-btn").forEach((boton, n) => {
      medicion.elementos[`botón ${n + 1}`] = caja(boton);
    });

    const modal = doc.getElementById("info-modal")!;

    for (const n of ordenCapas(doc.querySelectorAll(".layer-btn").length)) {
      const capa = `capa ${n + 1}`;
      const boton = doc.querySelectorAll<HTMLElement>(".layer-btn")[n];
      const anteriores = new Set(doc.querySelectorAll(".key"));

      boton.click();
      await esperar(() => boton.classList.contains("active"), `activar la capa ${capa}`);

      const teclas = [...doc.querySelectorAll<HTMLElement>(".key")];
      medicion.capas[capa] = {
        cajas: teclas.map(caja),
        // La fuente también: las teclas tienen tamaño fijo, así que un cambio de
        // tipografía (p. ej. un <button> que no hereda Courier) no movería ninguna caja
        contenido: teclas.map((t) => {
          const e = win.getComputedStyle(t);
          return `${t.className}|${texto(t)}|${e.fontFamily} ${e.fontSize} ${e.fontWeight} ${e.lineHeight} ${e.letterSpacing}`;
        }),
        teclasNuevas: teclas.filter((t) => !anteriores.has(t)).length,
      };
      anotarColores(win, doc.querySelectorAll("*"), colores);

      for (const [i, tecla] of teclas.entries()) {
        const etiqueta = texto(tecla);
        if (!etiqueta) continue;

        // React escucha mouseover/mouseout; la versión vanilla, mouseenter/mouseleave
        tecla.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
        tecla.dispatchEvent(new win.MouseEvent("mouseenter"));
        await esperar(
          // Basta con que se abra (se espera a que se cierre tras cada tecla); lo que muestra queda
          // anotado abajo. El título no siempre es el texto de la tecla: «CTRL+N / ALT+B»
          () => !modal.classList.contains("hidden"),
          `abrir el modal de ${capa} ${etiqueta}`,
        );

        const r = modal.getBoundingClientRect();
        const partes = [...modal.children].map(
          (parte) => `${texto(parte)}/${win.getComputedStyle(parte).display}`,
        );
        medicion.modales[`${capa} #${i} ${etiqueta}`] =
          `${redondear(r.width)}x${redondear(r.height)} ${partes.join(" | ")}`;
        anotarColores(win, [modal, ...modal.querySelectorAll("*")], colores);

        tecla.dispatchEvent(new win.MouseEvent("mouseout", { bubbles: true }));
        tecla.dispatchEvent(new win.MouseEvent("mouseleave"));
        await esperar(() => modal.classList.contains("hidden"), `cerrar el modal de ${etiqueta}`);
      }
    }

    medicion.colores = [...colores].sort();
    return medicion;
  } finally {
    iframe.remove();
  }
}
