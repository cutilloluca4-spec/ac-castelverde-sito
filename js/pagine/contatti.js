/* ==================================================================
   A.C. Castelverde — js/pagine/contatti.js
   Pagina Contatti: recapiti (da js/dati/club.js), modulo, campi.

   Il modulo invia i messaggi con Web3Forms: la chiave si scrive in
   js/dati/club.js (CLUB.modulo.chiaveWeb3Forms). Senza chiave apre
   il programma di posta con il messaggio già compilato.
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
      `<span class="w-8 h-8 ${rossa ? "text-white" : "text-acc-rosso"}">${icona}</span>` +
      `<span class="titolo-display text-[22px] opacity-70">${titolo}</span>` +
      `<span class="titolo-display text-[30px] break-words">${valore}</span>`;
    const classi = `flex flex-col gap-3 p-7 no-underline ${rossa ? "trama-rossa text-white" : "bg-white text-acc-nero"} shadow-acc-card transition-transform hover:-translate-y-1`;
    return link ? `<a class="${classi}" href="${link}"${link.indexOf("http") === 0 ? ' target="_blank" rel="noopener"' : ""}>${dentro}</a>` : `<div class="${classi}">${dentro}</div>`;
  };

  let html =
    card(ICONE.luogo, "Sede", testo(c.indirizzo) + "<br>" + testo(c.citta), c.mappa, true) +
    card(ICONE.telefono, "Telefono", testo(c.telefono), `tel:${c.telefonoLink}`) +
    card(ICONE.posta, "Email", `<span class="font-acc-testo normal-case font-bold text-[17px] break-all">${testo(c.email)}</span>`, `mailto:${c.email}`);
  if (CLUB.social.instagram) html += card(ICONE.instagram, "Instagram", `<span class="font-acc-testo normal-case font-bold text-[17px] break-all">${testo(CLUB.social.instagramNome)}</span>`, CLUB.social.instagram);
  document.getElementById("recapiti").innerHTML = html;
}

function disegnaCampi() {
  document.getElementById("campiContatti").innerHTML = CLUB.impianti.map(function (c) {
    return (
      `<a href="${c.mappa}" target="_blank" rel="noopener" class="group flex items-center gap-6 bg-acc-grigio-chiaro p-7 no-underline text-acc-nero hover:bg-acc-nero hover:text-white transition-colors">` +
        `<span class="grid place-items-center w-16 h-16 flex-none bg-acc-rosso text-white"><span class="w-8 h-8">${ICONE.luogo}</span></span>` +
        '<span class="flex flex-col gap-1">' +
          `<span class="titolo-display text-[34px]">${testo(c.nome)}</span>` +
          `<span class="text-[15px] opacity-80">${testo(c.indirizzo)}</span>` +
        "</span>" +
        `<span class="w-7 h-7 ml-auto flex-none text-acc-rosso">${ICONE.freccia}</span>` +
      "</a>"
    );
  }).join("");
}

// Il modulo: se in js/dati/club.js c'è la chiave di Web3Forms il messaggio parte
// direttamente per email; se manca (o l'invio non riesce) si apre il programma di
// posta con il messaggio già compilato. In nessun caso il messaggio va perso.
function preparaModulo() {
  const modulo = document.getElementById("moduloContatti");
  const errore = document.getElementById("erroreModulo");
  const grazie = document.getElementById("grazieModulo");
  const pulsante = modulo.querySelector('button[type="submit"]');
  const chiave = CLUB.modulo && CLUB.modulo.chiaveWeb3Forms;

  // ?motivo=partner preseleziona "Diventare partner"
  if (parametro("motivo") === "partner") modulo.motivo.value = "Diventare partner";

  function mostraErrore(messaggio) {
    errore.textContent = messaggio;
    errore.classList.remove("hidden");
  }

  function fatto() {
    Array.from(modulo.children).forEach(function (el) { if (el !== grazie) el.classList.add("hidden"); });
    grazie.classList.remove("hidden");
  }

  // apre il programma di posta con oggetto e testo già scritti
  function apriPosta() {
    const oggetto = `Dal sito: ${modulo.motivo.value}`;
    const testoEmail = modulo.messaggio.value + "\n\n" + modulo.nome.value +
      (modulo.telefono.value ? `\nTel. ${modulo.telefono.value}` : "") + "\n" + modulo.email.value;
    location.href = `mailto:${CLUB.contatti.email}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(testoEmail)}`;
  }

  modulo.addEventListener("submit", function (e) {
    e.preventDefault();
    errore.classList.add("hidden");

    if (!modulo.checkValidity()) {
      mostraErrore("Compila nome, email, messaggio e accetta l'informativa privacy.");
      return;
    }
    if (modulo.botcheck.checked) return;      // campo nascosto spuntato: è un programma automatico (spam)

    if (!chiave) { apriPosta(); return; }

    // i dati per Web3Forms: la chiave, l'oggetto dell'email e "rispondi a" chi ha scritto
    const dati = new FormData(modulo);
    dati.append("access_key", chiave);
    dati.append("subject", `Nuovo messaggio dal sito – ${modulo.motivo.value}`);
    dati.append("from_name", "Sito A.C. Castelverde");
    dati.append("replyto", modulo.email.value);
    dati.delete("privacy");

    pulsante.disabled = true;
    pulsante.textContent = "Invio in corso…";
    fetch("https://api.web3forms.com/submit", { method: "POST", body: dati, headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (risposta) { if (!risposta.success) throw new Error(); fatto(); })
      .catch(function () {
        mostraErrore("Invio non riuscito: ti apriamo il programma di posta con il messaggio già scritto.");
        pulsante.disabled = false;
        pulsante.textContent = "Invia il messaggio";
        apriPosta();
      });
  });
}
