# Immagini del sito

Le immagini con scritto **FOTO DA INSERIRE** sono segnaposto: riportano il nome del file e le misure. Per sostituirle basta salvare la foto vera **con lo stesso nome**, nella stessa cartella.

Formato: JPG per le foto (qualità 80, sotto i 300 KB), PNG trasparente per stemmi, loghi e ritratti dei giocatori.
Per le foto in cui compaiono **minorenni** serve la liberatoria dei genitori.

| Cartella / file | Misure | Dove compare |
| --- | --- | --- |
| `notizie/apertura-01…04.jpg` | 1920×1080 | notizie in evidenza: card grande in Home e pagina della notizia |
| `notizie/notizia-01…08.jpg` | 1200×800 | card delle notizie |
| `squadre/<id squadra>.jpg` | 1200×900 | pagina Squadre e card "Quattro squadre" in Home (`prima-squadra`, `juniores`, `allievi`, `giovanissimi`) |
| `club/storia.jpg`, `campo.jpg` | 1000×1300 | le card "Dal 1987" in Home (la terza, Dirigenza, usa lo stemma). `storia.jpg` è il campanile da Wikimedia Commons (CC BY-SA, crediti nella pagina Privacy) |
| `club/storia-1987.jpg`, `storia-campo-1997.jpg`, `storia-2020.jpg`, `storia-oggi.jpg` | 1200×800 | linea del tempo nella pagina Società (il credito della foto va in `credito:` in `js/dati/storia.js`) |
| `giocatori/<cognome>.png` | 800×1000, sfondo trasparente | card della rosa (`foto:` in `js/dati/squadre.js`) |
| `dirigenti/<cognome>.jpg` | 800×1000 | pagina Dirigenza (`foto:` in `js/dati/club.js`) |
| `segnaposto-persona.png` | — | la sagoma per giocatori e dirigenti senza foto (non è un segnaposto "FOTO DA INSERIRE") |
| `avversari/<nome-squadra>.webp` | max 180×180, trasparente | stemmi delle squadre avversarie, uno per club (es. `polisportiva-san-giovanni.webp`), in WebP perché sono tanti e il calendario resta leggero. Presi dagli originali in alta risoluzione di Tuttocampo o dal sito ufficiale del club (Real Melegnano). Li scarica da solo `strumenti/aggiorna_risultati.py` quando arriva una squadra nuova; per mettere un logo migliore basta sostituire il file con lo stesso nome (va bene anche un `.png`) |
| `partner/*.png` | max 1400×700, trasparente | loghi degli sponsor (dai file originali della società a 300 ppi) |
| `social/*.jpg` | 600×1067 | le grafiche Instagram mostrate nella sezione social della Home |
| `texture/texture-grigia.jpg`, `texture-rossa.jpg` | — | la trama "a graffi" delle grafiche, usata come sfondo (`trama-grigia`, `trama-rossa`) |

**Idee per le foto più utili da scattare**: foto di squadra di ogni categoria a inizio stagione; ritratti dei giocatori della prima squadra su sfondo neutro (si scontornano facilmente); lo Stadio Comunale N.1 dall'alto o dalla tribuna; un allenamento di ogni squadra; foto storiche della società (1987, anni '90).
