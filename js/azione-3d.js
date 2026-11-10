/* ==================================================================
   A.C. Castelverde — js/azione-3d.js
   "La nostra storia" come un'azione di calcio in 3D (Three.js): ogni
   tappa della storia è un giocatore, e il pallone passa dall'uno
   all'altro costruendo l'azione, dal rinvio del portiere fino alla
   rovesciata finale.

     creaAzione3D(tela, quante, modello) → null (niente WebGL) oppure
       { metti(p), misura(), etichette(), schermo(v), quante, fine,
         momentoGoal, momentoPalcoLibero, momenti }
     modello = i calciatori caricati da caricaCalciatori() (js/giocatori-3d.js)

   Ogni giocatore ha un ruolo (SCHEMA_3D): come riceve il pallone (stop,
   di prima, di testa), se lo porta avanti (dribbling, roulette) e come
   lo passa (rasoterra, lancio lungo, cross, rovesciata). I palloni alti
   volano con la gravità vera; i rasoterra rotolano e rallentano.

   p va da 0 a "fine": a p = k il pallone sta arrivando al giocatore k;
   l'ultimo tratto (quante-1 → quante+1, il doppio) è la rovesciata, al
   rallentatore. p diventa un tempo T in secondi e tutto (movimenti
   registrati, pallone, telecamera) dipende solo da T: scorrendo avanti
   e indietro la scena è sempre la stessa. Il pallone tocca davvero il
   piede (o la testa) negli istanti dei colpi, calcolati sulle ossa del
   modello, e non attraversa mai le gambe (viene spinto fuori).
   Lo scorrimento e le schede di testo sono in js/pagine/societa.js.

   Il mondo è in metri: il campo è 68 × 105, si attacca verso +z
   (la porta avversaria è a z = 52,5).
   ================================================================== */

