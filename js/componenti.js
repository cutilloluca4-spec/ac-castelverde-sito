/* ==================================================================
   A.C. Castelverde — js/componenti.js
   I pezzi di pagina che si ripetono, scritti UNA volta sola.
   Ogni funzione riceve un dato (una notizia, una partita, un
   giocatore…) e restituisce il suo HTML come testo.
   Le pagine (js/pagine/*.js) li mettono al posto giusto.

     htmlCardNotizia(notizia, variante)   card di una notizia
     htmlStemma(partita, lato, classe)    stemma nostro o dell'avversario
     htmlCardPartita(partita)             card stile "Full time / Match day"
     htmlRigaRisultato(partita)           riga compatta di un risultato
     htmlCardGiocatore(giocatore)         card della rosa
     htmlClassifica(classifica, limite)   tabella o collegamento alla classifica
     htmlAvvisoCalendario()               avviso "date provvisorie"
     htmlVuoto(messaggio)                 riquadro "niente da mostrare"
   ================================================================== */

const STEMMA_CASTELVERDE = "assets/logo/stemma-120.png";

/* Classi Tailwind dei pezzi usati in più funzioni (o in più pagine):
   scritte qui una volta sola. Per cambiare, ad esempio, la dimensione
   degli stemmi nelle card partita basta modificare FASCIA.stemma. */

// Card notizia (usata anche per le card squadra in Home): "group" serve
// agli effetti al passaggio del mouse (group-hover: sui figli)
const CARD_NOTIZIA = {
  card: "group flex flex-col no-underline text-acc-inchiostro bg-white",
  // la barra rossa che cresce in basso sulla foto (after:) e lo zoom della foto
  // (le proporzioni della foto, es. aspect-[3/2], si aggiungono dove si usa)
  foto: "relative overflow-hidden bg-acc-grigio after:absolute after:left-0 after:bottom-0 after:h-1.5 after:w-0 after:bg-acc-rosso after:transition-[width] after:duration-[400ms] group-hover:after:w-full",
  img: "w-full h-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]",
  titolo: "titolo-display transition-colors group-hover:text-acc-rosso-scuro"
};

// La fascia bianca del risultato: i due stemmi con il punteggio (o la "V") in mezzo
const FASCIA = {
  riga: "grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-white",
  squadra: "flex flex-col items-center gap-2 text-center",
  stemma: "w-[72px] h-[72px] object-contain",
  nome: "titolo-display text-[17px] leading-none tracking-[.02em]",
  punteggio: "titolo-display text-[64px] leading-[.8] tracking-[.02em] whitespace-nowrap pt-[.08em]",
  vs: "font-acc-titoli font-bold text-[56px] leading-[.8]"
};

// Larghezza delle card nei caroselli orizzontali
// (su smartphone le card stanno una sotto l'altra a tutta larghezza: niente carosello)
const LARGHEZZA_CARD_PARTITA = "w-full tablet:w-[min(82vw,360px)]";

// Le schede per scegliere squadra o categoria (Home, Calendario, Notizie, Squadre).
// La classe is-attiva la mette il JavaScript sulla scheda scelta: pillola rossa con testo bianco
// (come la voce attiva del menu da telefono).
// Il contenitore (.schede, in css/sito.css) le mette in fila e le fa andare a capo su smartphone.
const CLASSI_SCHEDA = "flex-none cursor-pointer border-0 rounded-full bg-transparent text-inherit no-underline font-acc-titoli font-bold uppercase text-[18px] tracking-[.03em] px-[18px] pt-[11px] pb-2 transition-[background-color,box-shadow] duration-200 hover:bg-black/6 [&.is-attiva]:bg-acc-rosso [&.is-attiva]:text-white [&.is-attiva]:hover:bg-acc-rosso";

