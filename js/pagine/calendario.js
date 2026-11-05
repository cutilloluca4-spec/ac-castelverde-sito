/* ==================================================================
   A.C. Castelverde — js/pagine/calendario.js
   Pagina Calendario: schede per squadra, prossime partite, risultati
   e classifica. Si può aprire su una squadra: calendario.html?squadra=juniores
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();

  const schede = document.getElementById("schedeCalendario");
  const squadre = squadreConPartite();
  let scelta = parametro("squadra");
  if (!squadre.some(function (s) { return s.id === scelta; })) scelta = squadre.length ? squadre[0].id : "";

  document.getElementById("avvisoCalendario").innerHTML = htmlAvvisoCalendario();

  schede.innerHTML = squadre.map(function (s) {
    return `<button type="button" role="tab" class="${CLASSI_SCHEDA}" data-squadra="${s.id}">${testo(s.nome)}</button>`;
  }).join("");

  function disegna() {
    schede.querySelectorAll("button").forEach(function (b) {
      const attivo = b.dataset.squadra === scelta;
      b.classList.toggle("is-attiva", attivo);
      b.setAttribute("aria-selected", attivo);
    });

    const prossime = prossimePartite(scelta);
    // le prossime 3 come card, le altre in un elenco compatto
    document.getElementById("prossime").innerHTML = prossime.length
      ? prossime.slice(0, 3).map(htmlCardPartita).join("")
      : htmlVuoto("Nessuna partita in programma per questa squadra.");
    document.getElementById("restoCalendario").innerHTML = prossime.slice(3).map(htmlRigaCalendario).join("");
    document.getElementById("restoCalendarioBox").classList.toggle("hidden", prossime.length <= 3);

    const fatte = risultati(scelta);
    document.getElementById("risultati").innerHTML = fatte.length
      ? fatte.map(htmlRigaRisultato).join("")
      : '<li class="py-8 text-center text-acc-testo-2">Nessun risultato ancora.</li>';

    // Classifica del girone della squadra scelta (CLASSIFICHE in js/dati/partite.js)
    const classifica = document.getElementById("classifica");
    const c = typeof CLASSIFICHE !== "undefined" ? CLASSIFICHE[scelta] : null;
    classifica.innerHTML = c ? htmlClassifica(c) : htmlVuoto("Classifica non disponibile.");
  }

  schede.addEventListener("click", function (e) {
    const b = e.target.closest("button[data-squadra]");
    if (!b) return;
    scelta = b.dataset.squadra;
    history.replaceState(null, "", `?squadra=${scelta}`);
    disegna();
  });

  disegna();
  avviaAnimazioni();
});
