/* ==================================================================
   A.C. Castelverde — js/pagine/home.js
   Disegna le parti della Home che vengono dai dati:
     avviaApertura()          01 · apertura animata (in js/pagine/home-apertura.js)
     disegnaProssimaPartita() 02 · striscia rossa con conto alla rovescia
     disegnaUltimeNotizie()   03 · 1 notizia grande + 4 piccole
     disegnaPartite()         04 · schede per squadra + carosello partite
     disegnaSquadre()         05 · le quattro squadre della stagione
     disegnaRosa()            06 · carosello dei giocatori della prima squadra
     disegnaNumeri()          07 · "Il club in numeri"
     disegnaSocial()          08 · pulsante Instagram
   Le sezioni fisse (Dal 1987) sono scritte in index.html.
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();
  disegnaProssimaPartita();
  disegnaUltimeNotizie();
  disegnaPartite();
  disegnaSquadre();
  disegnaRosa();
  disegnaNumeri();
  disegnaSocial();
  avviaAnimazioni();
  avviaApertura();
});

/* 01 · APERTURA: tutto in js/pagine/home-apertura.js → avviaApertura() */

/* 02 · PROSSIMA PARTITA ------------------------------------------ */
function disegnaProssimaPartita() {
  const box = document.getElementById("prossimaPartita");
  const p = prossimePartite("prima-squadra")[0] || prossimePartite()[0];
  if (!p) { box.parentElement.remove(); return; }

  const s = squadreInOrdine(p, "w-[88px] h-[88px] object-contain");   // stemmi più grandi che nelle card
  const squadra = trovaSquadra(p.squadra);
  const nome = "titolo-display text-[20px] leading-none tracking-[.02em]";

  box.innerHTML =
    '<div class="grid computer:grid-cols-[auto_1.2fr_auto] items-center gap-8 computer:gap-12">' +
      '<div data-entra>' +
        `<p class="text-[13px] font-semibold uppercase tracking-[.14em] flex items-center gap-2"><span class="lampeggia w-2.5 h-2.5 rounded-full bg-white"></span>${testo(squadra.nome)}</p>` +
        '<h2 id="titoloProssima" class="titolo-display text-[56px] tablet:text-[72px] mt-2">Match <span class="titolo-contorno titolo-contorno--bianco">day</span></h2>' +
        `<span class="pillola text-[16px] mt-3">${testo(p.competizione)}</span>` +
      "</div>" +
      `<div class="${FASCIA.riga} text-acc-nero px-4 py-6 shadow-[8px_10px_0_rgba(0,0,0,.18)]" data-entra data-ritardo=".1">` +
        `<div class="${FASCIA.squadra}">${s[0].stemma}<span class="${nome}">${testo(s[0].nome)}</span></div>` +
        '<span class="font-acc-titoli font-bold text-[72px] leading-[.8]">V</span>' +
        `<div class="${FASCIA.squadra}">${s[1].stemma}<span class="${nome}">${testo(s[1].nome)}</span></div>` +
      "</div>" +
      '<div class="flex flex-col gap-4" data-entra data-ritardo=".2">' +
        `<p class="titolo-display text-[32px]">${dataLunga(p.data)} · ${testoOra(p)}</p>` +
        `<p class="flex items-start gap-2 text-[14px] max-w-[300px]"><span class="w-5 h-5 flex-none">${ICONE.luogo}</span>${testo(p.campo)}</p>` +
        '<div id="contoRovescia" class="flex gap-5 titolo-display text-[40px]" aria-live="off"></div>' +
        '<div class="flex flex-wrap items-center gap-3">' +
          `<a href="calendario.html?squadra=${p.squadra}" class="btn btn--bianco self-start">Calendario</a>` +
          htmlAvvisoCalendario(true) +
        "</div>" +
      "</div>" +
    "</div>";

  // Conto alla rovescia (giorni, ore, minuti), aggiornato ogni 30 secondi.
  // Se l'orario non è ancora fissato (es. "orario ufficiale") si contano solo i giorni.
  const ora = /^\d{1,2}:\d{2}$/.test(p.ora) ? p.ora.split(":") : null;
  const inizio = leggiData(p.data);
  if (ora) inizio.setHours(+ora[0], +ora[1], 0, 0);
  else inizio.setHours(0, 0, 0, 0);   // leggiData mette mezzogiorno: per contare i giorni serve la mezzanotte
  const conto = document.getElementById("contoRovescia");
  function aggiorna() {
    const cella = function (n, etichetta) {
      // min-w-[2ch]: le cifre non fanno "ballare" il conto quando cambiano
      return `<span class="flex flex-col items-center min-w-[2ch] text-center leading-none"><span class="inline-block min-w-[2ch] text-center">${String(n).padStart(2, "0")}</span><small class="text-[12px] font-acc-testo font-semibold uppercase tracking-[.1em] mt-1">${etichetta}</small></span>`;
    };
    if (!ora) {
      const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
      const g = Math.max(0, Math.round((inizio - oggi) / 864e5));
      conto.innerHTML = cella(g, g === 1 ? "giorno" : "giorni");
      return;
    }
    const diff = Math.max(0, inizio - new Date());
    const g = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60;
    conto.innerHTML = cella(g, "giorni") + cella(h, "ore") + cella(m, "min");
  }
  aggiorna();
  setInterval(aggiorna, 30000);
}

