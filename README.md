# A.C. Castelverde — Sito ufficiale

**Il sito della società di calcio di Castelverde (CR), dal 1987.**
Stagione 2026/27: quattro squadre agonistiche (Prima squadra in Seconda Categoria, Juniores Under 19 nel Campionato Regionale, Allievi Under 17 e Giovanissimi Under 15 nei provinciali cremonesi). Notizie, calendario e risultati, storia, dirigenza, contatti e partner.

> **Stato:** prima versione completa (ottobre 2026). Tutte le pagine funzionano; mancano le foto vere (al loro posto ci sono segnaposto con il nome del file da sostituire) e alcuni dati da verificare (vedi [Prima di pubblicare](#prima-di-pubblicare)).
>
> **Progetto:** Luca Cutillo, segretario e responsabile del settore giovanile. Stessa impostazione del progetto Digital Sports Desk (HTML + Tailwind + JavaScript semplice), con lo stile delle grafiche Instagram del club. Reference di struttura: [acmilan.com](https://www.acmilan.com/it).

> **Nuovo nel progetto?** Leggi prima **[docs/primi-passi.md](docs/primi-passi.md)**: dove sta cosa ed esempi pratici. Per aggiornare notizie, partite e foto senza toccare il codice: **[docs/aggiornare-i-contenuti.md](docs/aggiornare-i-contenuti.md)**.

---

## Indice

1. [Avvio rapido](#avvio-rapido)
2. [Struttura delle cartelle](#struttura-delle-cartelle)
3. [Le pagine](#le-pagine)
4. [Come funziona: dati → componenti → pagine](#come-funziona-dati--componenti--pagine)
5. [Risultati e calendario automatici](#risultati-e-calendario-automatici)
6. [Design system](#design-system) e [dove si trova lo stile](#dove-si-trova-lo-stile)
7. [Convenzioni del codice](#convenzioni-del-codice) e [controlli automatici](#controlli-automatici)
8. [Prima di pubblicare](#prima-di-pubblicare)
9. [Pubblicare su GitHub Pages](#pubblicare-su-github-pages)
10. [Sviluppi futuri](#sviluppi-futuri)

---

## Avvio rapido

Non c'è niente da installare: è HTML, CSS e JavaScript semplice. Tailwind e GSAP sono già nella cartella `js/vendor/`, caricati con un normale `<script>` come visto nel corso (funziona anche senza internet).

**Modo consigliato: Visual Studio Code + Live Server**

1. Apri la cartella `ac-castelverde-sito` in Visual Studio Code.
2. Installa l'estensione **Live Server** (di Ritwick Dey): VS Code la propone da solo, è tra le estensioni consigliate del progetto.
3. Clic destro su `index.html` → **Open with Live Server**. Ogni volta che salvi un file, la pagina nel browser si ricarica da sola.

**In alternativa, da terminale** (nella cartella del progetto): `python3 -m http.server 8000`, poi apri <http://localhost:8000>.

> Aprire `index.html` con doppio clic funziona quasi del tutto, ma alcuni browser bloccano parti del JavaScript sui file locali: meglio Live Server.

---

## Struttura delle cartelle

```
ac-castelverde-sito/
├── README.md                ← questo file
├── index.html               ← Home
├── notizie.html             ← elenco notizie con filtri
├── notizia.html             ← singola notizia (notizia.html?id=...)
├── squadre.html             ← tutte le squadre, staff, rosa
├── calendario.html          ← prossime partite, risultati, classifica
├── societa.html             ← numeri, storia, il campo
├── dirigenza.html           ← presidente, consiglio direttivo, staff delle squadre
├── contatti.html            ← recapiti, modulo, come arrivare
├── privacy-cookie.html      ← informativa (BOZZA da completare)
│
├── design-system/
│   ├── colori.css           ← ⭐ colori, font e misure: unico punto da cambiare
│   └── tema-tailwind.js     ← colori, ombre e larghezze come classi Tailwind (text-acc-rosso, shadow-acc-card, max-w-acc…)
│
├── css/
│   ├── componenti.css       ← i mattoncini del design system: titoli, pillola, pulsanti, cornice, trame
│   ├── sito.css             ← menu, intestazioni, caroselli, campi del modulo, stati is-…
│   └── animazioni.css       ← stati iniziali delle animazioni
│
├── js/
│   ├── dati/                ← ⭐ I CONTENUTI: si aggiorna il sito cambiando solo questi file
│   │   ├── partite.js       ← calendario, risultati, classifiche: GENERATO da strumenti/aggiorna_risultati.py, non toccarlo a mano
│   │   ├── club.js          ← nome, contatti, Instagram, dirigenti, campo, numeri
│   │   ├── notizie.js       ← tutte le notizie
│   │   ├── squadre.js       ← squadre, staff, rosa della prima squadra
│   │   ├── storia.js        ← tappe della storia (pagina Società)
│   │   └── partner.js       ← sponsor
│   ├── utilita.js           ← date, testi, ricerca partite, icone SVG
│   ├── componenti.js        ← l'HTML dei pezzi ripetuti (card notizia, card partita…)
│   ├── layout.js            ← menu, partner e footer: scritti una volta per tutte le pagine
│   ├── animazioni.js        ← comparse, contatori, caroselli (GSAP + ScrollTrigger)
│   ├── pagine/              ← un file per pagina: home.js, notizie.js, squadre.js…
│   │   └── home-apertura.js ← l'apertura interattiva della Home (pallone, fascia, stemma)
│   └── vendor/              ← Tailwind, GSAP, ScrollTrigger (non modificare)
│
├── assets/
│   ├── logo/                ← stemma (PNG trasparente in più misure), favicon
│   ├── font/                ← Barlow Condensed (riserva di DIN Condensed, licenza OFL)
│   ├── img/                 ← foto: vedi assets/img/LEGGIMI.md per l'elenco completo
│   └── og-image.jpg         ← anteprima quando il link viene condiviso (1200×630)
│
├── test/                    ← controlli automatici: apri test/index.html con Live Server
├── strumenti/               ← aggiornamento automatico di calendario e risultati
│   ├── aggiorna_risultati.py ← ⭐ da lanciare ogni settimana (lo fa da solo un'attività pianificata)
│   ├── calendari_lnd.py     ← calendari ufficiali LND 2026/27: date, campi, orari, squadre ritirate
│   ├── tuttocampo.py        ← lettura dei risultati da Tuttocampo
│   └── archivio/            ← giornate già lette (non va su GitHub)
│
├── docs/
│   ├── primi-passi.md       ← ⭐ da leggere per primo
│   └── aggiornare-i-contenuti.md ← notizie, partite, foto, partner passo per passo
│
├── .vscode/                 ← estensioni consigliate (Live Server, EditorConfig)
├── .editorconfig            ← stesso formato del codice in ogni editor
└── .gitignore
```

---

## Le pagine

| Pagina | Contenuto | JavaScript |
| --- | --- | --- |
| `index.html` | **Home**: apertura interattiva (pallone da calciare con il mouse, fascia "Associazione Calcio Castelverde" che scorre, stemma in 3D), prossima partita con conto alla rovescia, ultime notizie, partite per squadra, le quattro squadre, rosa della prima squadra, "Dal 1987" con i numeri, Instagram, partner | `pagine/home.js` |
| `notizie.html` | Tutte le notizie, filtri per categoria, "Carica altre". Si apre filtrata con `?categoria=Storia` | `pagine/notizie.js` |
| `notizia.html` | Una notizia: `notizia.html?id=storia-dal-1987`. Condivisione WhatsApp / copia link, altre notizie | `pagine/notizia.js` |
| `squadre.html` | Una scheda per ognuna delle 4 squadre (`#prima-squadra`, `#juniores`, `#allievi`, `#giovanissimi`) con staff, allenamenti, sponsor e rosa | `pagine/squadre.js` |
| `calendario.html` | Schede per squadra (`?squadra=juniores`), prossime partite, risultati, classifica | `pagine/calendario.js` |
| `societa.html` | Numeri, linea del tempo della storia, il campo, rimando alla dirigenza | `pagine/societa.js` |
| `dirigenza.html` | Scheda grande del presidente, altre figure dirigenziali, staff di ogni squadra | `pagine/dirigenza.js` |
| `contatti.html` | Recapiti, modulo (`#scrivici`, `?motivo=partner`), come arrivare | `pagine/contatti.js` |
| `privacy-cookie.html` | Informativa privacy e cookie (**bozza**) | `pagine/privacy.js` |

La struttura della Home segue la reference (acmilan.com): grande apertura → partite → notizie → box in evidenza (lì lo Shop, qui le quattro squadre) → giocatori → Heritage (qui "Dal 1987") → social → partner → footer a colonne. L'apertura è un piccolo gioco: un pallone (disegnato su canvas) che si calcia con il mouse. Passandoci sopra lo si colpisce (più veloce è il movimento, più forte parte), con un clic lo si calcia verso quel punto; rimbalza sui bordi e sullo stemma, che vibra e fa un'onda rossa, e lascia una scia rossa come le pennellate delle grafiche. Se nessuno gioca, riparte da solo. Nella fascia bianca scorre "Associazione Calcio Castelverde" con le parole alternate grigio/rosso: il nastro accelera e si inclina seguendo il mouse. Lo stemma si inclina in 3D verso il mouse. Codice in `js/pagine/home-apertura.js` (commentato passo per passo), struttura in `index.html` (sezione 01).

---

## Come funziona: dati → componenti → pagine

Il sito è diviso in tre livelli, sempre nello stesso ordine:

1. **Dati** (`js/dati/*.js`): solo contenuti, nessuna logica. Sono oggetti JavaScript (`const NOTIZIE = [...]`) e non file JSON perché così il sito funziona anche aperto dal disco, senza server.
2. **Componenti** (`js/componenti.js`): funzioni che ricevono un dato e restituiscono il suo HTML, es. `htmlCardPartita(partita)`. Ogni card esiste una volta sola: se cambia la card partita, cambia in Home e in Calendario insieme.
3. **Pagine** (`js/pagine/*.js`): prendono i dati, usano i componenti e li mettono nei contenitori dell'HTML (`<div id="ultimeNotizie">`).

Le **sezioni fisse** (es. l'apertura, le tre card "Dal 1987") sono scritte direttamente nell'HTML: si modificano lì.

Menu, partner e footer sono **uguali in tutte le pagine** e li scrive `js/layout.js` dentro `<div id="menu">`, `<div id="partner">` e `<div id="piede">`. Per aggiungere una voce al menu basta una riga in `VOCI_MENU`.

Ordine di caricamento in ogni pagina (in fondo al `<body>`): GSAP → dati → `utilita.js` → `componenti.js` → `layout.js` → `animazioni.js` → `pagine/<pagina>.js`.

---

## Risultati e calendario automatici

Calendario, risultati, marcatori, classifiche e loghi delle 4 squadre (Prima squadra, Juniores U19, Allievi U17, Giovanissimi U15) vengono da due fonti:

- **calendari ufficiali LND** (`strumenti/calendari_lnd.py`): date, campi e orari di tutte le partite della stagione;
- **Tuttocampo**: risultati, marcatori, orari aggiornati, campi invertiti, rinvii, squadre ritirate e loghi.

```
cd strumenti
python3 aggiorna_risultati.py                  # legge Tuttocampo e riscrive js/dati/partite.js
python3 aggiorna_risultati.py --solo-archivio  # rifà partite.js con i dati già letti, senza internet
```

Ogni **lunedì mattina** un'attività pianificata lo esegue sul Mac della società e manda un riepilogo dei risultati del weekend (il Mac deve essere acceso). Va bene anche un qualsiasi pianificatore: `cron` su Mac/Linux, Utilità di pianificazione su Windows, o una GitHub Action.

Dopo ogni aggiornamento conviene aprire **`test/index.html`** (vedi [Controlli automatici](#controlli-automatici)): verifica che classifiche, date e stemmi del nuovo `partite.js` siano coerenti.

Cose da sapere:
- Tuttocampo **blocca chi fa troppe richieste** (oltre ~20 di fila): il programma va piano apposta (8 s tra una richiesta e l'altra) e rilegge solo le giornate recenti. Se viene bloccato si ferma, salva quello che ha letto e riparte da lì al giro dopo. Non abbassare la pausa.
- La **classifica** è calcolata dai risultati (non tiene conto di eventuali penalizzazioni): accanto c'è sempre il link alla classifica ufficiale.
- Le **squadre ritirate** si escludono in `calendari_lnd.py` (`ritirate`): oggi Fanfulla (Juniores), Fadigati e Casalromano (Giovanissimi). Quelle che Tuttocampo segna "Squadra ritirata" vengono riconosciute da sole.
- Per correggere un campo o un orario: cambia `calendari_lnd.py` e rilancia con `--solo-archivio`.
- Requisiti: Python 3 e curl (già presenti su Mac). Nessun pacchetto da installare.

## Design system

Tutto viene dallo **stemma** e dalle **grafiche Instagram** del club (Match day, Full time, Starting XI):

| Elemento | Dove | Classe |
| --- | --- | --- |
| Rosso `#ff0000`, grigio `#d0d2d4`, nero, bianco | `design-system/colori.css` | `text-acc-rosso`, `bg-acc-grigio`… |
| Titoli in DIN Condensed maiuscolo | `componenti.css` §2 | `titolo-display` |
| Titolo solo contorno ("FULL TIME") | §2 | `titolo-contorno` (`--bianco`, `--rosso`) |
| Titolo con linea grigia/rossa ai lati | §2 | `titolo-sezione` |
| Etichetta bianca con ombra ("SECONDA CATEGORIA") | §3 | `pillola` (`--rossa`, `--piccola`) |
| Riquadro con bordo grigio e angolo rosso a L | §5 | `cornice angolo-rosso` |
| Trama "a graffi" delle grafiche | §6 | `trama-grigia`, `trama-rossa`, `trama-scura` |
| Fasce diagonali di sfondo | §6 | `diagonali` |
| Fascia bianca con i due stemmi e il risultato | `js/componenti.js` | costante `FASCIA` (classi Tailwind) |

**Font.** Le grafiche usano **DIN Condensed**, già installato su Mac/iPhone. Su Windows e Android il sito usa **Barlow Condensed** (in `assets/font/`, molto simile). Se la società ha la licenza web di DIN, basta aggiungere i file in `assets/font/` e il loro `@font-face` in `colori.css`.

### Dove si trova lo stile

**Quasi tutto è scritto con Tailwind, direttamente nell'HTML** (e nelle funzioni di `js/componenti.js` e `js/layout.js`, che scrivono l'HTML delle parti ripetute). Per cambiare l'aspetto di una card o di una sezione si modificano le sue classi.

- **Colori, ombre e larghezza massima** hanno un nome del club, definito in `design-system/tema-tailwind.js` (i valori sono in `colori.css`): `bg-acc-rosso`, `text-acc-testo-2`, `shadow-acc-card`, `shadow-acc-grafica`, `drop-shadow-acc-stemma`, `max-w-acc` (1320 px). Si cambia un valore in `colori.css` e cambia in tutto il sito.
- **Classi ripetute in più punti** sono raccolte in costanti in cima a `js/componenti.js` (`CARD_NOTIZIA`, `FASCIA`, `COLORE_ESITO`, `LARGHEZZA_CARD_PARTITA`) e `js/layout.js` (`LINK_PIEDE`): si cambiano lì una volta sola.
- **Effetti al passaggio del mouse** con `group` / `group-hover:` (card notizia, giocatore, "Dal 1987"); righe e pallini decorativi con `before:` / `after:` (menu, linea del tempo, avviso "Risultati aggiornati").

**Nei file CSS resta solo quello che Tailwind non fa, o che nell'HTML sarebbe illeggibile** (stessa regola del DSD):

- i **componenti del design system** (`componenti.css`): titoli, pillole, pulsanti, cornice con angolo rosso, trame, fasce diagonali;
- gli **stati che cambia il JavaScript** (`sito.css`, classi `is-…`): menu che si accorcia, menu mobile, schede, "torna su";
- le **forme lunghe** (`clip-path` delle intestazioni) e i pezzi ripetuti in molte pagine (caroselli, campi del modulo);
- le **animazioni** (`animazioni.css`): stati iniziali di GSAP e `@keyframes` (`rimbalzo`, `lampeggio`).

Una classe con un nome "parlante" (`apertura__stemma`, `linea-tempo__progresso`, `menu__apri`) ha una parte di stile in `css/` oppure la usa il JavaScript: cercala lì.

Prefissi per le larghezze dello schermo:

| Prefisso | Da | Esempio |
| --- | --- | --- |
| (nessuno) | smartphone | `text-[52px]` |
| `sm:` | 640 px | `sm:grid-cols-2` |
| `tablet:` | 700 px | `tablet:grid-cols-2` |
| `computer:` | 900 px | `hidden computer:flex` |
| `lg:` | 1024 px | `lg:grid-cols-5` |

---

## Convenzioni del codice

- **Classi CSS in italiano**, schema `blocco__parte--variante`: `titolo-contorno--bianco`, `pillola--rossa`, `apertura__stemma`. Se una classe ha un nome "parlante", una parte del suo stile è in `css/` o il JavaScript la usa: cercala lì.
- `is-…` = **stato** acceso dal JavaScript (`is-attiva`, `is-aperto`, `is-scorso`, `is-visibile`).
- `data-…` = attributi letti dal JavaScript: `data-entra` / `data-entrano` (compaiono scorrendo), `data-conta` (numero che sale), `data-carosello` (frecce del carosello), `data-indirizzo` (servizio del modulo).
- **JavaScript semplice** (niente framework, niente build), funzioni con nomi italiani che dicono cosa fanno: `disegnaApertura()`, `prossimePartite()`, `htmlCardGiocatore()`.
- I testi che arrivano dai dati passano sempre da `testo()` (in `utilita.js`), che evita che un carattere `<` rompa la pagina.
- Commento in cima a ogni file con cosa contiene; commento `<!-- ===== NOME ===== -->` prima di ogni sezione dell'HTML.
- **Versione ferma**: aggiungi `?statico` all'indirizzo (es. `index.html?statico`) per vedere tutto senza animazioni, utile per controllare i testi o importare le pagine in Figma (html.to.design).
- **Versione dei file (`?v=1`)**: CSS e JS sono richiamati con `?v=1`, così a ogni pubblicazione si può obbligare i browser a scaricare i file nuovi. Prima di pubblicare una versione con CSS o JS cambiati, porta il numero a `?v=2` (poi `?v=3`…) in **tutte** le pagine: in VS Code, Cerca e sostituisci in tutti i file (Cmd/Ctrl+Maiusc+H) `?v=1` → `?v=2`.
- **Parti ripetute nelle pagine HTML (scelta voluta)**: menu, partner e footer sono scritti una volta sola da `js/layout.js`, ma il `<head>` (titolo, descrizione, anteprima social, CSS) e l'elenco degli `<script>` in fondo sono copiati in ognuna delle 9 pagine. Senza un passaggio di build è il modo più semplice e leggibile: ogni pagina si apre e si capisce da sola. Chi cambia un file comune (es. aggiunge un CSS) deve aggiungerlo in tutte le pagine; per aggiungere una pagina si copia la più simile.
- **Accessibilità**: ogni pagina ha un solo `<h1>` (in Home è nascosto, l'apertura è grafica), i caroselli si selezionano con Tab e si scorrono con le frecce, le immagini decorative hanno `alt=""`. Controllato con axe (lo strumento di Lighthouse): resta solo il contrasto del testo bianco piccolo sul rosso `#ff0000` (4:1, il minimo consigliato è 4,5:1), una scelta di stile del club.

### Controlli automatici

`test/index.html` (aprire con Live Server) carica dati e funzioni del sito e li prova: date, testi, esiti delle partite, coerenza di `partite.js` (punti = 3 × vittorie + pareggi, gol fatti = gol subiti nel girone, prossime partite davvero future), notizie e squadre senza doppioni, componenti che proteggono i testi, e che **ogni immagine citata nei dati esista davvero**. Se compare una ❌, la riga dice cosa si aspettava e cosa ha trovato. Per aggiungere un controllo: `verifica("descrizione", ottenuto, atteso)` in `test/test.js`.

---

## Prima di pubblicare

- [ ] **Foto**: sostituire i segnaposto "FOTO DA INSERIRE" in `assets/img/` (elenco in [assets/img/LEGGIMI.md](assets/img/LEGGIMI.md)). Giocatori e dirigenti hanno una sagoma: le loro foto si collegano con il campo `foto:` nei dati. Per le foto di minorenni serve la liberatoria dei genitori.
- [ ] **Rosa** (`js/dati/squadre.js`): mancano nomi di battesimo e ruoli dei giocatori.
- [ ] **Contatti** (`js/dati/club.js`): telefono ed email vengono dal vecchio sito, verificare che siano attivi.
- [ ] **Notizie** (`js/dati/notizie.js`): completare le parti `[tra parentesi]`; le notizie con `esempio: true` mostrano l'avviso "Testo di esempio".
- [ ] **Modulo contatti** (`contatti.html`): scegliere un servizio che riceve i messaggi (es. Formspree, meglio con server in UE) e scrivere il suo indirizzo in `data-indirizzo` sul `<form>`. Finché è vuoto il modulo mostra "Grazie!" ma **non invia niente**.
- [ ] **Privacy** (`privacy-cookie.html`): completare le parti `[tra parentesi]`, farla rileggere, togliere il riquadro "Bozza".
- [ ] **Partner**: i loghi sono quelli originali; se si vuole che portino al sito dell'azienda, scrivere l'indirizzo in `sito:` (`js/dati/partner.js`).
- [ ] **Controlli**: aprire `test/index.html` e verificare che sia tutto ✅; cambiare `?v=1` in tutte le pagine se CSS o JS sono cambiati dall'ultima pubblicazione.
- [ ] **Anteprima dei link** (`og:image` in ogni pagina): con il dominio definitivo scrivere l'indirizzo completo.

**Cookie**: il sito non usa cookie né statistiche e carica tutto da sé (font compresi), quindi non serve il banner. Se si aggiungono Google Analytics, mappe o video incorporati, il banner diventa necessario.

---

## Pubblicare su GitHub Pages

1. Crea un repository su GitHub e carica la cartella (da VS Code: **Source Control** → **Publish to GitHub**).
2. Su GitHub: **Settings** → **Pages** → *Source*: `Deploy from a branch`, branch `main`, cartella `/ (root)`.
3. Dopo un minuto il sito è online all'indirizzo che GitHub mostra in quella pagina. Per un dominio proprio (es. `castelverdecalcio1987.it`) si imposta in *Custom domain*.

La cartella `materiale/` (grafiche Instagram e file del vecchio sito usati come riferimento) è esclusa da Git in `.gitignore`.

---

## Sviluppi futuri

- **Aggiornare i contenuti senza toccare il codice**: oggi notizie e partite si aggiornano modificando i file in `js/dati/`. Il passo successivo è leggerli da un piccolo pannello o da un CMS (es. un foglio Google, Decap CMS, o il server di Digital Sports Desk). Basta che i dati arrivino con la stessa forma: componenti e pagine non cambiano.
- **Calendario automatico** dai comunicati del Comitato LND.
- **Pagina del giocatore** (`giocatore.html?numero=10`), come il "Vedi profilo giocatore" della reference.
- **Galleria foto** per partita.
- **Tailwind compilato**: oggi Tailwind è lo script nel browser (`js/vendor/tailwind-browser.js`), come nel corso e nel DSD: comodo, ma la documentazione di Tailwind lo indica per sviluppo e prototipi (genera il CSS mentre la pagina si apre). Per la versione online si può generare un unico file CSS con la Tailwind CLI (`npx @tailwindcss/cli -i … -o css/tailwind.css --minify`, oppure il programma singolo senza Node): le classi nell'HTML restano le stesse, cambia solo come vengono caricate.
