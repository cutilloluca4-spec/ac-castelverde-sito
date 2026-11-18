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
  // tabella lunga (es. Prima squadra, con tutto lo staff): da computer il pulsante
  // "Calendario e risultati" va sotto la foto, con il fondo in linea con la tabella
  const righe = (s.annate ? 1 : 0) + 1 + (s.staff || []).length + (s.sponsor ? 1 : 0);
  const lunga = righe >= 9;
  const pulsante = partite.length
    ? `<a class="btn btn--nero w-full tablet:w-auto mt-8 ${lunga ? `computer:mt-0 computer:self-end computer:justify-self-start computer:row-start-2 ${i % 2 ? "computer:col-start-2" : "computer:col-start-1"}` : ""}" href="calendario.html?squadra=${s.id}">Calendario e risultati ${ICONE.freccia}</a>`
    : "";
  // colonne da computer: la foto (e il pulsante, se la tabella è lunga) a sinistra nelle
  // squadre pari, a destra nelle dispari; il testo nell'altra colonna, alto due righe
  const colFoto = i % 2 ? "computer:col-start-2" : "computer:col-start-1";
  const colTesto = i % 2 ? "computer:col-start-1" : "computer:col-start-2";
  const rosa = s.rosa
    ? `<div class="mt-16" data-carosello>` +
        `<div class="flex items-end justify-between gap-4 mb-6 tablet:mb-8">` +
          `<h3 class="titolo-display text-[40px] tablet:text-[56px]">La <span class="titolo-contorno">rosa</span></h3>` +
          `<div class="hidden tablet:flex gap-2"><button type="button" class="${CLASSI_FRECCIA}" data-scorri-indietro aria-label="Indietro">⟵</button><button type="button" class="${CLASSI_FRECCIA}" data-scorri-avanti aria-label="Avanti">⟶</button></div>` +
        `</div>` +
        `<div class="scorri scorri--griglia" tabindex="0" aria-label="Rosa: ${testo(s.nome)} (si scorre con le frecce della tastiera)">${s.rosa.map(htmlCardGiocatore).join("")}</div>` +
      `</div>`
    : "";

  return (
    `<section id="${s.id}" class="scroll-mt-[128px] lg:scroll-mt-[150px] py-16 computer:py-24 ${scura ? "trama-grigia" : ""}">` +
      `<div class="max-w-acc mx-auto px-4 tablet:px-6">` +
        // da computer l'angolo in alto della foto è alla stessa altezza delle lettere del nome
        // della squadra: margine = etichetta (16px × 1,8) + 20px (mt-5) + dove inizia la maiuscola
        // nel titolo da 96px (--cima-maiuscole, in design-system/colori.css) + 24px dell'angolo
        // la colonna della foto è più larga (1.3fr): a sinistra nelle squadre pari, a destra nelle dispari
        `<div class="grid grid-cols-1 gap-8 tablet:gap-12 ${i % 2 ? "computer:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]" : "computer:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"} computer:grid-rows-[auto_1fr] computer:gap-x-16 computer:gap-y-0 items-start">` +
          // due angoli a "L" (in alto a sinistra e in basso a destra), staccati dalla foto:
          // grigi su fondo chiaro, rossi sulla trama (dove il grigio non si vedrebbe).
          // Da computer la foto è a filo del contenuto (computer:mx-0), allineata a "La rosa"
          // e alle card sotto; gli angoli sporgono nel margine della pagina
          `<div class="angoli ${scura ? "angoli--rossi" : ""} m-6 computer:mx-0 computer:mt-[calc(28.8px+20px+96px*var(--cima-maiuscole)+24px)] computer:row-start-1 ${colFoto}" data-entra>` +
            `<img class="block w-full aspect-[4/3] object-cover" src="${testo(s.immagine)}" alt="${testo(s.nome)}" loading="lazy" />` +
          `</div>` +
          `<div class="computer:row-start-1 computer:row-span-2 ${colTesto}" data-entra data-ritardo=".1">` +
            `<span class="pillola text-[min(16px,4.3vw)] tablet:text-[16px]">${testo(s.campionato)}</span>` +
            `<h2 class="titolo-display text-[56px] tablet:text-[96px] mt-5">${testo(s.nome)}</h2>` +
            `<p class="text-[17px] leading-relaxed mt-4 max-w-[520px]">${testo(s.descrizione)}</p>` +
            `<ul class="list-none p-0 m-0 mt-8 bg-white px-5 text-[15px]">` +
              (s.annate ? `<li class="flex flex-col gap-0.5 tablet:flex-row tablet:justify-between tablet:gap-4 py-3"><span class="text-acc-testo-2">Annate</span><strong>${testo(s.annate)}</strong></li>` : "") +
              `<li class="flex flex-col gap-0.5 tablet:flex-row tablet:justify-between tablet:gap-4 py-3 ${s.annate ? "border-t border-acc-linea" : ""}"><span class="text-acc-testo-2">Allenamenti</span><strong class="tablet:text-right">${testo(s.allenamenti)}</strong></li>` +
              staff +
              (s.sponsor ? `<li class="flex flex-col gap-0.5 tablet:flex-row tablet:justify-between tablet:gap-4 py-3 border-t border-acc-linea"><span class="text-acc-testo-2">Sponsor</span><strong class="text-acc-rosso-scuro">${testo(s.sponsor)}</strong></li>` : "") +
            `</ul>` +
            (lunga ? "" : pulsante) +
          `</div>` +
          (lunga ? pulsante : "") +
        `</div>` +
        rosa +
      `</div>` +
    `</section>`
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