/* 03 · ULTIME NOTIZIE --------------------------------------------- */
function disegnaUltimeNotizie() {
  const box = document.getElementById("ultimeNotizie");
  // la card grande è la notizia "in evidenza" più recente (apertura: true), poi le altre in ordine di data
  const tutte = notizieOrdinate();
  const evidenza = tutte.find(function (n) { return n.apertura; }) || tutte[0];
  const lista = [evidenza].concat(tutte.filter(function (n) { return n !== evidenza; })).slice(0, 5);
  box.innerHTML = lista.map(function (n, i) {
    return i === 0
      ? `<div class="tablet:col-span-2 computer:row-span-2">${htmlCardNotizia(n, "grande")}</div>`
      : `<div>${htmlCardNotizia(n, "normale")}</div>`;
  }).join("");
}

/* 04 · PARTITE ---------------------------------------------------- */
function disegnaPartite() {
  const schede = document.getElementById("schedePartite");
  const fila = document.getElementById("filaPartite");
  document.getElementById("avvisoPartite").innerHTML = htmlAvvisoCalendario();

  const squadre = squadreConPartite();
  schede.innerHTML = squadre.map(function (s, i) {
    return `<button type="button" role="tab" aria-selected="${i === 0}" class="${CLASSI_SCHEDA}${i === 0 ? " is-attiva" : ""}" data-squadra="${s.id}">${testo(s.nome)}</button>`;
  }).join("");

  function mostra(id) {
    const partite = partiteDi(id);
    // si parte dalla prima partita ancora da giocare
    const primaDaGiocare = partite.findIndex(function (p) { return !giocata(p); });
    // su smartphone le partite stanno una sotto l'altra: se ne mostrano 4
    // (l'ultimo risultato e le 3 successive), le altre restano nascoste (max-tablet:hidden)
    const da = primaDaGiocare < 0 ? Math.max(0, partite.length - 4) : Math.max(0, primaDaGiocare - 1);
    fila.innerHTML = partite.map(function (p, k) {
      const html = htmlCardPartita(p);
      return k >= da && k < da + 4 ? html : html.replace('<article class="', '<article class="max-tablet:hidden ');
    }).join("") +
      `<a href="calendario.html?squadra=${id}" class="${LARGHEZZA_CARD_PARTITA} flex-none flex tablet:grid items-center justify-center tablet:place-items-center tablet:content-center gap-4 bg-acc-nero text-white no-underline p-6 tablet:p-8 text-center hover:bg-acc-rosso transition-colors">` +
        `<span class="titolo-display text-[34px] tablet:text-[44px]">Calendario<br class="hidden tablet:block"> completo</span><span class="w-8 h-8 tablet:w-10 tablet:h-10">${ICONE.freccia}</span>` +
      "</a>";
    // dopo che la pagina ha finito di impaginarsi (font e immagini), così la card è allineata giusta
    function allinea() {
      const card = fila.children[Math.max(0, primaDaGiocare - 1)];
      if (!card) { fila.scrollLeft = 0; return; }
      // posizione della card dentro la fila (misurata sullo schermo), meno il margine interno
      const distanza = card.getBoundingClientRect().left - fila.getBoundingClientRect().left;
      fila.scrollLeft += distanza - parseFloat(getComputedStyle(fila).paddingLeft || 0);
    }
    allinea();
    requestAnimationFrame(allinea);
    if (document.fonts) document.fonts.ready.then(allinea);
    const carosello = fila.closest("[data-carosello]");
    if (carosello && carosello.aggiornaFrecce) carosello.aggiornaFrecce();
  }

  schede.addEventListener("click", function (e) {
    const b = e.target.closest("button[data-squadra]");
    if (!b) return;
    schede.querySelectorAll("button").forEach(function (x) {
      x.classList.toggle("is-attiva", x === b);
      x.setAttribute("aria-selected", x === b);
    });
    mostra(b.dataset.squadra);
  });

  if (squadre.length) mostra(squadre[0].id);
}

