/* ==================================================================
   A.C. Castelverde — js/dati/storia.js
   Le tappe della storia (pagina Società, sezione "La nostra storia").
   Testo ripreso dalla storia pubblicata sul vecchio sito della società.
   Per aggiungere una tappa: copia un blocco e mettilo nell'ordine giusto.
   credito: (facoltativo) autore e licenza della foto, compare sotto l'immagine.
   Le foto di Wikimedia Commons sono in licenza CC BY-SA: il credito va lasciato.
   ================================================================== */

const STORIA = [
  {
    anno: "1987",
    titolo: "La fondazione",
    immagine: "assets/img/club/storia-1987.webp",
    credito: "Il municipio e il campanile di Castelverde · Foto Grasso83, CC BY-SA 3.0, Wikimedia Commons",
    testo: "Nel luglio 1987 alcuni giovani di Castelverde fondano l'Associazione Calcio per tornare a giocare nel proprio paese: a parte una breve apparizione nel 1977, non c'era mai stata una squadra iscritta ai campionati F.I.G.C. La squadra viene presentata in piazza; a darle il battesimo arrivano il presidente dell'U.S. Cremonese Domenico Luzzara, il suo vice Giuseppe Miglioli, socio fondatore, il direttore sportivo Erminio Favalli e l'allenatore Mazzia. Primo presidente è Giovanni Giovanardi, con i vice Ulisse Caccialanza e Giuseppe Taietti; direttore sportivo Giuseppe Miglioli, allenatore Biddau. Il primo campionato di Terza Categoria si chiude con un onorevole quarto posto."
  },
  {
    anno: "1988",
    titolo: "Arriva Tiziano Ascagni",
    immagine: "",
    testo: "Nasce la prima squadra giovanile, iscritta al campionato provinciale Allievi. Arriva come giocatore e allenatore Tiziano Ascagni, ex professionista di Cremonese, Triestina, Parma e Brescia: con le sue reti il Castelverde chiude secondo dietro alla Marini. La presidenza passa a Ulisse Caccialanza."
  },
  {
    anno: "1989",
    titolo: "La marcia trionfale",
    immagine: "",
    testo: "Sotto la guida di mister Ascagni arrivano il titolo provinciale, la Coppa Disciplina e la promozione in Seconda Categoria, anche grazie alle trenta reti del bomber \"Cacio\" Claudio Villa, miglior marcatore di tutte le categorie dilettantistiche della stagione."
  },
  {
    anno: "1990/91",
    titolo: "Promozione in Prima Categoria",
    immagine: "",
    testo: "Un ottimo secondo posto alle spalle del Vigolo Marchese vale la promozione in Prima Categoria. In questi anni è decisiva l'opera del presidente Ulisse Caccialanza, vero tuttofare della società, sempre consigliato da Giuseppe Miglioli."
  },
  {
    anno: "1993/94",
    titolo: "Il \"magico\" Chiorri",
    immagine: "",
    testo: "Dopo la retrocessione del 1992/93, il Castelverde tessera Alviero Chiorri, stella del calcio nazionale che a 34 anni aveva lasciato il professionismo. Nel girone d'andata dà uno spettacolo mai visto in questi campionati, poi a dicembre torna a Genova."
  },
  {
    anno: "1995/96",
    titolo: "Di nuovo in Seconda",
    immagine: "",
    testo: "Dopo la retrocessione in Terza Categoria con Giovanni Gandolfi, la squadra riconquista subito la Seconda Categoria sotto la guida di Francesco Vaccari. Dal 1996/97 il direttore sportivo è Ivano Dolara."
  },
  {
    anno: "1997",
    titolo: "Il nuovo campo",
    immagine: "assets/img/club/storia-campo-1997.webp",
    testo: "Fino ad allora la prima squadra giocava sul campo dell'oratorio, concesso dalla Parrocchia, e i giovani a Costa Sant'Abramo. Il Comune di Castelverde costruisce l'attuale impianto sportivo di via dei Gerani e ne affida la gestione alla società."
  },
  {
    anno: "2001",
    titolo: "Rinasce il settore giovanile",
    immagine: "",
    testo: "Con l'entusiasmo di nuovi dirigenti e l'esperienza di Mauro Grazioli riparte il settore giovanile: in poco tempo nascono la scuola calcio e le squadre di tutte le categorie, con vittorie nei campionati provinciali e l'accesso a quelli regionali."
  },
  {
    anno: "2007",
    titolo: "La presidenza Arcari",
    immagine: "",
    testo: "Dopo Ulisse Caccialanza, che resta in società come direttore generale, e Luigi Villa, dal giugno 2007 la presidenza passa ad Adriano Arcari. La società arriva a contare, oltre alla prima squadra, dieci squadre giovanili e una scuola calcio riconosciuta dalla Federazione."
  },
  {
    anno: "2020",
    titolo: "Di nuovo in Prima Categoria",
    immagine: "assets/img/club/storia-2020.webp",
    credito: "La prima squadra 2019/20 al campo di via dei Gerani",
    testo: "La stagione 2019/20 si ferma a marzo per l'emergenza Covid-19. Quando la Federazione rende ufficiali le classifiche, il Castelverde è primo nel suo girone di Seconda Categoria e viene promosso in Prima Categoria."
  },
  {
    anno: "2024",
    titolo: "Il campo porta il nome di Giuseppe Miglioli",
    immagine: "",
    testo: "Il 20 aprile 2024 il Comune intitola il campo sportivo di via dei Gerani a Giuseppe Miglioli, vicepresidente dell'U.S. Cremonese accanto a Domenico Luzzara e socio fondatore del Castelverde nel 1987. Il piazzale davanti all'impianto è dedicato alla U.S. Velox, l'altra sua grande passione."
  },
  {
    anno: "Oggi",
    titolo: "Cresciamo insieme",
    immagine: "assets/img/club/storia-oggi.webp",
    credito: "La prima squadra 2026/27",
    testo: "Il Castelverde scende in campo con quattro squadre agonistiche: la prima squadra in Seconda Categoria, la Juniores nel Campionato Regionale Under 19, Allievi e Giovanissimi nei provinciali cremonesi. Lo spirito è sempre quello del 1987: pazienza, forza e volontà, al servizio del paese e del territorio."
  }
];
