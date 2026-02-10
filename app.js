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
  FN: "Capa Funciones",
  // Agrega aquí más si tienes otras capas
};

function renderKeyboard() {
  leftSide.innerHTML = "";
  rightSide.innerHTML = "";

  const keys = keymap[currentLayer];

  const rightHandData = keys.slice(0, 21);
  const leftHandData = keys.slice(21, 42);

  const processHand = (container, data, isMirrored) => {
    const rows = [
      data.slice(0, 6),
      data.slice(6, 12),
      data.slice(12, 18),
      data.slice(18, 21),
    ];

    rows.forEach((rowData) => {
      if (isMirrored) rowData.reverse();

      rowData.forEach((key) => {
        const keyDiv = document.createElement("div");
        keyDiv.className = "key";
        keyDiv.innerText = key.label;

        keyDiv.addEventListener("mouseenter", () => {
          modalTitle.innerText = key.label;
          modalDesc.innerText = key.desc;

          // AQUÍ USAMOS EL DICCIONARIO:
          // Si el nombre existe en el diccionario, lo usa. Si no, usa el original.
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

        container.appendChild(keyDiv);
      });
    });
  };

  processHand(leftSide, rightHandData, true);
  processHand(rightSide, leftHandData, false);
}

document.querySelectorAll(".layer-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const layerName = btn.innerText.toUpperCase();
    currentLayer = layerName === "BASE" ? "BASE" : layerName;

    document
      .querySelectorAll(".layer-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    renderKeyboard();
  });
});

renderKeyboard();
