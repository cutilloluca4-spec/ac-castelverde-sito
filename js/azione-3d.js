/* ==================================================================
   A.C. Castelverde — js/azione-3d.js
   "La nostra storia" come un'azione di calcio in 3D (Three.js): ogni
   tappa della storia è un giocatore, e il pallone passa dall'uno
   all'altro costruendo l'azione dal portiere fino al tiro in porta.

     creaAzione3D(tela, quante, modello) → null (niente WebGL) oppure
       { metti(p), misura(), etichette(), schermo(v), quante, fine,
         momentoGoal, momentoPalcoLibero }
     modello = i calciatori caricati da caricaCalciatori() (js/giocatori-3d.js)

   p va da 0 a "fine": a p = k il giocatore k parte per il suo passaggio;
   tra k e k+1 il pallone vola e il compagno lo stoppa; l'ultimo tratto
   (quante-1 → quante+1, il doppio) è il tiro. p diventa un tempo T in
   secondi e tutto (movimenti registrati, pallone, telecamera) dipende
   solo da T: scorrendo avanti e indietro la scena è sempre la stessa.
   Il pallone parte esattamente dal piede nell'istante del calcio e
   arriva sul piede di chi lo stoppa (calcolati sulle ossa del modello).
   Lo scorrimento e le schede di testo sono in js/pagine/societa.js.

   Il mondo è in metri: il campo è 68 × 105, si attacca verso +z
   (la porta avversaria è a z = 52,5).
   ================================================================== */

const CAMPO_3D = {
  nebbia: "#d2d3d5",                 // il campo sfuma nel grigio della trama dietro la scena (.trama-grigia)
  campo: "#a9abaf", striscia: "#a2a4a8", linee: "#e9eaeb",   // scuri: con la luce diventano grigio chiaro
  // per ora niente divise: i nostri chiari (la divisa del modello), gli avversari un po' più scuri
  nostri: "#ffffff", avversari: "#8f9296", portiere: "#6f7276",
  rosso: "#ff0000"
};
const RAGGIO_PALLA = .11;
// dove giocano i nostri: una costruzione dal basso, a zig-zag fino all'area (x, z)
const SCHEMA_3D = [[0, -46], [11, -36], [-9, -31], [-25, -19], [-6, -11], [19, -3], [3, 7], [-21, 14], [-4, 22], [23, 28], [17, 37.5], [2, 41]];
// gli avversari, in mezzo alle linee di passaggio
const AVVERSARI_3D = [[4, -24], [-16, -8], [11, 10], [-12, 26], [10, 33], [6, 44.5], [9, 47]];