// I pulsanti ⟵ ⟶ dei caroselli (disabled = siamo all'inizio o alla fine della fila)
const CLASSI_FRECCIA = "grid place-items-center w-12 h-12 cursor-pointer border-2 border-current bg-transparent text-inherit transition-colors hover:bg-acc-rosso hover:border-acc-rosso hover:text-white disabled:opacity-30 disabled:pointer-events-none";

// Colore dell'etichetta Vittoria / Pareggio / Sconfitta
const COLORE_ESITO = { V: "bg-acc-vittoria", N: "bg-acc-pareggio", P: "bg-acc-rosso" };

/* ---------- Notizie ---------- */

// variante: "grande" (prima card della Home), "normale", "orizzontale" (foto a sinistra da tablet in su).
// Mobile first: su smartphone tutte le card sono verticali (foto sopra, testo sotto).
function htmlCardNotizia(n, variante) {
  variante = variante || "normale";
  const indirizzo = `notizia.html?id=${encodeURIComponent(n.id)}`;
  const grande = variante === "grande";
  const orizzontale = variante === "orizzontale";

  return (
    `<a href="${indirizzo}" class="${CARD_NOTIZIA.card} h-full${orizzontale ? " tablet:flex-row" : ""}">` +
      `<div class="${CARD_NOTIZIA.foto} aspect-[16/9] tablet:aspect-[3/2]${grande ? " computer:aspect-auto computer:flex-1" : ""}${orizzontale ? " tablet:w-[44%] tablet:flex-none" : ""}">` +
        `<img class="${CARD_NOTIZIA.img}" src="${testo(n.immagine)}" alt="" loading="lazy" />` +
      "</div>" +
      `<div class="flex flex-col gap-2 tablet:gap-3 ${grande ? "p-5 tablet:p-6 computer:p-8" : "p-5"}">` +
        '<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold uppercase tracking-[.08em]">' +
          `<span class="text-acc-rosso-scuro">${testo(n.categoria)}</span>` +
          `<span class="text-acc-testo-2">${dataLunga(n.data)}</span>` +
        "</div>" +
        `<h3 class="${CARD_NOTIZIA.titolo} ${grande ? "text-[32px] tablet:text-[40px] computer:text-[52px]" : "text-[26px] tablet:text-[28px]"}">${testo(n.titolo)}</h3>` +
        (grande || orizzontale ? `<p class="text-[15px] leading-relaxed text-acc-testo-2">${testo(n.sommario)}</p>` : "") +
      "</div>" +
    "</a>"
  );
}

/* ---------- Partite ---------- */

// lato: "nostro" o "loro"
function htmlStemma(p, lato, classe) {
  classe = classe || FASCIA.stemma;
  if (lato === "nostro") {
    return `<img class="${classe}" src="${STEMMA_CASTELVERDE}" alt="" />`;
  }
  if (p.stemma) {
    return `<img class="${classe}" src="${testo(p.stemma)}" alt="" loading="lazy" />`;
  }
  return `<span class="scudo-iniziali" aria-hidden="true">${iniziali(p.avversario)}</span>`;
}

// Le due squadre nell'ordine giusto: chi gioca in casa a sinistra
// classeStemma (facoltativa) cambia la misura degli stemmi
function squadreInOrdine(p, classeStemma) {
  const noi = { nome: "Castelverde", stemma: htmlStemma(p, "nostro", classeStemma), gol: p.golNostri };
  const loro = { nome: p.avversario, stemma: htmlStemma(p, "loro", classeStemma), gol: p.golLoro };
  return p.casa ? [noi, loro] : [loro, noi];
}

const ETICHETTE_ESITO = { V: "Vittoria", N: "Pareggio", P: "Sconfitta" };

