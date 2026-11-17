/* ==================================================================
   A.C. Castelverde — js/pagine/notizie.js
   Pagina Notizie: filtri per categoria + elenco a pagine.
   Si può aprire già filtrata: notizie.html?categoria=Storia
   ================================================================== */

const NOTIZIE_PER_VOLTA = 9;    // quante notizie mostrare prima di "Carica altre"

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();

  const filtri = document.getElementById("filtriNotizie");
  const elenco = document.getElementById("elencoNotizie");
  const altre = document.getElementById("altreNotizie");
  let categoria = parametro("categoria") || "";
  let quante = NOTIZIE_PER_VOLTA;

  filtri.innerHTML = ["", ...CATEGORIE_NOTIZIE].map(function (c) {
    return `<button type="button" role="tab" class="${CLASSI_SCHEDA}" data-categoria="${testo(c)}">${c || "Tutte"}</button>`;
  }).join("");

  function disegna() {
    const lista = notizieOrdinate().filter(function (n) { return !categoria || n.categoria === categoria; });
    elenco.innerHTML = lista.length
      ? lista.slice(0, quante).map(function (n) { return htmlCardNotizia(n, "normale"); }).join("")
      : htmlVuoto("Nessuna notizia in questa categoria.");
    altre.classList.toggle("hidden", lista.length <= quante);
    filtri.querySelectorAll("button").forEach(function (b) {
      const attivo = b.dataset.categoria === categoria;
      b.classList.toggle("is-attiva", attivo);
      b.setAttribute("aria-selected", attivo);
    });
    mostraFiltroScelto("smooth");
  }

  // su smartphone la riga dei filtri scorre di lato: il filtro scelto resta in vista
  function mostraFiltroScelto(modo) {
    const scelto = filtri.querySelector(".is-attiva");
    if (!scelto) return;
    const dx = scelto.getBoundingClientRect().left - filtri.getBoundingClientRect().left;
    filtri.scrollTo({ left: filtri.scrollLeft + dx - (filtri.clientWidth - scelto.offsetWidth) / 2, behavior: modo });
  }
  // all'apertura (es. notizie.html?categoria=Storia) quando la pagina è impaginata del tutto
  window.addEventListener("load", function () { mostraFiltroScelto("instant"); });

  filtri.addEventListener("click", function (e) {
    const b = e.target.closest("button");
    if (!b) return;
    categoria = b.dataset.categoria;
    quante = NOTIZIE_PER_VOLTA;
    // aggiorna l'indirizzo senza ricaricare, così il filtro si può condividere
    history.replaceState(null, "", categoria ? `?categoria=${encodeURIComponent(categoria)}` : location.pathname);
    disegna();
  });

  altre.addEventListener("click", function () {
    quante += NOTIZIE_PER_VOLTA;
    disegna();
  });

  disegna();
  avviaAnimazioni();
});