function creaAzione3D(tela, quante, modello) {
  if (typeof THREE === "undefined" || !modello) return null;
  let motore;
  try {
    motore = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
  } catch (e) {
    return null;
  }
  THREE.ColorManagement.legacyMode = false;
  motore.outputEncoding = THREE.sRGBEncoding;
  motore.shadowMap.enabled = true;
  motore.shadowMap.type = THREE.PCFSoftShadowMap;
  motore.setClearColor(0x000000, 0);           // trasparente: dietro si vede la trama della pagina

  const scena = new THREE.Scene();
  scena.fog = new THREE.Fog(CAMPO_3D.nebbia, 30, 72);
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);
  const V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
  const g2r = THREE.MathUtils.degToRad;

  // ---- luci: cielo e terreno, il sole (con le ombre) e un controluce ----
  scena.add(new THREE.HemisphereLight(0xffffff, 0x8a8c90, .62));
  const sole = new THREE.DirectionalLight(0xffffff, 1.05);
  sole.castShadow = true;
  sole.shadow.mapSize.set(2048, 2048);
  Object.assign(sole.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 });
  sole.shadow.bias = -.0004;
  sole.shadow.normalBias = .02;
  scena.add(sole, sole.target);
  const controluce = new THREE.DirectionalLight(0xffffff, .6);
  controluce.position.set(10, 8, 30);
  scena.add(controluce);

  // ---- il campo: grigio neutro con le linee vere, disegnate su una texture ----
  (function campo() {
    const PX = 16;                                  // pixel per metro
    const c = document.createElement("canvas");
    c.width = 68 * PX; c.height = 105 * PX;
    const x = c.getContext("2d");
    for (let k = 0; k < 14; k++) {                   // le strisce dell'erba tagliata
      x.fillStyle = k % 2 ? CAMPO_3D.striscia : CAMPO_3D.campo;
      x.fillRect(0, k * c.height / 14, c.width, c.height / 14 + 1);
    }
    x.strokeStyle = CAMPO_3D.linee;
    x.lineWidth = .14 * PX;
    const m = function (v) { return v * PX; };
    const L = 68, Lu = 105, cx = L / 2, cy = Lu / 2;
    x.strokeRect(m(.5), m(.5), m(L - 1), m(Lu - 1));
    x.beginPath(); x.moveTo(m(.5), m(cy)); x.lineTo(m(L - .5), m(cy)); x.stroke();
    x.beginPath(); x.arc(m(cx), m(cy), m(9.15), 0, Math.PI * 2); x.stroke();
    x.fillStyle = CAMPO_3D.linee;
    [[cx, cy], [cx, .5 + 11], [cx, Lu - .5 - 11]].forEach(function (p) { x.beginPath(); x.arc(m(p[0]), m(p[1]), m(.13), 0, Math.PI * 2); x.fill(); });
    [[.5, 1], [Lu - .5, -1]].forEach(function (lato) {
      const fondo = lato[0], verso = lato[1];
      x.strokeRect(m(cx - 20.16), m(verso > 0 ? fondo : fondo - 16.5), m(40.32), m(16.5));       // area di rigore
      x.strokeRect(m(cx - 9.16), m(verso > 0 ? fondo : fondo - 5.5), m(18.32), m(5.5));          // area piccola
      const dischetto = fondo + verso * 11;
      x.save();
      x.beginPath(); x.rect(0, verso > 0 ? m(fondo + 16.5) : 0, c.width, verso > 0 ? c.height : m(fondo - 16.5)); x.clip();
      x.beginPath(); x.arc(m(cx), m(dischetto), m(9.15), 0, Math.PI * 2); x.stroke();          // lunetta
      x.restore();
    });
    [[.5, .5], [L - .5, .5], [.5, Lu - .5], [L - .5, Lu - .5]].forEach(function (p, i) {        // bandierine
      x.beginPath(); x.arc(m(p[0]), m(p[1]), m(1), [0, .5, 1.5, 1][i] * Math.PI, [.5, 1, 2, 1.5][i] * Math.PI); x.stroke();
    });
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = motore.capabilities.getMaxAnisotropy();
    const prato = new THREE.Mesh(new THREE.PlaneGeometry(68, 105), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
    prato.rotation.x = -Math.PI / 2;
    prato.receiveShadow = true;
    scena.add(prato);
    const intorno = new THREE.Mesh(new THREE.PlaneGeometry(260, 300), new THREE.MeshStandardMaterial({ color: CAMPO_3D.campo, roughness: 1 }));
    intorno.rotation.x = -Math.PI / 2;
    intorno.position.y = -.01;
    intorno.receiveShadow = true;
    scena.add(intorno);
  })();

  // ---- le porte (7,32 × 2,44 m) con la rete ----
  function asta(da, a, r, mat) {
    const d = new THREE.Vector3().subVectors(a, da);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 18, 1, true), mat);
    m.position.copy(da).addScaledVector(d, .5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    m.castShadow = true;
    return m;
  }
  function creaPorta(zLinea, verso) {
    const LARGA = 7.32, ALTA = 2.44, PALO = .065, SU = .9, GIU = 2;
    const g = new THREE.Group();
    g.position.z = zLinea;
    if (verso < 0) g.rotation.y = Math.PI;      // la rete va sempre "fuori dal campo"
    scena.add(g);
    const bianco = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .25, metalness: .1 });
    const grigio = new THREE.MeshStandardMaterial({ color: "#9a9c9f", roughness: .5, metalness: .3 });
    const mx = LARGA / 2;
    [-1, 1].forEach(function (s) {
      g.add(asta(V(s * mx, 0, 0), V(s * mx, ALTA, 0), PALO, bianco));
      const nodo = new THREE.Mesh(new THREE.SphereGeometry(PALO, 18, 12), bianco);
      nodo.position.set(s * mx, ALTA, 0);
      g.add(nodo);
      const a = V(s * mx, ALTA - .04, .04), b = V(s * mx, ALTA - .08, SU), c = V(s * mx, 0, GIU);
      g.add(asta(a, b, .025, grigio), asta(b, c, .025, grigio), asta(V(s * mx, .02, 0), V(s * mx, .02, GIU), .022, grigio));
    });
    g.add(asta(V(-mx, ALTA, 0), V(mx, ALTA, 0), PALO, bianco));
    g.add(asta(V(-mx, .02, GIU), V(mx, .02, GIU), .022, grigio));
    // la rete: linee sottili su quattro pannelli
    const punti = [];
    function pannello(p00, p10, p01, p11, nu, nv, pancia) {
      const punto = function (u, v) {
        const p = p00.clone().lerp(p10, u).lerp(p01.clone().lerp(p11, u), v);
        p.z += pancia * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
        return p;
      };
      const seg = function (p, q) { punti.push(p.x, p.y, p.z, q.x, q.y, q.z); };
      for (let i = 0; i <= nu; i++) for (let j = 0; j < nv; j++) seg(punto(i / nu, j / nv), punto(i / nu, (j + 1) / nv));
      for (let j = 0; j <= nv; j++) for (let i = 0; i < nu; i++) seg(punto(i / nu, j / nv), punto((i + 1) / nu, j / nv));
    }
    pannello(V(-mx, ALTA, SU), V(mx, ALTA, SU), V(-mx, 0, GIU), V(mx, 0, GIU), 52, 20, .12);
    pannello(V(-mx, ALTA, 0), V(mx, ALTA, 0), V(-mx, ALTA, SU), V(mx, ALTA, SU), 52, 7, 0);
    [-1, 1].forEach(function (s) { pannello(V(s * mx, ALTA, 0), V(s * mx, ALTA, SU), V(s * mx, 0, 0), V(s * mx, 0, GIU), 8, 18, 0); });
    const base = punti.slice();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(punti, 3));
    g.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xa3a5a8, transparent: true, opacity: .85 })));
    // la rete si gonfia intorno a un punto (coordinate della porta), s = 0…1
    g.gonfia = function (cx, cy, s) {
      const pos = geo.attributes.position.array;
      for (let k = 0; k < pos.length; k += 3) {
        const dx = base[k] - cx, dy = base[k + 1] - cy;
        const peso = Math.exp(-(dx * dx + dy * dy) / (2 * 1.1 * 1.1)) * Math.min(1, base[k + 2] / .6);
        pos[k + 2] = base[k + 2] + s * peso * .6;
        pos[k + 1] = base[k + 1] - s * peso * .12;
      }
      geo.attributes.position.needsUpdate = true;
    };
    return g;
  }
  const portaLoro = creaPorta(52.5, 1);
  const portaNostra = creaPorta(-52.5, -1);

  // ---- il pallone: lo stesso dell'apertura della Home (js/pallone-3d.js) ----
  // È disegnato su un piccolo canvas, con le stesse facce, luci e cuciture, e messo nella
  // scena come uno "sprite" (sempre rivolto alla telecamera). Quando si sposta, rotola
  // davvero: lo spostamento sullo schermo diventa rotazione, come nella Home.
  const palla = (function () {
    const LATO = 128;
    const tela2d = document.createElement("canvas");
    tela2d.width = tela2d.height = LATO;
    const contesto = tela2d.getContext("2d");
    const disegno = creaPallone3D();
    const texture = new THREE.CanvasTexture(tela2d);
    texture.encoding = THREE.sRGBEncoding;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, fog: false }));
    // il disegno occupa il canvas con un piccolo margine: lo sprite è un filo più grande del pallone
    const MARGINE = 1.12;
    sprite.scale.setScalar(RAGGIO_PALLA * 2 * MARGINE);
    sprite.renderOrder = 2;
    scena.add(sprite);
    // l'ombra a terra sotto il pallone
    const ombra = new THREE.Mesh(new THREE.CircleGeometry(RAGGIO_PALLA * .95, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .32, depthWrite: false }));
    ombra.rotation.x = -Math.PI / 2;
    ombra.position.y = .013;
    scena.add(ombra);
    let ultimo = null;
    sprite.ridisegna = function (schermo, raggioPx) {
      if (ultimo) disegno.rotola(schermo.x - ultimo.x, schermo.y - ultimo.y, Math.max(raggioPx, 2));
      ultimo = schermo;
      contesto.clearRect(0, 0, LATO, LATO);
      disegno.disegna(contesto, LATO / 2, LATO / 2, LATO / 2 / MARGINE, false);
      texture.needsUpdate = true;
      const alto = Math.max(0, sprite.position.y - RAGGIO_PALLA);
      ombra.position.x = sprite.position.x;
      ombra.position.z = sprite.position.z;
      ombra.scale.setScalar(1 + alto * .5);
      ombra.material.opacity = .32 / (1 + alto * 1.5);
    };
    return sprite;
  })();

  // ---- i giocatori: calciatori veri con i movimenti registrati (js/giocatori-3d.js) ----
  const n = Math.min(quante, SCHEMA_3D.length);
  const M = MOMENTI;
  const nostri = SCHEMA_3D.slice(0, n).map(function (p) {
    const g = modello.crea({ tinta: CAMPO_3D.nostri });
    scena.add(g.radice);
    return { g: g, base: V(p[0], 0, p[1]) };
  });
  const avversari = AVVERSARI_3D.map(function (p) {
    const g = modello.crea({ tinta: CAMPO_3D.avversari });
    scena.add(g.radice);
    return { g: g, pos: V(p[0], 0, p[1]), yaw: 0 };
  });
  const portiere = modello.crea({ tinta: CAMPO_3D.portiere });
  scena.add(portiere.radice);
  const POSTO_PORTIERE = V(0, 0, 51.7);

  // il cerchio rosso a terra sotto chi ha il pallone
  const anello = new THREE.Mesh(new THREE.RingGeometry(.55, .68, 48), new THREE.MeshBasicMaterial({ color: CAMPO_3D.rosso, transparent: true, opacity: .85, depthWrite: false }));
  anello.rotation.x = -Math.PI / 2;
  anello.position.y = .012;
  scena.add(anello);
  const tutti = nostri.map(function (x) { return x.g; }).concat(avversari.map(function (x) { return x.g; }), [portiere]);

  // ---- i calcoli fatti una volta ----
  const pianoXZ = function (v) { return V(v.x, 0, v.z); };
  const angolo = function (v) { return Math.atan2(v.x, v.z); };
  const avantiDi = function (yaw) { return V(Math.sin(yaw), 0, Math.cos(yaw)); };
  // l'origine di un movimento che continua dove finisce il precedente (il corpo non salta)
  function dopo(origine, yaw, movimento, t) {
    const d = modello.spostamento(movimento, t), c = Math.cos(yaw), s = Math.sin(yaw);
    return V(origine.x + d.x * c + d.z * s, 0, origine.z - d.x * s + d.z * c);
  }
  // dov'è il destro in un istante di un movimento
  function piede(g, movimento, t, origine, yaw) {
    g.metti([{ movimento: movimento, t: t, peso: 1, origine: origine, yaw: yaw }]);
    return g.osso("puntaD").lerp(g.osso("finePiedeD"), .5);
  }
  // il centro del pallone quando il piede lo colpisce: davanti al piede, a terra
  function pallaAlCalcio(g, movimento, t, origine, yaw) {
    // il pallone sta davanti alla punta, nel verso in cui il piede si muove in quel momento
    const prima = piede(g, movimento, t - 1 / 60, origine, yaw);
    const ora = piede(g, movimento, t, origine, yaw);
    const verso = pianoXZ(ora.clone().sub(prima)).normalize();
    const p = ora.addScaledVector(verso.lengthSq() ? verso : avantiDi(yaw), RAGGIO_PALLA * 1.55);
    p.y = RAGGIO_PALLA;
    return p;
  }

  const BERSAGLIO_TIRO = V(2.9, 1.85, 52.8);      // l'incrocio dalla parte opposta al tuffo del portiere
  const IN_RETE = V(2.5, RAGGIO_PALLA, 54);
  const yaw = [], oRicevi = [], oPassa = [], ferma = [], arriva = [];
  for (let k = 0; k < n; k++) {
    const prossimo = k < n - 1 ? nostri[k + 1].base : V(0, 0, 52.5);
    yaw[k] = angolo(prossimo.clone().sub(nostri[k].base));
  }
  // si affina: ognuno guarda (e passa) verso il punto in cui il compagno stopperà il pallone
  for (let giro = 0; giro < 4; giro++) {
    for (let k = 0; k < n; k++) {
      const g = nostri[k].g, ultimo = k === n - 1;
      oRicevi[k] = nostri[k].base;
      oPassa[k] = k === 0 ? nostri[k].base : dopo(oRicevi[k], yaw[k], "ricevi", M.riceviFine);
      ferma[k] = pallaAlCalcio(g, ultimo ? "tira" : "passa", ultimo ? M.tiroImpatto : M.passaImpatto, oPassa[k], yaw[k]);
      if (k > 0) {
        const p = piede(g, "ricevi", M.riceviContatto, oRicevi[k], yaw[k]);
        const da = ferma[k - 1] ? pianoXZ(ferma[k - 1].clone().sub(p)).normalize() : V(0, 0, -1);
        arriva[k] = p.addScaledVector(da, RAGGIO_PALLA * 1.05);
        arriva[k].y = Math.max(RAGGIO_PALLA, arriva[k].y);
      }
    }
    for (let k = 0; k < n; k++) {
      const verso = k < n - 1 ? arriva[k + 1] : BERSAGLIO_TIRO;
      if (verso) yaw[k] = angolo(pianoXZ(verso.clone().sub(ferma[k])));
    }
  }
  arriva[0] = ferma[0];

  // ---- i tempi (in secondi) dell'azione intera ----
  const DURATA_PASSA = modello.durata("passa"), DURATA_TIRA = modello.durata("tira"), DURATA_ESULTA = modello.durata("esulta");
  const inizioPassa = [0], calcio = [], volo = [], contatto = [], inizioRicevi = [];
  for (let k = 0; k < n; k++) {
    calcio[k] = inizioPassa[k] + (k === n - 1 ? M.tiroImpatto : M.passaImpatto);
    if (k === n - 1) break;
    const dist = pianoXZ(arriva[k + 1].clone().sub(ferma[k])).length();
    volo[k] = Math.min(1.5, Math.max(.65, dist / 15));     // circa 15 m/s, come un passaggio vero
    contatto[k + 1] = calcio[k] + volo[k];
    inizioRicevi[k + 1] = contatto[k + 1] - M.riceviContatto;
    inizioPassa[k + 1] = inizioRicevi[k + 1] + M.riceviFine;
  }
  // il tiro: rincorsa, impatto, volo (al rallentatore), dentro la rete, esultanza
  const T0 = inizioPassa[n - 1];
  const VOLO_TIRO = .55;
  const arrivoTiro = calcio[n - 1] + VOLO_TIRO;
  const inizioTuffo = arrivoTiro - M.tuffoArrivo;
  const inizioEsulta = T0 + DURATA_TIRA - .15;
  const fineTiro = inizioEsulta + DURATA_ESULTA;
  // lo scorrimento del tiro: la rincorsa scorre veloce, il volo del pallone lento (rallentatore)
  const FASI_TIRO = [[0, T0], [.12, calcio[n - 1] - .02], [.46, arrivoTiro + .45], [1, fineTiro]];
  function tempoDa(p) {
    p = Math.max(0, Math.min(n + 1, p));
    if (p < n - 1) { const k = Math.floor(p); return inizioPassa[k] + (p - k) * (inizioPassa[k + 1] - inizioPassa[k]); }
    const f = (p - (n - 1)) / 2;
    for (let i = 0; i < FASI_TIRO.length - 1; i++) {
      const a = FASI_TIRO[i], b = FASI_TIRO[i + 1];
      if (f <= b[0]) return a[1] + (b[1] - a[1]) * (f - a[0]) / (b[0] - a[0]);
    }
    return fineTiro;
  }
  function pDa(T) {                                  // l'inverso (per i momenti del GOAL!)
    let basso = 0, alto = n + 1;
    for (let i = 0; i < 40; i++) { const m = (basso + alto) / 2; if (tempoDa(m) < T) basso = m; else alto = m; }
    return (basso + alto) / 2;
  }

  // da che parte guarda la telecamera in ogni passaggio: di traverso, alle spalle dell'azione
  const lati = [];
  for (let k = 0; k < n; k++) {
    const d = pianoXZ((k < n - 1 ? arriva[k + 1] : BERSAGLIO_TIRO).clone().sub(ferma[k])).normalize();
    let traverso = V(-d.z, 0, d.x);
    if (traverso.z > 0) traverso.negate();
    lati.push(traverso.lerp(V(0, 0, -1), .45).normalize());
  }

  // ---- la regia: tutto dipende dal tempo T (che dipende da p) ----
  const liscia = function (t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  const tratto = function (t, da, a) { return Math.min(1, Math.max(0, (t - da) / (a - da))); };
  const FONDI = .25;                                 // quanto dura la fusione tra due movimenti (s)
  const centro = new THREE.Vector3(), guarda = new THREE.Vector3();

  // il pallone al tempo T
  function pallaA(T) {
    const p = new THREE.Vector3();
    for (let k = 0; k < n; k++) {
      if (T < calcio[k]) {                           // prima del calcio: fermo, o portato avanti dopo lo stop
        if (k === 0 || T < contatto[k]) { p.copy(k === 0 ? ferma[0] : arriva[k]); return p; }
        const u = liscia(tratto(T, contatto[k], calcio[k]));
        return p.copy(arriva[k]).lerp(ferma[k], u).setY(RAGGIO_PALLA + (arriva[k].y - RAGGIO_PALLA) * (1 - u));
      }
      if (k < n - 1 && T < contatto[k + 1]) {        // in volo verso il compagno: parte forte e rallenta
        const u = tratto(T, calcio[k], contatto[k + 1]);
        const s = 1 - Math.pow(1 - u, 1.6);
        const dist = pianoXZ(arriva[k + 1].clone().sub(ferma[k])).length();
        p.copy(ferma[k]).lerp(arriva[k + 1], s);
        p.y += (dist > 16 ? dist * .04 : 0) * Math.sin(Math.PI * s);
        return p;
      }
    }
    // il tiro
    if (T < arrivoTiro) {
      const u = tratto(T, calcio[n - 1], arrivoTiro);
      p.copy(ferma[n - 1]).lerp(BERSAGLIO_TIRO, u);
      p.y += Math.sin(Math.PI * u) * .7;
      return p;
    }
    const u = tratto(T, arrivoTiro, arrivoTiro + .5);
    p.copy(BERSAGLIO_TIRO).lerp(IN_RETE, u);
    p.y = BERSAGLIO_TIRO.y + (IN_RETE.y - BERSAGLIO_TIRO.y) * u * u + Math.abs(Math.sin(u * Math.PI * 2.5)) * .22 * (1 - u);
    return p;
  }

  // un nostro giocatore al tempo T: aspetta, riceve, passa (o tira ed esulta), poi aspetta
  function statoNostro(k, T) {
    const y = yaw[k], ultimo = k === n - 1;
    const attesa = function (origine, peso) {      // in piedi, si muove appena (respiro)
      return { movimento: "attesa", t: .25 + .2 * Math.sin(T * 1.7 + k * 1.3), peso: peso, origine: origine, yaw: y };
    };
    if (k > 0 && T < inizioRicevi[k]) return [attesa(oRicevi[k], 1)];
    if (k > 0 && T < inizioPassa[k]) {
      const t = T - inizioRicevi[k], u = tratto(t, 0, FONDI);
      return [{ movimento: "ricevi", t: t, peso: u, origine: oRicevi[k], yaw: y }, attesa(oRicevi[k], 1 - u)];
    }
    const t = T - inizioPassa[k];
    const entra = k > 0 ? tratto(t, 0, FONDI) : 1;
    const prima = k > 0 ? { movimento: "ricevi", t: M.riceviFine, peso: 1 - entra, origine: oRicevi[k], yaw: y } : null;
    if (!ultimo) {
      if (t < DURATA_PASSA) return [{ movimento: "passa", t: t, peso: entra, origine: oPassa[k], yaw: y }].concat(prima ? [prima] : []);
      const fine = dopo(oPassa[k], y, "passa", DURATA_PASSA), u = tratto(t - DURATA_PASSA, 0, .35);
      return [attesa(fine, u), { movimento: "passa", t: DURATA_PASSA, peso: 1 - u, origine: oPassa[k], yaw: y }];
    }
    // chi tira: tiro in corsa, poi il salto a braccia alte
    if (T < inizioEsulta) return [{ movimento: "tira", t: t, peso: entra, origine: oPassa[k], yaw: y }].concat(prima ? [prima] : []);
    const oEsulta = dopo(oPassa[k], y, "tira", DURATA_TIRA - .15);
    const te = T - inizioEsulta, u = tratto(te, 0, .3);
    return [{ movimento: "esulta", t: te, peso: u, origine: oEsulta, yaw: y }, { movimento: "tira", t: DURATA_TIRA - .15 + te, peso: 1 - u, origine: oPassa[k], yaw: y }];
  }

  function metti(p) {
    const T = tempoDa(p);
    // il tratto in corso: l'ultimo giocatore che ha cominciato il suo passaggio (o il tiro)
    let k = 0;
    while (k < n - 1 && T >= inizioPassa[k + 1]) k++;
    const tiro = T >= T0;
    const pallaPos = pallaA(T);
    palla.position.copy(pallaPos);

    // i nostri
    nostri.forEach(function (x, j) { x.g.metti(statoNostro(j, T)); });
    // gli avversari: pronti sulle gambe, girati verso il pallone
    avversari.forEach(function (a, j) {
      a.yaw = angolo(pianoXZ(pallaPos.clone().sub(a.pos)));
      a.g.metti([{ movimento: "difende", t: (T * .8 + j * .9) % 4.4, peso: 1, origine: a.pos, yaw: a.yaw }]);
    });
    // il portiere: pronto, poi il tuffo (verso la sua sinistra: il pallone va dall'altra parte)
    const tTuffo = T - inizioTuffo, uTuffo = tratto(tTuffo, 0, .2);
    portiere.metti([
      { movimento: "tuffo", t: tTuffo, peso: tTuffo > 0 ? uTuffo : 0, origine: POSTO_PORTIERE, yaw: Math.PI },
      { movimento: "difende", t: (T * .8) % 4.4, peso: 1 - (tTuffo > 0 ? uTuffo : 0), origine: POSTO_PORTIERE, yaw: Math.PI }
    ]);

    // la rete: si gonfia quando entra il pallone e torna con un'oscillazione
    const ur = tratto(T, arrivoTiro - .03, arrivoTiro + 1.6);
    const gonfio = T > arrivoTiro - .03 ? Math.exp(-ur * 5) * Math.cos(ur * 14) * Math.min(1, ur / .04) : 0;
    portaLoro.gonfia(BERSAGLIO_TIRO.x, BERSAGLIO_TIRO.y, Math.max(0, gonfio));

    // il cerchio rosso sotto chi ha il pallone
    const chi = tiro ? n - 1 : (T >= (contatto[k + 1] || Infinity) ? k + 1 : k);
    const sotto = nostri[chi].g.radice.position;
    anello.position.set(sotto.x, .012, sotto.z);
    anello.material.opacity = tiro && T > calcio[n - 1] ? .85 * (1 - tratto(T, calcio[n - 1], calcio[n - 1] + .4)) : .85;

    // la telecamera
    if (!tiro) {
      // segue il pallone come in televisione: di traverso rispetto al passaggio, alle spalle dell'azione
      const u = liscia(tratto(T, calcio[k] - .25, contatto[k + 1] + .25));
      centro.copy(ferma[k]).lerp(arriva[k + 1], u).setY(0);
      centro.lerp(pianoXZ(pallaPos), .2);
      const giro = k > 0 ? liscia(tratto(T, inizioPassa[k], inizioPassa[k] + .9)) : 1;
      const dir = lati[Math.max(0, k - 1)].clone().lerp(lati[k], giro).normalize();
      const lungo = Math.min(1, Math.max(0, (pianoXZ(arriva[k + 1].clone().sub(ferma[k])).length() - 12) / 14));
      const lontano = (1 + 1.05 * lungo * Math.sin(Math.PI * u)) * (largo >= 900 ? 1 : 1.6);
      camera.position.copy(centro).addScaledVector(dir, 10.5 * lontano).setY(6.2 * lontano);
      guarda.copy(centro).add(V(0, .6, 0));
    } else {
      regiaTiro(T);
    }
    // durante il gol la scena prende tutto lo schermo (la scheda si fa da parte)
    inquadra(tiro ? 1 - liscia(tratto(T, calcio[n - 1] - .3, calcio[n - 1] + .2)) : 1);
    camera.lookAt(guarda);
    portaNostra.visible = camera.position.z > -51;

    // chi si trova tra la telecamera e l'azione (o troppo vicino) diventa trasparente
    const attivi = [nostri[k].g, nostri[Math.min(n - 1, k + 1)].g];
    tutti.forEach(function (g) {
      if (attivi.indexOf(g) >= 0) { g.sbiadisci(1); return; }
      const pos = g.radice.position;
      const versoAtleta = V(pos.x, 1, pos.z).sub(camera.position);
      const versoAzione = guarda.clone().sub(camera.position);
      const davanti = versoAtleta.length() < versoAzione.length() - 2.5;
      const scarto = versoAtleta.angleTo(versoAzione);
      const vicino = versoAtleta.length() < 8.5;          // troppo vicino alla telecamera
      g.sbiadisci(vicino ? .1 : davanti && scarto < .22 ? .14 + .86 * Math.max(0, (scarto - .1) / .12) : 1);
    });

    // il pallone rotola come nella Home: la rotazione segue lo spostamento sullo schermo
    camera.updateMatrixWorld();
    const sulloSchermo = schermo(palla.position);
    const distanza = camera.position.distanceTo(palla.position);
    palla.ridisegna(sulloSchermo, RAGGIO_PALLA / (distanza * Math.tan(g2r(camera.fov / 2))) * alto / 2);
    sole.position.copy(guarda).add(V(-10, 20, -6));
    sole.target.position.copy(guarda);
    disegna();
    return { chi: chi, palla: pallaPos };
  }

  // La regia del tiro, in tre inquadrature che si fondono:
  // A dietro al tiratore (la rincorsa), B davanti alla porta, di lato (il pallone entra
  // all'incrocio, il portiere vola dall'altra parte, la rete si gonfia), C larga (l'esultanza).
  function regiaTiro(T) {
    const s = ferma[n - 1], d = avantiDi(yaw[n - 1]);
    const verticale = largo < 900;
    const allarga = verticale ? 1.2 : 1;
    const A = { pos: s.clone().addScaledVector(d, -6.5).add(V(-1.6, 2.3, 0)), guarda: s.clone().addScaledVector(d, 5).setY(1) };
    const B = verticale ? { pos: V(4.5, 3.8, 35.5), guarda: V(0, 1.2, 52.4) } : { pos: V(12.5, 3.3, 43), guarda: V(-.2, 1.3, 52.6) };
    const B2 = { pos: B.pos.clone().lerp(B.guarda, .12), guarda: B.guarda };
    const C = verticale ? { pos: V(3, 9.5, 27.5), guarda: V(0, 1, 47) } : { pos: V(14.5, 6.8, 36.5), guarda: V(-.5, 1.1, 47.5) };
    const mix = function (x, y, w) { return { pos: x.pos.clone().lerp(y.pos, w), guarda: x.guarda.clone().lerp(y.guarda, w) }; };
    const c = calcio[n - 1];
    let q;
    if (T < c) q = A;
    else if (T < arrivoTiro + .1) q = mix(A, B, liscia(tratto(T, c, arrivoTiro + .1)));
    else if (T < arrivoTiro + .9) q = mix(B, B2, liscia(tratto(T, arrivoTiro + .1, arrivoTiro + .9)));
    else q = mix(B2, C, liscia(tratto(T, arrivoTiro + .9, arrivoTiro + 2)));
    guarda.copy(q.guarda);
    camera.position.copy(q.guarda).add(q.pos.clone().sub(q.guarda).multiplyScalar(allarga));
  }

  // ---- dimensioni e inquadratura: da computer l'azione sta a destra (a sinistra c'è la scheda),
  // su smartphone sta in alto (in basso c'è la scheda)
  let largo = 1, alto = 1;
  function misura() {
    largo = tela.clientWidth || 1; alto = tela.clientHeight || 1;
    motore.setPixelRatio(Math.min(window.devicePixelRatio || 1, largo < 700 ? 1.5 : 2));
    motore.setSize(largo, alto, false);
    camera.aspect = largo / alto;
    camera.fov = largo >= 900 ? 32 : 44;
    inquadra(spostamento);
  }
  // quanto spostare l'azione per lasciare spazio alla scheda (1 = tutto, 0 = scena al centro)
  let spostamento = 1;
  function inquadra(quanto) {
    spostamento = quanto;
    if (largo >= 900) camera.setViewOffset(largo, alto, -largo * .17 * quanto, 0, largo, alto);
    else camera.setViewOffset(largo, alto, 0, alto * .16 * quanto, largo, alto);
    camera.updateProjectionMatrix();
  }
  function disegna() { motore.render(scena, camera); }

  // dove sono sullo schermo le teste dei nostri giocatori (per le etichette con l'anno)
  function etichette() {
    return nostri.map(function (x) {
      const q = x.g.osso("testa").add(V(0, .42, 0)).project(camera);
      return { x: (q.x + 1) / 2 * largo, y: (1 - q.y) / 2 * alto, visibile: q.z < 1 };
    });
  }

  // un punto del campo sullo schermo (px dentro il canvas)
  function schermo(v) {
    const q = v.clone().project(camera);
    return { x: (q.x + 1) / 2 * largo, y: (1 - q.y) / 2 * alto };
  }

  misura();
  metti(0);
  return {
    schermo: schermo,
    metti: metti, misura: misura, etichette: etichette, quante: n,
    // il momento in cui il pallone entra in porta (per far partire il GOAL!)
    momentoGoal: pDa(arrivoTiro),
    // da qui la scheda si fa da parte e la scena prende tutto lo schermo
    momentoPalcoLibero: pDa(calcio[n - 1] - .3),
    fine: n + 1,
    // i momenti (in p) dei calci e degli stop: servono ai controlli automatici
    momenti: { calci: calcio.map(pDa), stop: contatto.map(function (c) { return c == null ? null : pDa(c); }) }
  };
}
