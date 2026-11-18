# Primi passi

Guida per chi apre il progetto per la prima volta. In 10 minuti: dove sta cosa e come si fanno le modifiche più comuni.

## 1. Dove sta cosa

| Voglio cambiare… | Apro… |
| --- | --- |
| una notizia, una partita, un giocatore, un contatto | `js/dati/` (vedi [aggiornare-i-contenuti.md](aggiornare-i-contenuti.md)) |
| un testo fisso (es. l'apertura della Home, le card "Dal 1987") | la pagina `.html`, cercando il commento `<!-- ===== … ===== -->` della sezione |
| un colore in tutto il sito | `design-system/colori.css` |
| il nome Tailwind di un colore, un'ombra o una larghezza dello schermo (`tablet:`) | `design-system/tema.css` |
| come è fatta una card (notizia, partita, giocatore) | `js/componenti.js` |
| il menu o il footer | `js/layout.js` |
| l'ordine o il contenuto delle sezioni della Home | `index.html` + `js/pagine/home.js` |
| la velocità di un'animazione | `js/animazioni.js` (comparse) o `js/pagine/home-apertura.js` (apertura) |

## 2. Esempi pratici

**Cambiare lo spazio sopra un titolo.** Nell'HTML il titolo ha classi Tailwind come `mt-5` (margine sopra). `mt-5` = 20 px, `mt-8` = 32 px, `mt-[50px]` = esattamente 50 px.

**Cambiare la grandezza di un titolo.** `text-[52px] tablet:text-[72px]` = 52 px su smartphone, 72 px da 600 px in su. Cambia i numeri.

**Cambiare il rosso.** In `design-system/colori.css` cambia `--color-rosso`. Si aggiorna ovunque: pulsanti, trame, card, linee.

**Aggiungere una pagina al menu.** In `js/layout.js` aggiungi una riga a `VOCI_MENU`:

```js
{ id: "galleria", nome: "Galleria", indirizzo: "galleria.html" },
```

Poi crea `galleria.html` copiando `privacy-cookie.html` (è la più semplice), metti `data-pagina="galleria"` sul `<body>` e scrivi il contenuto nel `<main>`.

**Spostare una sezione della Home.** In `index.html` ogni sezione è un blocco `<section>` che inizia con un commento `<!-- ============ 0X · NOME ============ -->`. Taglia e incolla il blocco intero.

**Scegliere la notizia grande della Home.** È la più recente con `apertura: true` in `js/dati/notizie.js`.

**Regolare l'apertura della Home.** In `js/pagine/home-apertura.js`, in cima a `preparaPallone()`: `ATTRITO` (quanto rallenta il pallone), `RIMBALZO` (quanto rimbalza), `FORZA_MAX` (calcio più forte), `SCIA` (lunghezza della scia rossa). La velocità della scritta nella fascia è il `1.1` in `preparaFascia()`. Le parole della fascia si cambiano in `index.html` (sezione 01).

## 3. Come si legge una card

Esempio: la card di una partita, in `js/componenti.js` → `htmlCardPartita(p)`.

- In alto "MATCH DAY" (trama rossa) se la partita è da giocare, "FULL TIME" (trama grigia) se ha i gol.
- Al centro la fascia bianca con i due stemmi (classi nella costante `FASCIA`, in cima al file): chi gioca in casa a sinistra, come nelle grafiche Instagram.
- Se l'avversario non ha lo stemma, `htmlStemma()` disegna uno scudo con le iniziali.

## 4. Come si lavora

```
npm install     # la prima volta
npm run dev     # apri http://localhost:8000: a ogni salvataggio Tailwind rigenera lo stile, ricarica la pagina
```

Le classi Tailwind si scrivono nell'HTML (o nell'HTML dentro `js/`) come sempre; Tailwind le trova e le mette in `css/stile.min.css`. Scrivile **intere**: `bg-acc-rosso`, non `"bg-acc-" + colore` (Tailwind non le troverebbe).

## 5. Controlli dopo una modifica

1. **`npm test`**: prova tutte le pagine a 6 larghezze, il menu, le schede, i link e i dati. Deve essere tutto verde.
2. Apri la pagina e guarda la **console** del browser (F12 → Console): non devono esserci errori rossi.
3. Prova la pagina **stretta** (F12 → icona del telefono): niente scorrimento orizzontale, testi leggibili. Per l'iPhone Duo aperto: 626 × 890.
4. Aggiungi `?statico` all'indirizzo per vedere tutto senza animazioni.
5. Un errore tipico nei file `js/dati/`: una **virgola mancante** tra due blocchi `{ … }` o una virgoletta `"` dentro un testo. Nei testi usa `\"` oppure le virgolette tipografiche « ».
