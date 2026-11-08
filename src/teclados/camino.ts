// El camino a una capa: qué teclas de capa hay que usar, y en qué orden, para llegar a ella
// desde Base. Lo dibujan las capas animadas.
//
// Cada tecla de capa sabe a qué capa lleva (`abre`, sacado del .keymap). La primera tecla
// del camino es una que está en Base; la segunda, una que está dentro de la capa que abrió
// la primera, y así. Es como cruzar puertas: la segunda tecla no lleva a ningún sitio hasta
// que se mantiene la primera. Por eso el orden no se puede confundir: en el keymap del
// autor, NAV es NUM y luego el pulgar derecho; LED, los mismos pulgares al revés.
import type { ModoCapa, TecladoConfig } from "./tipos";

export type PasoCamino = {
  pos: number; // la tecla (posición de ZMK, 0…41)
  capa: string; // la capa en la que está esa tecla
  modo: ModoCapa;
};

// El camino más corto a `destino`. Vacío para Base, para una capa a la que no lleva ninguna
// tecla y para una que no existe. Si hay varios igual de cortos, gana el de las capas que
// van antes en el orden y, dentro de una capa, el de la tecla de número menor.
export function caminoDeCapa(t: TecladoConfig, destino: string): PasoCamino[] {
  const base = t.orden[0];
  if (!base || destino === base || !t.capas[destino]) return [];

  // Recorrido por anchura: cada capa se visita una vez, por el camino más corto
  const llegada = new Map<string, PasoCamino[]>([[base, []]]);
  let frontera = [base];
  while (frontera.length) {
    const siguiente: string[] = [];
    for (const capa of frontera) {
      const teclas = t.capas[capa]?.teclas ?? {};
      const posiciones = Object.keys(teclas)
        .map(Number)
        .sort((a, b) => a - b);
      for (const pos of posiciones) {
        const abre = teclas[pos].abre;
        // Una tecla que apunta a una capa borrada, o a una ya visitada, no cuenta
        if (!abre || !t.capas[abre.capa] || llegada.has(abre.capa)) continue;
        const camino = [...llegada.get(capa)!, { pos, capa, modo: abre.modo }];
        if (abre.capa === destino) return camino;
        llegada.set(abre.capa, camino);
        siguiente.push(abre.capa);
      }
    }
    frontera = siguiente;
  }
  return [];
}
