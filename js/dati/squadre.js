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
     descrizione 1-2 frasi
     staff       [{ ruolo, nome }]
     allenamenti es. "Martedì e giovedì, 19:30 - 21:00"
     rosa        solo per chi ha la rosa: [{ numero, nome, cognome, ruolo, fascia, foto }]
                 ruolo: "Portiere", "Difensore", "Centrocampista", "Attaccante" (o vuoto)
                 fascia: "C" capitano, "VC" vice capitano (facoltativo)
                 foto: ritratto PNG con sfondo trasparente in assets/img/giocatori/
                       (vuoto = sagoma segnaposto)

   La rosa della prima squadra viene dalla grafica "Starting XI"
   (vs. Cannetese). Mancano i nomi di battesimo e i ruoli: da completare.
   Staff, annate e orari: stagione 2026/27.
   ================================================================== */

const RUOLI = ["Portiere", "Difensore", "Centrocampista", "Attaccante"];

const ROSA_PRIMA_SQUADRA = [
  { numero: 1,  cognome: "Milanesi",    nome: "", ruolo: "Portiere" },
  { numero: 2,  cognome: "Robuschi",    nome: "", ruolo: "" },
  { numero: 3,  cognome: "Jawara",      nome: "", ruolo: "" },
  { numero: 4,  cognome: "Annecchino",  nome: "", ruolo: "" },
  { numero: 5,  cognome: "Mazzini",     nome: "", ruolo: "", fascia: "C" },
  { numero: 6,  cognome: "Gaboardi",    nome: "", ruolo: "" },
  { numero: 7,  cognome: "Piazzi",      nome: "", ruolo: "" },
  { numero: 8,  cognome: "Rossi",       nome: "", ruolo: "", fascia: "VC" },
  { numero: 9,  cognome: "Camino",      nome: "", ruolo: "" },
  { numero: 10, cognome: "Rozzi",       nome: "L.", ruolo: "" },
  { numero: 11, cognome: "Galimberti",  nome: "", ruolo: "" },
  { numero: 12, cognome: "Margariti",   nome: "", ruolo: "" },
  { numero: 13, cognome: "Faciocchi",   nome: "", ruolo: "" },
  { numero: 14, cognome: "Passera",     nome: "", ruolo: "" },
  { numero: 15, cognome: "Longo",       nome: "", ruolo: "" },
  { numero: 16, cognome: "Franzosi",    nome: "", ruolo: "" },
  { numero: 17, cognome: "Pedroni",     nome: "", ruolo: "" },
  { numero: 18, cognome: "Ravasi",      nome: "", ruolo: "" },
  { numero: 19, cognome: "Alberti",     nome: "", ruolo: "" },
  { numero: 20, cognome: "Bassanetti",  nome: "", ruolo: "" }
];

const SQUADRE = [
  {
    id: "prima-squadra",
    nome: "Prima squadra",
    categoria: "Seconda Categoria",
    campionato: "Seconda Categoria",
    annate: "",
    immagine: "assets/img/squadre/prima-squadra.jpg",
    descrizione: "La squadra che rappresenta Castelverde nei campionati dilettantistici della F.I.G.C. dal 1987.",
    staff: [
      { ruolo: "Allenatore", nome: "Salvatore Puzone" },
      { ruolo: "Vice allenatore", nome: "Domenico Settimini" },
      { ruolo: "Preparatore dei portieri", nome: "Massimo Vicardi" },
      { ruolo: "Direttore sportivo", nome: "Luca Carnevali" },
      { ruolo: "Dirigente accompagnatore", nome: "Giulio Scolari" },
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
    campionato: "Campionato Regionale Under 19",
    annate: "2007 - 2008 - 2009",
    immagine: "assets/img/squadre/juniores.jpg",
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
    campionato: "Campionato Provinciale Cremonese Under 17",
    annate: "2010 - 2011",
    immagine: "assets/img/squadre/allievi.jpg",
    descrizione: "Gli Under 17 nel campionato provinciale di Cremona.",
    sponsor: "DD Sistemi",
    staff: [
      { ruolo: "Allenatore", nome: "Emiliano Zigliani" },
      { ruolo: "Collaboratore tecnico", nome: "Luca Cutillo" },
      { ruolo: "Dirigente", nome: "Loris Boccaccia" },
      { ruolo: "Addetto all'arbitro", nome: "Ernesto Zigliani" },
      { ruolo: "Collaboratore", nome: "Lorenzo Balestreri" }
    ],
    allenamenti: "Martedì e giovedì, 18:00 - 19:30"
  },
  {
    id: "giovanissimi",
    nome: "Giovanissimi",
    categoria: "Under 15",
    campionato: "Campionato Provinciale Cremonese Under 15",
    annate: "2012 - 2013 - 2014",
    immagine: "assets/img/squadre/giovanissimi.jpg",
    descrizione: "Gli Under 15 nel campionato provinciale di Cremona.",
    sponsor: "Unical",
    staff: [
      { ruolo: "Allenatore", nome: "Gianluca Silla" },
      { ruolo: "Collaboratore tecnico", nome: "Alessandro Masseroli" },
      { ruolo: "Preparatore dei portieri", nome: "Alessandro Guarneri" },
      { ruolo: "Collaboratore", nome: "Alessio Superti" },
      { ruolo: "Collaboratore", nome: "Nicola Carini" }
    ],
    allenamenti: "Mercoledì e venerdì, 18:00 - 19:30"
  }
];
