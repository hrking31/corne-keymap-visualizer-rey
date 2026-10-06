import { useState } from "react";
import { idioma } from "../i18n";
import { guardarEleccion, hayEleccion, navegadorEnEspanol, rutaEnIdioma } from "../i18n/idioma";

// Siempre en inglés: es para quien no lee español. Mismos textos que hernandorey.
const AVISO = {
  etiqueta: "Language",
  texto: "This site is also available in English.",
  accion: "View in English",
  cerrar: "Close",
};

const navegador = () => navigator.languages ?? [navigator.language];

// Sugiere el inglés a quien entra en español con el navegador en otro idioma.
// No redirige: manda el enlace que se compartió. Se cierra para siempre al
// elegir idioma o al tocar la X.
export default function AvisoIdioma() {
  const [abierto, setAbierto] = useState(
    () => idioma === "es" && !navegadorEnEspanol(navegador()) && !hayEleccion(),
  );

  if (!abierto) return null;

  const cerrar = () => {
    guardarEleccion("es");
    setAbierto(false);
  };

  return (
    <aside className="lang-notice" lang="en" aria-label={AVISO.etiqueta}>
      <p>{AVISO.texto}</p>
      <a href={rutaEnIdioma("en")} hrefLang="en" onClick={() => guardarEleccion("en")}>
        {AVISO.accion}
      </a>
      <button type="button" aria-label={AVISO.cerrar} onClick={cerrar}>
        ×
      </button>
    </aside>
  );
}
