
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("texto");
  if (!contenedor) return;

  // 1. PREPARACIÓN: Envolvemos el texto suelto en etiquetas para que el CSS funcione
  const prepararTexto = () => {
    const nodos = Array.from(contenedor.childNodes);
    let grupo = [];

    nodos.forEach((nodo) => {
      if (nodo.nodeName === "BR" || nodo.nodeName === "UL" || nodo.nodeName === "OL") {
        envolverGrupo(grupo);
        grupo = [];
      } else {
        if (nodo.textContent.trim() !== "") {
          grupo.push(nodo);
        }
      }
    });
    envolverGrupo(grupo);
  };

  const envolverGrupo = (nodos) => {
    if (nodos.length === 0) return;
    const span = document.createElement("span");
    span.className = "linea-lectura";
    nodos[0].parentNode.insertBefore(span, nodos[0]);
    nodos.forEach(n => span.appendChild(n));
  };

  prepararTexto();

  // 2. SELECCIÓN DE ELEMENTOS (Spans creados + LIs de las listas)
  const elementos = Array.from(contenedor.querySelectorAll(".linea-lectura, li"));
  let indice = -1;

  // 3. FUNCIÓN DE RESALTADO
  function actualizarResaltado(nuevoIndice) {
    elementos.forEach(el => el.classList.remove("segment-highlight"));

    if (nuevoIndice >= elementos.length) nuevoIndice = 0;
    if (nuevoIndice < 0) nuevoIndice = elementos.length - 1;

    indice = nuevoIndice;
    const activo = elementos[indice];

    if (activo) {
      activo.classList.add("segment-highlight");
      activo.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // ✅ (OPCIONAL) iniciar en el primer segmento al cargar
  // actualizarResaltado(0);

  // 4. EVENTOS DE TECLADO
  document.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(e.target.tagName) || e.target.isContentEditable) return;

    if (e.key === "Tab") {
      e.preventDefault();
      e.shiftKey ? actualizarResaltado(indice - 1) : actualizarResaltado(indice + 1);
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      actualizarResaltado(indice - 1);
    }
  });

  // ===============================
  // ✅ 5. EVENTOS TOUCH (CELULAR/TABLET)
  // ===============================

  // ✅ Tap para avanzar / doble tap para retroceder
  let lastTapTime = 0;

  contenedor.addEventListener("click", (e) => {
    // No interferir si tocó un link o selecciona texto
    if (e.target.closest("a, button, input, textarea, select")) return;

    const now = Date.now();
    const isDoubleTap = (now - lastTapTime) < 320;
    lastTapTime = now;

    if (isDoubleTap) {
      actualizarResaltado(indice - 1); // doble tap = retrocede
    } else {
      actualizarResaltado(indice + 1); // tap = avanza
    }
  });

  // ✅ Swipe izquierda/derecha
  let xStart = null;
  let yStart = null;

  contenedor.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    xStart = e.touches[0].clientX;
    yStart = e.touches[0].clientY;
  }, { passive: true });

  contenedor.addEventListener("touchend", (e) => {
    if (xStart === null || yStart === null) return;

    const xEnd = e.changedTouches[0].clientX;
    const yEnd = e.changedTouches[0].clientY;

    const dx = xEnd - xStart;
    const dy = yEnd - yStart;

    // reset
    xStart = null;
    yStart = null;

    // ✅ Umbrales (ajustables)
    const SWIPE_MIN = 50;     // mínimo desplazamiento horizontal
    const VERTICAL_MAX = 80;  // si se mueve mucho vertical, lo ignoramos

    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dy) > VERTICAL_MAX) return;

    if (dx < 0) {
      // swipe a la izquierda -> avanzar
      actualizarResaltado(indice + 1);
    } else {
      // swipe a la derecha -> retroceder
      actualizarResaltado(indice - 1);
    }
  }, { passive: true });
});

