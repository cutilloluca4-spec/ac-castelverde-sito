/* ==================================================================
   A.C. Castelverde — js/pagine/societa.js
   Pagina Società: numeri, la storia (js/dati/storia.js) come azione di calcio
   in 3D o come linea del tempo, e campi (js/dati/club.js). Le persone sono nella pagina Dirigenza.
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  preparaLayout();
  disegnaNumeriSocieta();
  disegnaStoria();
  disegnaImpianti();
  avviaStoria3D();          // prima delle altre animazioni: decide se la storia è in 3D
  avviaAnimazioni();
});

function disegnaNumeriSocieta() {
  document.getElementById("numeri").innerHTML = CLUB.numeri.map(function (n) {
    return (
      '<div class="bg-white px-6 py-7 shadow-[6px_8px_0_rgba(0,0,0,.15)]">' +
        `<p class="titolo-display text-[60px] computer:text-[80px]" data-conta="${n.valore}" data-suffisso="${n.suffisso || ""}">${n.valore}${n.suffisso || ""}</p>` +
        `<p class="text-[13px] font-semibold uppercase tracking-[.1em] mt-2 text-acc-testo-2">${testo(n.etichetta)}</p>` +
      "</div>"
    );
  }).join("");
}

// La linea del tempo classica: su computer le tappe si alternano a sinistra e a destra.
// Si vede se il 3D non c'è; con il 3D acceso resta per i lettori di schermo.
function disegnaStoria() {
  document.getElementById("lineaTempo").innerHTML = STORIA.map(function (t, i) {
    const destra = i % 2 === 1;
    return (
      '<li class="relative pl-14 computer:pl-0 computer:grid computer:grid-cols-2 computer:gap-20" data-entra>' +
        // il rombo della tappa sulla linea
        '<span class="absolute left-1.5 top-1.5 w-[22px] h-[22px] bg-white border-4 border-acc-nero rotate-45 computer:left-1/2 computer:-ml-[11px]" aria-hidden="true"></span>' +
        `<div class="${destra ? "computer:col-start-2" : "computer:text-right"}">` +
          `<p class="titolo-display text-[72px] computer:text-[96px] text-acc-rosso">${testo(t.anno)}</p>` +
          `<h3 class="titolo-display text-[34px] mt-1">${testo(t.titolo)}</h3>` +
          `<p class="text-[16px] leading-relaxed mt-3 text-acc-inchiostro/80">${testo(t.testo)}</p>` +
          // la cornice grigia sporge di 24 px tutto intorno alla foto: mt-12 lascia sempre 24 px liberi tra il testo e la cornice
          (t.immagine ? `<img class="block w-[calc(100%-48px)] aspect-[3/2] object-cover cornice mt-12 mb-6 mx-6 ${destra ? "" : "computer:ml-auto"}" src="${testo(t.immagine)}" alt="" loading="lazy" />` : "") +
          (t.immagine && t.credito ? `<p class="text-[12px] text-acc-testo-2 mt-4 mx-6">${testo(t.credito)}</p>` : "") +
        "</div>" +
      "</li>"
    );
  }).join("");
}


/* ---- LA STORIA IN 3D: l'azione di calcio ---------------------------------
   Scorrendo, la sezione .azione resta ferma (ScrollTrigger pin) e l'avanzamento
   p (0 … numero di tappe) muove la scena 3D di js/azione-3d.js: a p = k il
   giocatore k ha il pallone, e la scheda mostra la tappa k di STORIA.
   Si accende solo se le animazioni sono attive e il browser ha WebGL. */
