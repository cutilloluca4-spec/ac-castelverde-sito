# A.C. Castelverde — Sito ufficiale

**Il sito della società di calcio di Castelverde (CR), dal 1987.**
Stagione 2026/27: quattro squadre agonistiche (Prima squadra in Seconda Categoria, Juniores Under 19 nel Campionato Regionale, Allievi Under 17 e Giovanissimi Under 15 nei provinciali cremonesi). Notizie, calendario e risultati, storia, dirigenza, contatti e partner.

> **Stato:** versione completa e responsive (novembre 2026), pubblicata su GitHub Pages: <https://cutilloluca4-spec.github.io/ac-castelverde-sito/>. Mancano le foto vere (al loro posto ci sono segnaposto) e alcuni dati da verificare (vedi [Prima di pubblicare](#prima-di-pubblicare)).
>
> **In breve per chi sviluppa:** HTML + [Tailwind CSS 4](https://tailwindcss.com) + JavaScript senza framework. `npm install`, poi `npm run dev` per lavorare, `npm test` per i controlli, `npm run build` per il sito da pubblicare (lo fa da solo GitHub Actions a ogni push su `main`).
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
9. [Sicurezza](#sicurezza)
10. [Pubblicare su GitHub Pages](#pubblicare-su-github-pages)
11. [Sviluppi futuri](#sviluppi-futuri)

---

## Avvio rapido

Serve [Node.js](https://nodejs.org) 20 o più recente. Nella cartella del progetto:

```
npm install        # una volta: installa Tailwind e Playwright (in node_modules/, fuori da Git)
npm run dev        # mentre si lavora: http://localhost:8000, lo stile si rigenera a ogni salvataggio
npm test           # controlli automatici (pagine, larghezze, menu, link, dati)
npm run build      # il sito da pubblicare, nella cartella _site/
npm run preview    # guarda _site/ su http://localhost:8080
```

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Tailwind in ascolto (riscrive `css/stile.min.css` quando cambi una classe) + server locale. Ricarica la pagina per vedere le modifiche. |
| `npm run css` | Rigenera solo `css/stile.min.css`. |
| `npm run build` | Rigenera lo stile e prepara `_site/`: solo i file pubblici, l'impronta su ogni CSS e JS (niente cache vecchia), `sitemap.xml` e `robots.txt`. Vedi `strumenti/build.mjs`. |
| `npm test` | Apre il sito in un browser vero (Playwright) e lo controlla: vedi [Controlli automatici](#controlli-automatici). |

**Senza Node** il sito si vede lo stesso: `css/stile.min.css` è già pronto nel repository, quindi basta **Live Server** in VS Code (clic destro su `index.html` → *Open with Live Server*) o `python3 -m http.server`. Solo se si cambiano le classi Tailwind serve rigenerarlo (`npm run css`); online lo rigenera comunque GitHub Actions.

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
├── privacy-cookie.html      ← informativa privacy e cookie
├── 404.html                 ← "pagina non trovata" (la apre da sola GitHub Pages / Netlify)
│
├── design-system/
│   ├── colori.css           ← ⭐ colori, font e misure: unico punto da cambiare
│   └── tema.css             ← i nomi Tailwind del club (text-acc-rosso, shadow-acc-card, max-w-acc, tablet:, computer:)
│
├── css/
│   ├── tailwind.css         ← ⭐ il file di partenza dello stile: Tailwind lo legge e scrive stile.min.css
│   ├── stile.min.css        ← GENERATO (npm run css / dev / build): l'unico CSS che le pagine caricano
│   ├── componenti.css       ← i mattoncini del design system: titoli, pillola, pulsanti, cornice, trame
│   ├── sito.css             ← menu da telefono, fasce diagonali delle intestazioni, caroselli
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
│   ├── animazioni.js        ← comparse, contatori, caroselli, linea del tempo (GSAP + ScrollTrigger)
│   ├── pallone-3d.js        ← il pallone dello stemma disegnato in 3D su canvas (solo apertura della Home)
│   ├── pagine/              ← un file per pagina: home.js, notizie.js, squadre.js…
│   │   └── home-apertura.js ← l'apertura interattiva della Home (pallone, fascia, stemma)
│   └── vendor/              ← GSAP e ScrollTrigger 3.12.5 (librerie esterne: non modificare, vedi LEGGIMI.md)
│
├── assets/
│   ├── logo/                ← stemma (WebP trasparente in più misure), favicon e icona per iPhone (PNG)
│   ├── font/                ← D-DIN Condensed, il carattere dei titoli (licenza libera OFL)
│   ├── img/                 ← foto in WebP: vedi assets/img/LEGGIMI.md per l'elenco completo
│   └── og-image.jpg         ← anteprima quando il link viene condiviso (1200×630)
│
├── test/
│   ├── sito.spec.js         ← controlli automatici con Playwright (npm test)
│   ├── index.html, test.js  ← controlli di dati e funzioni (si aprono anche nel browser)
├── strumenti/
│   ├── dev.mjs, server.mjs  ← npm run dev / preview: Tailwind in ascolto e server locale
│   ├── build.mjs            ← npm run build: prepara _site/ (impronte dei file, sitemap, robots)
│   ├── aggiorna_risultati.py ← ⭐ da lanciare ogni settimana (lo fa da solo un'attività pianificata)
│   ├── calendari_lnd.py     ← calendari ufficiali LND 2026/27: date, campi, orari, squadre ritirate
│   ├── tuttocampo.py        ← lettura dei risultati da Tuttocampo
│   └── archivio/            ← giornate già lette (non va su GitHub)
│
├── docs/
│   ├── primi-passi.md       ← ⭐ da leggere per primo
│   └── aggiornare-i-contenuti.md ← notizie, partite, foto, partner passo per passo
│
├── .github/workflows/
│   └── pubblica.yml         ← a ogni push su main: build, pubblicazione su GitHub Pages e controlli
├── package.json             ← comandi (npm run …) e versioni di Tailwind e Playwright
├── playwright.config.js     ← configurazione dei controlli automatici
├── .vscode/                 ← estensioni consigliate (Tailwind CSS IntelliSense, Live Server, Playwright, EditorConfig)
├── .editorconfig            ← stesso formato del codice in ogni editor
└── .gitignore               ← fuori da Git: node_modules/, _site/, materiale/, rapporti dei test
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
| `privacy-cookie.html` | Informativa privacy e cookie (GDPR), con indice | `pagine/privacy.js` |
| `404.html` | Pagina non trovata ("Fuorigioco") | `pagine/privacy.js` |

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

Dopo ogni aggiornamento conviene lanciare **`npm test`** (o aprire `test/index.html`, vedi [Controlli automatici](#controlli-automatici)): verifica che classifiche, date e stemmi del nuovo `partite.js` siano coerenti. Online i controlli partono da soli a ogni push.

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
| Titoli in D-DIN Condensed maiuscolo | `componenti.css` §2 | `titolo-display` |
| Titolo solo contorno ("FULL TIME") | §2 | `titolo-contorno` (`--bianco`, `--rosso`) |
| Titolo con linea grigia/rossa ai lati (solo su fondo chiaro) | §2 | `titolo-sezione` (`--sinistra`: solo la linea rossa) |
| Titolo sopra la trama grigia: seconda parola a contorno, centrato | §2 | `titolo-display text-center` + `titolo-contorno` |
| Etichetta bianca con ombra ("SECONDA CATEGORIA") | §3 | `pillola` (`--rossa`, `--piccola`) |
| Riquadro con bordo grigio e angolo rosso a L | §5 | `cornice angolo-rosso` (`cornice--rossa`: bordo tutto rosso, es. modulo contatti) |
| Due angoli a L staccati dalla foto (in alto a sinistra e in basso a destra) | §5 | `angoli` (grigi), `angoli angoli--rossi` (sulla trama) |
| Cornice metà grigia e metà rossa (presidente) | `js/componenti.js` | `htmlCardDirigente(…, true)` |
| Trama "a graffi" delle grafiche, senza righe di giunzione | §6 | `trama-grigia`, `trama-rossa`, `trama-scura` |
| Fasce diagonali di sfondo | §6 | `diagonali` |
| Fascia bianca con i due stemmi e il risultato | `js/componenti.js` | costante `FASCIA` (classi Tailwind) |

**Font.** I titoli usano **D-DIN Condensed** (di Datto, licenza libera SIL OFL 1.1), la versione libera del DIN Condensed delle grafiche Instagram. I file sono in `assets/font/` e il sito li carica da sé: il carattere è **identico su Mac, iPhone, Windows e Android** e non serve Google Fonts. Le pagine lo pre-caricano (`<link rel="preload">` nel `<head>`) così i titoli compaiono subito con il carattere giusto. I testi usano Helvetica Neue (Mac/iPhone) e Arial altrove.

In `design-system/colori.css` ci sono anche due misure del carattere: `--scarto-maiuscole` (le linee di `titolo-sezione` stanno a metà delle maiuscole) e `--cima-maiuscole` (in Squadre l'angolo della foto parte all'altezza del nome della squadra). Se un giorno si cambia carattere, vanno ricalcolate con la formula scritta lì accanto.

**Regole di stile da rispettare.**

- **Sopra la trama grigia il grigio non si vede**: niente linee, bordi o cornici grigie. Si usano il bianco, il rosso o il titolo con la parola a contorno; le foto delle squadre hanno gli angoli rossi (`angoli--rossi`). Sulla trama la parte a contorno dei titoli diventa da sola rossa e più spessa, per restare leggibile.
- **Le trame sono allineate alla pagina** (`allineaTrame` in `js/layout.js`): due sezioni a trama una sotto l'altra sembrano un fondo unico. Le texture `texture-*-continua.webp` sono fatte per ripetersi senza giunzioni.
- **Un'etichetta (`pillola`) ha un'ombra a destra**: il testo accanto va staccato di almeno 24 px (`gap-x-6`).
- **Titoli con una parte a contorno**: tutte le lettere, piene e a contorno, hanno la stessa spaziatura (`.03em`, così i contorni di lettere vicine non si toccano) e lo spessore del contorno è sempre proporzionale alla grandezza del titolo (`.022em`, `.028em` sopra la trama), senza minimi in pixel: stesso aspetto su telefono e computer. Nei titoli grandi la dimensione segue lo schermo (`text-[min(52px,13.5vw)]`) così restano su una riga anche sui telefoni stretti.
- **Pagina Squadre (da computer)**: la colonna della foto è più larga e cambia lato a ogni squadra; l'angolo in alto della foto è alla stessa altezza del nome; se la tabella dello staff ha 9 righe o più, il pulsante "Calendario e risultati" va sotto la foto, in linea con il fondo della tabella.

### Dove si trova lo stile

**Quasi tutto è scritto con Tailwind, direttamente nell'HTML** (e nelle funzioni di `js/componenti.js` e `js/layout.js`, che scrivono l'HTML delle parti ripetute). Per cambiare l'aspetto di una card o di una sezione si modificano le sue classi.

- **Colori, ombre e larghezza massima** hanno un nome del club, definito in `design-system/tema.css` (i valori sono in `colori.css`): `bg-acc-rosso`, `text-acc-testo-2`, `shadow-acc-card`, `shadow-acc-grafica`, `drop-shadow-acc-stemma`, `max-w-acc` (1320 px). Si cambia un valore in `colori.css` e cambia in tutto il sito.
- **Classi ripetute in più punti** sono raccolte in costanti in cima a `js/componenti.js` (`CARD_NOTIZIA`, `FASCIA`, `COLORE_ESITO`, `LARGHEZZA_CARD_PARTITA`, `CLASSI_SCHEDA`, `CLASSI_FRECCIA`) e `js/layout.js` (`LINK_PIEDE`): si cambiano lì una volta sola.
- **Effetti al passaggio del mouse** con `group` / `group-hover:` (card notizia, giocatore, "Dal 1987"); righe e pallini decorativi con `before:` / `after:` (menu, linea del tempo, avviso "Risultati aggiornati").

**Come arriva lo stile alla pagina.** Le pagine caricano un solo file, `css/stile.min.css`, generato dalla [Tailwind CLI](https://tailwindcss.com/docs/installation/tailwind-cli) a partire da `css/tailwind.css`: Tailwind legge le pagine HTML e i file in `js/`, trova le classi usate e scrive solo il CSS che serve, insieme al tema del club e ai file qui sotto. **Le classi vanno scritte intere e staccate dal resto**, altrimenti Tailwind non le trova: sì `p-4 ${attivo ? "bg-acc-rosso" : ""}`, no `p-4${…}` o `"bg-acc-" + colore`.

**Nei file CSS resta solo quello che Tailwind non fa, o che nell'HTML sarebbe illeggibile** (stessa regola del DSD):

- i **componenti del design system** (`componenti.css`): titoli, pillole, pulsanti, cornice con angolo rosso, trame, fasce diagonali;
- in `sito.css`: il **menu da telefono** (deve essere già nascosto prima che la pagina compaia), le **forme lunghe** (`clip-path` delle intestazioni) e i pezzi ripetuti in molte pagine (caroselli che su smartphone diventano elenchi);
- le **animazioni** (`animazioni.css`): stati iniziali di GSAP e `@keyframes` (`rimbalzo`, `lampeggio`).

Una classe con un nome "parlante" (`apertura__stemma`, `linea-tempo__progresso`, `intestazione`) ha una parte di stile in `css/` oppure la usa il JavaScript per trovare l'elemento: cercala lì. Gli stati cambiati dal JavaScript sono classi `is-…` (es. `is-aperto`, `is-attiva`, `is-scorso`): lo stile che ne dipende è scritto direttamente sull'elemento, con le varianti di Tailwind (`[&.is-aperto]:translate-x-0`, `group-[.is-aperto]:rotate-45`).

Prefissi per le larghezze dello schermo:

| Prefisso | Da | Esempio |
| --- | --- | --- |
| (nessuno) | smartphone | `text-[52px]` |
| `tablet:` | 600 px (anche i telefoni pieghevoli aperti, es. iPhone Duo) | `tablet:grid-cols-2` |
| `sm:` | 640 px | `sm:inline` (solo dove non c'è anche `tablet:` sulla stessa proprietà) |
| `md:` | 768 px | `md:text-[96px]` |
| `computer:` | 900 px | `hidden computer:flex` |
| `lg:` | 1024 px | `lg:grid-cols-5` |
| `basso:` | schermi alti al massimo 500 px (telefono in orizzontale) | `basso:right-6`: apertura della Home e menu laterale |
| `@xl:` | contenitore largo 576 px (container query) | righe del calendario: si dispongono in colonne in base allo spazio della colonna che le contiene, non dello schermo |

---

## Convenzioni del codice

- **Classi CSS in italiano**, schema `blocco__parte--variante`: `titolo-contorno--bianco`, `pillola--rossa`, `apertura__stemma`. Se una classe ha un nome "parlante", una parte del suo stile è in `css/` o il JavaScript la usa: cercala lì.
- `is-…` = **stato** acceso dal JavaScript (`is-attiva`, `is-aperto`, `is-scorso`, `is-visibile`).
- `data-…` = attributi letti dal JavaScript: `data-entra` / `data-entrano` (compaiono scorrendo), `data-conta` (numero che sale), `data-carosello` (frecce del carosello).
- **HTML nel JavaScript sempre tra backtick** (template literal): `` `<a class="${classe}" href="${link}">${testo(nome)}</a>` `` (le parti tra `${…}` sono i dati). Gli elementi lunghi vanno una riga per elemento, unite con `+`: l'HTML si legge indentato come nelle pagine e non nascono spazi indesiderati tra gli elementi. Le stringhe che non sono HTML usano le virgolette doppie.
- **JavaScript semplice** (niente framework), funzioni con nomi italiani che dicono cosa fanno: `disegnaApertura()`, `prossimePartite()`, `htmlCardGiocatore()`. Gli script sono normali `<script>` caricati in ordine (vedi sopra): le funzioni sono globali, così le pagine si aprono anche senza server.
- I testi che arrivano dai dati passano sempre da `testo()` (in `utilita.js`), che evita che un carattere `<` rompa la pagina.
- Commento in cima a ogni file con cosa contiene; commento `<!-- ===== NOME ===== -->` prima di ogni sezione dell'HTML.
- **Versione ferma**: aggiungi `?statico` all'indirizzo (es. `index.html?statico`) per vedere tutto senza animazioni, utile per controllare i testi o importare le pagine in Figma (html.to.design).
- **Versione dei file**: non si scrive a mano. `npm run build` aggiunge a ogni CSS e JS l'impronta del contenuto (`stile.min.css?v=bb510293`): quando un file cambia cambia l'impronta, e i browser scaricano quello nuovo.
- **Parti ripetute nelle pagine HTML (scelta voluta)**: menu, partner e footer sono scritti una volta sola da `js/layout.js`, ma il `<head>` (titolo, descrizione, anteprima social, CSS) e l'elenco degli `<script>` in fondo sono copiati in ognuna delle 10 pagine: ogni pagina si apre e si capisce da sola. Chi aggiunge uno script comune lo aggiunge in tutte le pagine; per aggiungere una pagina si copia la più simile.
- **Immagini in WebP** (`assets/img/`): pesano circa la metà dei JPG. Le nuove foto vanno convertite prima di caricarle (es. [Squoosh](https://squoosh.app), qualità 80, larghe al massimo 1600 px). Restano PNG/JPG solo favicon, icona per iPhone e `og-image.jpg`, perché social e sistemi operativi li vogliono così.
- **Accessibilità**: ogni pagina ha un solo `<h1>` (in Home è nascosto, l'apertura è grafica), i caroselli si selezionano con Tab e si scorrono con le frecce, le immagini decorative hanno `alt=""`. Controllato con axe (lo strumento di Lighthouse): resta solo il contrasto del testo bianco piccolo sul rosso `#ff0000` (4:1, il minimo consigliato è 4,5:1), una scelta di stile del club.

### Controlli automatici

**`npm test`** apre il sito in Chromium con [Playwright](https://playwright.dev) e controlla (file `test/sito.spec.js`):

- **ogni pagina a 6 larghezze** (320, 390, 626 = iPhone Duo aperto, 768, 1024, 1440 px): nessun errore JavaScript, nessun file mancante, la pagina non scorre di lato, tutte le immagini si caricano e hanno `alt`;
- **telefono**: il menu non lampeggia all'apertura delle pagine, si apre e si chiude (anche con Esc), le schede delle squadre stanno su una riga, filtri e "Carica altre" delle notizie, il modulo contatti vuoto non parte;
- **apertura della Home in 17 formati** (telefoni in verticale e in orizzontale, pieghevoli, tablet, computer fino a 2560 px): lo stemma è al centro dello schermo visibile, non tocca la freccia né l'header, la freccia si vede e il rosso del Match Day compare solo scorrendo;
- **tutti i link interni** portano a una pagina (e a un `#punto`) che esiste;
- **dati e funzioni**: la pagina `test/index.html` deve essere tutta ✅ (vedi sotto).

Se un controllo fallisce, `npx playwright show-report` apre il rapporto con la foto del momento. Online gli stessi controlli partono a ogni push (GitHub Actions): non bloccano la pubblicazione, ma il push viene segnato con una ❌ e GitHub manda un'email.

`test/index.html` (si apre anche da solo, con Live Server) carica dati e funzioni del sito e li prova: date, testi, esiti delle partite, coerenza di `partite.js` (punti = 3 × vittorie + pareggi, gol fatti = gol subiti nel girone, prossime partite davvero future), notizie e squadre senza doppioni, componenti che proteggono i testi, e che **ogni immagine citata nei dati esista davvero**. Se compare una ❌, la riga dice cosa si aspettava e cosa ha trovato. Per aggiungere un controllo: `verifica("descrizione", ottenuto, atteso)` in `test/test.js`.

---

## Prima di pubblicare

- [ ] **Foto**: sostituire i segnaposto "FOTO DA INSERIRE" in `assets/img/` (elenco in [assets/img/LEGGIMI.md](assets/img/LEGGIMI.md)). Giocatori e dirigenti hanno una sagoma: le loro foto si collegano con il campo `foto:` nei dati. Per le foto di minorenni serve la liberatoria dei genitori.
- [ ] **Rosa** (`js/dati/squadre.js`): mancano nomi di battesimo e ruoli dei giocatori.
- [ ] **Contatti** (`js/dati/club.js`): telefono ed email vengono dal vecchio sito, verificare che siano attivi.
- [ ] **Notizie** (`js/dati/notizie.js`): completare le parti `[tra parentesi]`; le notizie con `esempio: true` mostrano l'avviso "Testo di esempio".
- [ ] **Modulo contatti**: creare la chiave gratuita su [web3forms.com](https://web3forms.com) con l'email della società e incollarla in `js/dati/club.js` → `modulo.chiaveWeb3Forms`. Finché è vuota, "Invia" apre il programma di posta con il messaggio già scritto (non si perde niente). Fare un invio di prova.
- [ ] **Privacy** (`privacy-cookie.html`): scrivere il nome del servizio di hosting dove indicato nel commento (sezione 2) e aggiornare la data "Ultimo aggiornamento". Farla rileggere a chi segue la privacy della società.
- [ ] **Partner**: i loghi sono quelli originali; se si vuole che portino al sito dell'azienda, scrivere l'indirizzo in `sito:` (`js/dati/partner.js`).
- [ ] **Controlli**: `npm test` tutto verde.
- [ ] **Dominio definitivo**: scriverlo in `package.json` → `homepage` (lo usano `sitemap.xml` e `robots.txt`) e come indirizzo completo in `og:image` di ogni pagina (anteprima dei link). `robots.txt` funziona solo alla radice di un dominio: con l'indirizzo `github.io/ac-castelverde-sito` i motori di ricerca non lo leggono, con un dominio proprio sì.

**Cookie**: il sito non usa cookie né salva dati nel browser (niente `localStorage`), carica tutto da sé (font compresi) e Instagram e Google Maps sono semplici link, non incorporati: per le linee guida del Garante (2021) il banner non serve. Diventa necessario se si aggiungono Google Analytics, mappe o video **incorporati** nelle pagine: in quel caso aggiornare anche la sezione 6 della privacy.

---

## Sicurezza

Il sito è **statico**: niente server, database o area di accesso, quindi niente da "bucare" sul sito stesso. Per modificarlo bisogna poter pubblicare sul repository GitHub: la protezione vera è l'**account GitHub con la verifica in due passaggi**, pochi collaboratori sul repository e, con il dominio definitivo, il dominio **verificato** su GitHub (*Settings → Pages → Verified domains*).

Ogni pagina ha anche una **Content Security Policy** (il `<meta http-equiv="Content-Security-Policy">` nel `<head>`): il browser esegue solo il codice del sito, carica immagini e caratteri solo dal sito e lascia parlare il modulo contatti solo con Web3Forms. Se qualcuno riuscisse a inserire del codice estraneo nella pagina, il browser lo bloccherebbe.

- Lo script nel `<head>` (quello delle animazioni) è ammesso con la sua impronta `sha256`. **Se lo si modifica, va ricalcolata** in tutte le pagine: `printf '%s' 'contenuto dello script' | openssl dgst -sha256 -binary | base64`.
- Se un giorno si aggiunge un servizio esterno (mappa o video incorporati, statistiche), va aggiunto il suo indirizzo alla regola giusta (`img-src`, `script-src`, `frame-src`…), altrimenti il browser lo blocca.
- `npm test` controlla che la regola non blocchi niente del sito.

---

## Pubblicare su GitHub Pages

Il sito si pubblica da solo con **GitHub Actions** (`.github/workflows/pubblica.yml`): a ogni push sul ramo `main` (in VS Code: *Sincronizza modifiche*) GitHub esegue `npm run build` e pubblica la cartella `_site/`. L'avanzamento si vede nella scheda **Actions** del repository.

Una volta sola, su GitHub: **Settings** → **Pages** → *Build and deployment* → *Source*: **GitHub Actions**.

Per un dominio proprio (es. `castelverdecalcio1987.it`): *Settings → Pages → Custom domain*, poi aggiornare `homepage` in `package.json`.

La cartella `materiale/` (grafiche Instagram e file del vecchio sito usati come riferimento) è esclusa da Git in `.gitignore`.

---

## Sviluppi futuri

- **Aggiornare i contenuti senza toccare il codice**: oggi notizie e partite si aggiornano modificando i file in `js/dati/`. Il passo successivo è leggerli da un piccolo pannello o da un CMS (es. un foglio Google, Decap CMS, o il server di Digital Sports Desk). Basta che i dati arrivino con la stessa forma: componenti e pagine non cambiano.
- **Calendario automatico** dai comunicati del Comitato LND.
- **Pagina del giocatore** (`giocatore.html?numero=10`), come il "Vedi profilo giocatore" della reference.
- **Galleria foto** per partita.
- **Moduli JavaScript** (`import` / `export`) al posto delle funzioni globali: più ordine tra i file, ma le pagine non si aprirebbero più con il doppio clic (serve sempre un server). Con un bundler (es. Vite) si potrebbero anche unire `<head>` e script ripetuti nelle 10 pagine.
- **Immagini in più misure** (`srcset`) per i telefoni, generate dalla build.
