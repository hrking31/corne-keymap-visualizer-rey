// Lee un archivo .keymap de ZMK: las capas con sus teclas y los comportamientos que el
// propio archivo define (macros, tocar/mantener…). Sigue la sintaxis estándar de ZMK,
// que es la de devicetree pasada por el preprocesador de C:
// - quita los comentarios y aplica los #define, también los que son plantillas con
//   parámetros (como `MACRO(nombre, …)`, que mucha gente usa para escribir macros);
// - el keymap es el nodo con `compatible = "zmk,keymap"`; cada hijo es una capa, en orden;
// - un comportamiento propio es un nodo con `compatible = "zmk,behavior-…"` y etiqueta.
// No sabe nada de un teclado concreto: sirve para el .keymap de cualquier usuario.

export type Binding = {
  comportamiento: string; // «&kp», «&mo», «&mcr_git»…
  parametros: string[]; // «LC(C)», «1»…
  original: string; // tal como estaba escrito, para mostrarlo si no se reconoce
};

type CapaLeida = {
  nodo: string; // «default_layer»
  nombre: string; // display-name o label, o el nombre del nodo
  bindings: Binding[];
};

type ComportamientoPropio = {
  tipo: string; // «macro», «hold-tap», «tap-dance», «mod-morph»…
  // Los comportamientos que usa por dentro (hold-tap: [mantener, tocar]; mod-morph y
  // tap-dance: cada opción completa, con sus parámetros)
  bindings: Binding[];
};

export type KeymapLeido = {
  capas: CapaLeida[];
  propios: Record<string, ComportamientoPropio>;
};

export class ErrorKeymap extends Error {}

// ---------- Preprocesador ----------

// Quita los comentarios /* … */ y // …, sin tocar lo que va entre comillas
function quitarComentarios(texto: string): string {
  let salida = "";
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '"') {
      const fin = finDeCadena(texto, i);
      salida += texto.slice(i, fin + 1);
      i = fin;
    } else if (c === "/" && texto[i + 1] === "*") {
      const fin = texto.indexOf("*/", i + 2);
      i = fin < 0 ? texto.length : fin + 1;
      salida += " ";
    } else if (c === "/" && texto[i + 1] === "/") {
      const fin = texto.indexOf("\n", i);
      i = fin < 0 ? texto.length : fin - 1;
    } else salida += c;
  }
  return salida;
}

function finDeCadena(texto: string, inicio: number): number {
  for (let i = inicio + 1; i < texto.length; i++) {
    if (texto[i] === "\\") i++;
    else if (texto[i] === '"') return i;
  }
  return texto.length - 1;
}

type Definicion = { parametros: string[] | null; cuerpo: string };

// Saca las directivas (#define, #include, #if…) y guarda los #define
function separarDirectivas(texto: string): { codigo: string; definiciones: Map<string, Definicion> } {
  const definiciones = new Map<string, Definicion>();
  // Una barra al final de la línea la continúa en la siguiente
  const lineas = texto.replace(/\\\r?\n/g, " ").split(/\r?\n/);
  const codigo: string[] = [];
  for (const linea of lineas) {
    const directiva = /^\s*#\s*(\w+)\s*(.*)$/.exec(linea);
    if (!directiva) {
      codigo.push(linea);
      continue;
    }
    if (directiva[1] !== "define") continue;
    const def = /^(\w+)(\(([^)]*)\))?\s*(.*)$/.exec(directiva[2]);
    if (!def) continue;
    definiciones.set(def[1], {
      parametros: def[2] ? def[3].split(",").map((p) => p.trim()).filter(Boolean) : null,
      cuerpo: def[4].trim(),
    });
  }
  return { codigo: codigo.join("\n"), definiciones };
}

