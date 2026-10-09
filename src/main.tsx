import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AvisoVersion from "./components/AvisoVersion";
import "./style.css";
import "./editor.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <AvisoVersion />
  </StrictMode>,
);
