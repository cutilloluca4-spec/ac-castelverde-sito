/* ==================================================================
   A.C. Castelverde — js/pagine/notizia.js
   Pagina della singola notizia: notizia.html?id=<id della notizia>
   Legge la notizia da js/dati/notizie.js e la impagina.
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();

  const box = document.getElementById("articolo");
  const n = trovaNotizia(parametro("id"));

  if (!n) {
    box.innerHTML =
      `<div class="max-w-[900px] mx-auto px-4 tablet:px-6 py-24 text-center">` +
        `<p class="titolo-display text-[64px]">Notizia non trovata</p>` +
        `<a class="btn btn--rosso mt-8" href="notizie.html">Tutte le notizie</a>` +
      `</div>`;
    disegnaAltre(null);
    avviaAnimazioni();
    return;
  }

  document.title = n.titolo + " — A.C. Castelverde";

  const indirizzo = location.href;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(n.titolo + " " + indirizzo)}`;

  box.innerHTML =
    `<header class="diagonali">` +
      `<div class="max-w-[1000px] mx-auto px-4 tablet:px-6 pt-12 computer:pt-16 pb-10">` +
        `<a href="notizie.html" class="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[.1em] text-acc-nero no-underline hover:text-acc-rosso"><span class="w-4 h-4">${ICONE.indietro}</span>Notizie</a>` +
        `<div class="flex flex-wrap items-center gap-4 mt-8">` +
          `<a href="notizie.html?categoria=${encodeURIComponent(n.categoria)}" class="pillola text-[15px] no-underline">${testo(n.categoria)}</a>` +
          `<span class="text-[13px] font-semibold uppercase tracking-[.1em] text-acc-testo-2">${dataLunga(n.data)}</span>` +
        `</div>` +
        `<h1 class="titolo-display text-[52px] tablet:text-[80px] mt-6">${testo(n.titolo)}</h1>` +
        `<p class="text-[20px] leading-relaxed text-acc-testo-2 mt-5 max-w-[760px]">${testo(n.sommario)}</p>` +
      `</div>` +
      `<div class="max-w-[1000px] mx-auto px-4 tablet:px-6 pb-16">` +
        `<div class="cornice angolo-rosso angolo-rosso--doppio m-6"><img class="block w-full aspect-[16/9] object-cover" src="${testo(n.immagine)}" alt="" /></div>` +
      `</div>` +
    `</header>` +
    `<div class="bg-white">` +
      `<div class="[&_p]:mb-[1.25em] [&_p]:text-[18px] [&_p]:leading-[1.65] max-w-[760px] mx-auto px-4 tablet:px-6 py-14">` +
        (n.esempio ? `<p class="!text-[14px] bg-acc-avviso-chiaro border-l-[6px] border-acc-avviso p-4"><strong>Testo di esempio</strong> da sostituire in js/dati/notizie.js.</p>` : "") +
        n.testo.map(function (p) { return `<p>${testo(p)}</p>`; }).join("") +
        `<div class="flex flex-wrap items-center gap-3 border-t border-acc-linea pt-8 mt-10">` +
          `<span class="titolo-display text-[20px] mr-2">Condividi</span>` +
          `<a class="btn btn--nero !py-2.5 !px-4" href="${whatsapp}" target="_blank" rel="noopener"><span class="w-5 h-5">${ICONE.whatsapp}</span>WhatsApp</a>` +
          `<button id="copiaLink" type="button" class="btn btn--contorno !py-2.5 !px-4"><span class="w-5 h-5">${ICONE.link}</span><span>Copia il link</span></button>` +
        `</div>` +
      `</div>` +
    `</div>`;

  const copia = document.getElementById("copiaLink");
  copia.addEventListener("click", function () {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(indirizzo).then(function () {
      copia.lastElementChild.textContent = "Link copiato";
      setTimeout(function () { copia.lastElementChild.textContent = "Copia il link"; }, 2000);
    });
  });

  disegnaAltre(n);
  avviaAnimazioni();
});

// Tre notizie: prima quelle della stessa categoria, poi le più recenti
function disegnaAltre(attuale) {
  const altre = notizieOrdinate().filter(function (x) { return !attuale || x.id !== attuale.id; });
  const stessa = altre.filter(function (x) { return attuale && x.categoria === attuale.categoria; });
  const scelte = stessa.concat(altre.filter(function (x) { return stessa.indexOf(x) < 0; })).slice(0, 3);
  document.getElementById("altreNotizie").innerHTML = scelte.map(function (x) { return htmlCardNotizia(x, "normale"); }).join("");
}
