/* ==================================================================
   A.C. Castelverde — js/utilita.js
   Piccole funzioni usate da tutte le pagine: date, testi, ricerca
   delle partite, icone. Nessuna di queste disegna la pagina.
   ================================================================== */

const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const MESI_CORTI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const GIORNI_CORTI = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

// "2026-10-25" → oggetto Date (a mezzogiorno, così il fuso orario non sposta il giorno)
function leggiData(iso) {
  const p = iso.split("-");
  return new Date(+p[0], +p[1] - 1, +p[2], 12);
}

// oggetto Date → "2026-10-25" (data locale, non quella di Greenwich: dopo mezzanotte è già il giorno nuovo)
function dataISO(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// "2026-10-25" → "25 ottobre 2026"
function dataLunga(iso) {
  const d = leggiData(iso);
  return d.getDate() + " " + MESI[d.getMonth()] + " " + d.getFullYear();
}

// "2026-10-25" → "dom 25 ott"
function dataCorta(iso) {
  const d = leggiData(iso);
  return GIORNI_CORTI[d.getDay()] + " " + d.getDate() + " " + MESI_CORTI[d.getMonth()];
}

// Protegge i testi inseriti nell'HTML (evita che < e > rompano la pagina)
function testo(valore) {
  return String(valore == null ? "" : valore)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// "Canottieri Baldesio" → "CB"
function iniziali(nome) {
  return nome.replace(/[^A-Za-zÀ-ú ]/g, " ").split(" ").filter(Boolean).slice(0, 2)
    .map(function (p) { return p[0].toUpperCase(); }).join("");
}

// Legge un parametro dall'indirizzo: notizia.html?id=abc → parametro("id") = "abc"
function parametro(nome) {
  return new URLSearchParams(location.search).get(nome);
}

/* ---------- Notizie ---------- */

// Tutte le notizie, dalla più recente
function notizieOrdinate() {
  return NOTIZIE.slice().sort(function (a, b) { return b.data.localeCompare(a.data); });
}

function trovaNotizia(id) {
  return NOTIZIE.find(function (n) { return n.id === id; });
}

/* ---------- Squadre e partite ---------- */

function trovaSquadra(id) {
  return SQUADRE.find(function (s) { return s.id === id; });
}

// Una partita è "giocata" quando ha i gol
function giocata(p) {
  return p.golNostri !== null && p.golNostri !== undefined;
}

// Le partite di una squadra (o di tutte se id è vuoto), in ordine di data
function partiteDi(idSquadra) {
  return PARTITE
    .filter(function (p) { return !idSquadra || p.squadra === idSquadra; })
    .sort(function (a, b) { return a.data.localeCompare(b.data); });
}

// Da giocare: senza risultato e con data da oggi in poi
// (una partita passata senza risultato è in attesa di aggiornamento: non è "prossima")
function prossimePartite(idSquadra) {
  const oggi = dataISO(new Date());
  return partiteDi(idSquadra).filter(function (p) { return !giocata(p) && p.data >= oggi; });
}

function risultati(idSquadra) {
  return partiteDi(idSquadra).filter(giocata).reverse();   // il più recente per primo
}

// "V" vittoria, "N" pareggio, "P" sconfitta
function esito(p) {
  if (!giocata(p)) return "";
  if (p.golNostri > p.golLoro) return "V";
  if (p.golNostri < p.golLoro) return "P";
  return "N";
}

// Le squadre che hanno almeno una partita in calendario
function squadreConPartite() {
  return SQUADRE.filter(function (s) {
    return PARTITE.some(function (p) { return p.squadra === s.id; });
  });
}

/* ---------- Icone (SVG semplici, colore = colore del testo) ---------- */

const ICONE = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm0 16.4c-1.4 0-2.8-.4-4-1.1l-.3-.2-2.7.7.7-2.6-.2-.3A7.4 7.4 0 1 1 12 19.4zm4.1-5.5c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6 6 0 0 1-3-2.6c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.6-.3z"/></svg>`,
  freccia: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  indietro: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`,
  luogo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
  orologio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  telefono: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>`,
  posta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>`,
  pallone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10z" fill="currentColor"/><path d="M12 7V3M16 10l3.5-1.5M14.5 14.5l2 3.5M9.5 14.5l-2 3.5M8 10 4.5 8.5"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>`
};
