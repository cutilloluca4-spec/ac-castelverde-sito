/* ==================================================================
   A.C. Castelverde — test/test.js
   Controlli automatici delle funzioni e dei dati del sito.
   Si aprono con Live Server: test/index.html. Ogni riga dice cosa ci si
   aspetta; se dopo una modifica compare una ❌, qualcosa si è rotto.

   Utile soprattutto dopo l'aggiornamento automatico dei risultati
   (strumenti/aggiorna_risultati.py): controlla che js/dati/partite.js
   sia coerente (classifiche, date, stemmi che esistono davvero).

   Come aggiungere un controllo:
     verifica("descrizione", valoreOttenuto, valoreAtteso);
   dentro uno dei gruppo("…", function () { … }) qui sotto.
   ================================================================== */

// 1. STRUMENTI PER I CONTROLLI
const risultatiControlli = [];
let gruppoCorrente = "";

function gruppo(titolo, controlli) {
  gruppoCorrente = titolo;
  try {
    controlli();
  } catch (errore) {
    risultatiControlli.push({ gruppo: titolo, descrizione: "il gruppo si è fermato per un errore", ok: false, dettaglio: String(errore) });
  }
}

function verifica(descrizione, ottenuto, atteso) {
  const ok = JSON.stringify(ottenuto) === JSON.stringify(atteso);
  risultatiControlli.push({
    gruppo: gruppoCorrente,
    descrizione: descrizione,
    ok: ok,
    dettaglio: ok ? "" : "atteso " + JSON.stringify(atteso) + ", ottenuto " + JSON.stringify(ottenuto)
  });
}

// Un elenco di valori senza doppioni? (restituisce i doppioni trovati)
function doppioni(valori) {
  return valori.filter(function (v, i) { return valori.indexOf(v) !== i; });
}

const DATA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;


// 2. FUNZIONI DI UTILITÀ (js/utilita.js)
gruppo("Date", function () {
  verifica("dataLunga scrive il mese per esteso", dataLunga("2026-10-25"), "25 ottobre 2026");
  verifica("dataCorta scrive giorno della settimana e mese corto", dataCorta("2026-10-25"), "dom 25 ott");
  verifica("dataISO usa la data locale", dataISO(new Date(2026, 0, 5, 0, 30)), "2026-01-05");
  verifica("leggiData non sposta il giorno per il fuso orario", leggiData("2026-03-29").getDate(), 29);
});

gruppo("Testi", function () {
  verifica("testo() protegge i caratteri speciali", testo('<b>"A&B"</b>'), "&lt;b&gt;&quot;A&amp;B&quot;&lt;/b&gt;");
  verifica("testo() di un valore vuoto è una stringa vuota", testo(null), "");
  verifica("iniziali di un nome di squadra", iniziali("Canottieri Baldesio"), "CB");
  verifica("iniziali ignorano numeri e simboli", iniziali("Ciria Calcio 2020"), "CC");
});

gruppo("Esito di una partita", function () {
  verifica("senza gol non è giocata", giocata({ golNostri: null, golLoro: null }), false);
  verifica("con i gol è giocata", giocata({ golNostri: 0, golLoro: 0 }), true);
  verifica("vittoria", esito({ golNostri: 2, golLoro: 1 }), "V");
  verifica("pareggio", esito({ golNostri: 1, golLoro: 1 }), "N");
  verifica("sconfitta", esito({ golNostri: 0, golLoro: 3 }), "P");
  verifica("partita da giocare: nessun esito", esito({ golNostri: null, golLoro: null }), "");
});


