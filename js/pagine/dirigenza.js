/* ==================================================================
   A.C. Castelverde — js/pagine/dirigenza.js
   Pagina Dirigenza:
     - scheda grande del presidente (la PRIMA persona di CLUB.organigramma)
     - schede delle altre figure dirigenziali
     - staff di ogni squadra (da SQUADRE in js/dati/squadre.js)
   Le persone si aggiungono in js/dati/club.js, le foto in assets/img/dirigenti/.
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();

  const persone = CLUB.organigramma;
  document.getElementById("presidente").innerHTML = persone.length ? htmlCardDirigente(persone[0], true) : "";
  document.getElementById("dirigenti").innerHTML = persone.slice(1).map(function (d) { return htmlCardDirigente(d, false); }).join("");

  document.getElementById("staffSquadre").innerHTML = SQUADRE.map(function (s) {
    const righe = (s.staff || []).map(function (p) {
      return `<li class="flex flex-col gap-0.5 py-3 border-t border-acc-linea first:border-t-0"><span class="text-[12px] font-semibold uppercase tracking-[.08em] text-acc-testo-2">${testo(p.ruolo)}</span><strong class="text-[16px]">${testo(p.nome)}</strong></li>`;
    }).join("");
    return (
      '<article class="bg-white flex flex-col">' +
        `<a href="squadre.html#${s.id}" class="trama-rossa text-white p-6 no-underline">` +
          `<span class="text-[12px] font-semibold uppercase tracking-[.1em] opacity-90">${testo(s.categoria)}${s.livello ? " · " + testo(s.livello) : ""}</span>` +
          `<span class="block titolo-display text-[40px] mt-1">${testo(s.nome)}</span>` +
        "</a>" +
        `<ul class="list-none m-0 px-6 pb-4 pt-3">${righe}</ul>` +
      "</article>"
    );
  }).join("");

  avviaAnimazioni();
});
