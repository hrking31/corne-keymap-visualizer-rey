import type { Practica } from "../../practica/practica";
import type { Fase, Final } from "../../practica/usePractica";
import type { Marca } from "../../practica/records";

type Props = {
  fase: Fase;
  practica: Practica | null;
  final: Final | null;
  // Al terminar, la marca se ve unos segundos; después solo «Nueva ronda»
  marcaVisible: boolean;
  formato: (m: Marca) => string;
  onNuevaRonda: () => void;
};

// Los avisos de cada paso
const AVISOS: Partial<Record<Fase, string>> = {
  sinGrupo: "Elige qué practicar",
  sinTeclado: "Pulsa cualquier tecla",
  conectado: "¡Teclado conectado!",
  listo: "Pulsa una tecla para empezar",
  cuenta: "¡Empieza la ronda!",
};

// Cuántas letras tiene la primera línea del título: en el móvil la letra se ajusta para que
// quepa en una línea (editor.css, --letras). 0 si solo queda el botón
export function letrasDelTitulo({ fase, practica, final, marcaVisible, formato }: Omit<Props, "onNuevaRonda">): number {
  const largo = (texto: string) => [...texto].length;
  if (fase === "fin") {
    if (!final || !marcaVisible) return 0;
    return largo(final.nuevoRecord || !final.mejorAntes ? "¡Nuevo récord!" : `Ronda: ${formato(final.marca)}`);
  }
  if (fase !== "ronda" || !practica) return largo(AVISOS[fase] ?? "");
  if (practica.enOrden) return practica.objetivos.length;
  return largo(`Pulsa: ${practica.objetivos[practica.actual].texto}`);
}

// Lo que dice el título mientras se practica: el paso de la ronda, la tecla que se pide (en
// naranja) o el texto que se escribe; y al terminar la marca con «Nueva ronda», que se queda
// sola a los pocos segundos. En el móvil la marca va en dos partes (editor.css)
export default function TituloPractica({ fase, practica, final, marcaVisible, formato, onNuevaRonda }: Props) {
  if (fase !== "ronda" && fase !== "fin") return <>{AVISOS[fase]}</>;
  if (!practica) return <>{AVISOS.listo}</>;

  // ENT en el teclado hace lo mismo
  const nueva = (
    <button type="button" className="boton-principal nueva-ronda" onClick={onNuevaRonda}>
      Nueva ronda
    </button>
  );
  if (fase === "fin" && final && !marcaVisible) return nueva;
  if (fase === "fin" && final) {
    return (
      <>
        {final.nuevoRecord || !final.mejorAntes ? (
          <span className="pide">¡Nuevo récord!</span>
        ) : (
          `Ronda: ${formato(final.marca)}`
        )}
        <span className="fin-separa">{final.nuevoRecord || !final.mejorAntes ? " " : " · "}</span>
        <span className="fin-detalle">
          {final.nuevoRecord || !final.mejorAntes ? formato(final.marca) : `Récord: ${formato(final.mejorAntes)}`}
          {nueva}
        </span>
      </>
    );
  }

  // Palabras y frases: lo escrito en naranja; la letra que toca, subrayada
  if (practica.enOrden) {
    const letras = practica.objetivos.map((o) => o.texto);
    return (
      <span className="frase">
        <span className="hecha">{letras.slice(0, practica.hechas).join("")}</span>
        <span className="toca">{letras[practica.hechas]}</span>
        {letras.slice(practica.hechas + 1).join("")}
      </span>
    );
  }

  return (
    <>
      Pulsa: <span className="pide">{practica.objetivos[practica.actual].texto}</span>
    </>
  );
}