// 3. PARTITE (js/dati/partite.js, scritto da strumenti/aggiorna_risultati.py)
gruppo("Partite: dati completi", function () {
  const idSquadre = SQUADRE.map(function (s) { return s.id; });
  const sbagliate = PARTITE.filter(function (p) {
    return idSquadre.indexOf(p.squadra) === -1 || !DATA_VALIDA.test(p.data) || !p.avversario || !p.campo || !p.competizione;
  });
  verifica("ogni partita ha squadra, data, avversario, campo e competizione", sbagliate.map(function (p) { return p.squadra + " " + p.data; }), []);

  const golAMeta = PARTITE.filter(function (p) { return (p.golNostri === null) !== (p.golLoro === null); });
  verifica("i gol ci sono per entrambe le squadre o per nessuna", golAMeta.length, 0);

  const oraStrana = PARTITE.filter(function (p) { return /\d/.test(p.ora) && !/^\d{2}:\d{2}$/.test(p.ora); });
  verifica("gli orari sono nel formato 14:30", oraStrana.map(function (p) { return p.ora; }), []);

  const stemmi = PARTITE.filter(function (p) { return p.stemma && !/^assets\/img\/avversari\/[a-z0-9-]+\.(webp|png)$/.test(p.stemma); });
  verifica("gli stemmi sono in assets/img/avversari/", stemmi.map(function (p) { return p.stemma; }), []);

  SQUADRE.forEach(function (s) {
    const giornate = partiteDi(s.id).map(function (p) { return p.giornata; });
    verifica(s.nome + ": nessuna giornata ripetuta", doppioni(giornate), []);
  });
});

gruppo("Partite: prossime e risultati", function () {
  const oggi = dataISO(new Date());
  SQUADRE.forEach(function (s) {
    const prossime = prossimePartite(s.id);
    verifica(s.nome + ": le prossime partite non hanno gol e sono da oggi in poi",
      prossime.filter(function (p) { return giocata(p) || p.data < oggi; }).length, 0);
    const date = prossime.map(function (p) { return p.data; });
    verifica(s.nome + ": le prossime partite sono in ordine di data", date, date.slice().sort());
  });
});

gruppo("Classifiche (calcolate dai risultati)", function () {
  Object.keys(CLASSIFICHE).forEach(function (id) {
    const c = CLASSIFICHE[id];
    const righe = c.squadre || [];
    if (!righe.length) return;
    const nome = trovaSquadra(id) ? trovaSquadra(id).nome : id;
    verifica(nome + ": punti = 3 × vittorie + pareggi",
      righe.filter(function (r) { return r.pt !== 3 * r.v + r.n; }).map(function (r) { return r.nome; }), []);
    verifica(nome + ": giocate = vittorie + pareggi + sconfitte",
      righe.filter(function (r) { return r.g !== r.v + r.n + r.p; }).map(function (r) { return r.nome; }), []);
    const fatti = righe.reduce(function (t, r) { return t + r.gf; }, 0);
    const subiti = righe.reduce(function (t, r) { return t + r.gs; }, 0);
    verifica(nome + ": i gol fatti in tutto il girone sono uguali a quelli subiti", fatti, subiti);
    const punti = righe.map(function (r) { return r.pt; });
    verifica(nome + ": in ordine di punti", punti, punti.slice().sort(function (a, b) { return b - a; }));
    verifica(nome + ": il Castelverde c'è una volta sola", righe.filter(function (r) { return r.noi; }).length, 1);
  });
});


// 4. ALTRI DATI
gruppo("Notizie", function () {
  verifica("nessun id ripetuto", doppioni(NOTIZIE.map(function (n) { return n.id; })), []);
  verifica("date nel formato aaaa-mm-gg", NOTIZIE.filter(function (n) { return !DATA_VALIDA.test(n.data); }).map(function (n) { return n.id; }), []);
  verifica("ogni notizia ha titolo, immagine e testo",
    NOTIZIE.filter(function (n) { return !n.titolo || !n.immagine || !n.testo || !n.testo.length; }).map(function (n) { return n.id; }), []);
  verifica("trovaNotizia trova una notizia dal suo id", trovaNotizia(NOTIZIE[0].id).titolo, NOTIZIE[0].titolo);
});

