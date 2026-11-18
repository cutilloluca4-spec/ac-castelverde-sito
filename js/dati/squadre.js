/* ==================================================================
   A.C. Castelverde — js/dati/squadre.js
   Le squadre della società nella stagione 2026/27: le 4 squadre
   dell'attività agonistica, il loro staff e la rosa della prima squadra.

   Ogni squadra:
     id          parola unica: è anche l'indirizzo (squadre.html#juniores)
                 e il collegamento con le partite in partite.js
     nome        come appare nel sito
     categoria   etichetta breve (es. "Under 19")
     campionato  campionato della stagione
     annate      es. "2008-2009" (vuoto per la prima squadra)
     immagine    foto di squadra (vedi assets/img/LEGGIMI.md)
     livello     (facoltativo) "Regionale" o "Provinciale": compare accanto alla categoria nella pagina Dirigenza
     descrizione 1-2 frasi
     staff       [{ ruolo, nome }]
     allenamenti es. "Martedì e giovedì, 19:30 - 21:00"
     rosa        solo per chi ha la rosa: [{ numero, nome, cognome, ruolo, fascia, foto }]
                 numero: numero di maglia (non compare sulla card; null se non c'è)
                 nome: nome di battesimo (presi dalle classifiche marcatori di Tuttocampo)
                 ruolo: "Portiere", "Difensore", "Centrocampista", "Attaccante" (o vuoto)
                 fascia: "C" capitano, "VC" vice capitano (facoltativo)
                 foto: ritratto scontornato (WebP o PNG trasparente, 800×1000) in assets/img/giocatori/
                       (vuoto = sagoma segnaposto)

   La rosa della prima squadra viene dalla grafica "Starting XI"
   (vs. Cannetese). Mancano i ruoli.
   Staff, annate e orari: stagione 2026/27.
   ================================================================== */

const RUOLI = ["Portiere", "Difensore", "Centrocampista", "Attaccante"];

const ROSA_PRIMA_SQUADRA = [
  { numero: 1,  cognome: "Milanesi",    nome: "Matteo", ruolo: "Portiere" },
  { numero: 2,  cognome: "Robuschi",    nome: "Davide", ruolo: "" },
  { numero: 3,  cognome: "Jawara",      nome: "Saikou", ruolo: "", foto: "assets/img/giocatori/jawara.webp" },
  { numero: 4,  cognome: "Annecchino",  nome: "Nicolò", ruolo: "" },
  { numero: 5,  cognome: "Mazzini",     nome: "Liam", ruolo: "", fascia: "C" },
  { numero: 6,  cognome: "Gaboardi",    nome: "Marco", ruolo: "" },
  { numero: 7,  cognome: "Piazzi",      nome: "Alessandro", ruolo: "" },
  { numero: 8,  cognome: "Rossi",       nome: "Filippo", ruolo: "", fascia: "VC" },
  { numero: 9,  cognome: "Camino",      nome: "Jorge Luis", ruolo: "" },
  { numero: 10, cognome: "Rozzi",       nome: "Luca", ruolo: "" },
  { numero: 11, cognome: "Galimberti",  nome: "Giovanni", ruolo: "" },
  { numero: 12, cognome: "Margariti",   nome: "Luca", ruolo: "" },
  { numero: 13, cognome: "Facciocchi",  nome: "Marco", ruolo: "" },
  { numero: 14, cognome: "Passera",     nome: "Michele", ruolo: "" },
  { numero: 15, cognome: "Longo",       nome: "Lorenzo", ruolo: "", foto: "assets/img/giocatori/longo.webp" },
  { numero: 16, cognome: "Franzosi",    nome: "Davide", ruolo: "", foto: "assets/img/giocatori/franzosi.webp" },
  { numero: 17, cognome: "Pedroni",     nome: "Emanuele", ruolo: "", foto: "assets/img/giocatori/pedroni.webp" },
  { numero: 18, cognome: "Ravasi",      nome: "Nicolò", ruolo: "", foto: "assets/img/giocatori/ravasi.webp" },
  { numero: 19, cognome: "Alberti",     nome: "Gioele", ruolo: "", foto: "assets/img/giocatori/alberti.webp" },
  { numero: 20, cognome: "Bassanetti",  nome: "Luca", ruolo: "", foto: "assets/img/giocatori/bassanetti.webp" },
  { numero: null, cognome: "Bonazzoli", nome: "Giacomo", ruolo: "", foto: "assets/img/giocatori/bonazzoli.webp" }
];

