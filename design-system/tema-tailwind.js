/* ==================================================================
   A.C. Castelverde — design-system/tema-tailwind.js
   Dice a Tailwind (lo script js/vendor/tailwind-browser.js) i nomi dei
   colori e dei font del club, così nell'HTML si scrive
   text-acc-rosso invece di text-[#e10600].
   I valori veri sono in colori.css: qui ci sono solo i nomi.
   Oltre ai colori: font, larghezza massima (max-w-acc) e ombre.

   Va caricato PRIMA di tailwind-browser.js:
     <link rel="stylesheet" href="design-system/colori.css">
     <script src="design-system/tema-tailwind.js"></script>
     <script src="js/vendor/tailwind-browser.js"></script>
   ================================================================== */

const temaTailwind = `
  @theme inline {
    --color-acc-rosso: var(--color-rosso);               /* #ff0000 */
    --color-acc-rosso-scuro: var(--color-rosso-scuro);   /* #c80000 */
    --color-acc-rosso-profondo: var(--color-rosso-profondo); /* #8e1414 */
    --color-acc-grigio: var(--color-grigio);             /* #d0d2d4 grigio stemma */
    --color-acc-grigio-chiaro: var(--color-grigio-chiaro); /* #f1f1f1 */
    --color-acc-grigio-medio: var(--color-grigio-medio); /* #a9abad */
    --color-acc-nero: var(--color-nero);                 /* #0e0e0f */
    --color-acc-nero-2: var(--color-nero-2);
    --color-acc-nero-3: var(--color-nero-3);
    --color-acc-carta: var(--color-carta);               /* #f6f6f6 sfondo */
    --color-acc-inchiostro: var(--color-inchiostro);     /* #111113 testo */
    --color-acc-testo-2: var(--color-testo-2);           /* #6c6f73 testo secondario */
    --color-acc-linea: var(--color-linea);
    --color-acc-vittoria: var(--color-vittoria);
    --color-acc-pareggio: var(--color-pareggio);
    --color-acc-avviso: var(--color-avviso);             /* #f0a500 */
    --color-acc-avviso-chiaro: var(--color-avviso-chiaro); /* #fff6d9 */

    --font-acc-titoli: var(--font-titoli);               /* classe: font-acc-titoli */
    --font-acc-testo: var(--font-testo);                 /* classe: font-acc-testo  */

    --container-acc: var(--larghezza-max);               /* classe: max-w-acc (1320px) */

    --shadow-acc-card: var(--ombra-card);                /* classe: shadow-acc-card */
    --shadow-acc-grafica: var(--ombra-grafica);          /* classe: shadow-acc-grafica */
    --drop-shadow-acc-stemma: var(--ombra-stemma);       /* classe: drop-shadow-acc-stemma */
  }

  /* Larghezze dello schermo in aggiunta a quelle di Tailwind
     (sm 640, md 768, lg 1024, xl 1280).
     "computer:flex" = da 900px in su. */
  @theme {
    --breakpoint-tablet: 43.75rem;   /* 700px */
    --breakpoint-computer: 56.25rem; /* 900px */
  }
`;

// Tailwind legge i blocchi <style type="text/tailwindcss"> presenti nella pagina
const stileTema = document.createElement("style");
stileTema.type = "text/tailwindcss";
stileTema.textContent = temaTailwind;
document.head.appendChild(stileTema);
