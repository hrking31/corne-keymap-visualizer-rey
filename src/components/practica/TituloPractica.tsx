import type { Practica } from "../../practica/practica";
import type { Fase, Final } from "../../practica/usePractica";
import type { Marca } from "../../practica/records";

type Props = {
  fase: Fase;
  practica: Practica | null;
  final: Final | null;
  formato: (m: Marca) => string;
  onNuevaRonda: () => void;
};

// Lo que dice el título mientras se practica: el paso de la ronda, la tecla que se pide (en
// naranja) o el texto que se escribe, y al terminar la marca con «Nueva ronda» al lado
export default function TituloPractica({ fase, practica, final, formato, onNuevaRonda }: Props) {
  if (fase === "sinTeclado") return <>Pulsa cualquier tecla</>;
  if (fase === "conectado") return <>¡Teclado conectado!</>;
  if (fase === "cuenta" || !practica) return <>¡Empieza la ronda!</>;

  if (fase === "fin" && final) {
    return (
      <>
        {final.nuevoRecord || !final.mejorAntes ? (
          <>
            <span className="pide">¡Nuevo récord!</span> {formato(final.marca)}
          </>
        ) : (
          `Ronda: ${formato(final.marca)} · Récord: ${formato(final.mejorAntes)}`
        )}
        {/* ENT en el teclado hace lo mismo */}
        <button type="button" className="boton-principal nueva-ronda" onClick={onNuevaRonda}>
          Nueva ronda
        </button>
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
