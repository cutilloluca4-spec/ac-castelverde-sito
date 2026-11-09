/* ==================================================================
   A.C. Castelverde — js/dati/club.js
   ⭐ I dati della società: UNICO punto da cambiare.
   Menu, footer e pagine Società / Contatti leggono da qui:
   se cambia il telefono o il presidente, si cambia solo questo file.

   Le informazioni segnate "DA VERIFICARE" vengono dal vecchio sito
   (castelverdecalcio1987.it) e vanno ricontrollate prima di pubblicare.
   ================================================================== */

const CLUB = {
  nome: "A.C. Castelverde",
  nomeCompleto: "Associazione Calcio Castelverde A.S.D.",
  fondazione: 1987,
  motto: "Cresciamo insieme, dal 1987",
  stagione: "2026/27",
  categoria: "Seconda Categoria · Cremona",   // DA VERIFICARE: girone della stagione

  // Avviso facoltativo sopra calendario e risultati (es. "Campionati sospesi per neve").
  // Se è vuoto compare "Risultati aggiornati il …" con la data dell'ultimo aggiornamento.
  avvisoCalendario: "",

  contatti: {
    email: "info@castelverdecalcio1987.it",   // DA VERIFICARE
    telefono: "+39 348 901 6995",             // numero provvisorio: da sostituire con il numero della società
    telefonoLink: "+393489016995",
    indirizzo: "Via dei Gerani, 39",
    cap: "26022",
    citta: "Castelverde (CR)",
    mappa: "https://www.google.com/maps/search/?api=1&query=Via+dei+Gerani+39+26022+Castelverde+CR"
  },

  social: {
    // Il club usa solo Instagram (se l'indirizzo è vuoto il link sparisce da tutto il sito)
    instagram: "https://www.instagram.com/ac_castelverde1987/",
    instagramNome: "@ac_castelverde1987"
  },

  // Modulo della pagina Contatti: i messaggi arrivano per email tramite Web3Forms
  // (gratuito, https://web3forms.com). Si crea la chiave con l'email della società
  // e la si incolla qui. Finché è vuota, "Invia" apre il programma di posta
  // con il messaggio già scritto: nessun messaggio va perso.
  modulo: {
    chiaveWeb3Forms: ""
  },

  fiscale: {
    codiceFiscale: "00964030191",   // DA VERIFICARE
    partitaIva: "00964030191"
  },

  // Figure dirigenziali (pagina dirigenza.html): una riga per persona.
  //   ruoli   uno o più incarichi; il primo della lista è il principale
  //   foto    ritratto JPG 800×1000 in assets/img/dirigenti/ (vuoto = sagoma)
  //   email   facoltativa: compare il pulsante "Scrivi"
  // La prima persona della lista (il presidente) ha la scheda grande.
  // Per aggiungere un dirigente basta copiare una riga.
  organigramma: [
    { nome: "Santo Mussa",    ruoli: ["Presidente"], foto: "", email: "" },
    { nome: "Luca Carnevali", ruoli: ["Vicepresidente", "Direttore sportivo"], foto: "", email: "" },
    { nome: "Luca Cutillo",   ruoli: ["Segretario", "Responsabile del settore giovanile"], foto: "", email: "" }
  ],

  impianti: [
    {
      nome: "Stadio Comunale N.1",
      indirizzo: "Via dei Gerani, 39 · Castelverde (CR)",
      descrizione: "Costruito dal Comune nel 1997 e affidato in gestione alla società, dal 2024 è intitolato a Giuseppe Miglioli: è la casa dell'A.C. Castelverde.",
      mappa: "https://www.google.com/maps/search/?api=1&query=Via+dei+Gerani+39+26022+Castelverde+CR"
    }
  ],

  // I numeri della sezione "Il club in numeri" (Home e Società)
  numeri: [
    { valore: 1987, etichetta: "Anno di fondazione" },
    { valore: 4, etichetta: "Squadre agonistiche" },
    { valore: 39, etichetta: "Anni di storia" },
    { valore: 21, etichetta: "Giocatori in prima squadra" }
  ]
};
