# Immagini del sito

Le immagini con scritto **FOTO DA INSERIRE** sono segnaposto: riportano il nome del file e le misure. Per sostituirle basta salvare la foto vera **con lo stesso nome**, nella stessa cartella.

Formato: JPG per le foto (qualità 80, sotto i 300 KB), PNG trasparente per stemmi, loghi e ritratti dei giocatori.
Per le foto in cui compaiono **minorenni** serve la liberatoria dei genitori.

| Cartella / file | Misure | Dove compare |
| --- | --- | --- |
| `notizie/apertura-01…04.webp` | 1920×1080 | notizie in evidenza: card grande in Home e pagina della notizia |
| `notizie/notizia-01…08.webp` | 1200×800 | card delle notizie |
| `squadre/<id squadra>.webp` | 1200×900 | pagina Squadre e card "Quattro squadre" in Home (`prima-squadra`, `juniores`, `allievi`, `giovanissimi`) |
| `club/storia.webp`, `campo.webp` | 1000×1300 | le card "Dal 1987" in Home (la terza, Dirigenza, usa lo stemma). `storia.webp` è il campanile da Wikimedia Commons (CC BY-SA, crediti nella pagina Privacy) |
| `club/storia-1987.webp`, `storia-campo-1997.webp`, `storia-2020.webp`, `storia-oggi.webp` | 1200×800 | linea del tempo nella pagina Società (il credito della foto va in `credito:` in `js/dati/storia.js`) |
| `giocatori/<cognome>.webp` | 800×1000, sfondo trasparente | card della rosa (`foto:` in `js/dati/squadre.js`). Scontornati e tutti alla stessa scala (testa larga circa 235 px, cima della testa a ~90 px dal bordo); i PNG originali sono in `materiale/giocatori-png/`, con lo script che li prepara (`ritaglia-giocatori.py`). Va bene anche un `.png` trasparente |
| `dirigenti/<cognome>.webp` | 800×1000 | pagina Dirigenza (`foto:` in `js/dati/club.js`) |
| `segnaposto-persona.webp` | — | la sagoma per giocatori e dirigenti senza foto (non è un segnaposto "FOTO DA INSERIRE") |
| `avversari/<nome-squadra>.webp` | max 180×180, trasparente | stemmi delle squadre avversarie, uno per club (es. `polisportiva-san-giovanni.webp`), in WebP perché sono tanti e il calendario resta leggero. Presi dagli originali in alta risoluzione di Tuttocampo o dal sito ufficiale del club (Real Melegnano). Li scarica da solo `strumenti/aggiorna_risultati.py` quando arriva una squadra nuova; per mettere un logo migliore basta sostituire il file con lo stesso nome (va bene anche un `.png`) |
| `partner/*.webp` | larghi 600 px, trasparenti | loghi degli sponsor (gli originali a 300 ppi della società sono in `materiale/`) |
| `social/*.webp` | 600×1067 | le grafiche Instagram mostrate nella sezione social della Home |
| `texture/texture-grigia-continua.webp`, `texture-rossa-continua.webp` | — | la trama "a graffi" delle grafiche resa senza cuciture (si ripete senza righe di giunzione), usata come sfondo (`trama-grigia`, `trama-rossa`) |
| `texture/texture-grigia.webp`, `texture-rossa.webp` | — | la trama originale; quella grigia la usa intera il menu da telefono |

## Foto facsimile (provvisorie)

Per mostrare il sito finché non arrivano le foto della società, alcuni segnaposto sono stati sostituiti con foto di calcio generiche, senza persone riconoscibili. Sono tutte di Wikimedia Commons con licenza **CC0** (pubblico dominio): si possono tenere anche online, senza citare l'autore. Quando arriva la foto vera si salva con lo stesso nome.

| File nel sito | Foto | Autore | Licenza |
| --- | --- | --- | --- |
| `assets/img/notizie/apertura-01.webp` | [Playing football in evening (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Playing_football_in_evening_(Unsplash).jpg) | Abigail Keenan akeenster | CC0 |
| `assets/img/notizie/apertura-02.webp` | [Soccer at night (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Soccer_at_night_(Unsplash).jpg) | Abigail  Keenan akeenster | CC0 |
| `assets/img/notizie/apertura-03.webp` | [Goalkeeper through the soccer goal net (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Goalkeeper_through_the_soccer_goal_net_(Unsplash).jpg) | Dan Gold danielcgold | CC0 |
| `assets/img/notizie/apertura-04.webp` | [Adidas soccer ball on a grass pitch (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Adidas_soccer_ball_on_a_grass_pitch_(Unsplash).jpg) | Peter Glaser baraida | CC0 |
| `assets/img/notizie/notizia-01.webp` | [Soccer field at Brastad arena 6.jpg](https://commons.wikimedia.org/wiki/File:Soccer_field_at_Brastad_arena_6.jpg) | W.carter | CC0 |
| `assets/img/notizie/notizia-03.webp` | [Football on fall ground (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Football_on_fall_ground_(Unsplash).jpg) | C MA chancema | CC0 |
| `assets/img/notizie/notizia-04.webp` | [White soccer line (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:White_soccer_line_(Unsplash).jpg) | Sandro Schuh schuh | CC0 |
| `assets/img/notizie/notizia-06.webp` | [Silhouette goalkeeper catching the ball (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Silhouette_goalkeeper_catching_the_ball_(Unsplash).jpg) | david clarke davidclarke | CC0 |
| `assets/img/notizie/notizia-07.webp` | [Corner flag at Brastad arena.jpg](https://commons.wikimedia.org/wiki/File:Corner_flag_at_Brastad_arena.jpg) | W.carter | CC0 |
| `assets/img/notizie/notizia-08.webp` | [Soccer goal construction with night sky clouds (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Soccer_goal_construction_with_night_sky_clouds_(Unsplash).jpg) | Mitchell Lawler dalawler | CC0 |
| `assets/img/club/campo.webp` | [Red football corner flag.jpg](https://commons.wikimedia.org/wiki/File:Red_football_corner_flag.jpg) | Pksois23 | CC0 |
| `assets/img/club/storia-campo-1997.webp` | [Soccer Field (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Soccer_Field_(Unsplash).jpg) | Sonja Guina sonjulica | CC0 |

Giocatori e dirigenti restano con la sagoma: le loro foto le fornisce la società.

**Idee per le foto più utili da scattare**: foto di squadra di ogni categoria a inizio stagione; ritratti dei giocatori della prima squadra su sfondo neutro (si scontornano facilmente); lo Stadio Comunale N.1 dall'alto o dalla tribuna; un allenamento di ogni squadra; foto storiche della società (1987, anni '90).
