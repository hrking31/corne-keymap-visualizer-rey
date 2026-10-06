// Mide una versión de la app dentro de un iframe del tamaño pedido: dónde queda cada
// tecla, qué muestra el modal de cada una y qué colores se usan. Lo usa diseno.test.ts
// para comparar la app actual con la copia congelada de tests/referencia/.

export type Medicion = {
  // Cajas del título, los botones de capa y las dos mitades del teclado
  elementos: Record<string, string>;
  // Por capa: caja de cada tecla, sus clases y texto, y cuántas se crearon nuevas
  capas: Record<string, { cajas: string[]; contenido: string[]; teclasNuevas: number }>;
  // Por tecla con acción: tamaño del modal y lo que muestra cada una de sus partes
  modales: Record<string, string>;
  colores: string[];
};

// Empieza en NUM y termina en BASE: así cada clic cambia de verdad de capa
// (la app arranca en BASE) y se puede comprobar que las teclas se recrean.
const ORDEN_CAPAS = ["NUM", "SYM", "NAV", "LED", "FUN", "BASE"];

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
    doc.querySelectorAll(".layer-btn").forEach((boton) => {
      medicion.elementos[`botón ${boton.textContent}`] = caja(boton);
    });

    const modal = doc.getElementById("info-modal")!;
    const tituloModal = doc.getElementById("modal-title")!;

    for (const capa of ORDEN_CAPAS) {
      const boton = doc.querySelector<HTMLElement>(`.layer-btn[data-layer="${capa}"]`)!;
      const anteriores = new Set(doc.querySelectorAll(".key"));

      boton.click();
      await esperar(() => boton.classList.contains("active"), `activar la capa ${capa}`);

      const teclas = [...doc.querySelectorAll<HTMLElement>(".key")];
      medicion.capas[capa] = {
        cajas: teclas.map(caja),
        contenido: teclas.map((t) => `${t.className}|${t.textContent}`),
        teclasNuevas: teclas.filter((t) => !anteriores.has(t)).length,
      };
      anotarColores(win, doc.querySelectorAll("*"), colores);

      for (const [i, tecla] of teclas.entries()) {
        const texto = tecla.textContent ?? "";
        if (!texto.trim()) continue;

        // React escucha mouseover/mouseout; la versión vanilla, mouseenter/mouseleave
        tecla.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
        tecla.dispatchEvent(new win.MouseEvent("mouseenter"));
        await esperar(
          () => !modal.classList.contains("hidden") && tituloModal.textContent === texto,
          `abrir el modal de ${capa} ${texto}`,
        );

        const r = modal.getBoundingClientRect();
        const partes = [...modal.children].map(
          (parte) => `${parte.textContent}/${win.getComputedStyle(parte).display}`,
        );
        medicion.modales[`${capa} #${i} ${texto}`] =
          `${redondear(r.width)}x${redondear(r.height)} ${partes.join(" | ")}`;
        anotarColores(win, [modal, ...modal.querySelectorAll("*")], colores);

        tecla.dispatchEvent(new win.MouseEvent("mouseout", { bubbles: true }));
        tecla.dispatchEvent(new win.MouseEvent("mouseleave"));
        await esperar(() => modal.classList.contains("hidden"), `cerrar el modal de ${texto}`);
      }
    }

    medicion.colores = [...colores].sort();
    return medicion;
  } finally {
    iframe.remove();
  }
}
