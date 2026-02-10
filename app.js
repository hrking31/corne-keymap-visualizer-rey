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

    keyDiv.addEventListener("mouseenter", (e) => {
      modalTitle.innerText = key.label;
      modalDesc.innerText = key.desc;
      modalLayer.innerText = currentLayer;
      modal.classList.remove("hidden");
    });

    keyDiv.addEventListener("mousemove", (e) => {
      modal.style.left = e.clientX + 15 + "px";
      modal.style.top = e.clientY + 15 + "px";
    });

    keyDiv.addEventListener("mouseleave", () => {
      modal.classList.add("hidden");
    });

    if (index < 21) leftSide.appendChild(keyDiv);
    else rightSide.appendChild(keyDiv);
  });
}

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

renderKeyboard();
