/* ==================================================================
   A.C. Castelverde — js/layout.js
   Le parti uguali in tutte le pagine, scritte UNA volta sola:
     1. Menu in alto        → dentro <div id="menu"></div>
     2. Partner             → dentro <div id="partner"></div>
     3. Footer              → dentro <div id="piede"></div>
     4. Comandi del menu    (si accorcia scorrendo, menu mobile, torna su)

   Per aggiungere una pagina al menu: aggiungi una riga a VOCI_MENU.
   La voce evidenziata è quella con lo stesso "id" scritto in
   <body data-pagina="...">.
   ================================================================== */

const VOCI_MENU = [
  { id: "home",       nome: "Home",       indirizzo: "index.html" },
  { id: "notizie",    nome: "Notizie",    indirizzo: "notizie.html" },
  { id: "squadre",    nome: "Squadre",    indirizzo: "squadre.html" },
  { id: "calendario", nome: "Calendario", indirizzo: "calendario.html" },
  { id: "societa",    nome: "Società",    indirizzo: "societa.html" },
  { id: "dirigenza",  nome: "Dirigenza",  indirizzo: "dirigenza.html" },
  { id: "contatti",   nome: "Contatti",   indirizzo: "contatti.html" }
];

function preparaLayout() {
  const pagina = document.body.dataset.pagina;
  disegnaMenu(pagina);
  disegnaPartner();
  disegnaPiede();
  preparaComandiMenu();
}

/* 1. MENU --------------------------------------------------------- */
function linkSocial(classe) {
  let html = "";
  if (CLUB.social.instagram) html += `<a class="${classe}" href="${CLUB.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONE.instagram}</a>`;
  return html;
}