// Card nello stile delle grafiche "Full time" (giocata) e "Match day" (da giocare)
function htmlCardPartita(p) {
  const squadra = trovaSquadra(p.squadra);
  const s = squadreInOrdine(p);
  const fatta = giocata(p);
  const e = esito(p);

  const centro = fatta
    ? `<span class="${FASCIA.punteggio}">${s[0].gol} - ${s[1].gol}</span>`
    : `<span class="${FASCIA.vs}">V</span>`;

  return (
    `<article class="${LARGHEZZA_CARD_PARTITA} flex-none flex flex-col bg-acc-grigio-chiaro">` +
      `<div class="relative px-5 pt-5 pb-7 ${fatta ? "trama-grigia" : "trama-rossa text-white"}">` +
        '<div class="flex items-start justify-between gap-3">' +
          `<p class="titolo-display text-[30px]">${fatta ? "Full time" : "Match day"}</p>` +
          (fatta
            ? `<span class="${COLORE_ESITO[e]} text-white text-[12px] font-bold uppercase tracking-[.08em] px-2.5 py-1">${ETICHETTE_ESITO[e]}</span>`
            : `<span class="text-[12px] font-bold uppercase tracking-[.08em] bg-white text-acc-nero px-2.5 py-1">${p.casa ? "In casa" : "Trasferta"}</span>`) +
        "</div>" +
        `<p class="titolo-display text-[20px] mt-1 opacity-80">${testo(squadra ? squadra.nome : "")}</p>` +
      "</div>" +
      `<div class="${FASCIA.riga} px-4 py-5 -mt-3 relative">` +
        `<div class="${FASCIA.squadra}">${s[0].stemma}<span class="${FASCIA.nome}">${testo(s[0].nome)}</span></div>` +
        centro +
        `<div class="${FASCIA.squadra}">${s[1].stemma}<span class="${FASCIA.nome}">${testo(s[1].nome)}</span></div>` +
      "</div>" +
      '<div class="flex flex-col items-center gap-3 px-5 pt-5 pb-6 text-center">' +
        `<span class="pillola pillola--piccola">${testo(p.competizione)}</span>` +
        `<p class="titolo-display text-[22px] mt-1">${dataCorta(p.data)} · ${testoOra(p)}</p>` +
        (p.nota ? `<span class="text-[12px] font-bold uppercase tracking-[.08em] bg-acc-nero text-white px-2.5 py-1">${testo(p.nota)}</span>` : "") +
        `<p class="text-[13px] text-acc-testo-2 leading-snug">${testo(p.campo)}</p>` +
        (p.marcatori ? htmlMarcatori(p) : "") +
      "</div>" +
    "</article>"
  );
}

function htmlMarcatori(p) {
  const nostri = (p.marcatori.nostri || []).join(", ");
  const loro = (p.marcatori.loro || []).join(", ");
  return (
    '<p class="text-[13px] leading-snug border-t border-acc-linea pt-3 w-full">' +
      `<span class="inline-block w-4 h-4 align-[-3px] mr-1 text-acc-nero">${ICONE.pallone}</span>` +
      (nostri ? `<strong>${testo(nostri)}</strong>` : "") +
      (nostri && loro ? '<span class="text-acc-testo-2"> · </span>' : "") +
      (loro ? `<span class="text-acc-testo-2">${testo(loro)}</span>` : "") +
    "</p>"
  );
}

// Riga compatta per la lista dei risultati (pagina Calendario)
function htmlRigaRisultato(p) {
  const s = squadreInOrdine(p);
  const e = esito(p);
  return (
    '<li class="grid grid-cols-1 tablet:grid-cols-[110px_1fr_auto] items-center gap-x-5 gap-y-2 py-4 border-t border-acc-linea">' +
      `<div class="titolo-display text-[18px] leading-tight">${dataCorta(p.data)}<br class="hidden tablet:block"><span class="tablet:hidden"> · </span><span class="text-acc-testo-2 text-[15px]">${testo(p.competizione)}</span></div>` +
      '<div class="flex items-center gap-3 tablet:gap-4 min-w-0">' +
        `<span class="titolo-display text-[19px] tablet:text-[24px] leading-none text-right flex-1 min-w-0 break-words">${testo(s[0].nome)}</span>` +
        `<span class="titolo-display text-[30px] bg-acc-nero text-white px-3 pt-1.5 pb-0.5 whitespace-nowrap">${s[0].gol} - ${s[1].gol}</span>` +
        `<span class="titolo-display text-[19px] tablet:text-[24px] leading-none flex-1 min-w-0 break-words">${testo(s[1].nome)}</span>` +
      "</div>" +
      `<span class="${COLORE_ESITO[e]} justify-self-start text-white text-[12px] font-bold uppercase tracking-[.08em] px-2.5 py-1">${ETICHETTE_ESITO[e]}</span>` +
    "</li>"
  );
}

