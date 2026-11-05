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
  // Il pallone è lo stesso dello stemma: un pallone classico a 32 facce
  // (12 pentagoni neri, 20 esagoni bianchi, cuciture nere), costruito in 3D
  // e ruotato davvero mentre rotola. Le facce si calcolano una volta sola.
  const FACCE = costruisciPallone();
  // orientamento iniziale: un esagono bianco al centro, come nel logo
  // (porta il centro di un esagono, direzione (1,1,1), davanti a chi guarda)
  let orientamento = matriceDa([1, -1, 0], Math.acos(1 / Math.sqrt(3)));
  orientamento = moltiplica(matriceDa([0, 0, 1], 0.2), orientamento);

  function costruisciPallone() {
    const f = (1 + Math.sqrt(5)) / 2;
    // vertici del pallone (icosaedro troncato): permutazioni cicliche
    const base = [[0, 1, 3 * f], [1, 2 + f, 2 * f], [f, 2, 2 * f + 1]];
    const vertici = [];
    base.forEach(function (b) {
      for (let c = 0; c < 3; c++) {
        const v = [b[c % 3], b[(c + 1) % 3], b[(c + 2) % 3]];
        for (let m = 0; m < 8; m++) {
          const w = v.map(function (x, k) { return (m >> k) & 1 ? -x : x; });
          if (!vertici.some(function (u) { return u.every(function (x, k) { return Math.abs(x - w[k]) < 1e-6; }); })) vertici.push(w);
        }
      }
    });
    const norma = function (v) { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
    const V = vertici.map(norma);
    // centri delle facce: pentagoni = vertici dell'icosaedro, esagoni = vertici del dodecaedro
    const centri = [];
    const cicla = function (v, nero) {
      for (let c = 0; c < 3; c++) {
        const w = [v[c % 3], v[(c + 1) % 3], v[(c + 2) % 3]];
        for (let m = 0; m < 8; m++) {
          const z = w.map(function (x, k) { return (m >> k) & 1 ? -x : x; });
          const n = norma(z);
          if (!centri.some(function (u) { return Math.abs(u.n[0] - n[0]) + Math.abs(u.n[1] - n[1]) + Math.abs(u.n[2] - n[2]) < 1e-6; })) centri.push({ n: n, nero: nero });
        }
      }
    };
    cicla([0, 1, f], true);
    cicla([1, 1, 1], false);
    cicla([0, f, 1 / f], false);
    // ogni faccia: i vertici più vicini al suo centro, in ordine attorno al centro
    return centri.map(function (c) {
      const d = V.map(function (v) { return v[0] * c.n[0] + v[1] * c.n[1] + v[2] * c.n[2]; });
      const max = Math.max.apply(null, d);
      const lato = V.filter(function (v, i) { return d[i] > max - 1e-3; });
      const a = Math.abs(c.n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const u = norma([c.n[1] * a[2] - c.n[2] * a[1], c.n[2] * a[0] - c.n[0] * a[2], c.n[0] * a[1] - c.n[1] * a[0]]);
      const w = [c.n[1] * u[2] - c.n[2] * u[1], c.n[2] * u[0] - c.n[0] * u[2], c.n[0] * u[1] - c.n[1] * u[0]];
      lato.sort(function (p, q) {
        return Math.atan2(p[0] * w[0] + p[1] * w[1] + p[2] * w[2], p[0] * u[0] + p[1] * u[1] + p[2] * u[2]) -
               Math.atan2(q[0] * w[0] + q[1] * w[1] + q[2] * w[2], q[0] * u[0] + q[1] * u[1] + q[2] * u[2]);
      });
      // per ogni lato il "piano della cucitura": un punto è dentro la faccia se sta dalla parte giusta di tutti
      const bordi = lato.map(function (p, i) {
        const q = lato[(i + 1) % lato.length];
        let e = norma([p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]]);
        if (e[0] * c.n[0] + e[1] * c.n[1] + e[2] * c.n[2] < 0) e = [-e[0], -e[1], -e[2]];
        return e;
      });
      return { n: c.n, nero: c.nero, bordi: bordi };
    });
  }

  // rotazione di "angolo" attorno all'asse (matrice 3×3)
  function matriceDa(asse, angolo) {
    const l = Math.hypot(asse[0], asse[1], asse[2]) || 1, x = asse[0] / l, y = asse[1] / l, z = asse[2] / l;
    const c = Math.cos(angolo), s = Math.sin(angolo), t = 1 - c;
    return [[t * x * x + c, t * x * y - s * z, t * x * z + s * y],
            [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
            [t * x * z - s * y, t * y * z + s * x, t * z * z + c]];
  }
  function moltiplica(a, b) {
    return a.map(function (riga) { return [0, 1, 2].map(function (j) { return riga[0] * b[0][j] + riga[1] * b[1][j] + riga[2] * b[2][j]; }); });
  }
  function ruota(m, v) {
    return [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]];
  }
  // il pallone rotola: gira attorno all'asse perpendicolare al movimento
  function rotola(dx, dy) {
    const passo = Math.hypot(dx, dy);
    if (passo < 0.01) return;
    // un pallone vero gira di (strada / raggio); oltre ~25° per fotogramma l'occhio
    // vede le facce "saltare" all'indietro, quindi la rotazione ha un tetto
    orientamento = moltiplica(matriceDa([-dy, dx, 0], Math.min(passo / raggio, 0.45)), orientamento);
  }

  // Il pallone si disegna pixel per pixel su una piccola tela a parte, come una
  // sfera vera: per ogni punto del disco si calcola dove cade sul pallone (dopo
  // la rotazione), se è in un pentagono nero, su una cucitura o nel bianco,
  // e quanta luce riceve. Così rotolando le facce si deformano sul bordo come
  // su un pallone reale, senza "buchi" o trasparenze.
  const tela = document.createElement("canvas");
  const pennello = tela.getContext("2d");
  const LUCE = (function () { const l = [-0.45, -0.6, 0.66], m = Math.hypot(l[0], l[1], l[2]); return [l[0] / m, l[1] / m, l[2] / m]; })();
  const CUCITURA = 0.022;        // spessore delle cuciture (sulla sfera)

  function disegnaPallone(x, y, r) {
    // ombra a terra
    contesto.save();
    contesto.fillStyle = "rgba(0,0,0,.14)";
    contesto.beginPath();
    contesto.ellipse(x + r * 0.25, y + r * 1.05, r * 0.9, r * 0.28, 0, 0, Math.PI * 2);
    contesto.fill();
    contesto.restore();
    if (r < 2) return;

    const nitidezza = Math.min(window.devicePixelRatio || 1, 2);
    const lato = Math.ceil(r * 2 * nitidezza) + 2;
    if (tela.width !== lato) { tela.width = lato; tela.height = lato; }
    const img = pennello.createImageData(lato, lato);
    const d = img.data;
    const R = orientamento, c = lato / 2, rp = r * nitidezza;
    const aa = 1.2 / rp;                                   // larghezza del bordo sfumato (antialias)
    let ultima = FACCE[0];

    for (let py = 0; py < lato; py++) {
      for (let px = 0; px < lato; px++) {
        const sx = (px + 0.5 - c) / rp, sy = (py + 0.5 - c) / rp;
        const d2 = sx * sx + sy * sy;
        if (d2 > 1) continue;
        const sz = Math.sqrt(1 - d2);
        // punto sul pallone, riportato nelle coordinate del pallone (rotazione inversa = trasposta)
        const qx = R[0][0] * sx + R[1][0] * sy + R[2][0] * sz;
        const qy = R[0][1] * sx + R[1][1] * sy + R[2][1] * sz;
        const qz = R[0][2] * sx + R[1][2] * sy + R[2][2] * sz;
        // in quale faccia cade il punto: si prova prima la faccia della volta prima
        // (i pixel vicini cadono quasi sempre nella stessa), poi tutte le altre.
        // "minimo" = distanza dal bordo più vicino della faccia (serve per le cuciture)
        let faccia = null, minimo = 0;
        for (let t = -1; t < FACCE.length && !faccia; t++) {
          const f = t < 0 ? ultima : FACCE[t];
          if (t >= 0 && f === ultima) continue;
          const b = f.bordi;
          let m = 9;
          for (let k = 0; k < b.length; k++) {
            const v = b[k][0] * qx + b[k][1] * qy + b[k][2] * qz;
            if (v < m) { m = v; if (m < 0) break; }
          }
          if (m >= 0) { faccia = f; minimo = m; }
        }
        if (!faccia) { faccia = ultima; minimo = 0; }
        ultima = faccia;
        // colore: nero nei pentagoni, bianco negli esagoni, cuciture scure
        let base = faccia.nero ? 22 : 246;
        // cucitura: una linea scura lungo i bordi di ogni faccia (sfumata per non "seghettare")
        const cucitura = 1 - Math.min(1, Math.max(0, (minimo - CUCITURA) / aa));
        base = base * (1 - cucitura) + 30 * cucitura;
        // luce: diffusa + riflesso, il bordo della sfera un po' più scuro
        const diffusa = Math.max(0, sx * LUCE[0] + sy * LUCE[1] + sz * LUCE[2]);
        const rx = 2 * sz * sx, ry = 2 * sz * sy, rz = 2 * sz * sz - 1;   // riflesso della direzione di vista
        const riflesso = Math.pow(Math.max(0, rx * LUCE[0] + ry * LUCE[1] + rz * LUCE[2]), 24);
        let luce = 0.66 + 0.42 * diffusa;
        let valore = base * luce + riflesso * (faccia.nero ? 90 : 60);
        valore *= 0.86 + 0.14 * Math.pow(sz, 0.5);
        const v8 = valore > 255 ? 255 : valore;
        const o = (py * lato + px) * 4;
        d[o] = v8; d[o + 1] = v8; d[o + 2] = v8 + (faccia.nero ? 0 : 2);
        // bordo del disco sfumato
        const bordo = (1 - Math.sqrt(d2)) / aa;
        d[o + 3] = bordo >= 1 ? 255 : Math.max(0, bordo) * 255;
      }
    }
    pennello.putImageData(img, 0, 0);
    contesto.drawImage(tela, x - lato / nitidezza / 2, y - lato / nitidezza / 2, lato / nitidezza, lato / nitidezza);
    // contorno nero sottile, come il pallone dello stemma
    contesto.beginPath();
    contesto.arc(x, y, r - 0.5, 0, Math.PI * 2);
    contesto.lineWidth = Math.max(1.2, r * 0.045);
    contesto.strokeStyle = "#0e0e0f";
    contesto.stroke();
  }

  // scia rossa: tratti sempre più sottili e trasparenti, leggermente "sporchi"
  function disegnaScia() {
    contesto.lineCap = "round";
    for (let i = 1; i < scia.length; i++) {
      const a = scia[i - 1], b = scia[i];
      const vita = i / scia.length;
      contesto.beginPath();
      contesto.moveTo(a.x, a.y);
      contesto.lineTo(b.x, b.y);
      contesto.strokeStyle = "rgba(255,0,0," + (vita * 0.85) + ")";
      contesto.lineWidth = raggio * 1.3 * vita * Math.min(1, b.v / 8);
      contesto.stroke();
      // graffi paralleli, come la pennellata delle grafiche
      contesto.beginPath();
      contesto.moveTo(a.x + 6, a.y - 9);
      contesto.lineTo(b.x + 6, b.y - 9);
      contesto.lineWidth = 2;
      contesto.strokeStyle = "rgba(255,0,0," + (vita * 0.5) + ")";
      contesto.stroke();
    }
  }

  function disegnaAnelli() {
    anelli.forEach(function (a) {
      a.r += 5; a.vita -= 0.025;
      contesto.beginPath();
      contesto.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      contesto.lineWidth = 6 * a.vita;
      contesto.strokeStyle = "rgba(255,0,0," + Math.max(0, a.vita) + ")";
      contesto.stroke();
    });
    anelli = anelli.filter(function (a) { return a.vita > 0; });
  }

  function disegna() {
    contesto.clearRect(0, 0, larghezza, altezza);
    disegnaAnelli();
    disegnaScia();
    if (pallone.scala > 0) disegnaPallone(pallone.x, pallone.y, raggio * pallone.scala);
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
    rotola(pallone.vx, pallone.vy);          // rotola nella direzione del movimento

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
    calcia((x - pallone.x) * 0.09, (y - pallone.y) * 0.09);
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