function avviaStoria3D() {
  const storia = document.querySelector(".storia");
  const palco = document.querySelector(".azione");
  if (!storia || !palco || ANIMAZIONI_SPENTE || typeof creaAzione3D !== "function" || !window.WebGLRenderingContext) return;
  storia.classList.add("con-3d");                 // prima di creare la scena: così il canvas ha le sue misure
  // i calciatori (modello e movimenti registrati) si caricano una volta; se qualcosa va storto
  // torna la linea del tempo classica
  caricaCalciatori("assets/3d/calciatore.glb").then(function (modello) {
    const azione = creaAzione3D(palco.querySelector(".azione__tela"), STORIA.length, modello);
    if (!azione) throw new Error("WebGL non disponibile");
    palco.querySelector(".azione__attesa").remove();
    regiaStoria3D(palco, azione);
  }).catch(function () {
    storia.classList.remove("con-3d");
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
}

// la regia dello scorrimento: la sezione resta ferma, le schede, gli anni, il GOAL!
function regiaStoria3D(palco, azione) {
  gsap.registerPlugin(ScrollTrigger);
  const n = azione.quante;

  const scheda = palco.querySelector(".azione__scheda");
  const etichette = palco.querySelector(".azione__etichette");
  const percorso = palco.querySelector(".azione__percorso");
  const invito = palco.querySelector(".azione__invito");

  // le etichette con l'anno sopra ogni giocatore
  etichette.innerHTML = STORIA.slice(0, n).map(function (t) {
    // come le pillole del sito: bianca, rossa per chi ha il pallone
    return `<span class="pillola pillola--piccola absolute left-0 top-0 [&.is-attiva]:bg-acc-rosso [&.is-attiva]:text-white [&.is-attiva]:text-[15px] transition-[background-color,color,font-size] duration-300">${testo(t.anno)}</span>`;
  }).join("");
  const nomi = Array.from(etichette.children);

  // il percorso: un pulsante per anno
  percorso.innerHTML = STORIA.slice(0, n).map(function (t, i) {
    // come le schede del sito (Prima squadra, Juniores…): tonde, rosse quando attive
    return `<li class="flex-none"><button type="button" data-tappa="${i}" class="cursor-pointer border-0 rounded-full bg-white/70 text-acc-nero font-acc-titoli font-bold uppercase text-[14px] tracking-[.03em] px-3.5 pt-[8px] pb-[5px] transition-[background-color,color] duration-200 hover:bg-white [&.is-attiva]:bg-acc-rosso [&.is-attiva]:text-white">${testo(t.anno)}</button></li>`;
  }).join("");
  const bottoni = Array.from(percorso.querySelectorAll("button"));

  // la scheda di una tappa
  function htmlScheda(t, i) {
    return (
      // la scheda come le card del sito: bianca, ombra piena e l'angolo rosso a L delle grafiche.
      // Da computer non supera mai lo spazio tra il menu e gli anni: la foto si adatta
      '<article class="angolo-rosso bg-white p-6 computer:p-8 shadow-[8px_10px_0_rgba(0,0,0,.15)] computer:max-h-full computer:flex computer:flex-col">' +
        `<p class="pillola pillola--piccola pillola--grigia self-start">Tappa ${i + 1} di ${n}</p>` +
        `<p class="titolo-display text-[56px] computer:text-[88px] text-acc-rosso mt-3">${testo(t.anno)}</p>` +
        `<h3 class="titolo-display text-[26px] computer:text-[32px] mt-1">${testo(t.titolo)}</h3>` +
        `<p class="text-[14px] computer:text-[15px] leading-relaxed mt-3 text-acc-inchiostro/80">${testo(t.testo)}</p>` +
        // la foto si restringe (fino a sparire) se il testo è lungo; la didascalia sta sopra la foto e sparisce con lei
        (t.immagine ? '<figure class="hidden computer:block relative m-0 mt-5 min-h-0 flex-1 max-h-[220px] overflow-hidden">' +
          `<img class="block w-full h-full object-cover" src="${testo(t.immagine)}" alt="" loading="lazy" />` +
          (t.credito ? `<figcaption class="absolute inset-x-0 bottom-0 px-3 pt-6 pb-2 text-[11px] leading-snug text-white bg-gradient-to-t from-black/70 to-transparent">${testo(t.credito)}</figcaption>` : "") +
        "</figure>" : "") +
      "</article>"
    );
  }
  let attuale = -1;
  function mostraTappa(i) {
    if (i === attuale) return;
    const verso = i > attuale ? 1 : -1;
    attuale = i;
    bottoni.forEach(function (b, k) { b.classList.toggle("is-attiva", k === i); });
    // la fila degli anni scorre da sola (solo lei: scrollIntoView sposterebbe anche la scena)
    if (bottoni[i]) percorso.scrollTo({ left: bottoni[i].parentNode.offsetLeft - percorso.clientWidth / 2 + bottoni[i].offsetWidth / 2, behavior: "smooth" });
    // il testo cambia subito (così non resta mai indietro), poi la scheda entra con una dissolvenza
    scheda.innerHTML = htmlScheda(STORIA[i], i);
    gsap.killTweensOf(scheda);
    gsap.fromTo(scheda, { opacity: 0, y: 18 * verso }, { opacity: 1, y: 0, duration: .4, ease: "power3.out" });
  }

  // il GOAL! in stile premiazione
  const goal = preparaGoal(palco);

  // ogni fotogramma: la scena, gli anni sopra le teste, la scheda, il goal
  function aggiorna(p) {
    const stato = azione.metti(p);
    // durante il gol la scheda si fa da parte e la scena prende tutto lo schermo
    const libero = p >= azione.momentoPalcoLibero;
    scheda.style.visibility = libero ? "hidden" : "";
    // su smartphone anche la fila degli anni lascia il posto al GOAL!
    percorso.parentNode.style.visibility = libero && window.innerWidth < 900 ? "hidden" : "";
    const punti = azione.etichette();
    nomi.forEach(function (el, k) {
      const q = punti[k];
      el.style.transform = "translate(" + q.x.toFixed(1) + "px," + q.y.toFixed(1) + "px) translate(-50%,-100%)";
      el.style.opacity = q.visibile && !libero ? (k === stato.chi ? 1 : .8) : 0;
      el.classList.toggle("is-attiva", k === stato.chi);
    });
    mostraTappa(Math.min(n - 1, Math.round(p - .14)));
    invito.style.opacity = Math.max(0, 1 - p * 3);
    goal.controlla(p >= azione.momentoGoal);
  }

  // lo scorrimento: la sezione resta ferma per (tappe + 1) schermate circa
  const corsa = { p: 0 };
  const tratto = gsap.to(corsa, {
    p: azione.fine, ease: "none",                  // le tappe più il tiro (che dura il doppio)
    scrollTrigger: {
      trigger: palco, start: "top top", end: function () { return "+=" + Math.round(window.innerHeight * (azione.fine + .8) * .85); },
      pin: true, scrub: .7, invalidateOnRefresh: true
    },
    onUpdate: function () { aggiorna(corsa.p); }
  });
  // cliccando un anno si va a quella tappa
  bottoni.forEach(function (b, i) {
    b.addEventListener("click", function () {
      const st = tratto.scrollTrigger;
      window.scrollTo({ top: st.start + (st.end - st.start) * (i / azione.fine) + 2, behavior: "smooth" });
    });
  });
  window.addEventListener("resize", function () { azione.misura(); aggiorna(corsa.p); });
  aggiorna(0);
  ScrollTrigger.refresh();
}

// Il GOAL! finale, come le grafiche "FULL TIME" del club: la fascia diagonale rossa entra
// di taglio, le lettere saltano fuori, sotto la pillola; intorno i coriandoli.
// controlla(true) lo fa partire, controlla(false) lo nasconde (tornando indietro).
function preparaGoal(palco) {
  const strato = palco.querySelector(".azione__goal");
  const fascia = palco.querySelector(".azione__fascia");
  const filo = palco.querySelector(".azione__filo");
  const scritta = palco.querySelector(".azione__scritta");
  const sotto = palco.querySelector(".azione__sotto");
  const scatola = palco.querySelector(".azione__coriandoli");
  // ogni lettera ha il suo contorno dietro (sempre allineato) e il bianco davanti, che la riempie dal basso
  scritta.innerHTML = "GOAL!".split("").map(function (l) {
    return '<span class="goal__lettera relative inline-block">' +
      `<span class="goal__contorno absolute inset-0 titolo-contorno [-webkit-text-stroke-width:3px]">${l}</span>` +
      `<span class="goal__pieno relative inline-block">${l}</span>` +
      "</span>";
  }).join("");
  const lettere = scritta.querySelectorAll(".goal__lettera");
  const contorni = scritta.querySelectorAll(".goal__contorno");
  const pieni = scritta.querySelectorAll(".goal__pieno");
  const COLORI = ["#ff0000", "#d0d2d4", "#0e0e0f", "#ffffff", "#c80000"];
  const coriandoli = [];
  for (let k = 0; k < 56; k++) {
    const c = document.createElement("span");
    c.className = "absolute block w-2 h-3.5 -ml-1 -mt-2 opacity-0";
    c.style.background = COLORI[k % COLORI.length];
    scatola.appendChild(c);
    coriandoli.push(c);
  }
  let acceso = false;
  function accendi() {
    gsap.killTweensOf([strato, fascia, filo, lettere, contorni, pieni, sotto]);
    gsap.set(strato, { autoAlpha: 1 });
    gsap.fromTo(fascia, { scaleX: 0 }, { scaleX: 1, duration: .45, ease: "power4.out" });
    gsap.fromTo(filo, { scaleX: 0 }, { scaleX: 1, duration: .5, ease: "power4.out", delay: .12 });
    // le lettere saltano fuori vuote (solo il contorno), poi il bianco le riempie tutte dal basso
    // e il contorno scivola di lato, a fare l'ombra
    gsap.fromTo(lettere, { opacity: 0, scale: 0, y: 60, rotation: function (k) { return k % 2 ? 14 : -14; } },
      { opacity: 1, scale: 1, y: 0, rotation: 0, duration: .55, ease: "back.out(3)", stagger: .06, delay: .15 });
    gsap.fromTo(pieni, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .45, ease: "power2.inOut", stagger: .06, delay: .45 });
    gsap.fromTo(contorni, { x: 0, y: 0 }, { x: 10, y: 10, duration: .45, ease: "power3.out", stagger: .06, delay: .7 });
    gsap.fromTo(sotto, { opacity: 0, y: 116 }, { opacity: 1, y: function () { return window.innerWidth >= 900 ? 136 : 100; }, duration: .45, ease: "power3.out", delay: .6 });
    coriandoli.forEach(function (c) {
      const a = Math.random() * Math.PI * 2, forza = 140 + Math.random() * 260;
      gsap.timeline({ delay: .2 })
        .set(c, { opacity: 1, x: 0, y: 0, rotation: Math.random() * 360, scale: .6 + Math.random() * .7 })
        .to(c, { x: Math.cos(a) * forza, y: Math.sin(a) * forza * .6 - 80, rotation: "+=" + (200 + Math.random() * 400), duration: .75, ease: "power3.out" })
        .to(c, { y: "+=" + (180 + Math.random() * 160), x: "+=" + (Math.random() * 40 - 20), opacity: 0, rotation: "+=180", duration: 1.6 + Math.random() * .6, ease: "power1.in" });
    });
  }
  function spegni() {
    gsap.killTweensOf(coriandoli);
    gsap.set(coriandoli, { opacity: 0 });
    gsap.to(strato, { autoAlpha: 0, duration: .25 });
  }
  return {
    controlla: function (dentro) {
      if (dentro && !acceso) { acceso = true; accendi(); }
      else if (!dentro && acceso) { acceso = false; spegni(); }
    }
  };
}

function disegnaImpianti() {
  document.getElementById("elencoImpianti").innerHTML = CLUB.impianti.map(function (c, i) {
    return (
      '<article class="flex flex-col bg-white">' +
        `<div class="${i === 0 ? "trama-rossa text-white" : "trama-grigia"} p-8 pb-10">` +
          `<p class="titolo-display text-[20px] opacity-80">La nostra casa</p>` +
          `<h3 class="titolo-display text-[48px] tablet:text-[60px] mt-2">${testo(c.nome)}</h3>` +
        "</div>" +
        '<div class="p-8 flex flex-col gap-4 flex-1">' +
          `<p class="flex items-start gap-2 font-semibold"><span class="w-5 h-5 flex-none text-acc-rosso">${ICONE.luogo}</span>${testo(c.indirizzo)}</p>` +
          `<p class="text-[15px] leading-relaxed text-acc-testo-2">${testo(c.descrizione)}</p>` +
          `<a class="btn btn--nero self-start mt-auto" href="${c.mappa}" target="_blank" rel="noopener">Apri la mappa ${ICONE.freccia}</a>` +
        "</div>" +
      "</article>"
    );
  }).join("");
}
