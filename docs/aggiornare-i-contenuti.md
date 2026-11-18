# Aggiornare i contenuti

Tutto quello che cambia durante la stagione sta nei file di `js/dati/`. Non serve toccare HTML o CSS.
Dopo ogni modifica: salva, ricarica la pagina, controlla che non ci siano errori nella console (F12).

## Pubblicare una notizia

In `js/dati/notizie.js` copia un blocco `{ … },` e incollalo **in cima** alla lista `NOTIZIE`:

```js
{
  id: "castelverde-rapid-united",          // unico, senza spazi: diventa l'indirizzo
  data: "2026-11-08",                      // AAAA-MM-GG
  categoria: "Prima squadra",              // Società · Prima squadra · Settore giovanile · Storia
  titolo: "Castelverde - Rapid United 2-0",
  sommario: "Una o due righe che compaiono nelle card.",
  immagine: "assets/img/notizie/castelverde-rapid-united.webp",
  apertura: true,                          // true = card grande delle "Ultime notizie" in Home
  esempio: false,
  testo: [
    "Primo paragrafo.",
    "Secondo paragrafo."
  ]
},
```

La foto va in `assets/img/notizie/`: JPG, 1200×800 px (1920×1080 se è in apertura), sotto i 300 KB.

## Risultati, calendario e classifiche

Si aggiornano **da soli** ogni lunedì da Tuttocampo (vedi "Risultati e calendario automatici" nel README). Per aggiornarli subito:

```
cd strumenti
python3 aggiorna_risultati.py
```

Dopo l'aggiornamento lancia `npm test` (o apri `test/index.html` con Live Server): se è tutto ✅ classifiche, date e stemmi sono coerenti.

Non modificare `js/dati/partite.js` a mano: viene riscritto a ogni aggiornamento. Per correggere un campo, un orario o escludere una squadra ritirata si cambia `strumenti/calendari_lnd.py` e si rilancia con `--solo-archivio`.

## Giocatori e staff

In `js/dati/squadre.js`, lista `ROSA_PRIMA_SQUADRA`:

```js
{ numero: 10, cognome: "Rozzi", nome: "Luca", ruolo: "Attaccante", foto: "assets/img/giocatori/rozzi.webp" },
```

- `fascia: "C"` capitano, `"VC"` vice: compare il pallino rosso sulla card.
- Foto: **scontornata (sfondo trasparente)**, mezzo busto, 800×1000 px, in WebP (più leggero) o PNG. Senza foto compare la sagoma.

Staff, annate e orari di ogni squadra sono nello stesso file, dentro `SQUADRE`.

## Partner

In `js/dati/partner.js` aggiungi una riga con nome, logo e (facoltativo) sito; il logo va in `assets/img/partner/` (PNG trasparente o SVG). Nel sito compare solo il logo, nell'ordine della lista.

## Dati della società

`js/dati/club.js`: contatti, Instagram, dirigenti, campo e numeri della sezione "Il club in numeri". Cambiano in tutte le pagine insieme (menu, footer, Contatti, Società, Dirigenza).

## Dirigenti

In `js/dati/club.js`, lista `organigramma`, una riga per persona:

```js
{ nome: "Luca Carnevali", ruoli: ["Vicepresidente", "Direttore sportivo"], foto: "assets/img/dirigenti/carnevali.webp", email: "" },
```

La prima persona della lista ha la scheda grande nella pagina Dirigenza. Foto: JPG verticale 800×1000 px, mezzo busto; senza foto compare la sagoma.

## Sostituire le foto segnaposto

Le immagini con scritto "FOTO DA INSERIRE" riportano **il nome del file e le misure**. Basta salvare la foto vera con lo stesso nome nella stessa cartella. Elenco completo: [assets/img/LEGGIMI.md](../assets/img/LEGGIMI.md).

## Modulo contatti

I messaggi della pagina Contatti arrivano all'email della società tramite **Web3Forms** (gratuito). Una volta sola: su [web3forms.com](https://web3forms.com) si inserisce l'email della società, arriva una chiave, e la si incolla in `js/dati/club.js`:

```js
modulo: { chiaveWeb3Forms: "la-chiave-ricevuta-per-email" },
```

Senza chiave il pulsante "Invia" apre il programma di posta con il messaggio già compilato. C'è un campo antispam invisibile: niente captcha.

## Privacy e cookie

Il testo è in `privacy-cookie.html`, diviso in sezioni numerate con un indice. Va aggiornato (e cambiata la data "Ultimo aggiornamento") se cambia l'hosting, il servizio del modulo, oppure se si aggiungono statistiche, mappe o video incorporati: in quel caso serve anche il banner dei cookie. Oggi il sito non usa cookie e il banner non serve.