// Parte «a, f(b, c), d» en sus argumentos, respetando paréntesis y comillas
function partirArgumentos(texto: string): string[] {
  const argumentos: string[] = [];
  let nivel = 0;
  let actual = "";
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '"') {
      const fin = finDeCadena(texto, i);
      actual += texto.slice(i, fin + 1);
      i = fin;
      continue;
    }
    if (c === "(") nivel++;
    if (c === ")") nivel--;
    if (c === "," && nivel === 0) {
      argumentos.push(actual.trim());
      actual = "";
    } else actual += c;
  }
  argumentos.push(actual.trim());
  return argumentos;
}

// Sustituye los parámetros de una plantilla, con # (a texto) y ## (pegar)
function sustituir(def: Definicion, argumentos: string[]): string {
  const valor = new Map(def.parametros!.map((p, i) => [p, argumentos[i] ?? ""]));
  // «#x» (a texto), pero no el «##» de pegar: ni el primero ni el segundo de los dos «#»
  let cuerpo = def.cuerpo.replace(/#\s*(\w+)/g, (todo, p: string, desde: number, texto: string) =>
    valor.has(p) && texto[desde - 1] !== "#" ? JSON.stringify(valor.get(p)) : todo,
  );
  cuerpo = cuerpo.replace(/\b\w+\b/g, (p) => (valor.has(p) ? valor.get(p)! : p));
  return cuerpo.replace(/\s*##\s*/g, "");
}

// Aplica los #define al código (fuera de las comillas), hasta que no quede nada por expandir
function expandir(codigo: string, definiciones: Map<string, Definicion>): string {
  for (let vuelta = 0; vuelta < 20; vuelta++) {
    let cambio = false;
    let salida = "";
    for (let i = 0; i < codigo.length; ) {
      const c = codigo[i];
      if (c === '"') {
        const fin = finDeCadena(codigo, i);
        salida += codigo.slice(i, fin + 1);
        i = fin + 1;
        continue;
      }
      const palabra = /^[A-Za-z_]\w*/.exec(codigo.slice(i));
      if (!palabra || (i > 0 && /\w/.test(codigo[i - 1]))) {
        salida += c;
        i++;
        continue;
      }
      const nombre = palabra[0];
      const def = definiciones.get(nombre);
      let fin = i + nombre.length;
      if (def && def.parametros === null) {
        salida += def.cuerpo;
        cambio = true;
      } else if (def && def.parametros !== null) {
        // Plantilla: solo si va seguida de sus argumentos entre paréntesis
        let j = fin;
        while (/\s/.test(codigo[j] ?? "")) j++;
        if (codigo[j] !== "(") {
          salida += nombre;
        } else {
          let nivel = 0;
          let k = j;
          for (; k < codigo.length; k++) {
            if (codigo[k] === '"') k = finDeCadena(codigo, k);
            else if (codigo[k] === "(") nivel++;
            else if (codigo[k] === ")" && --nivel === 0) break;
          }
          salida += sustituir(def, partirArgumentos(codigo.slice(j + 1, k)));
          fin = k + 1;
          cambio = true;
        }
      } else salida += nombre;
      i = fin;
    }
    codigo = salida;
    if (!cambio) return codigo;
  }
  return codigo;
}

// ---------- Devicetree ----------

type Nodo = {
  nombre: string;
  etiqueta?: string;
  propiedades: Record<string, string>;
  hijos: Nodo[];
};

// Lee el contenido de un nodo desde `i` hasta su «}» (o el final del texto)
function leerBloque(texto: string, i: number, nodo: Nodo): number {
  while (i < texto.length) {
    while (/\s|;/.test(texto[i] ?? "")) i++;
    if (i >= texto.length) return i;
    if (texto[i] === "}") return i + 1;

    // La cabecera: hasta «=», «{», «;» o «}» fuera de comillas, <…> y paréntesis
    let nivel = 0;
    let j = i;
    for (; j < texto.length; j++) {
      const c = texto[j];
      if (c === '"') j = finDeCadena(texto, j);
      else if (c === "(" || c === "<") nivel++;
      else if (c === ")" || c === ">") nivel--;
      else if (nivel <= 0 && (c === "=" || c === "{" || c === ";" || c === "}")) break;
    }
    const cabecera = texto.slice(i, j).trim();
    const c = texto[j];

    if (c === "=") {
      // Propiedad: el valor llega hasta el «;»
      let k = j + 1;
      nivel = 0;
      for (; k < texto.length; k++) {
        const d = texto[k];
        if (d === '"') k = finDeCadena(texto, k);
        else if (d === "(" || d === "<") nivel++;
        else if (d === ")" || d === ">") nivel--;
        else if (d === ";" && nivel <= 0) break;
      }
      nodo.propiedades[cabecera] = texto.slice(j + 1, k).trim();
      i = k + 1;
    } else if (c === "{") {
      const m = /^(?:([\w-]+)\s*:\s*)?(.+)$/s.exec(cabecera);
      const hijo: Nodo = { nombre: m?.[2]?.trim() ?? cabecera, etiqueta: m?.[1], propiedades: {}, hijos: [] };
      nodo.hijos.push(hijo);
      i = leerBloque(texto, j + 1, hijo);
    } else if (c === ";") {
      if (cabecera) nodo.propiedades[cabecera] = "";
      i = j + 1;
    } else {
      // «}» sin cerrar la cabecera (texto que no es devicetree): se descarta
      return j + 1;
    }
  }
  return i;
}

function recorrer(nodo: Nodo, visitar: (n: Nodo) => void) {
  visitar(nodo);
  nodo.hijos.forEach((h) => recorrer(h, visitar));
}

const cadena = (valor: string | undefined) => /^"(.*)"$/s.exec(valor?.trim() ?? "")?.[1];

// «<&kp A &mo 1>» → bindings. Un binding empieza en «&»; lo que sigue son sus parámetros
function leerBindings(valor: string): Binding[] {
  const fichas: string[] = [];
  let actual = "";
  let nivel = 0;
  for (const c of valor.replace(/[<>]/g, " ").replace(/,/g, " ")) {
    if (c === "(") nivel++;
    if (c === ")") nivel--;
    if (/\s/.test(c) && nivel <= 0) {
      if (actual) fichas.push(actual);
      actual = "";
    } else actual += c;
  }
  if (actual) fichas.push(actual);

  const bindings: Binding[] = [];
  for (const ficha of fichas) {
    if (ficha.startsWith("&")) bindings.push({ comportamiento: ficha, parametros: [], original: ficha });
    else if (bindings.length) {
      const ultimo = bindings[bindings.length - 1];
      ultimo.parametros.push(ficha);
      ultimo.original += " " + ficha;
    }
  }
  return bindings;
}

// ---------- Lectura ----------

// Lee el texto de un .keymap. Lanza ErrorKeymap si no encuentra un keymap de ZMK.
export function leerKeymap(texto: string): KeymapLeido {
  const { codigo, definiciones } = separarDirectivas(quitarComentarios(texto));
  const raiz: Nodo = { nombre: "", propiedades: {}, hijos: [] };
  leerBloque(expandir(codigo, definiciones), 0, raiz);

  let keymap: Nodo | undefined;
  const propios: Record<string, ComportamientoPropio> = {};
  recorrer(raiz, (n) => {
    const compatible = cadena(n.propiedades.compatible) ?? "";
    if (compatible === "zmk,keymap") keymap ??= n;
    const tipo = /^zmk,behavior-(.+)$/.exec(compatible)?.[1];
    if (tipo && n.etiqueta) {
      propios[n.etiqueta] = { tipo, bindings: leerBindings(n.propiedades.bindings ?? "") };
    }
  });
  if (!keymap) throw new ErrorKeymap('No es un .keymap de ZMK: no tiene el nodo con compatible = "zmk,keymap".');

  const capas = keymap.hijos
    .filter((n) => n.propiedades.bindings !== undefined)
    .map((n) => ({
      nodo: n.nombre,
      nombre: cadena(n.propiedades["display-name"]) ?? cadena(n.propiedades.label) ?? n.nombre,
      bindings: leerBindings(n.propiedades.bindings),
    }));
  if (!capas.length) throw new ErrorKeymap("El keymap no tiene capas.");
  return { capas, propios };
}
