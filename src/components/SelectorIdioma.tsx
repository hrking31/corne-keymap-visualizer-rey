import { idioma, t } from "../i18n";
import { guardarEleccion, rutaEnIdioma } from "../i18n/idioma";

// Botón fijo en la esquina: muestra el idioma al que se pasa (EN o ES). Es un enlace
// y no un botón, para que los buscadores también encuentren la versión /en.
export default function SelectorIdioma() {
  const destino = idioma === "en" ? "es" : "en";

  return (
    <a
      className="lang-switch"
      href={rutaEnIdioma(destino)}
      hrefLang={destino}
      lang={destino}
      aria-label={t.cambiarIdioma}
      title={t.cambiarIdioma}
      onClick={() => guardarEleccion(destino)}
    >
      {destino.toUpperCase()}
    </a>
  );
}