gruppo("Squadre e staff", function () {
  verifica("nessun id di squadra ripetuto", doppioni(SQUADRE.map(function (s) { return s.id; })), []);
  SQUADRE.forEach(function (s) {
    verifica(s.nome + ": ogni persona dello staff ha ruolo e nome",
      (s.staff || []).filter(function (p) { return !p.ruolo || !p.nome; }).length, 0);
    if (s.rosa) verifica(s.nome + ": nessun giocatore ripetuto", doppioni(s.rosa.map(function (g) { return g.cognome + " " + g.nome; })), []);
    if (s.rosa) verifica(s.nome + ": nessun numero di maglia ripetuto", doppioni(s.rosa.map(function (g) { return g.numero; }).filter(function (n) { return n != null; })), []);
  });
});


// 5. COMPONENTI (js/componenti.js)
gruppo("Componenti", function () {
  const prova = { squadra: SQUADRE[0].id, giornata: 1, data: "2026-09-13", ora: "15:30", competizione: "Prova", casa: true,
    avversario: "Squadra <Prova>", stemma: "", campo: "Campo di prova", golNostri: 2, golLoro: 1 };
  const card = htmlCardPartita(prova);
  verifica("la card partita protegge il nome dell'avversario", card.indexOf("Squadra &lt;Prova&gt;") > -1, true);
  verifica("la card di una partita giocata mostra il risultato", card.indexOf("2 - 1") > -1, true);
  verifica("senza stemma compare lo scudo con le iniziali", card.indexOf("scudo-iniziali") > -1, true);
  verifica("la card notizia porta alla pagina della notizia", htmlCardNotizia(NOTIZIE[0]).indexOf("notizia.html?id=") > -1, true);
});


// 6. FILE CHE ESISTONO DAVVERO (immagini citate nei dati)
// Questo controllo chiede ogni file al server, quindi arriva dopo gli altri.
function fileCitati() {
  const elenco = [];
  PARTITE.forEach(function (p) { if (p.stemma) elenco.push(p.stemma); });
  NOTIZIE.forEach(function (n) { elenco.push(n.immagine); });
  SQUADRE.forEach(function (s) {
    elenco.push(s.immagine);
    (s.rosa || []).forEach(function (g) { if (g.foto) elenco.push(g.foto); });
  });
  PARTNER.forEach(function (p) { elenco.push(p.logo); });
  CLUB.organigramma.forEach(function (d) { if (d.foto) elenco.push(d.foto); });
  STORIA.forEach(function (t) { if (t.immagine) elenco.push(t.immagine); });
  return elenco.filter(function (f, i) { return elenco.indexOf(f) === i; });
}

function controllaFile() {
  const elenco = fileCitati();
  return Promise.all(elenco.map(function (f) {
    return fetch("../" + f, { method: "HEAD" })
      .then(function (r) { return r.ok ? null : f; })
      .catch(function () { return f; });
  })).then(function (mancanti) {
    gruppoCorrente = "Immagini";
    verifica("tutte le " + elenco.length + " immagini citate nei dati esistono", mancanti.filter(Boolean), []);
  });
}


// 7. RIEPILOGO
function mostraRisultati() {
  const sbagliati = risultatiControlli.filter(function (r) { return !r.ok; }).length;
  const riepilogo = document.getElementById("riepilogo");
  riepilogo.textContent = sbagliati
    ? "❌ " + sbagliati + " controlli su " + risultatiControlli.length + " non tornano"
    : "✅ Tutti i " + risultatiControlli.length + " controlli sono a posto";
  riepilogo.className = "p-4 font-bold " + (sbagliati ? "bg-acc-avviso-chiaro" : "bg-white");

  let html = "";
  let ultimo = "";
  risultatiControlli.forEach(function (r) {
    if (r.gruppo !== ultimo) {
      html += '<h2 class="mt-8 mb-2 text-lg font-bold">' + testo(r.gruppo) + "</h2>";
      ultimo = r.gruppo;
    }
    html += '<p class="py-1.5 border-b border-acc-linea text-sm">' + (r.ok ? "✅ " : "❌ ") + testo(r.descrizione) +
      (r.dettaglio ? '<br><span class="text-acc-rosso-scuro">' + testo(r.dettaglio) + "</span>" : "") + "</p>";
  });
  document.getElementById("elenco").innerHTML = html;
}

controllaFile().then(mostraRisultati);