function disegnaMenu(pagina) {
  const contenitore = document.getElementById("menu");
  if (!contenitore) return;

  // la riga rossa sotto la voce (after:): piena sulla pagina aperta, cresce al passaggio del mouse sulle altre
  const voci = VOCI_MENU.map(function (v) {
    const attiva = v.id === pagina;
    return `<a href="${v.indirizzo}" class="relative titolo-display text-[21px] text-acc-nero no-underline pt-1 transition-colors hover:text-acc-rosso-scuro ` +
      "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-1 after:bg-acc-rosso after:origin-left after:transition-transform after:duration-[250ms] " +
      (attiva ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100") + '"' +
      (attiva ? ' aria-current="page"' : "") + ">" + v.nome + "</a>";
  }).join("");

  const vociMobile = VOCI_MENU.map(function (v) {
    return `<a href="${v.indirizzo}" class="${v.id === pagina ? "is-attiva " : ""}titolo-display text-[44px] text-acc-nero no-underline">${v.nome}</a>`;
  }).join("");

  contenitore.innerHTML =
    '<header id="testata" class="menu fixed top-0 inset-x-0 z-50 bg-white">' +
      // barra nera sottile
      '<div class="bg-acc-nero text-white h-[38px]">' +
        '<div class="max-w-acc mx-auto h-full px-4 tablet:px-6 flex items-center justify-between gap-4 text-[12px] font-semibold uppercase tracking-[.1em]">' +
          `<span class="truncate">${testo(CLUB.categoria)} <span class="hidden sm:inline text-acc-grigio-medio">· Stagione ${testo(CLUB.stagione)}</span></span>` +
          '<span class="flex items-center gap-4">' +
            (CLUB.social.instagram ? `<a href="${CLUB.social.instagram}" target="_blank" rel="noopener" class="hidden sm:inline-flex items-center gap-2 text-white no-underline hover:text-acc-rosso normal-case tracking-[.04em]"><span class="w-[16px] h-[16px]">${ICONE.instagram}</span>${testo(CLUB.social.instagramNome)}</a>` : "") +
            // su smartphone solo l'icona, con un'area da toccare di 38 px (la sagoma resta 18 px)
            `<span class="sm:hidden flex -mr-2.5">${linkSocial("grid place-items-center w-[38px] h-[38px] text-white [&>svg]:w-[18px] [&>svg]:h-[18px]")}</span>` +
            '<a href="contatti.html" class="hidden tablet:inline text-white no-underline hover:text-acc-rosso">Contatti</a>' +
          "</span>" +
        "</div>" +
      "</div>" +
      // barra principale
      // su smartphone la barra è più bassa (64 px): più spazio per i contenuti
      '<div class="max-w-acc mx-auto h-[64px] lg:h-[76px] px-4 tablet:px-6 flex items-center gap-6">' +
        `<a href="index.html" class="flex items-center gap-3 no-underline text-acc-nero self-start pt-2" aria-label="${testo(CLUB.nome)} — Home">` +
          '<img class="menu__stemma h-[70px] lg:h-[84px] w-auto -mb-5 drop-shadow-[0_6px_8px_rgba(0,0,0,.18)]" src="assets/logo/stemma-400.png" alt="" />' +
          '<span class="flex lg:hidden xl:flex flex-col leading-none pt-1">' +
            '<span class="titolo-display text-[22px] sm:text-[26px]">A.C. Castelverde</span>' +
            `<span class="text-[12px] font-semibold uppercase tracking-[.18em] text-acc-testo-2 mt-1">Dal ${CLUB.fondazione}</span>` +
          "</span>" +
        "</a>" +
        `<nav class="hidden lg:flex flex-1 justify-center gap-6 xl:gap-9" aria-label="Menu principale">${voci}</nav>` +
        (CLUB.social.instagram ? `<a href="${CLUB.social.instagram}" target="_blank" rel="noopener" class="hidden lg:inline-flex btn btn--rosso ml-auto lg:ml-0 !py-3 !px-4 !text-[17px]"><span class="w-[18px] h-[18px]">${ICONE.instagram}</span>Seguici</a>` : "") +
        '<button id="apriMenu" class="menu__apri lg:hidden ml-auto -mr-1.5 w-11 h-11 px-1.5 flex flex-col justify-center bg-transparent border-0 cursor-pointer" aria-label="Apri il menu" aria-expanded="false" aria-controls="menuMobile">' +
          "<span></span><span></span><span></span>" +
        "</button>" +
      "</div>" +
      // fascia grigio/rossa come lo stemma
      '<div class="h-[6px] bg-[linear-gradient(90deg,var(--color-grigio)_50%,var(--color-rosso)_50%)]"></div>' +
    "</header>" +
    // menu mobile
    '<div id="menuMobile" class="menu-mobile fixed inset-0 z-40 trama-grigia flex flex-col pt-[132px] pb-10 px-6 overflow-y-auto lg:hidden" aria-hidden="true">' +
      `<nav class="flex flex-col gap-3" aria-label="Menu">${vociMobile}</nav>` +
      (CLUB.social.instagram ? `<a href="${CLUB.social.instagram}" target="_blank" rel="noopener" class="btn btn--rosso self-start mt-8"><span class="w-5 h-5">${ICONE.instagram}</span>Seguici su Instagram</a>` : "") +
    "</div>";
}

/* 2. PARTNER ------------------------------------------------------ */
function disegnaPartner() {
  const contenitore = document.getElementById("partner");
  if (!contenitore) return;

  const loghi = PARTNER.map(function (p) {
    // solo il logo: centrato, contenuto in un riquadro fisso così loghi larghi e alti hanno lo stesso peso
    // grande: true (loghi stretti e alti, es. Selica) → meno margine e più altezza
    const altezza = p.grande ? "max-h-[100px] tablet:max-h-[126px]" : "max-h-[72px] tablet:max-h-[84px]";
    const margine = p.grande ? "py-2.5 tablet:py-3" : "py-6";
    const dentro = `<img class="${altezza} w-auto max-w-full object-contain" src="${testo(p.logo)}" alt="${testo(p.nome)}" loading="lazy" />`;
    const classi = `flex items-center justify-center bg-white px-5 ${margine} tablet:px-8 h-[120px] tablet:h-[150px] no-underline shadow-[5px_7px_14px_rgba(0,0,0,.08)]`;
    return p.sito
      ? `<a class="${classi} hover:-translate-y-1 transition-transform" href="${testo(p.sito)}" target="_blank" rel="noopener">${dentro}</a>`
      : `<div class="${classi}">${dentro}</div>`;
  }).join("");

  contenitore.innerHTML =
    '<section class="trama-grigia py-16" aria-labelledby="titoloPartner">' +
      '<div class="max-w-acc mx-auto px-4 tablet:px-6">' +
        '<h2 id="titoloPartner" class="titolo-sezione text-[40px] tablet:text-[52px] mb-10">I nostri partner</h2>' +
        '<div class="grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-4 gap-3 tablet:gap-4" data-entrano>' +
          loghi +
          '<a href="contatti.html?motivo=partner#scrivici" class="col-span-full flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-[3px] border-dashed border-acc-grigio-medio px-6 py-5 text-center no-underline text-acc-nero hover:border-acc-rosso hover:text-acc-rosso transition-colors">' +
            '<span class="titolo-display text-[26px]">Il tuo marchio qui</span>' +
            '<span class="text-[14px]">Diventa partner del Castelverde →</span>' +
          "</a>" +
        "</div>" +
      "</div>" +
    "</section>";
}

/* 3. FOOTER ------------------------------------------------------- */
// i link del footer: stesso colore del testo, rossi al passaggio del mouse
const LINK_PIEDE = "text-inherit no-underline transition-colors hover:text-acc-rosso";

function disegnaPiede() {
  const contenitore = document.getElementById("piede");
  if (!contenitore) return;

  const colonna = function (titolo, voci) {
    return (
      "<div>" +
        `<h3 class="titolo-display text-[22px] text-white mb-4">${titolo}</h3>` +
        // i link hanno un po' di spazio sopra e sotto (py-1): sul telefono si toccano senza sbagliare
        '<ul class="flex flex-col gap-1 text-[15px] tablet:text-[14px] text-acc-grigio list-none p-0 m-0">' +
          voci.map(function (v) { return `<li><a class="${LINK_PIEDE} inline-block py-1" href="${v[1]}">${v[0]}</a></li>`; }).join("") +
        "</ul>" +
      "</div>"
    );
  };

  const squadre = SQUADRE.map(function (s) { return [s.nome, `squadre.html#${s.id}`]; });
  const c = CLUB.contatti;
  const anno = new Date().getFullYear();

  contenitore.innerHTML =
    '<footer class="bg-acc-nero text-white">' +
      '<div class="h-[6px] bg-[linear-gradient(90deg,var(--color-grigio)_50%,var(--color-rosso)_50%)]"></div>' +
      '<div class="max-w-acc mx-auto px-4 tablet:px-6 pt-16 pb-10 grid gap-12 lg:grid-cols-[1.3fr_2fr]">' +
        '<div class="flex flex-col items-start gap-5">' +
          // lo stemma ha il bordo scuro: su fondo nero sparirebbe, quindi sta in un riquadro grigio con l'angolo rosso (come nelle grafiche)
          '<div class="relative mt-2 ml-2 trama-grigia p-4">' +
            '<span class="absolute -top-2 -left-2 w-10 h-10 border-t-[6px] border-l-[6px] border-acc-rosso" aria-hidden="true"></span>' +
            '<img class="relative h-[104px] w-auto drop-shadow-[0_6px_10px_rgba(0,0,0,.25)]" src="assets/logo/stemma-400.png" alt="" />' +
          "</div>" +
          `<p class="titolo-display text-[34px]">${testo(CLUB.nomeCompleto)}</p>` +
          `<p class="titolo-display text-[22px] text-acc-rosso">${testo(CLUB.motto)}</p>` +
          `<div class="flex gap-4">${linkSocial(LINK_PIEDE + " grid place-items-center w-11 h-11 border-2 border-acc-nero-3 hover:border-acc-rosso [&>svg]:w-5 [&>svg]:h-5")}</div>` +
        "</div>" +
        // su smartphone le colonne del footer stanno una sotto l'altra
        '<div class="grid grid-cols-1 sm:grid-cols-2 tablet:grid-cols-[1fr_1fr_1fr_1.45fr] gap-8">' +
          colonna("Notizie", [["Ultime notizie", "notizie.html"], ["Prima squadra", "notizie.html?categoria=Prima%20squadra"], ["Settore giovanile", "notizie.html?categoria=Settore%20giovanile"], ["Storia", "notizie.html?categoria=Storia"]]) +
          colonna("Squadre", squadre) +
          colonna("Club", [["La nostra storia", "societa.html#storia"], ["Dirigenza", "dirigenza.html"], ["Impianti", "societa.html#impianti"], ["Calendario", "calendario.html"]]) +
          '<div class="sm:col-span-2 tablet:col-span-1">' +
            '<h3 class="titolo-display text-[22px] text-white mb-4">Contatti</h3>' +
            '<ul class="flex flex-col gap-1 text-[15px] tablet:text-[14px] text-acc-grigio list-none p-0 m-0">' +
              `<li class="py-1">${testo(c.indirizzo)}<br>${testo(c.cap + " " + c.citta)}</li>` +
              `<li><a class="${LINK_PIEDE} inline-block py-1" href="tel:${c.telefonoLink}">${testo(c.telefono)}</a></li>` +
              `<li><a class="${LINK_PIEDE} inline-block py-1 whitespace-nowrap" href="mailto:${c.email}">${testo(c.email)}</a></li>` +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="border-t border-acc-nero-3">' +
        '<div class="max-w-acc mx-auto px-4 tablet:px-6 py-6 flex flex-col tablet:flex-row gap-3 justify-between text-[12px] text-acc-grigio-medio">' +
          `<p>© ${anno} ${testo(CLUB.nomeCompleto)} · C.F. e P.IVA ${testo(CLUB.fiscale.partitaIva)}</p>` +
          `<p class="flex gap-5"><a class="${LINK_PIEDE} inline-block py-1.5" href="privacy-cookie.html">Privacy e cookie</a><a class="${LINK_PIEDE} inline-block py-1.5" href="contatti.html">Contatti</a></p>` +
        "</div>" +
      "</div>" +
    "</footer>" +
    // pulsante "torna su" (fisso in basso a destra), solo da computer (lg, 1024 px):
    // su telefono e tablet il menu in alto è sempre raggiungibile e il pulsante
    // coprirebbe testi e foto; per tornare su basta toccare la barra in alto del telefono.
    // Sta FUORI dal footer: dentro un elemento
    // animato (con transform) "fixed" smetterebbe di essere fisso sullo schermo.
    // L'<aside> lo mette in una zona della pagina per i lettori di schermo.
    '<aside aria-label="Torna su">' +
      '<a href="#top" id="tornaSu" class="fixed right-5 bottom-5 z-40 hidden lg:grid place-items-center w-12 h-12 bg-acc-rosso text-white shadow-lg opacity-0 pointer-events-none translate-y-3 transition-[opacity,translate,background-color] duration-300 hover:bg-acc-nero [&.is-visibile]:opacity-100 [&.is-visibile]:pointer-events-auto [&.is-visibile]:translate-y-0" aria-label="Torna su">' +
        `<span class="w-5 h-5 -rotate-90">${ICONE.freccia}</span>` +
      "</a>" +
    "</aside>";
}

/* 4. COMANDI DEL MENU -------------------------------------------- */
function preparaComandiMenu() {
  const testata = document.getElementById("testata");
  const pulsante = document.getElementById("apriMenu");
  const menuMobile = document.getElementById("menuMobile");
  const tornaSu = document.getElementById("tornaSu");
  let ultimaPosizione = 0;

  // Scorrendo: il menu si accorcia, la barra nera sparisce scendendo e torna risalendo
  function aggiorna() {
    const y = window.scrollY;
    if (testata) {
      testata.classList.toggle("is-scorso", y > 40);
      testata.classList.toggle("is-nascosto", y > 200 && y > ultimaPosizione && !document.body.classList.contains("menu-aperto"));
    }
    if (tornaSu) tornaSu.classList.toggle("is-visibile", y > 700);
    ultimaPosizione = y;
  }
  window.addEventListener("scroll", aggiorna, { passive: true });
  aggiorna();

  // Menu mobile
  if (pulsante && menuMobile) {
    pulsante.addEventListener("click", function () {
      const aperto = !menuMobile.classList.contains("is-aperto");
      menuMobile.classList.toggle("is-aperto", aperto);
      pulsante.classList.toggle("is-aperto", aperto);
      document.body.classList.toggle("menu-aperto", aperto);
      pulsante.setAttribute("aria-expanded", aperto);
      menuMobile.setAttribute("aria-hidden", !aperto);
    });
  }
}