const CAMPO_3D = {
  nebbia: "#d2d3d5",                 // il campo sfuma nel grigio della trama dietro la scena (.trama-grigia)
  campo: "#a9abaf", striscia: "#a2a4a8", linee: "#e9eaeb",   // scuri: con la luce diventano grigio chiaro
  // per ora niente divise: i nostri chiari (la divisa del modello), gli avversari un po' più scuri
  nostri: "#ffffff", nostroPortiere: "#5b5e63", avversari: "#8f9296", portiere: "#6f7276",
  rosso: "#ff0000"
};
const RAGGIO_PALLA = .11;
// I nostri giocatori, uno per tappa: dove si trovano (x, z) e il ruolo nell'azione:
//   come riceve (stop, prima, testa, rovesciata), se porta palla (dribbling, finta) e come passa
//   (passa = rasoterra, lancio = lungo e alto, cross, rinvio del portiere)
const SCHEMA_3D = [
  [2, -46.5, "rinvio"],                  // il portiere: rinvio lungo di collo pieno
  [15, -14, "testa"],                    // sponda di testa in salto
  [8, -7.5, "stop passa"],
  [-8, -3, "stop dribbling passa"],
  [-3, 11, "prima"],                     // passaggio di prima
  [12, 14.5, "stop finta passa"],        // la roulette per saltare l'avversario
  [3, 23, "stop lancio"],                // cambio di gioco
  [-22, 30, "stop dribbling passa"],
  [-9, 35.5, "prima"],
  [6, 31, "stop passa"],
  [19, 36, "stop dribbling cross"],
  [.6, 45, "rovesciata"]                 // e il gol
];
// gli avversari: chiudono gli spazi e vanno incontro a chi ha il pallone, ma nessun passaggio
// passa a portata di intercetto (il pallone basso resta sempre ad almeno 3,5 m da ognuno)
const AVVERSARI_3D = [
  [9, -21],        // sul rinvio lungo
  [-2, 3],         // va incontro a chi parte in dribbling
  [9.8, 19.2],     // chiude chi riceve: viene saltato con la roulette
  [-14, 24],       // scavalcato dal cambio di gioco
  [-4.5, 39.5],    // il centrale, tagliato fuori dal passaggio di prima
  [14, 44],        // esce sull'ala che crossa
  [-5, 46]         // il marcatore, battuto dalla rovesciata
];

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
  const n = Math.max(2, Math.min(quante, SCHEMA_3D.length));
  const schema = SCHEMA_3D.slice(0, n - 2).concat(SCHEMA_3D.slice(-2));   // il cross e la rovesciata ci sono sempre
  const M = MOMENTI, R = RAGGIO_PALLA;
  const CLIP = { rinvio: "tira", lancio: "tira", cross: "tira", passa: "passa", prima: "tocco", testa: "testa", rovesciata: "rovesciata" };
  const IMPATTO = { tira: M.tiroImpatto, passa: M.passaImpatto, tocco: M.toccoImpatto, testa: M.testaImpatto, rovesciata: M.rovesciataImpatto };
  const nostri = schema.map(function (s, k) {
    const g = modello.crea({ tinta: k === 0 ? CAMPO_3D.nostroPortiere : CAMPO_3D.nostri, guanti: k === 0 });
    scena.add(g.radice);
    const parti = s[2].split(" ");
    const x = { g: g, base: V(s[0], 0, s[1]), azione: parti[parti.length - 1], ricezione: null, conduzione: null };
    if (parti[0] === "stop") { x.ricezione = "stop"; x.conduzione = parti.length === 3 ? parti[1] : null; }
    else if (x.azione !== "rinvio") x.ricezione = x.azione;           // di prima, di testa, in rovesciata: ricevere è già colpire
    return x;
  });
  const avversari = AVVERSARI_3D.map(function (p) {
    const g = modello.crea({ tinta: CAMPO_3D.avversari });
    scena.add(g.radice);
    return { g: g, pos: V(p[0], 0, p[1]) };
  });
  const portiere = modello.crea({ tinta: CAMPO_3D.portiere, guanti: true });
  scena.add(portiere.radice);
  const POSTO_PORTIERE = V(.5, 0, 52);

  // il cerchio rosso a terra sotto chi ha il pallone
  const anello = new THREE.Mesh(new THREE.RingGeometry(.55, .68, 48), new THREE.MeshBasicMaterial({ color: CAMPO_3D.rosso, transparent: true, opacity: .85, depthWrite: false }));
  anello.rotation.x = -Math.PI / 2;
  anello.position.y = .012;
  scena.add(anello);
  const tutti = nostri.map(function (x) { return x.g; }).concat(avversari.map(function (x) { return x.g; }), [portiere]);

  // ---- strumenti di geometria ----
  const liscia = function (t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
  const tratto = function (t, da, a) { return Math.min(1, Math.max(0, (t - da) / (a - da))); };
  const pianoXZ = function (v) { return V(v.x, 0, v.z); };
  const angolo = function (v) { return Math.atan2(v.x, v.z); };
  const avantiDi = function (yaw) { return V(Math.sin(yaw), 0, Math.cos(yaw)); };
  const ruota = function (d, yaw) { const c = Math.cos(yaw), s = Math.sin(yaw); return V(d.x * c + d.z * s, 0, -d.x * s + d.z * c); };
  // l'origine di un movimento che continua dove finisce il precedente (il corpo non salta)
  function dopo(origine, yaw, movimento, t) { return origine.clone().add(ruota(modello.spostamento(movimento, t), yaw)); }
  // e quella da cui partire per arrivare in "origine" dopo t secondi di movimento
  function prima(origine, yaw, movimento, t) { return origine.clone().sub(ruota(modello.spostamento(movimento, t), yaw)); }
  function posa(g, movimento, t, origine, yaw) { g.metti([{ movimento: movimento, t: t, peso: 1, origine: origine, yaw: yaw }]); }
  const punta = function (g) { return g.osso("puntaD").lerp(g.osso("finePiedeD"), .5); };
  // il centro del pallone quando il destro lo colpisce: davanti alla punta, nel verso in cui
  // il piede si muove (a terra per i rasoterra, nello spazio per la rovesciata)
  function colpoDiPiede(g, movimento, t, origine, yaw, aTerra) {
    posa(g, movimento, t - 1 / 60, origine, yaw);
    const prima = punta(g);
    posa(g, movimento, t, origine, yaw);
    const ora = punta(g);
    const verso = ora.clone().sub(prima);
    if (aTerra) verso.y = 0;
    if (verso.lengthSq() < 1e-8) verso.copy(avantiDi(yaw));
    verso.normalize();
    const palla = ora.addScaledVector(verso, R * 1.55);
    if (aTerra) palla.y = R;
    return { palla: palla, verso: pianoXZ(verso).normalize() };
  }
  // il pallone sulla fronte (colpo di testa), dalla parte da cui arriva
  function colpoDiTesta(g, t, origine, yaw, da) {
    posa(g, "testa", t, origine, yaw);
    const fronte = g.osso("testa").lerp(g.osso("cima"), .55).addScaledVector(avantiDi(yaw), .09);
    const verso = da.clone().sub(fronte).setY(0).normalize();
    return { palla: fronte.addScaledVector(verso, R + .02), verso: avantiDi(yaw) };
  }
  // di quanto il colpo di ogni movimento va "storto" rispetto a dove guarda il giocatore
  const STORTO = {};
  ["tira", "passa", "tocco", "rovesciata"].forEach(function (c) {
    STORTO[c] = angolo(colpoDiPiede(nostri[0].g, c, IMPATTO[c], V(0, 0, 0), 0, c !== "rovesciata").verso);
  });

  // ---- il portiere avversario: si tuffa dalla parte giusta, il pallone passa appena oltre i guantoni ----
  const YAW_PORTIERE = Math.PI;
  posa(portiere, "tuffo", M.tuffoMani, POSTO_PORTIERE, YAW_PORTIERE);
  const mani = ["LeftHandMiddle4", "RightHandMiddle4", "LeftHandIndex4", "RightHandIndex4"].map(function (o) { return portiere.osso(o); });
  const piuLontana = mani.reduce(function (a, b) { return b.x < a.x ? b : a; });   // si tuffa verso -x
  const SFIORA = V(piuLontana.x - .25, piuLontana.y + .22, piuLontana.z);         // il punto in cui il pallone gli sfugge

  // ---- la geometria dell'azione: dove ognuno riceve e colpisce, e verso dove guarda ----
  const yaw = [], geo = [];
  const dischetto = nostri[0].base.clone();                // dove il portiere calcia il pallone
  for (let k = 0; k < n; k++) yaw[k] = angolo((k < n - 1 ? nostri[k + 1].base : V(0, 0, 52.5)).clone().sub(nostri[k].base));
  function geometria(k) {
    const x = nostri[k], g = x.g, y = yaw[k], G = { segmenti: [], tocchi: [] };
    let o = x.base, t = 0;
    if (x.ricezione === "stop") {
      G.segmenti.push({ movimento: "ricevi", rel: 0, origine: o });
      G.contattoRel = M.riceviContatto;
      posa(g, "ricevi", M.riceviContatto, o, y);
      G.piedeStop = punta(g);
      o = dopo(o, y, "ricevi", M.riceviFine); t = M.riceviFine;
    }
    if (x.conduzione === "dribbling") {
      G.segmenti.push({ movimento: "dribbling", rel: t, origine: o });
      const oo = o, tt = t;
      M.dribblingTocchi.forEach(function (tocco) { G.tocchi.push({ rel: tt + tocco, palla: colpoDiPiede(g, "dribbling", tocco, oo, y, true).palla }); });
      o = dopo(o, y, "dribbling", M.dribblingFine); t += M.dribblingFine;
    } else if (x.conduzione === "finta") {
      // la roulette: il pallone resta tra i piedi mentre il giocatore gira su sé stesso
      G.segmenti.push({ movimento: "finta", rel: t, origine: o });
      const d = modello.durata("finta");
      [.3, .6, .9].forEach(function (tf) {
        posa(g, "finta", tf, o, y);
        const piedi = g.osso("RightToe_End").lerp(g.osso("LeftToe_End"), .5);
        G.tocchi.push({ rel: t + tf, palla: piedi.addScaledVector(avantiDi(y), .3).setY(R) });
      });
      o = dopo(o, y, "finta", d); t += d;
      G.tocchi.push({ rel: t - .05, palla: o.clone().addScaledVector(avantiDi(y), .55).setY(R) });
    }
    const clip = CLIP[x.azione];
    G.clip = clip;
    G.segmenti.push({ movimento: clip, rel: t, origine: o });
    G.calcioRel = t + IMPATTO[clip];
    G.fineRel = t + modello.durata(clip);
    G.fine = dopo(o, y, clip, modello.durata(clip));
    if (clip === "testa") {
      const c = colpoDiTesta(g, IMPATTO.testa, o, y, k > 0 ? geo[k - 1].ferma : o);
      G.ferma = c.palla;
    } else {
      // (il rinvio del portiere è al volo: il pallone gli cade dalle mani sul collo del piede)
      G.ferma = colpoDiPiede(g, clip, IMPATTO[clip], o, y, clip !== "rovesciata" && x.azione !== "rinvio").palla;
    }
    if (x.ricezione === "stop") {
      const da = k > 0 && geo[k - 1] ? geo[k - 1].ferma : G.ferma;
      const verso = pianoXZ(da.clone().sub(G.piedeStop)).normalize();
      G.arriva = G.piedeStop.clone().addScaledVector(verso, R + .06).setY(R);
    } else {
      G.contattoRel = G.calcioRel;
      G.arriva = G.ferma;
    }
    return G;
  }
  for (let giro = 0; giro < 6; giro++) {
    for (let k = 0; k < n; k++) geo[k] = geometria(k);
    // il portiere si mette in modo che il piede colpisca il pallone sul dischetto
    nostri[0].base.add(pianoXZ(dischetto.clone().sub(geo[0].ferma)));
    for (let k = 0; k < n; k++) {
      const x = nostri[k], G = geo[k];
      const verso = k < n - 1 ? geo[k + 1].arriva : SFIORA;
      if (G.clip === "testa") {
        // di testa: guarda a metà tra da dove arriva il pallone e dove lo manda
        const a = pianoXZ(geo[k - 1].ferma.clone().sub(G.ferma)).normalize();
        const b = pianoXZ(verso.clone().sub(G.ferma)).normalize();
        yaw[k] = angolo(a.add(b));
      } else {
        yaw[k] = angolo(pianoXZ(verso.clone().sub(G.ferma))) - STORTO[G.clip];
      }
    }
  }
  for (let k = 0; k < n; k++) geo[k] = geometria(k);

  // il tiro: dalla rovesciata, oltre i guantoni, fino alla linea di porta e dentro la rete
  const S = geo[n - 1].ferma;
  const dirTiro = SFIORA.clone().sub(S).normalize();
  const GOL = S.clone().addScaledVector(dirTiro, (52.5 - S.z) / dirTiro.z);   // dove passa la linea di porta
  const IN_RETE = GOL.clone().addScaledVector(pianoXZ(dirTiro).normalize(), 1.1).setY(R);

  // ---- i voli del pallone ----
  const GRAVITA = 9.81;
  function tipoVolo(k) { return { passa: "terra", prima: "terra", lancio: "alto", rinvio: "alto", cross: "cross", testa: "sponda" }[nostri[k].azione]; }
  // un pallone alto: parte in a, arriva in b, sale fino all'altezza "cima"
  function parabola(a, b, cima) {
    const su = Math.sqrt(2 * GRAVITA * Math.max(.05, cima - a.y));
    const durata = (su + Math.sqrt(Math.max(0, su * su - 2 * GRAVITA * (b.y - a.y)))) / GRAVITA;
    return { su: su, durata: durata };
  }
  const voli = [];
  for (let k = 0; k < n - 1; k++) {
    const a = geo[k].ferma, b = geo[k + 1].arriva, dist = pianoXZ(b.clone().sub(a)).length(), tipo = tipoVolo(k);
    if (tipo === "terra") { voli[k] = { tipo: tipo, durata: Math.min(1.6, Math.max(.55, dist / 14)) }; continue; }
    const cima = tipo === "cross" ? 4.2 : tipo === "sponda" ? a.y + 1 : Math.max(a.y, b.y) + Math.min(8, Math.max(2.5, dist * .17));
    voli[k] = Object.assign({ tipo: tipo }, parabola(a, b, cima));
  }

  // ---- i tempi (in secondi) dell'azione intera ----
  const PAUSA = 1.8;                                 // il portiere, pallone in mano, aspetta un attimo e prende la rincorsa
  const inizio = [PAUSA], contatto = [0], calcio = [];
  calcio[0] = PAUSA + geo[0].calcioRel;
  for (let k = 1; k < n; k++) {
    contatto[k] = calcio[k - 1] + voli[k - 1].durata;
    inizio[k] = contatto[k] - geo[k].contattoRel;
    calcio[k] = inizio[k] + geo[k].calcioRel;
  }
  // il tiro: il pallone vola veloce (circa 19 m/s), il portiere parte appena dopo il colpo
  const VEL_TIRO = 19;
  const arrivoMani = calcio[n - 1] + S.distanceTo(SFIORA) / VEL_TIRO;
  const arrivoGol = arrivoMani + SFIORA.distanceTo(GOL) / VEL_TIRO;
  const TUFFO = { da: .4, velocita: 1.5 };
  const inizioTuffo = arrivoMani - (M.tuffoMani - TUFFO.da) / TUFFO.velocita;
  const inizioEsulta = inizio[n - 1] + geo[n - 1].fineRel - .1;
  const fineTiro = inizioEsulta + modello.durata("testa");
  const T0 = inizio[n - 1];                          // da qui il rallentatore della rovesciata

  // ---- il programma di ogni giocatore: i movimenti uno dopo l'altro (si fondono tra loro) ----
  const FONDI = .25;
  const programma = nostri.map(function (x, k) {
    const G = geo[k], y = yaw[k], lista = [];
    if (k === 0) {
      // in piedi con il pallone in mano, poi due passi di corsa (sempre tenendolo) e il rinvio al volo
      const d = modello.durata("corsa"), o1 = prima(G.segmenti[0].origine, y, "corsa", d);
      lista.push({ movimento: "attesa", respiro: true, inizio: -1e9, origine: o1 });
      lista.push({ movimento: "corsa", inizio: inizio[0] - d, origine: o1 });
    } else {
      // prima si smarca: due falcate di corsa che finiscono dove comincia la ricezione
      const corsa = x.ricezione === "rovesciata" ? "indietro" : "corsa", d = modello.durata(corsa);
      const o2 = prima(x.base, y, corsa, d), o1 = prima(o2, y, corsa, d);
      lista.push({ movimento: "attesa", respiro: true, inizio: -1e9, origine: o1 });
      lista.push({ movimento: corsa, inizio: inizio[k] - 2 * d, origine: o1 });
      lista.push({ movimento: corsa, inizio: inizio[k] - d, origine: o2, fondi: .01 });
    }
    G.segmenti.forEach(function (s, i) {
      const pezzo = { movimento: s.movimento, inizio: inizio[k] + s.rel, origine: s.origine };
      // se il colpo arriva subito (di prima), il movimento comincia prima, fermo sulla posa iniziale:
      // così nell'istante del colpo non si sta ancora fondendo con la corsa
      if (i === 0 && k > 0 && G.contattoRel < FONDI + .15) { pezzo.inizio -= .35; pezzo.da = -.35; }
      lista.push(pezzo);
    });
    if (k < n - 1) {
      lista.push({ movimento: "attesa", respiro: true, inizio: inizio[k] + G.fineRel - .1, origine: G.fine, fondi: .35 });
    } else {
      lista.push({ movimento: "testa", inizio: inizioEsulta, origine: G.fine, fondi: .3 });      // l'esultanza: il salto a braccia alte
    }
    return lista;
  });
  const programmaPortiere = [
    { movimento: "difende", ciclo: true, inizio: -1e9, origine: POSTO_PORTIERE },
    { movimento: "tuffo", inizio: inizioTuffo, da: TUFFO.da, velocita: TUFFO.velocita, origine: POSTO_PORTIERE, fondi: .12 }
  ];
  // ---- il pallone in mano al portiere: lo tiene davanti al petto, poi lo lascia cadere sul piede ----
  // (dove sta il pallone mentre lo tiene: segue il petto; si calcola una volta sola, in una tabella)
  const PASSO_PRESA = 1 / 60, presa = [];
  const petto = function (T) {
    nostri[0].g.metti(stati(programma[0], yaw[0], T, 0));
    return nostri[0].g.osso("Spine2").addScaledVector(avantiDi(yaw[0]), .31);
  };
  const ALTEZZA_PRESA = 1.05 - petto(0).y;           // il pallone all'altezza dello stomaco
  for (let T = 0; T <= calcio[0] + 1e-6; T += PASSO_PRESA) presa.push(petto(T).add(V(0, ALTEZZA_PRESA, 0)));
  function inMano(T) {
    const f = Math.min(Math.max(0, T), calcio[0]) / PASSO_PRESA, i = Math.min(Math.floor(f), presa.length - 2);
    return presa[i].clone().lerp(presa[i + 1], Math.min(1, f - i));
  }
  // quando lo lascia: un attimo prima del colpo, quanto basta perché cada sul collo del piede
  // (con una piccola spinta verso l'alto, come fanno i portieri)
  const SPINTA = .5;
  let lascia = calcio[0] - .4;
  for (let i = 0; i < 6; i++) {
    const giu = geo[0].ferma.y - inMano(lascia).y;
    lascia = calcio[0] - (SPINTA + Math.sqrt(SPINTA * SPINTA - 2 * GRAVITA * giu)) / GRAVITA;
  }
  const MANI = inMano(lascia), CADUTA = calcio[0] - lascia;
  const spintaVera = (geo[0].ferma.y - MANI.y + GRAVITA * CADUTA * CADUTA / 2) / CADUTA;
  // quanto le mani tengono ancora il pallone (1 = lo tengono, 0 = le braccia sono libere)
  const presaMani = function (T) { return 1 - liscia(tratto(T, lascia, lascia + .2)); };

  function tempoLocale(s, T, k) {
    if (s.respiro) return .25 + .2 * Math.sin(T * 1.7 + k * 1.3);
    if (s.ciclo) { const d = modello.durata(s.movimento); return ((T * .8 + k * .9) % d + d) % d; }
    return (s.da || 0) + (T - s.inizio) * (s.velocita || 1);
  }
  function stati(lista, y, T, k) {
    let i = lista.length - 1;
    while (i > 0 && T < lista[i].inizio) i--;
    const s = lista[i], dt = T - s.inizio, f = s.fondi || FONDI;
    const out = [{ movimento: s.movimento, t: tempoLocale(s, T, k), peso: 1, origine: s.origine, yaw: y }];
    if (i > 0 && dt < f) {
      const u = liscia(dt / f), p = lista[i - 1];
      out[0].peso = u;
      out.push({ movimento: p.movimento, t: tempoLocale(p, T, k), peso: 1 - u, origine: p.origine, yaw: y });
    }
    return out;
  }

  // ---- il pallone al tempo T ----
  // i punti di passaggio del pallone mentre il giocatore k lo controlla (stop, tocchi, colpo)
  const controllo = nostri.map(function (x, k) {
    const G = geo[k];
    // dopo lo stop il pallone rotola piano e regolare (il giocatore lo rincorre e lo calcia);
    // dopo un tocco parte più veloce e rallenta
    return [{ T: contatto[k], p: G.arriva, dopo: "regolare" }].concat(G.tocchi.map(function (t) { return { T: inizio[k] + t.rel, p: t.palla, dopo: "rallenta" }; }), [{ T: calcio[k], p: G.ferma }]);
  });
  function inVolo(k, T, p) {
    const a = geo[k].ferma, b = geo[k + 1].arriva, v = voli[k];
    const u = tratto(T, calcio[k], calcio[k] + v.durata);
    if (v.tipo === "terra") {                        // rasoterra: parte forte e rallenta
      const s = 1 - Math.pow(1 - u, 1.6);
      return p.copy(a).lerp(b, s);
    }
    const s = (1 - Math.exp(-.5 * u)) / (1 - Math.exp(-.5));     // un filo di attrito dell'aria
    const t = u * v.durata;
    p.copy(a).lerp(b, s);
    p.y = a.y + v.su * t - GRAVITA * t * t / 2;
    return p;
  }
  function pallaA(T) {
    const p = new THREE.Vector3();
    if (T <= lascia) return p.copy(inMano(T));
    if (T <= calcio[0]) {                             // cade dalle mani al piede
      const t = T - lascia;
      p.copy(MANI).lerp(geo[0].ferma, t / CADUTA);
      p.y = MANI.y + spintaVera * t - GRAVITA * t * t / 2;
      return p;
    }
    for (let k = 0; k < n - 1; k++) {
      if (T < contatto[k + 1]) return inVolo(k, T, p);
      if (T < calcio[k + 1]) {
        const punti = controllo[k + 1];
        let i = 0;
        while (i < punti.length - 2 && T >= punti[i + 1].T) i++;
        const u = tratto(T, punti[i].T, punti[i + 1].T);
        p.copy(punti[i].p).lerp(punti[i + 1].p, punti[i].dopo === "regolare" ? u : 1 - Math.pow(1 - u, 1.5));
        p.y = Math.max(R, p.y);
        return p;
      }
    }
    // la rovesciata: dritto oltre i guantoni e sulla linea, poi dentro la rete
    if (T < arrivoGol) return p.copy(S).lerp(GOL, tratto(T, calcio[n - 1], arrivoGol));
    const u = tratto(T, arrivoGol, arrivoGol + .6);
    p.copy(GOL).lerp(IN_RETE, 1 - Math.pow(1 - u, 2));
    p.y = GOL.y + (R - GOL.y) * u * u + Math.abs(Math.sin(u * Math.PI * 2.5)) * .2 * (1 - u);
    return p;
  }

  // il pallone non entra mai nelle gambe: se le tocca, viene spinto fuori
  const GAMBE = [["UpLeg", "Leg", .075], ["Leg", "Foot", .052], ["Foot", "ToeBase", .045], ["ToeBase", "Toe_End", .035]];
  const q = new THREE.Vector3(), ab = new THREE.Vector3(), d = new THREE.Vector3();
  function fuoriDalleGambe(c, giocatori) {
    for (let giro = 0; giro < 3; giro++) {
      giocatori.forEach(function (g) {
        ["Left", "Right"].forEach(function (lato) {
          GAMBE.forEach(function (pezzo) {
            const a = g.osso(lato + pezzo[0]), b = g.osso(lato + pezzo[1]);
            ab.subVectors(b, a);
            const t = Math.min(1, Math.max(0, d.subVectors(c, a).dot(ab) / Math.max(ab.lengthSq(), 1e-6)));
            q.copy(a).addScaledVector(ab, t);
            d.subVectors(c, q);
            const minimo = R + pezzo[2], l = d.length();
            if (l >= minimo) return;
            if (l < 1e-4) d.set(-ab.z, 0, ab.x);
            c.copy(q).addScaledVector(d.normalize(), minimo);
          });
        });
      });
      c.y = Math.max(R, c.y);
    }
    return c;
  }

  // ---- la scansione: p (scorrimento) ↔ T (tempo) ----
  // ogni tappa comincia quando il pallone sta per arrivare al suo giocatore; la rovesciata
  // (l'ultimo tratto, lungo il doppio) va al rallentatore mentre il pallone vola verso la porta
  const tappa = [0];
  for (let k = 1; k < n - 1; k++) tappa[k] = contatto[k] - .45;
  tappa[n - 1] = T0;
  const FASI_TIRO = [[0, T0], [.34, calcio[n - 1] - .02], [.56, arrivoGol + .35], [1, fineTiro]];
  function tempoDa(p) {
    p = Math.max(0, Math.min(n + 1, p));
    if (p < n - 1) { const k = Math.floor(p); return tappa[k] + (p - k) * (tappa[k + 1] - tappa[k]); }
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
  for (let k = 0; k < n - 1; k++) {
    const dd = pianoXZ(geo[k + 1].arriva.clone().sub(geo[k].ferma)).normalize();
    let traverso = V(-dd.z, 0, dd.x);
    if (traverso.z > 0) traverso.negate();
    lati.push(traverso.lerp(V(0, 0, -1), .45).normalize());
  }
  const lunghezza = voli.map(function (v, k) { return pianoXZ(geo[k + 1].arriva.clone().sub(geo[k].ferma)).length(); });

  // ---- la regia: tutto dipende dal tempo T (che dipende da p) ----
  const centro = new THREE.Vector3(), guarda = new THREE.Vector3();
  function metti(p) {
    const T = tempoDa(p);
    // chi ha il pallone: l'ultimo a cui è arrivato
    let k = 0;
    while (k < n - 1 && T >= contatto[k + 1]) k++;
    const tiro = T >= T0;

    // il pallone, poi i giocatori (il nostro portiere all'inizio lo tiene in mano)
    const pallaPos = pallaA(T);
    nostri.forEach(function (x, j) {
      const mani = j === 0 ? presaMani(T) : 0;
      x.g.metti(stati(programma[j], yaw[j], T, j), mani > 0 ? { punto: pallaPos, peso: mani } : null);
    });
    portiere.metti(stati(programmaPortiere, YAW_PORTIERE, T, 0));
    avversari.forEach(function (a, j) {
      a.g.metti([{ movimento: "difende", t: (T * .8 + j * .9) % 4.4, peso: 1, origine: a.pos, yaw: angolo(pianoXZ(pallaPos.clone().sub(a.pos))) }]);
    });
    const vicini = nostri.map(function (x) { return x.g; }).concat(avversari.map(function (a) { return a.g; })).filter(function (g) {
      return g.radice.position.distanceToSquared(pianoXZ(pallaPos)) < 6;
    });
    if (T < calcio[n - 1]) fuoriDalleGambe(pallaPos, vicini);
    palla.position.copy(pallaPos);

    // la rete: si gonfia quando entra il pallone e torna con un'oscillazione
    const ur = tratto(T, arrivoGol - .03, arrivoGol + 1.6);
    const gonfio = T > arrivoGol - .03 ? Math.exp(-ur * 5) * Math.cos(ur * 14) * Math.min(1, ur / .04) : 0;
    portaLoro.gonfia(GOL.x, GOL.y, Math.max(0, gonfio));

    // il cerchio rosso sotto chi ha il pallone
    const chi = tiro ? n - 1 : k;
    const sotto = nostri[chi].g.radice.position;
    anello.position.set(sotto.x, .012, sotto.z);
    anello.material.opacity = tiro ? .85 * (1 - tratto(T, T0, T0 + .4)) : .85;

    // la telecamera
    if (!tiro) {
      // segue il pallone come in televisione (con un po' di ritardo e d'anticipo, senza scatti),
      // di traverso rispetto al passaggio, alle spalle dell'azione; si allarga sui lanci lunghi
      centro.set(0, 0, 0);
      for (let i = -4; i <= 4; i++) centro.add(pianoXZ(pallaA(T + i * .14)));
      centro.multiplyScalar(1 / 9);
      const f = Math.min(k, n - 2);
      const giro = k > 0 ? liscia(tratto(T, contatto[k], contatto[k] + .9)) : 1;
      const dir = lati[Math.max(0, f - 1)].clone().lerp(lati[f], giro).normalize();
      let lungo = 0;
      voli.forEach(function (v, j) {
        const uv = tratto(T, calcio[j] - .3, calcio[j] + v.durata + .3);
        lungo = Math.max(lungo, Math.min(1, Math.max(0, (lunghezza[j] - 12) / 16)) * Math.sin(Math.PI * uv));
      });
      const lontano = largo >= 900 ? 1 + 1.05 * lungo : 1.55 * (1 + .6 * lungo);
      camera.position.copy(centro).addScaledVector(dir, 10.5 * lontano).setY(6.2 * lontano);
      guarda.copy(centro).add(V(0, .6 + 1.4 * lungo, 0));
    } else {
      regiaTiro(T);
    }
    // durante la rovesciata la scena prende tutto lo schermo (la scheda si fa da parte)
    inquadra(tiro ? 1 - liscia(tratto(T, T0, T0 + .6)) : 1);
    camera.lookAt(guarda);
    portaNostra.visible = camera.position.z > -51;

    // chi si trova tra la telecamera e l'azione (o troppo vicino) diventa trasparente
    const attivi = [nostri[k].g, nostri[Math.min(n - 1, k + 1)].g, portiere];
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
    palla.ridisegna(sulloSchermo, R / (distanza * Math.tan(g2r(camera.fov / 2))) * alto / 2);
    sole.position.copy(guarda).add(V(-10, 20, -6));
    sole.target.position.copy(guarda);
    disegna();
    return { chi: chi, palla: pallaPos };
  }

  // La regia della rovesciata, in tre inquadrature che si fondono:
  // A di lato (il cross arriva, la rovesciata), B davanti alla porta (il pallone sfiora i
  // guantoni del portiere in tuffo, la rete si gonfia), C larga (l'esultanza).
  function regiaTiro(T) {
    const verticale = largo < 900;
    const allarga = verticale ? 1.35 : 1;
    const dt = pianoXZ(dirTiro).normalize();
    let fianco = V(-dt.z, 0, dt.x);
    if (fianco.x < 0) fianco.negate();
    // (su smartphone lo schermo è stretto: la rovesciata sta al centro, un po' più lontana)
    const A = verticale
      ? { pos: S.clone().addScaledVector(fianco, 7.2).addScaledVector(dt, -.6).setY(1.6), guarda: S.clone().addScaledVector(dt, .15).setY(.95) }
      : { pos: S.clone().addScaledVector(fianco, 7.5).addScaledVector(dt, -1.5).setY(1.5), guarda: S.clone().addScaledVector(dt, 1.2).setY(1.1) };
    const B = verticale ? { pos: V(5, 3.4, 37.5), guarda: V(-.8, 1.1, 51.6) } : { pos: V(11.5, 2.8, 44), guarda: V(-1.4, 1.1, 51.8) };
    const B2 = { pos: B.pos.clone().lerp(B.guarda, .12), guarda: B.guarda };
    const C = verticale ? { pos: V(4, 9.5, 30), guarda: V(0, 1, 47) } : { pos: V(14, 6.5, 36.5), guarda: V(-.5, 1.1, 47) };
    const mix = function (x, y, w) { return { pos: x.pos.clone().lerp(y.pos, w), guarda: x.guarda.clone().lerp(y.guarda, w) }; };
    const c = calcio[n - 1];
    let qq;
    if (T < c + .05) qq = A;
    else if (T < arrivoGol + .1) qq = mix(A, B, liscia(tratto(T, c + .05, arrivoGol + .1)));
    else if (T < arrivoGol + .9) qq = mix(B, B2, liscia(tratto(T, arrivoGol + .1, arrivoGol + .9)));
    else qq = mix(B2, C, liscia(tratto(T, arrivoGol + .9, arrivoGol + 2)));
    guarda.copy(qq.guarda);
    camera.position.copy(qq.guarda).add(qq.pos.clone().sub(qq.guarda).multiplyScalar(allarga));
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
      const qq = x.g.osso("testa").add(V(0, .42, 0)).project(camera);
      return { x: (qq.x + 1) / 2 * largo, y: (1 - qq.y) / 2 * alto, visibile: qq.z < 1 };
    });
  }

  // un punto del campo sullo schermo (px dentro il canvas)
  function schermo(v) {
    const qq = v.clone().project(camera);
    return { x: (qq.x + 1) / 2 * largo, y: (1 - qq.y) / 2 * alto };
  }

  misura();
  metti(0);
  return {
    schermo: schermo,
    metti: metti, misura: misura, etichette: etichette, quante: n,
    // il momento in cui il pallone entra in porta (per far partire il GOAL!)
    momentoGoal: pDa(arrivoGol),
    // da qui la scheda si fa da parte e la scena prende tutto lo schermo
    momentoPalcoLibero: pDa(T0),
    fine: n + 1,
    // i momenti (in p) dei colpi e degli arrivi: servono ai controlli automatici
    momenti: { calci: calcio.map(pDa), stop: contatto.map(function (c, k) { return k ? pDa(c) : null; }) },
    // per i controlli: la geometria del tiro
    tiro: { rovesciata: S, guanti: SFIORA, gol: GOL },
    // per i controlli: dov'è il pallone al tempo T, e il tempo di ogni p
    pallaA: pallaA, tempoDa: tempoDa
  };
}