const SQUADRE = [
  {
    id: "prima-squadra",
    nome: "Prima squadra",
    categoria: "Seconda Categoria",
    campionato: "Seconda Categoria",
    annate: "",
    immagine: "assets/img/squadre/prima-squadra.webp",
    descrizione: "La squadra che rappresenta Castelverde nei campionati dilettantistici della F.I.G.C. dal 1987.",
    staff: [
      { ruolo: "Allenatore", nome: "Salvatore Puzone" },
      { ruolo: "Vice allenatore", nome: "Domenico Settimini" },
      { ruolo: "Preparatore dei portieri", nome: "Massimo Vicardi" },
      { ruolo: "Collaboratore tecnico", nome: "Jacopo Chiodi" },
      { ruolo: "Direttore sportivo", nome: "Luca Carnevali" },
      { ruolo: "Dirigente", nome: "Giulio Scolari" },
      { ruolo: "Dirigente", nome: "Francesco Muco" },
      { ruolo: "Medico", nome: "Antonio La Sala" }
    ],
    allenamenti: "Mercoledì e venerdì, 19:30 - 21:00",
    sponsor: "Unical",
    rosa: ROSA_PRIMA_SQUADRA
  },
  {
    id: "juniores",
    nome: "Juniores",
    categoria: "Under 19",
    livello: "Regionale",
    campionato: "Campionato Regionale Under 19",
    annate: "2007 - 2008 - 2009",
    immagine: "assets/img/squadre/juniores.webp",
    descrizione: "Gli Under 19 nel campionato regionale lombardo: l'ultimo passo prima della prima squadra.",
    sponsor: "Selica Costruzioni",
    staff: [
      { ruolo: "Allenatore", nome: "Ettore Benazzi" },
      { ruolo: "Vice allenatore", nome: "Roberto Alquati" },
      { ruolo: "Dirigente", nome: "Ivan Spoldi" },
      { ruolo: "Dirigente", nome: "Giovanni Franzosi" }
    ],
    allenamenti: "Martedì e giovedì, 19:30 - 21:00"
  },
  {
    id: "allievi",
    nome: "Allievi",
    categoria: "Under 17",
    livello: "Provinciale",
    campionato: "Campionato Provinciale Cremonese Under 17",
    annate: "2010 - 2011",
    immagine: "assets/img/squadre/allievi.webp",
    descrizione: "Gli Under 17 nel campionato provinciale di Cremona.",
    sponsor: "DD Sistemi",
    staff: [
      { ruolo: "Allenatore", nome: "Emiliano Zigliani" },
      { ruolo: "Vice allenatore", nome: "Luca Cutillo" },
      { ruolo: "Collaboratore tecnico", nome: "Lorenzo Balestreri" },
      { ruolo: "Dirigente", nome: "Loris Boccaccia" },
      { ruolo: "Dirigente", nome: "Ernesto Zigliani" }
    ],
    allenamenti: "Martedì e giovedì, 18:00 - 19:30"
  },
  {
    id: "giovanissimi",
    nome: "Giovanissimi",
    categoria: "Under 15",
    livello: "Provinciale",
    campionato: "Campionato Provinciale Cremonese Under 15",
    annate: "2012 - 2013 - 2014",
    immagine: "assets/img/squadre/giovanissimi.webp",
    descrizione: "Gli Under 15 nel campionato provinciale di Cremona.",
    sponsor: "Unical",
    staff: [
      { ruolo: "Allenatore", nome: "Gianluca Silla" },
      { ruolo: "Vice allenatore", nome: "Alessandro Masseroli" },
      { ruolo: "Preparatore dei portieri", nome: "Alessandro Guarneri" },
      { ruolo: "Collaboratore tecnico", nome: "Nicola Carini" },
      { ruolo: "Dirigente", nome: "Alessio Superti" }
    ],
    allenamenti: "Mercoledì e venerdì, 18:00 - 19:30"
  }
];
