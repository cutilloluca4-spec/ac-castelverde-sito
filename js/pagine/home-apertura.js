/* ==================================================================
   A.C. Castelverde — js/pagine/home-apertura.js
   L'apertura della Home: nessun testo da leggere, solo gioco.

     1. Pallone (canvas): un pallone da calciare con il mouse.
          - passando sopra il pallone lo si colpisce: più veloce è il
            movimento, più forte parte;
          - clic / tocco: calcio verso quel punto;
          - rimbalza sui bordi e sullo stemma (che vibra e fa un'onda rossa);
          - lascia una scia rossa, come le pennellate delle grafiche;
          - se nessuno gioca, ogni tanto riparte da solo.
     2. Fascia "Associazione Calcio Castelverde": scorre di continuo,
        parole alternate grigio/rosso; accelera e si inclina seguendo
        la velocità del mouse.
     3. Stemma: si inclina in 3D verso il mouse.

   Con ?statico o "riduci movimento" resta tutto fermo (pallone in basso a destra).
   Struttura HTML: sezione 01 di index.html. Stile: §3 di css/sito.css.
   ================================================================== */

function avviaApertura() {
  const sezione = document.getElementById("apertura");
  const canvas = document.getElementById("campoPallone");
  if (!sezione || !canvas) return;

  const gioco = preparaPallone(sezione, canvas, ANIMAZIONI_SPENTE);
  if (ANIMAZIONI_SPENTE) return;

  preparaFascia(sezione, gioco);
  preparaStemma(sezione, gioco);
  animaIngresso(gioco);
}

