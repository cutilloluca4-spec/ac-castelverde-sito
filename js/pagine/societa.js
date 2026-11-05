/* ==================================================================
   A.C. Castelverde — js/pagine/societa.js
   Pagina Società: numeri, linea del tempo della storia (js/dati/storia.js)
   e campi (js/dati/club.js). Le persone sono nella pagina Dirigenza.
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();
  disegnaNumeriSocieta();
  disegnaStoria();
  disegnaImpianti();
  avviaAnimazioni();
});

function disegnaNumeriSocieta() {
  document.getElementById("numeri").innerHTML = CLUB.numeri.map(function (n) {
    return (
      '<div class="bg-white px-6 py-7 shadow-[6px_8px_0_rgba(0,0,0,.15)]">' +
        '<p class="titolo-display text-[60px] computer:text-[80px]" data-conta="' + n.valore + '" data-suffisso="' + (n.suffisso || "") + '">' + n.valore + (n.suffisso || "") + "</p>" +
        '<p class="text-[13px] font-semibold uppercase tracking-[.1em] mt-2 text-acc-testo-2">' + testo(n.etichetta) + "</p>" +
      "</div>"
    );
  }).join("");
}

// Linea del tempo: su computer le tappe si alternano a sinistra e a destra
function disegnaStoria() {
  document.getElementById("lineaTempo").innerHTML = STORIA.map(function (t, i) {
    const destra = i % 2 === 1;
    return (
      '<li class="relative pl-14 computer:pl-0 computer:grid computer:grid-cols-2 computer:gap-20" data-entra>' +
        // il rombo sulla linea
        // il rombo diventa rosso quando la linea rossa lo raggiunge (classe is-raggiunto, la mette js/animazioni.js)
        '<span class="linea-tempo__punto absolute left-1.5 top-1.5 w-[22px] h-[22px] bg-white border-4 border-acc-nero rotate-45 transition-[background-color,scale] duration-300 [&.is-raggiunto]:bg-acc-rosso [&.is-raggiunto]:scale-115 computer:left-1/2 computer:-ml-[11px]" aria-hidden="true"></span>' +
        '<div class="' + (destra ? "computer:col-start-2" : "computer:text-right") + '">' +
          '<p class="titolo-display text-[72px] computer:text-[96px] text-acc-rosso">' + testo(t.anno) + "</p>" +
          '<h3 class="titolo-display text-[34px] mt-1">' + testo(t.titolo) + "</h3>" +
          '<p class="text-[16px] leading-relaxed mt-3 text-acc-inchiostro/80">' + testo(t.testo) + "</p>" +
          // la cornice grigia sporge di 24 px tutto intorno alla foto: mt-12 lascia sempre 24 px liberi tra il testo e la cornice
          (t.immagine ? '<img class="block w-[calc(100%-48px)] aspect-[3/2] object-cover cornice mt-12 mb-6 mx-6 ' + (destra ? "" : "computer:ml-auto") + '" src="' + testo(t.immagine) + '" alt="" loading="lazy" />' : "") +
          (t.immagine && t.credito ? '<p class="text-[12px] text-acc-testo-2 mt-4 mx-6">' + testo(t.credito) + "</p>" : "") +
        "</div>" +
      "</li>"
    );
  }).join("");
}

function disegnaImpianti() {
  document.getElementById("elencoImpianti").innerHTML = CLUB.impianti.map(function (c, i) {
    return (
      '<article class="flex flex-col bg-white">' +
        '<div class="' + (i === 0 ? "trama-rossa text-white" : "trama-grigia") + ' p-8 pb-10">' +
          '<p class="titolo-display text-[20px] opacity-80">' + "La nostra casa" + "</p>" +
          '<h3 class="titolo-display text-[48px] tablet:text-[60px] mt-2">' + testo(c.nome) + "</h3>" +
        "</div>" +
        '<div class="p-8 flex flex-col gap-4 flex-1">' +
          '<p class="flex items-start gap-2 font-semibold"><span class="w-5 h-5 flex-none text-acc-rosso">' + ICONE.luogo + "</span>" + testo(c.indirizzo) + "</p>" +
          '<p class="text-[15px] leading-relaxed text-acc-testo-2">' + testo(c.descrizione) + "</p>" +
          '<a class="btn btn--nero self-start mt-auto" href="' + c.mappa + '" target="_blank" rel="noopener">Apri la mappa ' + ICONE.freccia + "</a>" +
        "</div>" +
      "</article>"
    );
  }).join("");
}
