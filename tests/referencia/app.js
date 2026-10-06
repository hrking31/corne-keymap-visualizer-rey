import { keymap } from "./data.js";
import { dividirBloques, dividirFilas, tieneAccion } from "./teclado.js";

const leftSide = document.getElementById("left-side");
const rightSide = document.getElementById("right-side");
const modal = document.getElementById("info-modal");

const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalLayer = document.getElementById("modal-layer");
const modalExtra = document.getElementById("modal-extra");

let currentLayer = "BASE";

const layerNames = {
  BASE: "Capa Base",
  NUM: "Capa Números",
  SYM: "Capa Símbolos",
  NAV: "Capa Navegación",
  LED: "Capa Led RGB",
  FUN: "Capa Funciones",
};

function renderKeyboard() {
  leftSide.innerHTML = "";
  rightSide.innerHTML = "";

  const { izquierdo, derecho } = dividirBloques(keymap[currentLayer]);

  const processHand = (container, data, isMirrored) => {
    dividirFilas(data, isMirrored).forEach((rowData) => {
      rowData.forEach((key) => {
        const keyDiv = document.createElement("div");
        keyDiv.className = "key";
        keyDiv.innerText = key.label;

        if (key.clase) {
          keyDiv.classList.add(key.clase);
        }

        container.appendChild(keyDiv);

        if (!tieneAccion(key)) return;

        keyDiv.addEventListener("mouseenter", () => {
          modalTitle.innerText = key.label;
          modalDesc.innerText = key.desc;

          modalLayer.innerText = layerNames[currentLayer] || currentLayer;

          if (key.extra) {
            modalExtra.innerText = key.extra;
            modalExtra.style.display = "block";
          } else {
            modalExtra.innerText = "";
            modalExtra.style.display = "none";
          }

          modal.classList.remove("hidden", "from-top", "from-bottom");

          if (window.innerWidth <= 768) {
            const isBottomPart = container === rightSide;
            modal.classList.add(isBottomPart ? "from-bottom" : "from-top");
          }
        });

        keyDiv.addEventListener("mousemove", (e) => {
          if (window.innerWidth > 768) {
            const halfScreen = window.innerWidth / 2;
            const offset = 20;

            if (e.clientX > halfScreen) {
              modal.style.left = e.clientX - modal.offsetWidth - offset + "px";
            } else {
              modal.style.left = e.clientX + offset + "px";
            }
            modal.style.top = e.clientY - 100 + "px";
          }
        });

        keyDiv.addEventListener("mouseleave", () => {
          modal.classList.add("hidden");
          modal.style.left = "";
          modal.style.top = "";
          modalExtra.innerText = "";
        });
      });
    });
  };

  processHand(leftSide, izquierdo, true);
  processHand(rightSide, derecho, false);
}

document.querySelectorAll(".layer-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLayer = btn.dataset.layer;

    document
      .querySelectorAll(".layer-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    renderKeyboard();
  });
});

renderKeyboard();
