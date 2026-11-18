/* ==================================================================
   A.C. Castelverde — js/dati/partner.js
   I partner (sponsor) mostrati in fondo a ogni pagina: solo il logo.
   I loghi sono in assets/img/partner/: PNG con sfondo trasparente,
   ricavati dai file originali a 300 ppi (larghi al massimo 1400 px
   o alti 700 px, così restano nitidi anche sugli schermi retina).

   Per aggiungere un partner:
     1. metti il logo in assets/img/partner/ (PNG trasparente o SVG)
     2. aggiungi una riga: { nome, logo, sito }
        sito: indirizzo del sito dell'azienda (facoltativo: se c'è, il logo diventa un link)
        grande: true (facoltativo) per i loghi stretti e alti che nel riquadro sembrerebbero piccoli
   I loghi compaiono nell'ordine della lista.
   ================================================================== */

const PARTNER = [
  { nome: "Unical · Rappresentanze termoidrauliche di Gelmini & Preda", logo: "assets/img/partner/unical.webp",                   sito: "" },
  { nome: "Reale Mutua · Agenzia di Crema",                             logo: "assets/img/partner/reale-mutua.webp",              sito: "" },
  { nome: "Selica Costruzioni",                                          logo: "assets/img/partner/selica-costruzioni.webp",       sito: "", grande: true },
  { nome: "DD Sistemi",                                                  logo: "assets/img/partner/dd-sistemi.webp",               sito: "" },
  { nome: "Omega Verifiche Impianti S.r.l.",                             logo: "assets/img/partner/omega-verifiche-impianti.webp", sito: "" },
  { nome: "Vancom Imballaggi",                                           logo: "assets/img/partner/vancom-imballaggi.webp",        sito: "" },
  { nome: "Tecnopubblica S.r.l.",                                        logo: "assets/img/partner/tecnopubblica.webp",            sito: "" },
  { nome: "Opel Dal Ben & Barbieri S.n.c.",                              logo: "assets/img/partner/opel-dal-ben-barbieri.webp",    sito: "", grande: true }
];