/* 05 · LE QUATTRO SQUADRE ---------------------------------------- */
function disegnaSquadre() {
  document.getElementById("quattroSquadre").innerHTML = SQUADRE.map(function (s) {
    const prossima = prossimePartite(s.id)[0];
    return (
      `<a href="squadre.html#${s.id}" class="${CARD_NOTIZIA.card}">` +
        `<div class="${CARD_NOTIZIA.foto} aspect-[4/3]"><img class="${CARD_NOTIZIA.img}" src="${testo(s.immagine)}" alt="" loading="lazy" /></div>` +
        '<div class="flex flex-col gap-3 p-5 tablet:p-6 flex-1">' +
          `<span class="pillola pillola--piccola self-start">${testo(s.categoria)}</span>` +
          `<h3 class="${CARD_NOTIZIA.titolo} text-[38px] tablet:text-[44px] mt-1">${testo(s.nome)}</h3>` +
          `<p class="text-[14px] text-acc-testo-2 leading-snug">${testo(s.campionato)}</p>` +
          (prossima
            ? `<p class="text-[13px] font-semibold border-t border-acc-linea pt-3 mt-auto"><span class="text-acc-rosso-scuro uppercase tracking-[.08em] text-[12px] block mb-0.5">Prossima partita</span>${dataCorta(prossima.data)} · ${prossima.casa ? "Castelverde - " + testo(prossima.avversario) : testo(prossima.avversario) + " - Castelverde"}</p>`
            : '<p class="link-freccia text-[16px] mt-auto pt-3">La squadra</p>') +
        "</div>" +
      "</a>"
    );
  }).join("");
}

/* 06 · ROSA ------------------------------------------------------- */
function disegnaRosa() {
  const squadra = trovaSquadra("prima-squadra");
  if (!squadra || !squadra.rosa) return;
  // su smartphone la rosa è una griglia di 2 colonne con i primi 6 giocatori; "Vedi tutta la rosa" porta agli altri
  document.getElementById("filaGiocatori").innerHTML = squadra.rosa.map(function (g, k) {
    const html = htmlCardGiocatore(g);
    return k < 6 ? html : html.replace('<article class="', '<article class="max-tablet:hidden ');
  }).join("");
  const mister = squadra.staff.find(function (p) { return p.ruolo === "Allenatore"; });
  if (mister) document.getElementById("allenatore").innerHTML = `<span class="text-acc-testo-2">All.</span> ${testo(mister.nome)}`;
}

/* 07 · NUMERI ----------------------------------------------------- */
function disegnaNumeri() {
  document.getElementById("numeri").innerHTML = CLUB.numeri.map(function (n) {
    return (
      '<div class="bg-white px-6 py-8 computer:py-10">' +
        `<p class="titolo-display text-[64px] computer:text-[84px] text-acc-rosso" data-conta="${n.valore}" data-suffisso="${n.suffisso || ""}">${n.valore}${n.suffisso || ""}</p>` +
        `<p class="text-[13px] font-semibold uppercase tracking-[.1em] mt-2">${testo(n.etichetta)}</p>` +
      "</div>"
    );
  }).join("");
}

/* 08 · SOCIAL ----------------------------------------------------- */
function disegnaSocial() {
  const box = document.getElementById("pulsantiSocial");
  let html = "";
  if (CLUB.social.instagram) html += `<a class="btn btn--rosso" href="${CLUB.social.instagram}" target="_blank" rel="noopener"><span class="w-5 h-5">${ICONE.instagram}</span>Instagram</a>`;
  box.innerHTML = html;
}
