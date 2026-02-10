const leftSide = document.getElementById("left-side");
const rightSide = document.getElementById("right-side");
const modal = document.getElementById("info-modal");

// Función para crear las teclas
function buildHalf(container, startId, count) {
  for (let i = startId; i < startId + count; i++) {
    const keyId = "K" + i;
    const keyDiv = document.createElement("div");
    keyDiv.className = "key";
    keyDiv.innerText = keymap[keyId]?.label || "—";

    keyDiv.onmouseenter = (e) => {
      if (keymap[keyId]) {
        document.getElementById("modal-title").innerText = keymap[keyId].label;
        document.getElementById("modal-desc").innerText = keymap[keyId].desc;
        modal.classList.remove("hidden");
      }
    };

    keyDiv.onmousemove = (e) => {
      modal.style.left = e.clientX + 15 + "px";
      modal.style.top = e.clientY + 15 + "px";
    };

    keyDiv.onmouseleave = () => modal.classList.add("hidden");

    container.appendChild(keyDiv);
  }
}

// Dibujar Corne (Lado izquierdo 18 teclas + 3 pulgar)
buildHalf(leftSide, 1, 21);
buildHalf(rightSide, 22, 21);
