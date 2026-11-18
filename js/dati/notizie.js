/* ==================================================================
   A.C. Castelverde — js/dati/notizie.js
   Tutte le notizie del sito. La più recente va IN CIMA alla lista.

   Per aggiungere una notizia: copia un blocco { ... }, incollalo in cima
   e cambia i campi. Ogni campo:
     id          parola unica senza spazi: diventa l'indirizzo
                 (notizia.html?id=stagione-2026-27)
     data        "AAAA-MM-GG"
     categoria   una di CATEGORIE_NOTIZIE (qui sotto)
     titolo      il titolo (nel sito appare in maiuscolo)
     sommario    1-2 righe per le card
     immagine    percorso della foto (vedi assets/img/LEGGIMI.md)
     apertura    true = notizia in evidenza: è la card grande delle "Ultime notizie" in Home
     testo       i paragrafi dell'articolo, uno per riga
     esempio     true = testo di esempio da sostituire

   Le notizie con esempio: false raccontano fatti veri della società.
   ================================================================== */

const CATEGORIE_NOTIZIE = ["Società", "Prima squadra", "Settore giovanile", "Storia"];

const NOTIZIE = [
  {
    id: "stagione-2026-27",
    data: "2026-10-29",
    categoria: "Società",
    titolo: "Stagione 2026/27: quattro squadre in campo",
    sommario: "Prima squadra in Seconda Categoria, Juniores nel regionale Under 19, Allievi e Giovanissimi nei provinciali cremonesi.",
    immagine: "assets/img/notizie/apertura-01.webp",
    apertura: true,
    esempio: false,
    testo: [
      "L'A.C. Castelverde affronta la stagione 2026/27 con quattro squadre nell'attività agonistica.",
      "La prima squadra gioca il campionato di Seconda Categoria. La Juniores è impegnata nel Campionato Regionale Under 19, mentre Allievi (Under 17) e Giovanissimi (Under 15) disputano i campionati provinciali cremonesi.",
      "Calendari, risultati e rose di tutte le squadre sono nelle pagine Squadre e Calendario del sito.",
      "[Completare con allenatori, obiettivi e novità della stagione.]"
    ]
  },


  {
    id: "storia-dal-1987",
    data: "2026-10-12",
    categoria: "Storia",
    titolo: "Dal 1987 a oggi: la nostra storia",
    sommario: "Tutto è nato dal desiderio di alcuni ragazzi di tornare a giocare a calcio nel proprio paese.",
    immagine: "assets/img/club/storia-1987.webp",
    apertura: false,
    esempio: false,
    testo: [
      "L'Associazione Calcio Castelverde è stata fondata nel luglio 1987 per il desiderio di alcuni giovani di Castelverde di tornare a giocare a calcio nel proprio paese.",
      "L'iniziativa ebbe un successo immediato: a parte una breve apparizione nel 1977, a Castelverde non c'era mai stata una squadra iscritta ai campionati della F.I.G.C. Pochi giorni prima dell'inizio del campionato la squadra fu presentata al paese in piazza, alla presenza del presidente dell'U.S. Cremonese Domenico Luzzara.",
      "Da allora il Castelverde non si è più fermato: oggi scende in campo con quattro squadre agonistiche allo Stadio Comunale N.1 di via dei Gerani. La storia completa è nella pagina Società."
    ]
  },
  {
    id: "castelverde-primavera-bassa",
    data: "2026-11-01",
    categoria: "Prima squadra",
    titolo: "Castelverde - Primavera Bassa 2-1",
    sommario: "Ottava giornata: a Castelverde decidono Piazzi e Galimberti. Quarta vittoria in campionato.",
    immagine: "assets/img/notizie/apertura-02.webp",
    apertura: true,
    esempio: false,
    testo: [
      "Allo Stadio Comunale N.1 di via dei Gerani la prima squadra batte 2-1 la Primavera Bassa Cremonese nell'ottava giornata del girone H di Seconda Categoria.",
      "Per il Castelverde vanno a segno Piazzi e Galimberti; per gli ospiti accorcia Meledje.",
      "Domenica prossima la squadra è in trasferta a Cremona, sul campo dell'Esperia Calcio."
    ]
  },
  {
    id: "juniores-spinese",
    data: "2026-10-31",
    categoria: "Settore giovanile",
    titolo: "Juniores, 2-1 a Spino d'Adda",
    sommario: "Vittoria in trasferta sul campo dello Spinese Oratorio: a segno Longo e Gagliardi.",
    immagine: "assets/img/notizie/apertura-03.webp",
    apertura: true,
    esempio: false,
    testo: [
      "La Juniores vince 2-1 sul campo dello Spinese Oratorio nell'ottava giornata del Campionato Regionale Under 19 (girone F).",
      "Gol di Longo e Gagliardi. Per la squadra è la quinta vittoria di fila.",
      "Sabato prossimo si gioca in casa contro il Casalpusterlengo."
    ]
  },
  {
    id: "castelverde-canottieri-baldesio",
    data: "2026-10-11",
    categoria: "Prima squadra",
    titolo: "Castelverde - Canottieri Baldesio 1-1",
    sommario: "Allo Stadio Comunale N.1 finisce in parità: per i nostri a segno Rozzi.",
    immagine: "assets/img/notizie/notizia-07.webp",
    apertura: false,
    esempio: false,
    testo: [
      "Pareggio casalingo per la prima squadra di mister Salvatore Puzone, che allo Stadio Comunale N.1 di via dei Gerani chiude 1-1 contro la Canottieri Baldesio nel campionato di Seconda Categoria.",
      "Per il Castelverde va a segno Rozzi; per gli ospiti risponde Antonioli.",
      "Quinta giornata del campionato di Seconda Categoria (girone H)."
    ]
  },
  {
    id: "allievi-san-luigi",
    data: "2026-10-31",
    categoria: "Settore giovanile",
    titolo: "Allievi, 12-0 al San Luigi",
    sommario: "Ancora imbattuti gli Under 17: cinque vittorie e un pareggio, 50 gol segnati in sei partite.",
    immagine: "assets/img/notizie/apertura-04.webp",
    apertura: true,
    esempio: false,
    testo: [
      "Gli Allievi del Castelverde battono 12-0 il San Luigi a Castelverde nella settima giornata del Campionato Provinciale Cremonese Under 17 (girone B).",
      "In gol Cottone (tripletta), Mancini, Longo e Sakti (doppiette), Ronchi, Bolzoni e Brugnano.",
      "Dopo il pareggio all'esordio con il Casalbuttano, la squadra ha vinto tutte le partite: 4-1 alla Soresinese, 6-1 all'Oratorio Cava Digidue, 20-1 al Persico Dosimo, 7-0 al Leoncelli e 12-0 al San Luigi."
    ]
  },

  {
    id: "juniores-verolese",
    data: "2026-10-10",
    categoria: "Settore giovanile",
    titolo: "Juniores, 2-0 alla Verolese",
    sommario: "Vittoria casalinga per gli Under 19 nel Campionato Regionale.",
    immagine: "assets/img/notizie/notizia-08.webp",
    apertura: false,
    esempio: false,
    testo: [
      "La Juniores del Castelverde batte 2-0 la Verolese allo Stadio Comunale N.1 nel Campionato Regionale Under 19.",
      "A segno Longo e Bkir."
    ]
  },
  {
    id: "campo-via-dei-gerani",
    data: "2026-09-28",
    categoria: "Storia",
    titolo: "Il campo di via dei Gerani compie 29 anni",
    sommario: "Fino al 1997 la prima squadra giocava sul campo dell'oratorio. Poi il Comune ha costruito l'impianto di oggi.",
    immagine: "assets/img/notizie/notizia-01.webp",
    apertura: false,
    esempio: false,
    testo: [
      "Fino alla stagione 1996/97 le partite di campionato della prima squadra si giocavano sul campo dell'oratorio di Castelverde, concesso dalla Parrocchia, mentre le squadre giovanili giocavano sul campo comunale di Costa Sant'Abramo.",
      "Nel 1997 l'Amministrazione comunale ha costruito l'attuale impianto sportivo e, con un'apposita convenzione, ne ha affidato la gestione alla società.",
      "Dal 20 aprile 2024 il campo porta il nome di Giuseppe Miglioli, socio fondatore del Castelverde e vicepresidente dell'U.S. Cremonese; il piazzale davanti all'impianto è dedicato alla U.S. Velox."
    ]
  },
  {
    id: "alviero-chiorri",
    data: "2026-09-14",
    categoria: "Storia",
    titolo: "Quando il \"magico\" Chiorri giocava a Castelverde",
    sommario: "Nel 1993/94 arrivò in paese una stella del calcio nazionale. Uno spettacolo mai visto nei nostri campionati.",
    immagine: "assets/img/notizie/notizia-03.webp",
    apertura: false,
    esempio: false,
    testo: [
      "Per il campionato 1993/94, grazie a Giuseppe Miglioli, il Castelverde riuscì a tesserare Alviero Chiorri, stella di prima grandezza del calcio nazionale che, a soli 34 anni, aveva deciso di smettere con il professionismo.",
      "Nelle partite disputate, solo il girone d'andata perché a dicembre tornò a Genova, il \"magico\" diede uno spettacolo che raramente, per non dire mai, si era visto in questi campionati."
    ]
  },
  {
    id: "hall-of-fame-casteddu",
    data: "2026-05-10",
    categoria: "Storia",
    titolo: "Hall of Fame: il ritorno delle vecchie glorie",
    sommario: "Sabato 16 maggio, alle 17, le vecchie glorie del Castelverde tornano sul prato di via dei Gerani.",
    immagine: "assets/img/notizie/notizia-06.webp",
    apertura: false,
    esempio: false,
    testo: [
      "\"Il ritorno di vecchie glorie sul prato verde di Castelverde\": sabato 16 maggio alle 17:00, allo Stadio Comunale N.1 di via dei Gerani, la Hall of Fame dedicata a Casteddu.",
      "[Completare con il programma della giornata e i nomi dei protagonisti.]"
    ]
  },
  {
    id: "diventa-partner",
    data: "2026-09-07",
    categoria: "Società",
    titolo: "Diventa partner del Castelverde",
    sommario: "Le aziende del territorio che sostengono la società hanno il loro marchio sul sito e sulle grafiche delle partite. C'è posto anche per te.",
    immagine: "assets/img/notizie/notizia-04.webp",
    apertura: false,
    esempio: false,
    testo: [
      "Dal 1987 l'A.C. Castelverde vive grazie alle persone e alle aziende del paese. Oggi la società porta in campo quattro squadre agonistiche, dalla Seconda Categoria agli Under 15, e decine di ragazzi che si allenano ogni settimana allo Stadio Comunale di via dei Gerani.",
      "Sostenere il Castelverde vuol dire aiutare concretamente il settore giovanile: iscrizioni ai campionati, materiale tecnico, trasferte e la cura del campo. In cambio, il marchio dell'azienda accompagna la squadra per tutta la stagione.",
      "Il logo dei partner compare nella sezione \"I nostri partner\" in fondo a ogni pagina di questo sito e nelle grafiche Instagram della società (Match day, Starting XI, Full time), che raccontano ogni partita della stagione.",
      "Oggi sono con noi Unical, Reale Mutua, Selica Costruzioni, DD Sistemi, Omega Verifiche Impianti, Vancom Imballaggi, Tecnopubblica e Opel Dal Ben & Barbieri: grazie a tutti loro.",
      "Se la tua azienda vuole unirsi, scrivici dalla pagina Contatti scegliendo \"Diventare partner\", oppure chiamaci: costruiamo insieme la formula più adatta."
    ]
  }
];
