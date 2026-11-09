/* ==================================================================
   A.C. Castelverde — js/pallone-3d.js
   Il pallone dello stemma (32 facce: 12 pentagoni neri e 20 esagoni
   bianchi) disegnato in 3D su un <canvas>, che rotola davvero.
   Usato dall'apertura della Home (js/pagine/home-apertura.js) e dalla
   linea del tempo della pagina Società (js/animazioni.js).

     const palla = creaPallone3D();
     palla.rotola(dx, dy, raggio);              // spostamento in px → rotazione
     palla.disegna(contesto, x, y, raggio, ombra);
   ================================================================== */

function creaPallone3D() {
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
  function rotola(dx, dy, raggio) {
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

  function disegna(contesto, x, y, r, conOmbra) {
    // ombra a terra (facoltativa)
    if (conOmbra) {
      contesto.save();
      contesto.fillStyle = "rgba(0,0,0,.14)";
      contesto.beginPath();
      contesto.ellipse(x + r * 0.25, y + r * 1.05, r * 0.9, r * 0.28, 0, 0, Math.PI * 2);
      contesto.fill();
      contesto.restore();
    }
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

  return { rotola: rotola, disegna: disegna };
}
