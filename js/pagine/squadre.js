/* ==================================================================
   A.C. Castelverde — js/pagine/squadre.js
   Pagina Squadre: una scheda per ogni squadra di js/dati/squadre.js,
   con foto, campionato, staff, allenamenti, rosa (se c'è) e partite.
   Ogni scheda ha come indirizzo il suo id: squadre.html#juniores
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();

  document.getElementById("indiceSquadre").innerHTML = SQUADRE.map(function (s) {
    return `<a class="${CLASSI_SCHEDA}" href="#${s.id}">${testo(s.nome)}</a>`;
  }).join("");

  document.getElementById("elencoSquadre").innerHTML = SQUADRE.map(htmlSchedaSquadra).join("");

  evidenziaSquadraVisibile();
  vaiAllaSquadra();
  avviaAnimazioni();
});

function htmlSchedaSquadra(s, i) {
  const scura = i % 2 === 1;   // le schede si alternano: chiara / grigia
  const staff = (s.staff || []).map(function (p) {
    return `<li class="flex flex-col gap-0.5 tablet:flex-row tablet:justify-between tablet:gap-4 py-3 border-t border-acc-linea"><span class="text-acc-testo-2">${testo(p.ruolo)}</span><strong class="tablet:text-right">${testo(p.nome)}</strong></li>`;
  }).join("");

  const partite = partiteDi(s.id);
  const rosa = s.rosa
    ? '<div class="mt-16" data-carosello>' +
        '<div class="flex items-end justify-between gap-4 mb-6 tablet:mb-8">' +
          '<h3 class="titolo-display text-[40px] tablet:text-[56px]">La <span class="titolo-contorno">rosa</span></h3>' +
          `<div class="hidden tablet:flex gap-2"><button type="button" class="${CLASSI_FRECCIA}" data-scorri-indietro aria-label="Indietro">⟵</button><button type="button" class="${CLASSI_FRECCIA}" data-scorri-avanti aria-label="Avanti">⟶</button></div>` +
        "</div>" +
        `<div class="scorri scorri--griglia" tabindex="0" aria-label="Rosa: ${testo(s.nome)} (si scorre con le frecce della tastiera)">${s.rosa.map(htmlCardGiocatore).join("")}</div>` +
      "</div>"
    : "";

  return (
    `<section id="${s.id}" class="scroll-mt-[128px] lg:scroll-mt-[150px] py-16 computer:py-24 ${scura ? "trama-grigia" : ""}">` +
      '<div class="max-w-acc mx-auto px-4 tablet:px-6">' +
        '<div class="grid grid-cols-1 gap-8 tablet:gap-12 computer:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">' +
          `<div class="cornice angolo-rosso m-6 ${i % 2 ? "computer:order-2" : ""}" data-entra>` +
            `<img class="block w-full aspect-[4/3] object-cover" src="${testo(s.immagine)}" alt="${testo(s.nome)}" loading="lazy" />` +
          "</div>" +
          '<div data-entra data-ritardo=".1">' +
            `<span class="pillola text-[16px]">${testo(s.campionato)}</span>` +
            `<h2 class="titolo-display text-[56px] tablet:text-[96px] mt-5">${testo(s.nome)}</h2>` +
            `<p class="text-[17px] leading-relaxed mt-4 max-w-[520px]">${testo(s.descrizione)}</p>` +
            '<ul class="list-none p-0 m-0 mt-8 bg-white px-5 text-[15px]">' +
              (s.annate ? `<li class="flex flex-col gap-0.5 tablet:flex-row tablet:justify-between tablet:gap-4 py-3"><span class="text-acc-testo-2">Annate</span><strong>${testo(s.annate)}</strong></li>` : "") +
              `<li class="flex flex-col gap-0.5 tablet:flex-row tablet:justify-between tablet:gap-4 py-3 ${s.annate ? "border-t border-acc-linea" : ""}"><span class="text-acc-testo-2">Allenamenti</span><strong class="tablet:text-right">${testo(s.allenamenti)}</strong></li>` +
              staff +
              (s.sponsor ? `<li class="flex flex-col gap-0.5 tablet:flex-row tablet:justify-between tablet:gap-4 py-3 border-t border-acc-linea"><span class="text-acc-testo-2">Sponsor</span><strong class="text-acc-rosso-scuro">${testo(s.sponsor)}</strong></li>` : "") +
            "</ul>" +
            (partite.length ? `<a class="btn btn--nero w-full tablet:w-auto mt-8" href="calendario.html?squadra=${s.id}">Calendario e risultati ${ICONE.freccia}</a>` : "") +
          "</div>" +
        "</div>" +
        rosa +
      "</div>" +
    "</section>"
  );
}

// Clic su una scheda: la squadra si ferma subito sotto il menu e la barra delle schede.
// Il menu scendendo si accorcia (70 px su telefono, 82 da computer) e risalendo torna
// intero (108 / 120): lo spazio da lasciare dipende quindi dalla direzione.
function vaiAllaSquadra() {
  document.getElementById("indiceSquadre").addEventListener("click", function (e) {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;
    const sezione = document.querySelector(link.getAttribute("href"));
    if (!sezione) return;
    e.preventDefault();
    const computer = matchMedia("(min-width: 1024px)").matches;
    const barra = document.getElementById("barraSquadre").offsetHeight;
    const arrivo = sezione.getBoundingClientRect().top + window.scrollY;
    const scende = arrivo > window.scrollY;
    const menu = scende ? (computer ? 82 : 70) : (computer ? 120 : 108);
    window.scrollTo({ top: arrivo - menu - barra + 1, behavior: "smooth" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
}

// Nell'indice in alto si accende la squadra che si sta guardando
function evidenziaSquadraVisibile() {
  const pulsanti = document.querySelectorAll("#indiceSquadre a");
  const osserva = new IntersectionObserver(function (voci) {
    voci.forEach(function (v) {
      if (!v.isIntersecting) return;
      pulsanti.forEach(function (a) {
        a.classList.toggle("is-attiva", a.getAttribute("href") === `#${v.target.id}`);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  SQUADRE.forEach(function (s) { osserva.observe(document.getElementById(s.id)); });
}