// Riga compatta di una partita da giocare (resto del calendario)
function htmlRigaCalendario(p) {
  return (
    '<li class="grid grid-cols-1 tablet:grid-cols-[150px_1fr_auto] items-center gap-x-5 gap-y-2 py-4 border-t border-acc-linea">' +
      `<div class="titolo-display text-[19px] leading-tight">${dataCorta(p.data)}<br class="hidden tablet:block"><span class="tablet:hidden"> · </span><span class="text-acc-testo-2 text-[15px]">${testoOra(p)}</span></div>` +
      '<div class="flex items-center gap-3 min-w-0">' +
        htmlStemma(p, "loro", "w-9 h-9 object-contain flex-none").replace("scudo-iniziali", "scudo-iniziali !w-9 !h-9 !text-[13px] !border-2 flex-none") +
        `<div class="min-w-0"><p class="titolo-display text-[22px] leading-none">${p.casa ? "Castelverde - " + testo(p.avversario) : testo(p.avversario) + " - Castelverde"}</p>` +
        `<p class="text-[13px] text-acc-testo-2 mt-1 truncate">${testo(p.campo)}</p></div>` +
      "</div>" +
      `<span class="justify-self-start text-[12px] font-bold uppercase tracking-[.08em] px-2.5 py-1 ${p.casa ? "bg-acc-rosso text-white" : "bg-acc-grigio-chiaro"}">${p.casa ? "In casa" : "Trasferta"} · ${testo(p.giornata)}ª</span>` +
    "</li>"
  );
}

/* ---------- Giocatori ---------- */

function htmlCardGiocatore(g) {
  const foto = g.foto || "assets/img/segnaposto-persona.png";
  const nomeCompleto = (g.nome ? g.nome + " " : "") + g.cognome;
  return (
    '<article class="group relative w-full tablet:w-[min(64vw,260px)] flex-none flex flex-col">' +
      '<div class="relative aspect-[4/5] overflow-hidden trama-grigia">' +
        (g.fascia ? `<span class="absolute top-2.5 right-2.5 tablet:top-4 tablet:right-4 z-1 grid place-items-center w-8 h-8 tablet:w-9 tablet:h-9 rounded-full bg-acc-rosso text-white titolo-display text-[18px] pt-1" title="${g.fascia === "C" ? "Capitano" : "Vice capitano"}">${g.fascia}</span>` : "") +
        `<img class="absolute inset-0 w-full h-full object-contain object-bottom transition-transform duration-500 ease-[ease] group-hover:-translate-y-1.5 group-hover:scale-[1.03]" src="${testo(foto)}" alt="" loading="lazy" />` +
      "</div>" +
      '<div class="bg-white px-3 pt-3 pb-2.5 tablet:px-5 tablet:pt-4 tablet:pb-3 transition-colors duration-[250ms] ease-[ease] group-hover:bg-acc-rosso group-hover:text-white">' +
        // il nome c'è sempre (anche vuoto) così tutte le card hanno la stessa altezza
        `<p class="titolo-display text-[15px] tablet:text-[18px] opacity-70 min-h-[1em]">${testo(g.nome)}</p>` +
        `<h3 class="titolo-display text-[24px] tablet:text-[34px] break-words">${testo(g.cognome)}</h3>` +
        `<p class="text-[12px] font-semibold uppercase tracking-[.08em] mt-1 opacity-70 truncate">${testo(g.ruolo || "Prima squadra")}</p>` +
        (g.numero ? `<span class="sr-only">Numero ${g.numero}, ${testo(nomeCompleto)}</span>` : "") +
      "</div>" +
    "</article>"
  );
}