/* 1. PALLONE ------------------------------------------------------ */
function preparaPallone(sezione, canvas, fermo) {
  const contesto = canvas.getContext("2d");
  const ATTRITO = 0.988;         // quanto rallenta a ogni fotogramma (1 = mai)
  const RIMBALZO = 0.78;         // quanta velocità conserva rimbalzando
  const FORZA_MAX = 34;          // velocità massima dopo un calcio (px per fotogramma)
  const SCIA = 26;               // quanti punti lunga la scia

  let larghezza = 0, altezza = 0, raggio = 34;
  let visibile = true;
  const pallone = { x: 0, y: 0, vx: 0, vy: 0, scala: fermo ? 1 : 0 };
  const scia = [];
  let anelli = [];               // onde rosse quando il pallone colpisce lo stemma: { x, y, r, vita }
  const piede = { x: -9999, y: -9999, vx: 0, vy: 0, attivo: false, ultimo: 0 };   // il mouse
  let ultimoCalcio = 0;
  const ascoltatori = { colpoStemma: [] };

  // lo stemma è un ostacolo rotondo al centro della sezione
  const stemma = sezione.querySelector(".apertura__stemma");
  function ostacolo() {
    const r = stemma.getBoundingClientRect(), s = sezione.getBoundingClientRect();
    return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, r: r.width * 0.43 };
  }

  function prepara() {
    const nitidezza = Math.min(window.devicePixelRatio || 1, 2);
    larghezza = sezione.offsetWidth;
    altezza = sezione.offsetHeight;
    canvas.width = larghezza * nitidezza;
    canvas.height = altezza * nitidezza;
    contesto.setTransform(nitidezza, 0, 0, nitidezza, 0, 0);
    raggio = larghezza < 700 ? 26 : 36;
    if (!pallone.x) { pallone.x = larghezza * 0.8; pallone.y = altezza * 0.72; }
  }

  /* --- disegno --- */
  // il pallone 3D (uguale a quello dello stemma) è in js/pallone-3d.js: qui si usa e basta
  const palla3d = creaPallone3D();

  // scia rossa: tratti sempre più sottili e trasparenti, leggermente "sporchi"
  function disegnaScia() {
    contesto.lineCap = "round";
    for (let i = 1; i < scia.length; i++) {
      const a = scia[i - 1], b = scia[i];
      const vita = i / scia.length;
      contesto.beginPath();
      contesto.moveTo(a.x, a.y);
      contesto.lineTo(b.x, b.y);
      contesto.strokeStyle = `rgba(255,0,0,${vita * 0.85})`;
      contesto.lineWidth = raggio * 1.3 * vita * Math.min(1, b.v / 8);
      contesto.stroke();
      // graffi paralleli, come la pennellata delle grafiche
      contesto.beginPath();
      contesto.moveTo(a.x + 6, a.y - 9);
      contesto.lineTo(b.x + 6, b.y - 9);
      contesto.lineWidth = 2;
      contesto.strokeStyle = `rgba(255,0,0,${vita * 0.5})`;
      contesto.stroke();
    }
  }

  function disegnaAnelli() {
    anelli.forEach(function (a) {
      a.r += 5; a.vita -= 0.025;
      contesto.beginPath();
      contesto.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      contesto.lineWidth = 6 * a.vita;
      contesto.strokeStyle = `rgba(255,0,0,${Math.max(0, a.vita)})`;
      contesto.stroke();
    });
    anelli = anelli.filter(function (a) { return a.vita > 0; });
  }

  function disegna() {
    contesto.clearRect(0, 0, larghezza, altezza);
    disegnaAnelli();
    disegnaScia();
    if (pallone.scala > 0) palla3d.disegna(contesto, pallone.x, pallone.y, raggio * pallone.scala, true);
  }

  /* --- fisica --- */
  function calcia(vx, vy) {
    const v = Math.hypot(vx, vy) || 1;
    const k = Math.min(1, FORZA_MAX / v);
    pallone.vx = vx * k;
    pallone.vy = vy * k;
    ultimoCalcio = performance.now();
  }

  function muovi() {
    pallone.x += pallone.vx;
    pallone.y += pallone.vy;
    pallone.vx *= ATTRITO;
    pallone.vy *= ATTRITO;
    const velocita = Math.hypot(pallone.vx, pallone.vy);
    palla3d.rotola(pallone.vx, pallone.vy, raggio);   // rotola nella direzione del movimento

    // bordi
    if (pallone.x < raggio) { pallone.x = raggio; pallone.vx = Math.abs(pallone.vx) * RIMBALZO; }
    if (pallone.x > larghezza - raggio) { pallone.x = larghezza - raggio; pallone.vx = -Math.abs(pallone.vx) * RIMBALZO; }
    if (pallone.y < raggio) { pallone.y = raggio; pallone.vy = Math.abs(pallone.vy) * RIMBALZO; }
    if (pallone.y > altezza - raggio) { pallone.y = altezza - raggio; pallone.vy = -Math.abs(pallone.vy) * RIMBALZO; }

    // stemma: rimbalzo sul cerchio + avviso (lo stemma vibra)
    const o = ostacolo();
    const dx = pallone.x - o.x, dy = pallone.y - o.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < o.r + raggio) {
      const nx = dx / d, ny = dy / d;
      pallone.x = o.x + nx * (o.r + raggio);
      pallone.y = o.y + ny * (o.r + raggio);
      const dot = pallone.vx * nx + pallone.vy * ny;
      if (dot < 0) {
        pallone.vx = (pallone.vx - 2 * dot * nx) * RIMBALZO;
        pallone.vy = (pallone.vy - 2 * dot * ny) * RIMBALZO;
        const forzaColpo = Math.min(1, -dot / 20);
        anelli.push({ x: o.x + nx * o.r, y: o.y + ny * o.r, r: raggio * 0.6, vita: 0.4 + forzaColpo * 0.6 });
        ascoltatori.colpoStemma.forEach(function (f) { f(nx, ny, forzaColpo); });
      }
    }

    // il piede (mouse) colpisce il pallone quando lo tocca
    if (piede.attivo) {
      const px = pallone.x - piede.x, py = pallone.y - piede.y;
      const pd = Math.hypot(px, py) || 1;
      if (pd < raggio + 22) {
        const spinta = Math.max(7, Math.hypot(piede.vx, piede.vy) * 0.9);
        calcia(px / pd * spinta + piede.vx * 0.4, py / pd * spinta + piede.vy * 0.4);
        pallone.x = piede.x + px / pd * (raggio + 23);
        pallone.y = piede.y + py / pd * (raggio + 23);
      }
    }

    // scia
    scia.push({ x: pallone.x, y: pallone.y, v: velocita });
    if (scia.length > SCIA) scia.shift();

    // nessuno gioca da 5 s e il pallone è quasi fermo: riparte da solo
    if (performance.now() - ultimoCalcio > 5000 && velocita < 0.6) {
      const a = Math.random() * Math.PI * 2;
      calcia(Math.cos(a) * 18, Math.sin(a) * 18);
    }
  }

  function ciclo() {
    if (visibile) {
      // la velocità del piede si smorza se il mouse resta fermo
      piede.vx *= 0.8; piede.vy *= 0.8;
      muovi();
      disegna();
    }
    requestAnimationFrame(ciclo);
  }

  prepara();
  window.addEventListener("resize", function () { prepara(); disegna(); });

  if (fermo) { disegna(); return null; }

  // il mouse (o il dito) è il piede
  function aggiornaPiede(clientX, clientY) {
    const r = sezione.getBoundingClientRect();
    const x = clientX - r.left, y = clientY - r.top;
    if (piede.attivo) { piede.vx = x - piede.x; piede.vy = y - piede.y; }
    piede.x = x; piede.y = y; piede.attivo = true; piede.ultimo = performance.now();
  }
  sezione.addEventListener("pointermove", function (e) { aggiornaPiede(e.clientX, e.clientY); });
  // dito sollevato (o scorrimento della pagina): il piede sparisce, se no resterebbe
  // fermo nell'ultimo punto toccato e il pallone ci sbatterebbe contro
  ["pointerleave", "pointerup", "pointercancel"].forEach(function (evento) {
    sezione.addEventListener(evento, function (e) { if (evento === "pointerleave" || e.pointerType !== "mouse") piede.attivo = false; });
  });
  // clic / tocco: calcio verso quel punto
  sezione.addEventListener("pointerdown", function (e) {
    if (e.target.closest("a, button")) return;
    const r = sezione.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const dx = x - pallone.x, dy = y - pallone.y, distanza = Math.hypot(dx, dy) || 1;
    if (distanza < raggio * 1.6) {
      // tocco sul pallone (col dito capita spesso): lo si "colpisce", parte nel verso opposto al dito
      const forza = 20;
      calcia(-dx / distanza * forza || forza * 0.6, -dy / distanza * forza || -forza);
    } else {
      // tocco lontano: il pallone va verso quel punto, sempre con una spinta minima ben visibile
      const forza = Math.max(12, distanza * 0.09);
      calcia(dx / distanza * forza, dy / distanza * forza);
    }
  });

  ScrollTrigger.create({
    trigger: sezione, start: "top bottom", end: "bottom top",
    onToggle: function (s) { visibile = s.isActive; }
  });

  ciclo();

  return {
    pallone: pallone,
    piede: piede,
    calcia: calcia,
    dimensioni: function () { return { l: larghezza, a: altezza }; },
    suColpoStemma: function (f) { ascoltatori.colpoStemma.push(f); }
  };
}

