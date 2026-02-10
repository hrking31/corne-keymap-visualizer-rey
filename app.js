const leftSide = document.getElementById("left-side");
const rightSide = document.getElementById("right-side");
const modal = document.getElementById("info-modal");

const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalLayer = document.getElementById("modal-layer");

let currentLayer = "DEF";

function renderKeyboard() {
  leftSide.innerHTML = "";
  rightSide.innerHTML = "";

  const keys = keymap[currentLayer];

  keys.forEach((key, index) => {
    const keyDiv = document.createElement("div");
    keyDiv.className = "key";
    keyDiv.innerText = key.label;

    // index < 21 es la mitad superior en móvil, index >= 21 es la inferior
    const isBottomPart = index >= 21;

    keyDiv.addEventListener("mouseenter", () => {
      modalTitle.innerText = key.label;
      modalDesc.innerText = key.desc;
      modalLayer.innerText = currentLayer;

      modal.classList.remove("hidden", "from-top", "from-bottom");

      if (window.innerWidth <= 768) {
        // Si toco la parte de abajo, el modal va arriba
        modal.classList.add(isBottomPart ? "from-bottom" : "from-top");
      }
    });

    keyDiv.addEventListener("mousemove", (e) => {
      if (window.innerWidth > 768) {
        const halfScreen = window.innerWidth / 2;
        const offset = 20; // Espacio entre el cursor y el modal

        if (e.clientX > halfScreen) {
          // DERECHA: el modal abre a la IZQUIERDA del cursor
          modal.style.left = e.clientX - modal.offsetWidth - offset + "px";
        } else {
          // IZQUIERDA: el modal abre a la DERECHA del cursor
          modal.style.left = e.clientX + offset + "px";
        }

        // Posición vertical (siempre arriba del cursor)
        modal.style.top = e.clientY - 100 + "px";
      }
    });

    keyDiv.addEventListener("mouseleave", () => {
      modal.classList.add("hidden");
      modal.style.left = "";
      modal.style.top = "";
    });

    if (index < 21) leftSide.appendChild(keyDiv);
    else rightSide.appendChild(keyDiv);
  });
}

// Eventos de botones de capa
document.querySelectorAll(".layer-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const layerName = btn.innerText.toUpperCase();
    currentLayer = layerName === "BASE" ? "DEF" : layerName;

    document
      .querySelectorAll(".layer-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    renderKeyboard();
  });
});

// Inicialización
renderKeyboard();
