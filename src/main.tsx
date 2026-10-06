import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { idioma, t } from "./i18n";
import "./style.css";

document.documentElement.lang = idioma;
document.title = t.tituloPagina;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
