/* ==================================================================
   A.C. Castelverde — js/pagine/contatti.js
   Pagina Contatti: recapiti (da js/dati/club.js), modulo, campi.

   Il modulo invia i dati all'indirizzo scritto in data-indirizzo sul
   <form> (es. un servizio come Formspree). Finché è vuoto mostra
   solo il messaggio di conferma e NON invia niente.
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();
  disegnaRecapiti();
  disegnaCampi();
  preparaModulo();
  avviaAnimazioni();
});

function disegnaRecapiti() {
  const c = CLUB.contatti;
  const card = function (icona, titolo, valore, link, rossa) {
    const dentro =
      '<span class="w-8 h-8 ' + (rossa ? "text-white" : "text-acc-rosso") + '">' + icona + "</span>" +
      '<span class="titolo-display text-[22px] opacity-70">' + titolo + "</span>" +
      '<span class="titolo-display text-[30px] break-words">' + valore + "</span>";
    const classi = "flex flex-col gap-3 p-7 no-underline " + (rossa ? "trama-rossa text-white" : "bg-white text-acc-nero") + " shadow-acc-card transition-transform hover:-translate-y-1";
    return link ? '<a class="' + classi + '" href="' + link + '"' + (link.indexOf("http") === 0 ? ' target="_blank" rel="noopener"' : "") + ">" + dentro + "</a>" : '<div class="' + classi + '">' + dentro + "</div>";
  };

  let html =
    card(ICONE.luogo, "Sede", testo(c.indirizzo) + "<br>" + testo(c.citta), c.mappa, true) +
    card(ICONE.telefono, "Telefono", testo(c.telefono), "tel:" + c.telefonoLink) +
    card(ICONE.posta, "Email", '<span class="font-acc-testo normal-case font-bold text-[17px] break-all">' + testo(c.email) + "</span>", "mailto:" + c.email);
  if (CLUB.social.facebook) html += card(ICONE.facebook, "Facebook", testo(CLUB.social.facebookNome), CLUB.social.facebook);
  if (CLUB.social.instagram) html += card(ICONE.instagram, "Instagram", '<span class="font-acc-testo normal-case font-bold text-[17px] break-all">' + testo(CLUB.social.instagramNome) + "</span>", CLUB.social.instagram);
  document.getElementById("recapiti").innerHTML = html;
}

function disegnaCampi() {
  document.getElementById("campiContatti").innerHTML = CLUB.impianti.map(function (c) {
    return (
      '<a href="' + c.mappa + '" target="_blank" rel="noopener" class="group flex items-center gap-6 bg-acc-grigio-chiaro p-7 no-underline text-acc-nero hover:bg-acc-nero hover:text-white transition-colors">' +
        '<span class="grid place-items-center w-16 h-16 flex-none bg-acc-rosso text-white"><span class="w-8 h-8">' + ICONE.luogo + "</span></span>" +
        '<span class="flex flex-col gap-1">' +
          '<span class="titolo-display text-[34px]">' + testo(c.nome) + "</span>" +
          '<span class="text-[15px] opacity-80">' + testo(c.indirizzo) + "</span>" +
        "</span>" +
        '<span class="w-7 h-7 ml-auto flex-none text-acc-rosso">' + ICONE.freccia + "</span>" +
      "</a>"
    );
  }).join("");
}

function preparaModulo() {
  const modulo = document.getElementById("moduloContatti");
  const errore = document.getElementById("erroreModulo");
  const grazie = document.getElementById("grazieModulo");
  const pulsante = modulo.querySelector('button[type="submit"]');

  // ?motivo=partner preseleziona "Diventare partner"
  if (parametro("motivo") === "partner") modulo.motivo.value = "Diventare partner";

  modulo.addEventListener("submit", function (e) {
    e.preventDefault();
    errore.classList.add("hidden");

    if (!modulo.checkValidity()) {
      errore.textContent = "Compila nome, email, messaggio e accetta l'informativa privacy.";
      errore.classList.remove("hidden");
      return;
    }

    const indirizzo = modulo.dataset.indirizzo;
    function fatto() {
      Array.from(modulo.children).forEach(function (el) { if (el !== grazie) el.classList.add("hidden"); });
      grazie.classList.remove("hidden");
    }
    if (!indirizzo) { fatto(); return; }   // servizio non ancora scelto: solo conferma

    pulsante.disabled = true;
    pulsante.textContent = "Invio in corso…";
    fetch(indirizzo, { method: "POST", body: new FormData(modulo), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(); fatto(); })
      .catch(function () {
        errore.textContent = "Invio non riuscito. Riprova o scrivici a " + CLUB.contatti.email + ".";
        errore.classList.remove("hidden");
        pulsante.disabled = false;
        pulsante.textContent = "Invia il messaggio";
      });
  });
}