/* ---------- Classifica ---------- */

function htmlClassifica(c, limite) {
  if (!c.squadre || !c.squadre.length) {
    return (
      '<div class="flex flex-col items-start gap-4 bg-white p-6">' +
        `<p class="titolo-display text-[30px]">Classifica ${testo(c.titolo)}</p>` +
        '<p class="text-[15px] text-acc-testo-2 leading-relaxed">La classifica aggiornata è disponibile sul sito ufficiale dei risultati.</p>' +
        `<a class="btn btn--nero" href="${testo(c.linkUfficiale)}" target="_blank" rel="noopener">Vedi la classifica ${ICONE.freccia}</a>` +
      "</div>"
    );
  }
  // celle della tabella: intestazione (th) e dati (td); la 2ª colonna (squadra) è allineata a sinistra
  const TH = "font-acc-titoli font-bold text-[15px] uppercase text-acc-testo-2 px-2 py-2.5";
  const td = function (noi) {
    return `px-2 py-3 border-t text-[15px] ${noi ? "bg-acc-rosso text-white font-bold border-acc-rosso" : "border-acc-linea"}`;
  };
  const soloTablet = " hidden tablet:table-cell";

  const righe = c.squadre.slice(0, limite || c.squadre.length).map(function (r, i) {
    const stemma = r.noi ? STEMMA_CASTELVERDE : r.stemma;
    const nome = (stemma ? `<img class="inline-block w-6 h-6 object-contain align-middle mr-2.5" src="${testo(stemma)}" alt="" loading="lazy" />` : "") + testo(r.nome);
    const cella = td(r.noi);
    return "<tr>" +
      `<td class="${cella}">${i + 1}</td>` +
      `<td class="${cella} text-left whitespace-nowrap">${nome}</td>` +
      `<td class="${cella}"><strong>${r.pt}</strong></td>` +
      `<td class="${cella}">${r.g}</td>` +
      `<td class="${cella}${soloTablet}">${r.v}</td>` +
      `<td class="${cella}${soloTablet}">${r.n}</td>` +
      `<td class="${cella}${soloTablet}">${r.p}</td>` +
      `<td class="${cella}${soloTablet}">${r.gf}:${r.gs}</td>` +
    "</tr>";
  }).join("");
  return (
    '<div class="bg-white p-4 tablet:p-6 overflow-x-auto">' +
      '<table class="w-full border-collapse tabular-nums text-center"><thead><tr>' +
        `<th class="${TH}">#</th><th class="${TH} text-left">Squadra</th><th class="${TH}">Pt</th><th class="${TH}">G</th>` +
        `<th class="${TH}${soloTablet}">V</th><th class="${TH}${soloTablet}">N</th><th class="${TH}${soloTablet}">P</th><th class="${TH}${soloTablet}">Gol</th>` +
      `</tr></thead><tbody>${righe}</tbody></table>` +
      `<p class="text-[12px] text-acc-testo-2 mt-3">${c.aggiornata ? "Calcolata dai risultati al " + dataLunga(c.aggiornata) + " · " : ""}<a class="underline" href="${testo(c.linkUfficiale)}" target="_blank" rel="noopener">classifica ufficiale</a></p>` +
    "</div>"
  );
}

/* ---------- Avvisi ---------- */

