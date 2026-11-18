# js/vendor — librerie esterne

File copiati così come sono: non modificarli. Si caricano con un normale `<script>`, così il sito funziona anche aperto senza server.

| File | Libreria | Versione | Licenza |
| --- | --- | --- | --- |
| `gsap.min.js` | [GSAP](https://gsap.com) | 3.12.5 | [GreenSock Standard License](https://gsap.com/standard-license/) (gratuita, anche per siti commerciali) |
| `ScrollTrigger.min.js` | plugin ScrollTrigger di GSAP | 3.12.5 | come sopra |

Tailwind non è qui: è installato con npm (`package.json`) e genera `css/stile.min.css`.

Per aggiornare GSAP: scaricare i file `.min.js` della nuova versione da <https://cdnjs.com/libraries/gsap>, sostituirli qui, aggiornare la tabella e lanciare `npm test`.
