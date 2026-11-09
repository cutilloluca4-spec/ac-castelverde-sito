/* ==================================================================
   A.C. Castelverde — js/animazioni.js
   Le animazioni comuni a tutte le pagine (GSAP + ScrollTrigger).
   Le pagine le avviano con avviaAnimazioni(), DOPO aver disegnato
   i contenuti.

     1. Comparse         attributo data-entra    → l'elemento sale e compare
                         attributo data-entrano  → i figli compaiono uno dopo l'altro
     2. Contatori        attributo data-conta="1987" → il numero sale da 0
     3. Caroselli        .scorri + frecce data-scorri-indietro / data-scorri-avanti
     4. Linea del tempo  la riga rossa si riempie scorrendo (la storia in 3D è in js/pagine/societa.js)

   Animazioni spente: aggiungere ?statico all'indirizzo (utile per
   controllare i testi o importare la pagina in Figma), oppure attivare
   "riduci movimento" nelle impostazioni del sistema.
   ================================================================== */

const ANIMAZIONI_SPENTE =
  /[?&]statico/.test(location.search) ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  typeof gsap === "undefined";

function avviaAnimazioni() {
  preparaCaroselli();       // le frecce funzionano anche senza animazioni
  if (ANIMAZIONI_SPENTE) {
    document.documentElement.classList.remove("js-animazioni");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  animaComparse();
  animaContatori();
  animaLineaTempo();
}

// Esegue "azione" una volta sola, quando l'elemento entra nello schermo
function quandoEntra(elemento, azione, inizio) {
  ScrollTrigger.create({ trigger: elemento, start: inizio || "top 88%", once: true, onEnter: azione });
}

/* 1. COMPARSE ----------------------------------------------------- */
function animaComparse() {
  document.querySelectorAll("[data-entra]").forEach(function (el) {
    quandoEntra(el, function () {
      gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: "power3.out", delay: parseFloat(el.dataset.ritardo || 0) });
    });
  });
  document.querySelectorAll("[data-entrano]").forEach(function (gruppo) {
    quandoEntra(gruppo, function () {
      gsap.to(gruppo.children, { opacity: 1, y: 0, duration: .7, ease: "power3.out", stagger: .08 });
    });
  });
}

/* 2. CONTATORI ---------------------------------------------------- */
function animaContatori() {
  document.querySelectorAll("[data-conta]").forEach(function (el) {
    const fine = parseFloat(el.dataset.conta);
    const suffisso = el.dataset.suffisso || "";
    const partenza = fine > 1000 ? fine - 60 : 0;      // gli anni partono vicino, non da zero
    const valore = { n: partenza };
    el.textContent = partenza + suffisso;
    quandoEntra(el, function () {
      gsap.to(valore, {
        n: fine, duration: 1.6, ease: "power2.out",
        onUpdate: function () { el.textContent = Math.round(valore.n) + suffisso; }
      });
    });
  });
}

/* 3. CAROSELLI ---------------------------------------------------- */
// Struttura: un contenitore con data-carosello che contiene
//   un elemento .scorri (la fila che scorre)
//   due pulsanti data-scorri-indietro e data-scorri-avanti
function preparaCaroselli() {
  document.querySelectorAll("[data-carosello]").forEach(function (box) {
    const fila = box.querySelector(".scorri");
    const indietro = box.querySelector("[data-scorri-indietro]");
    const avanti = box.querySelector("[data-scorri-avanti]");
    if (!fila) return;

    function passo() {
      const primo = fila.firstElementChild;
      return primo ? primo.getBoundingClientRect().width + 20 : 300;
    }
    function aggiornaFrecce() {
      if (indietro) indietro.disabled = fila.scrollLeft < 5;
      if (avanti) avanti.disabled = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 5;
    }
    if (indietro) indietro.onclick = function () { fila.scrollBy({ left: -passo(), behavior: "smooth" }); };
    if (avanti) avanti.onclick = function () { fila.scrollBy({ left: passo(), behavior: "smooth" }); };
    fila.addEventListener("scroll", aggiornaFrecce, { passive: true });
    window.addEventListener("resize", aggiornaFrecce);
    aggiornaFrecce();
    box.aggiornaFrecce = aggiornaFrecce;   // usato quando la fila cambia contenuto
  });
}

/* 4. LINEA DEL TEMPO ---------------------------------------------- */
// La linea del tempo classica della pagina Società: scorrendo, la riga rossa si
// allunga lungo quella tratteggiata. Quando la storia è in 3D (.storia.con-3d,
// vedi js/pagine/societa.js) la linea non si vede e non serve animarla.
function animaLineaTempo() {
  const linea = document.querySelector(".linea-tempo");
  const progresso = document.querySelector(".linea-tempo__progresso");
  if (!linea || !progresso || linea.closest(".con-3d")) return;
  gsap.to(progresso, {
    height: "100%", ease: "none",
    scrollTrigger: { trigger: linea, start: "top 70%", end: "bottom 70%", scrub: 0.6 }
  });
}