// "Risultati aggiornati il …" (AGGIORNAMENTO lo scrive strumenti/aggiorna_risultati.py in partite.js)
// suFondoScuro: true per il testo bianco (striscia rossa della Home)
function htmlAvvisoCalendario(suFondoScuro) {
  // il pallino colorato prima del testo (before:): giallo = provvisorio, verde = aggiornato
  const classi = "inline-flex items-center gap-2 text-[12px] font-semibold tracking-[.02em] " +
    (suFondoScuro ? "text-white" : "text-acc-testo-2") +
    " before:w-2 before:h-2 before:rounded-full ";
  if (CLUB.avvisoCalendario) return `<p class="${classi}before:bg-acc-avviso">${testo(CLUB.avvisoCalendario)}</p>`;
  if (typeof AGGIORNAMENTO !== "undefined") return `<p class="${classi}before:bg-acc-vittoria">Risultati aggiornati il ${testo(AGGIORNAMENTO)}</p>`;
  return "";
}

// "ore 14:30", oppure "orario ufficiale" quando l'ora non è ancora fissata
function testoOra(p) {
  return /\d/.test(p.ora || "") ? `ore ${testo(p.ora)}` : testo(p.ora || "orario da definire");
}

function htmlVuoto(messaggio) {
  return `<div class="bg-white p-8 text-center text-acc-testo-2 text-[15px]">${testo(messaggio)}</div>`;
}

/* ---------- Dirigenti ---------- */

// grande: true per la scheda del presidente
function htmlCardDirigente(d, grande) {
  const foto = d.foto || "assets/img/segnaposto-persona.png";
  const ruoli = d.ruoli.map(function (r, i) {
    // whitespace-normal: un ruolo lungo ("Responsabile del settore giovanile") va a capo invece di uscire dalla card
    return `<span class="pillola pillola--piccola !whitespace-normal text-left${i === 0 && grande ? " pillola--rossa" : ""}">${testo(r)}</span>`;
  }).join("");
  const scrivi = d.email ? `<a class="btn btn--nero self-start mt-2" href="mailto:${testo(d.email)}"><span class="w-5 h-5">${ICONE.posta}</span>Scrivi</a>` : "";

  if (grande) {
    return (
      '<article class="grid gap-10 computer:grid-cols-[minmax(0,420px)_1fr] items-center">' +
        '<div class="cornice angolo-rosso angolo-rosso--doppio m-6 trama-grigia aspect-[4/5] relative overflow-hidden">' +
          `<img class="absolute inset-x-0 bottom-0 w-full h-[92%] object-cover object-top${d.foto ? "" : " !object-contain object-bottom"}" src="${testo(foto)}" alt="${testo(d.nome)}" />` +
        "</div>" +
        '<div class="flex flex-col items-start gap-5">' +
          `<div class="flex flex-wrap gap-3">${ruoli}</div>` +
          `<h2 class="titolo-display text-[72px] tablet:text-[120px]">${testo(d.nome).replace(" ", "<br>")}</h2>` +
          `<p class="titolo-display text-[26px] text-acc-rosso">${testo(CLUB.nomeCompleto)}</p>` +
          scrivi +
        "</div>" +
      "</article>"
    );
  }
  return (
    '<article class="flex flex-col bg-white shadow-acc-card">' +
      '<div class="relative aspect-square tablet:aspect-[4/5] overflow-hidden trama-grigia">' +
        `<img class="absolute inset-x-0 bottom-0 w-full h-[90%] ${d.foto ? "object-cover object-top" : "object-contain object-bottom"}" src="${testo(foto)}" alt="${testo(d.nome)}" loading="lazy" />` +
      "</div>" +
      '<div class="flex flex-col items-start gap-2 tablet:gap-3 p-5 tablet:p-6 min-w-0">' +
        `<div class="flex flex-wrap gap-1.5 tablet:gap-2">${ruoli}</div>` +
        `<h3 class="titolo-display text-[38px] tablet:text-[44px] mt-1">${testo(d.nome)}</h3>` +
        scrivi +
      "</div>" +
    "</article>"
  );
}