/* 2. FASCIA CHE SCORRE -------------------------------------------- */
// La fascia contiene due copie uguali della scritta: spostandola di metà
// della sua larghezza il giro è continuo. La velocità del mouse la spinge.
function preparaFascia(sezione, gioco) {
  const nastro = sezione.querySelector(".apertura__scritta");
  const stato = { x: 0, spinta: 0 };
  const inclina = gsap.quickTo(nastro, "skewX", { duration: .5, ease: "power3.out" });

  gsap.ticker.add(function () {
    const meta = nastro.scrollWidth / 2;
    // velocità di base + spinta del mouse (destra = più veloce, sinistra = rallenta e torna indietro)
    stato.spinta += (gioco.piede.vx * 0.6 - stato.spinta) * 0.08;
    stato.x -= 1.1 + stato.spinta;
    if (stato.x <= -meta) stato.x += meta;
    if (stato.x > 0) stato.x -= meta;
    gsap.set(nastro, { x: stato.x });
    inclina(Math.max(-14, Math.min(14, -stato.spinta * 0.9)));
  });
}

/* 3. STEMMA ------------------------------------------------------- */
function preparaStemma(sezione, gioco) {
  const stemma = sezione.querySelector(".apertura__stemma");
  gsap.set(stemma, { transformPerspective: 900 });
  const ry = gsap.quickTo(stemma, "rotationY", { duration: .8, ease: "power3.out" });
  const rx = gsap.quickTo(stemma, "rotationX", { duration: .8, ease: "power3.out" });
  const mx = gsap.quickTo(stemma, "x", { duration: .8, ease: "power3.out" });
  const my = gsap.quickTo(stemma, "y", { duration: .8, ease: "power3.out" });

  // si inclina verso il mouse
  gsap.ticker.add(function () {
    const d = gioco.dimensioni();
    if (!d.l || !gioco.piede.attivo) { ry(0); rx(0); mx(0); my(0); return; }
    const nx = Math.max(-1, Math.min(1, (gioco.piede.x - d.l / 2) / (d.l / 2)));
    const ny = Math.max(-1, Math.min(1, (gioco.piede.y - d.a / 2) / (d.a / 2)));
    ry(nx * 18); rx(-ny * 14); mx(nx * 16); my(ny * 10);
  });

  // colpito dal pallone: vibra e si sposta un attimo dalla parte opposta
  const immagine = stemma.querySelector("img");
  gioco.suColpoStemma(function (nx, ny, forza) {
    gsap.fromTo(immagine,
      { x: -nx * 18 * forza, y: -ny * 18 * forza, rotation: -nx * 8 * forza },
      { x: 0, y: 0, rotation: 0, duration: .9, ease: "elastic.out(1, .35)", overwrite: true });
  });
}

/* 4. INGRESSO ----------------------------------------------------- */
function animaIngresso(gioco) {
  const d = gioco.dimensioni();
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".apertura__banda", { scaleX: 0, duration: .9, ease: "power4.out" }, .1)
    .from(".apertura__stemma img", { opacity: 0, scale: .3, y: -160, rotation: -18, duration: 1.1, ease: "back.out(1.6)" }, .35)
    .to(gioco.pallone, { scala: 1, duration: .5, ease: "back.out(2)" }, 1.1)
    .add(function () {   // primo calcio: il pallone entra in gioco
      gioco.pallone.x = d.l * 0.88; gioco.pallone.y = d.a * 0.2;
      gioco.calcia(-16, 9);
    }, 1.1)
    .from(".apertura__giu", { opacity: 0, duration: .6 }, 1.5);
}
