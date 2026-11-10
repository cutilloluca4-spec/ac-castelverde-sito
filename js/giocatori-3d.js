/* ==================================================================
   A.C. Castelverde — js/giocatori-3d.js
   Il calciatore 3D della storia (pagina Società): un modello realistico
   con i movimenti registrati da calciatori veri (motion capture Mixamo),
   in assets/3d/calciatore.glb (personaggio e movimenti in un solo file).

     caricaCalciatori(url) → Promise di un "modello" con:
       crea({ tinta })                       un nuovo giocatore (copia del modello)
       spostamento(movimento, t)             quanto si è spostato il corpo al tempo t
       durata(movimento)                     quanto dura un movimento (secondi)

     crea({ tinta, guanti: true })          un portiere: con i guantoni (assets/3d/guanti.glb)

     ogni giocatore creato ha:
       radice                                il gruppo da aggiungere alla scena
       metti([{ movimento, t, peso, origine, yaw }], presa)
                                             lo mette nella posa: uno o più movimenti
                                             fusi insieme (peso), ognuno al suo tempo t;
                                             presa = { punto, peso }: tiene il pallone
                                             con le due mani (le braccia si adattano)
       osso(nome)                            dov'è un osso nel mondo (Vector3): un nome di OSSA
                                             o la fine del nome Mixamo ("LeftHand", "RightLeg"…)
       sbiadisci(0…1)                        trasparenza (se copre la telecamera)

   I movimenti nel file hanno lo spostamento del corpo incorporato (il
   giocatore corre davvero). Al caricamento lo si misura e lo si toglie
   (il movimento diventa "sul posto"): così due movimenti si fondono senza
   scatti e la scena sa sempre dove si trova il giocatore.
   ================================================================== */

// I movimenti usati (nomi dei file Mixamo, convertiti in assets/3d/calciatore.glb)
const MOVIMENTI = {
  attesa: "Soccer_Idle",              // in piedi, si muove appena (si usa solo il primo mezzo secondo)
  corsa: "Jog_Forward",               // corsa leggera in avanti (per smarcarsi)
  indietro: "Jog_Backward",           // corsa all'indietro, guardando il pallone
  ricevi: "Receive_Soccerball",       // arriva di corsa e stoppa il pallone col destro
  passa: "Soccer_Pass",               // rincorsa e passaggio col destro
  tocco: "Kick_Soccerball",           // passaggio di prima, da fermo
  tira: "Strike_Foward_Jog",          // calcio in corsa di collo pieno: rinvio, lancio lungo, cross
  dribbling: "Dribble",               // corsa palla al piede, due tocchi col destro
  finta: "Soccer_Spin",               // la "roulette": giro su sé stesso col pallone
  testa: "Soccer_Header",             // colpo di testa in salto (anche il salto dell'esultanza)
  rovesciata: "Scissor_Kick",         // la rovesciata
  difende: "Goalkeeper_Idle",         // pronto sulle gambe: gli avversari e i portieri
  tuffo: "Goalkeeper_Diving_Save"     // il tuffo del portiere (verso la sua sinistra)
};
// I momenti chiave dei movimenti (secondi), misurati sulla traiettoria del piede destro
const MOMENTI = {
  passaImpatto: .72,     // il destro colpisce il pallone
  tiroImpatto: .40,      // il collo del piede colpisce il pallone
  riceviContatto: .40,   // il destro tocca il pallone e lo ammortizza
  riceviFine: .95,       // il giocatore ha il pallone sotto controllo
  toccoImpatto: .15,     // il passaggio di prima
  testaImpatto: 1.17,    // la fronte colpisce il pallone, in cima al salto
  dribblingTocchi: [.58, 1.45], dribblingFine: 1.62,   // i tocchi: il destro davanti al corpo
  rovesciataImpatto: .85,// il destro colpisce il pallone sopra la testa
  tuffoMani: 1.0         // il portiere è disteso in volo, con le mani più lontane
};
const OSSA = {
  bacino: "mixamorig5Hips", testa: "mixamorig5Head", cima: "mixamorig5HeadTop_End",
  piedeD: "mixamorig5RightFoot", puntaD: "mixamorig5RightToeBase", finePiedeD: "mixamorig5RightToe_End"
};

// Il modello si prende da assets/3d/calciatore.glb.js (lo stesso file .glb scritto in uno
// script, così funziona anche aprendo la pagina con un doppio clic); se manca, dal .glb.
function caricaCalciatori(url) {
  return new Promise(function (fatto, errore) {
    const caricatore = new THREE.GLTFLoader();
    const byte = function (b64) {
      const binario = atob(b64), out = new Uint8Array(binario.length);
      for (let i = 0; i < binario.length; i++) out[i] = binario.charCodeAt(i);
      return out.buffer;
    };
    const leggi = function (b64, file) {
      return new Promise(function (ok, no) {
        if (b64) caricatore.parse(byte(b64), "", ok, no);
        else caricatore.load(file, ok, undefined, no);
      });
    };
    // i guanti (assets/3d/guanti.glb.js, accanto al calciatore): se mancano, i portieri restano a mani nude
    const guanti = leggi(window.GUANTI_3D, url.replace(/calciatore\.glb$/, "guanti.glb"))
      .then(preparaGuanto).catch(function () {});
    Promise.all([leggi(window.CALCIATORE_3D, url), guanti])
      .then(function (r) { fatto(preparaCalciatori(r[0])); }, errore);
  });
}

function preparaCalciatori(gltf) {
  const clip = {};
  gltf.animations.forEach(function (c) { clip[c.name] = c; });

  // 1. per ogni movimento: lo spostamento del bacino nel mondo, poi lo si toglie dalla traccia
  const PASSO = 1 / 60;
  const spostamenti = {};
  const prova = THREE.SkeletonUtils.clone(gltf.scene);
  const mixer = new THREE.AnimationMixer(prova);
  const bacino = prova.getObjectByName(OSSA.bacino);
  const v = new THREE.Vector3();
  Object.keys(clip).forEach(function (nome) {
    const c = clip[nome];
    const azione = mixer.clipAction(c);
    azione.play();
    const campioni = [];
    for (let t = 0; t <= c.duration + 1e-6; t += PASSO) {
      azione.time = t;
      mixer.update(0);
      prova.updateMatrixWorld(true);
      bacino.getWorldPosition(v);
      campioni.push(v.x, v.z);
    }
    azione.stop();
    const x0 = campioni[0], z0 = campioni[1];
    for (let i = 0; i < campioni.length; i += 2) { campioni[i] -= x0; campioni[i + 1] -= z0; }
    spostamenti[nome] = campioni;
    const traccia = c.tracks.find(function (tr) { return tr.name === OSSA.bacino + ".position"; });
    if (traccia) {
      const val = traccia.values, lx = val[0], lz = val[2];
      for (let i = 0; i < val.length; i += 3) { val[i] = lx; val[i + 2] = lz; }
    }
  });

  // lo spostamento (x, z nel verso del giocatore, cioè con il giocatore che guarda verso +z)
  function spostamento(nome, t) {
    const c = spostamenti[MOVIMENTI[nome] || nome];
    const f = Math.max(0, t) / PASSO;
    const i = Math.min(Math.floor(f), c.length / 2 - 2);
    const u = Math.min(1, f - i);
    return { x: c[i * 2] + (c[i * 2 + 2] - c[i * 2]) * u, z: c[i * 2 + 1] + (c[i * 2 + 3] - c[i * 2 + 1]) * u };
  }
  function durata(nome) { return clip[MOVIMENTI[nome] || nome].duration; }

  // 2. un nuovo giocatore
  function crea(opzioni) {
    const o = opzioni || {};
    const corpo = THREE.SkeletonUtils.clone(gltf.scene);
    const materiali = [];
    corpo.traverse(function (m) {
      if (!m.isMesh) return;
      m.castShadow = true;
      m.frustumCulled = false;                    // i corpi animati escono dal loro riquadro di partenza
      m.material = m.material.clone();            // ognuno il suo: per la trasparenza e per le divise
      if (o.tinta && !/hair|eyelash/i.test(m.name)) m.material.color.set(o.tinta);
      materiali.push(m.material);
    });
    if (o.guanti) mettiGuanti(corpo, materiali);    // dopo la tinta: i guanti hanno i loro colori
    const radice = new THREE.Group();
    radice.add(corpo);
    const mixer = new THREE.AnimationMixer(corpo);
    const azioni = {};
    Object.keys(clip).forEach(function (nome) {
      const a = mixer.clipAction(clip[nome]);
      a.play();
      a.enabled = false;
      azioni[nome] = a;
    });
    const ossa = {};
    function trova(nome) {
      if (!ossa[nome]) ossa[nome] = corpo.getObjectByName(OSSA[nome] || "mixamorig5" + nome);
      return ossa[nome];
    }

    // stati = [{ movimento, t, peso, origine (Vector3), yaw }]: i movimenti fusi insieme
    // presa = { punto, peso } (facoltativa): le mani tengono il pallone in quel punto
    function metti(stati, presa) {
      Object.keys(azioni).forEach(function (n) { azioni[n].enabled = false; });
      let somma = 0, x = 0, z = 0;
      const yaw = stati[0].yaw;
      stati.forEach(function (s) {
        if (s.peso <= 0) return;
        const nome = MOVIMENTI[s.movimento] || s.movimento;
        const a = azioni[nome];
        const t = Math.min(Math.max(0, s.t), clip[nome].duration - 1e-4);
        a.enabled = true;
        a.setEffectiveWeight(s.peso);
        a.time = t;
        const d = spostamento(nome, t);
        const c = Math.cos(s.yaw), sn = Math.sin(s.yaw);
        x += (s.origine.x + d.x * c + d.z * sn) * s.peso;
        z += (s.origine.z - d.x * sn + d.z * c) * s.peso;
        somma += s.peso;
      });
      radice.position.set(x / somma, 0, z / somma);
      radice.rotation.y = yaw;
      mixer.update(0);
      radice.updateMatrixWorld(true);
      if (presa && presa.peso > 0) tieni(presa.punto, presa.peso, yaw);
    }

    // ---- tenere il pallone con le due mani (il portiere prima del rinvio) ----
    // Le braccia si piegano da sole (IK a due ossa: spalla-gomito-polso) per portare i
    // palmi ai lati del pallone, con le dita in avanti e verso l'alto. peso 0…1 fonde con
    // il movimento registrato (per lasciarlo andare senza scatti).
    const W = THREE.Vector3, Q = THREE.Quaternion;
    // le dita nella posa di partenza (distese): tenendo il pallone le mani si aprono
    const ditaDistese = [];
    corpo.traverse(function (b) { if (b.isBone && /Hand(Thumb|Index|Middle|Ring|Pinky)[123]$/.test(b.name)) ditaDistese.push([b, b.quaternion.clone()]); });
    const verso = {};                                 // da che parte guarda il palmo, nella posa a T (in basso)
    function assi(lato) {
      const polso = osso(lato + "Hand"), medio = osso(lato + "HandMiddle1");
      const dita = medio.clone().sub(polso).normalize();
      const largo = osso(lato + "HandIndex1").sub(osso(lato + "HandPinky1"));
      const palmo = new W().crossVectors(largo, dita).normalize();
      return { dita: dita, palmo: palmo.multiplyScalar(verso[lato] || 1) };
    }
    radice.updateMatrixWorld(true);
    ["Left", "Right"].forEach(function (lato) {
      if (!trova(lato + "HandIndex1")) return;
      verso[lato] = assi(lato).palmo.y < 0 ? 1 : -1;
    });
    // ruota l'osso (nel mondo) di q, tenendo conto del genitore
    const qGen = new Q(), qMondo = new Q();
    function giraNelMondo(o, q) {
      o.getWorldQuaternion(qMondo);
      o.parent.getWorldQuaternion(qGen);
      o.quaternion.copy(qGen.invert().multiply(q.multiply(qMondo)));
      o.updateMatrixWorld(true);
    }
    function punta(o, da, a) { giraNelMondo(o, new Q().setFromUnitVectors(da.normalize(), a.normalize())); }
    function tieni(palla, peso, yaw) {
      const avanti = new W(Math.sin(yaw), 0, Math.cos(yaw)), su = new W(0, 1, 0);
      const fianco = new W(Math.cos(yaw), 0, -Math.sin(yaw));          // verso la sinistra del giocatore
      const ditaVoluto = avanti.clone().multiplyScalar(.55).addScaledVector(su, .83).normalize();
      ["Left", "Right"].forEach(function (lato, i) {
        const spalla = trova(lato + "Arm"), gomito = trova(lato + "ForeArm"), polso = trova(lato + "Hand");
        if (!spalla || !gomito || !polso || !verso[lato]) return;
        const s = i === 0 ? 1 : -1;
        const prima = [spalla.quaternion.clone(), gomito.quaternion.clone(), polso.quaternion.clone()];
        // dove deve stare il polso: il palmo sul fianco del pallone, un po' dietro il centro
        const lato3 = fianco.clone().multiplyScalar(s);
        const contatto = palla.clone().addScaledVector(lato3, .11 + .025).addScaledVector(avanti, -.03);
        const meta = contatto.clone().addScaledVector(ditaVoluto, -.075);
        const A = osso(lato + "Arm"), B = osso(lato + "ForeArm"), C = osso(lato + "Hand");
        const l1 = A.distanceTo(B), l2 = B.distanceTo(C);
        const dir = meta.clone().sub(A);
        const d = Math.min(Math.max(dir.length(), Math.abs(l1 - l2) + .01), (l1 + l2) * .995);
        dir.normalize();
        // il gomito: in basso e un po' in fuori
        const polo = A.clone().addScaledVector(lato3, .35).addScaledVector(su, -.8).addScaledVector(avanti, .05).sub(A);
        polo.addScaledVector(dir, -polo.dot(dir)).normalize();
        const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
        const E = A.clone().addScaledVector(dir, a).addScaledVector(polo, h);
        punta(spalla, B.clone().sub(A), E.clone().sub(A));
        const B2 = osso(lato + "ForeArm"), C2 = osso(lato + "Hand");
        punta(gomito, C2.clone().sub(B2), A.clone().addScaledVector(dir, d).sub(B2));
        // la mano: dita in avanti e in alto, palmo verso il pallone
        const ora = assi(lato);
        punta(polso, ora.dita.clone(), ditaVoluto.clone());
        const ora2 = assi(lato);
        const palmoVoluto = lato3.clone().negate().addScaledVector(ditaVoluto, -lato3.clone().negate().dot(ditaVoluto)).normalize();
        punta(polso, ora2.palmo.addScaledVector(ditaVoluto, -ora2.palmo.dot(ditaVoluto)), palmoVoluto);
        // le dita quasi distese, appoggiate sul pallone
        ditaDistese.forEach(function (d) { if (d[0].name.indexOf(lato + "Hand") >= 0) d[0].quaternion.slerp(d[1], .75 * peso); });
        // fusione con il movimento registrato
        if (peso < 1) {
          [spalla, gomito, polso].forEach(function (o, j) { o.quaternion.copy(prima[j].slerp(o.quaternion.clone(), peso)); });
          spalla.updateMatrixWorld(true);
        }
      });
    }
    // (le matrici delle ossa sono già aggiornate da metti: qui si leggono e basta)
    function osso(nome) { return new THREE.Vector3().setFromMatrixPosition(trova(nome).matrixWorld); }
    function sbiadisci(v) {
      materiali.forEach(function (m) { m.opacity = v; m.transparent = v < 1 || /hair/i.test(m.name); m.depthWrite = v >= 1; });
    }
    return { radice: radice, metti: metti, osso: osso, sbiadisci: sbiadisci };
  }

  return { crea: crea, spostamento: spostamento, durata: durata };
}

// I guantoni del portiere: un modello 3D di guanti veri (assets/3d/guanti.glb, "Goalkeeper
// Galaxy Gloves" di cbarreiro su Sketchfab, licenza CC BY 4.0: il credito è nel piede della
// pagina Società). Dal paio si prende il sinistro (dorso col logo, palmo in lattice) e lo si
// fissa all'osso della mano; per la mano destra lo stesso guanto, specchiato. La mano del
// modello, sotto, si nasconde (non può "bucare" il guanto).
let guantoBase = null;               // la geometria del guanto sinistro, già pronta (vedi preparaGuanto)
function preparaGuanto(gltf) {
  let mesh = null;
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(function (m) { if (m.isMesh && !mesh) mesh = m; });
  const ge = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
  let pos = ge.attributes.position;
  const ix = ge.index.array, tieni = [];
  for (let t = 0; t < ix.length; t += 3) {             // solo i triangoli del guanto di sinistra (x < 0)
    if (pos.getX(ix[t]) < 0 && pos.getX(ix[t + 1]) < 0 && pos.getX(ix[t + 2]) < 0) tieni.push(ix[t], ix[t + 1], ix[t + 2]);
  }
  // solo i punti del guanto sinistro (gli altri resterebbero nella geometria, inutili)
  const nuovoIndice = new Int32Array(pos.count).fill(-1), usati = [];
  tieni.forEach(function (i) { if (nuovoIndice[i] < 0) { nuovoIndice[i] = usati.length; usati.push(i); } });
  Object.keys(ge.attributes).forEach(function (nome) {
    const a = ge.attributes[nome], out = new Float32Array(usati.length * a.itemSize);
    const leggi = [a.getX, a.getY, a.getZ, a.getW];      // (gli attributi possono essere "intrecciati")
    usati.forEach(function (i, j) { for (let c = 0; c < a.itemSize; c++) out[j * a.itemSize + c] = leggi[c].call(a, i); });
    ge.setAttribute(nome, new THREE.BufferAttribute(out, a.itemSize));
  });
  ge.setIndex(tieni.map(function (i) { return nuovoIndice[i]; }));
  pos = ge.attributes.position;
  // il riquadro del guanto: le dita verso +y, il dorso verso +z, il pollice verso +x
  const min = new THREE.Vector3(Infinity, Infinity, Infinity), max = min.clone().negate();
  for (let i = 0; i < pos.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(pos, i); min.min(v); max.max(v); }
  const alto = max.y - min.y;
  const polso = min.y + alto * .3;                     // il polso: in cima al polsino
  // al centro del polsino (non del riquadro, che il pollice sposta di lato): così il polsino
  // si infila dritto sull'avambraccio
  let cx = 0, cz = 0, cn = 0;
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) < polso) { cx += pos.getX(i); cz += pos.getZ(i); cn++; }
  ge.translate(-cx / cn, -polso, -cz / cn);
  guantoBase = { geometria: ge, materiale: mesh.material, lunghezza: max.y - polso };
}

function mettiGuanti(corpo, materiali) {
  if (!guantoBase) return;
  corpo.updateMatrixWorld(true);
  const V = THREE.Vector3;
  const osso = function (nome) { return corpo.getObjectByName("mixamorig5" + nome); };
  const dove = function (nome) { return new V().setFromMatrixPosition(osso(nome).matrixWorld); };
  const leggi = function (a, i, j) { return j === 0 ? a.getX(i) : j === 1 ? a.getY(i) : j === 2 ? a.getZ(i) : a.getW(i); };
  // 1. il pezzo del modello con la pelle delle mani (il corpo) e quanto ogni punto è "mano"
  let pelle = null, piuMani = 0, quantoPelle = null;
  const pezzi = [];                                      // tutti i pezzi: per misurare il braccio
  corpo.traverse(function (m) {
    if (!m.isSkinnedMesh || !m.geometry.index) return;
    pezzi.push(m);
    if (!m.skeleton.bones.some(function (b) { return /HandMiddle3$/.test(b.name); })) return;
    const si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
    const diMano = m.skeleton.bones.map(function (b) { return /Hand/.test(b.name); });
    const quanto = new Float32Array(si.count);
    let mani = 0;
    for (let i = 0; i < si.count; i++) {
      for (let j = 0; j < 4; j++) if (diMano[leggi(si, i, j)]) quanto[i] += leggi(sw, i, j);
      if (quanto[i] > .5) mani++;
    }
    if (mani > piuMani) { pelle = m; piuMani = mani; quantoPelle = quanto; }
  });
  if (!pelle) return;
  // la mano nuda, sotto il guanto, non si disegna (la manica e il resto del corpo sì)
  (function () {
    const ge = pelle.geometry, ix = ge.index.array, gruppi = [[], []];
    for (let t = 0; t < ge.index.count; t += 3) {
      const a = ix[t], b = ix[t + 1], c = ix[t + 2];
      gruppi[(quantoPelle[a] + quantoPelle[b] + quantoPelle[c]) / 3 > .3 ? 1 : 0].push(a, b, c);
    }
    const nuova = ge.clone();                            // una geometria sua: gli altri giocatori hanno le mani
    nuova.setIndex(gruppi[0].concat(gruppi[1]));
    nuova.clearGroups();
    nuova.addGroup(0, gruppi[0].length, 0);
    nuova.addGroup(gruppi[0].length, gruppi[1].length, 1);
    pelle.geometry = nuova;
    pelle.material = [pelle.material, new THREE.MeshBasicMaterial({ visible: false })];
  })();
  const materiale = guantoBase.materiale.clone();
  materiale.side = THREE.DoubleSide;                     // dentro il polsino si vede l'interno, non il vuoto
  materiali.push(materiale);
  const ossa = pelle.skeleton.bones;
  const versoPelle = pelle.matrixWorld.clone().invert();
  // i punti di tutto il modello (corpo, maglia…) nella posa di partenza: per misurare il braccio
  const punti = [];
  pezzi.forEach(function (m) {
    const p = m.geometry.attributes.position, w = new V();
    for (let i = 0; i < p.count; i++) punti.push(w.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m.matrixWorld).clone());
  });

  // 2. un guanto per mano, cucito sul braccio:
  //    - il polsino abbraccia l'avambraccio (e la manica) e lo segue;
  //    - dal polso in su ogni punto del guanto segue l'osso più vicino (palmo, falangi di
  //      ogni dito), come la pelle del modello: le dita del guanto si piegano con le dita.
  ["Left", "Right"].forEach(function (lato) {
    if (!osso(lato + "Hand") || !osso(lato + "HandMiddle4")) return;
    // gli assi della mano, nella posa di partenza: dita, dorso, pollice
    const P = dove(lato + "Hand");
    const dita = dove(lato + "HandMiddle1").sub(P).normalize();
    const largo = dove(lato + "HandIndex1").sub(dove(lato + "HandPinky1"));
    const dorso = new V().crossVectors(largo, dita).normalize();
    if (dorso.y < 0) dorso.negate();                     // nella posa a T i palmi guardano in basso: il dorso in alto
    dita.addScaledVector(dorso, -dita.dot(dorso)).normalize();
    const pollice = new V().crossVectors(dita, dorso);   // per la sinistra è il lato del pollice
    const specchio = pollice.dot(dove(lato + "HandThumb1").sub(P)) < 0;   // mano destra: guanto specchiato
    if (specchio) pollice.negate();
    // la misura: dal polso alla punta del medio, più lo spessore dell'imbottitura
    const lungo = P.distanceTo(dove(lato + "HandMiddle1")) + dove(lato + "HandMiddle1").distanceTo(dove(lato + "HandMiddle4"));
    const k = lungo * 1.08 / guantoBase.lunghezza;
    const mondo = new THREE.Matrix4().makeBasis(pollice.clone().multiplyScalar(k), dita.clone().multiplyScalar(k), dorso.clone().multiplyScalar(k)).setPosition(P);
    const ge = guantoBase.geometria.clone().applyMatrix4(mondo);   // nel mondo, mano in posa di partenza (normali comprese)
    if (specchio) {                                      // lo specchio rovescia i triangoli: si rimettono dritti
      const a = ge.index.array;
      for (let t = 0; t < a.length; t += 3) { const x = a[t + 1]; a[t + 1] = a[t + 2]; a[t + 2] = x; }
    }
    const pos = ge.attributes.position, nor = ge.attributes.normal, n = pos.count;
    const v = new V(), q = new V();

    // l'asse dell'avambraccio (gomito → polso) e quanto è largo il braccio, fetta per fetta
    const G = dove(lato + "ForeArm"), asse = P.clone().sub(G).normalize();
    const FETTA = .01, larghezza = {}, guantoLargo = {};
    const fetta = function (p) { return Math.round(q.copy(p).sub(P).dot(asse) / FETTA); };
    const raggio = function (p) { q.copy(p).sub(P); return q.addScaledVector(asse, -q.dot(asse)).length(); };
    punti.forEach(function (p) {
      const f = fetta(p);
      if (f < -14 || f > 1) return;
      const r = raggio(p);
      if (r < .07) larghezza[f] = Math.max(larghezza[f] || 0, r);   // il punto più esterno (la manica)
    });
    const polsino = [];                                  // i punti del polsino: sotto il polso
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      const f = fetta(v);
      if (f > 0) continue;
      polsino.push(i);
      const r = raggio(v);
      guantoLargo[f] = (guantoLargo[f] || [0, 0]); guantoLargo[f][0] += r; guantoLargo[f][1]++;
    }
    // la fodera interna del polsino (le facce che guardano verso il braccio) si toglie: è
    // lei che, stretta sul braccio, spunterebbe a punte dal bordo
    const fodera = new Uint8Array(n), nn = new V();
    polsino.forEach(function (i) {
      v.fromBufferAttribute(pos, i);
      q.copy(v).sub(P);
      q.addScaledVector(asse, -q.dot(asse)).normalize();
      nn.fromBufferAttribute(nor, i);
      if (nn.dot(q) < -.2) fodera[i] = 1;
    });
    const ixG = ge.index.array, restano = [];
    for (let t = 0; t < ixG.length; t += 3) if (!(fodera[ixG[t]] && fodera[ixG[t + 1]] && fodera[ixG[t + 2]])) restano.push(ixG[t], ixG[t + 1], ixG[t + 2]);
    ge.setIndex(restano);
    // il polsino: un anello dritto e pulito attorno al braccio, appena più largo della manica
    // (non segue le curve del braccio, se no sembra un calzino)
    let braccioMax = 0;
    for (let f = -9; f <= 0; f++) if (larghezza[f]) braccioMax = Math.max(braccioMax, larghezza[f]);
    // il bordo: dove finisce il polsino del modello, pareggiato (i punti più bassi salgono
    // tutti alla stessa altezza: un taglio dritto, senza frange)
    let fondoModello = 0;
    polsino.forEach(function (i) { v.fromBufferAttribute(pos, i); fondoModello = Math.max(fondoModello, -q.copy(v).sub(P).dot(asse)); });
    const FONDO = fondoModello - .008;
    polsino.forEach(function (i) {
      v.fromBufferAttribute(pos, i);
      const f = fetta(v);
      if (!guantoLargo[f]) return;
      let lungoA = q.copy(v).sub(P).dot(asse);
      if (lungoA < -FONDO) lungoA = -FONDO;
      const c = P.clone().addScaledVector(asse, q.copy(v).sub(P).dot(asse));
      const radiale = v.clone().sub(c), r = radiale.length();
      const medio = guantoLargo[f][0] / guantoLargo[f][1];
      const t = Math.min(1, -lungoA / FONDO);            // 0 al polso, 1 al bordo
      const verso0 = Math.min(1, t * 2.5);               // vicino al polso il guanto resta com'è
      const voluto = (braccioMax + .008 + .003 * t) * Math.pow(r / medio, .3 * (1 - t) + .04 * t);
      const nuovo = r + (voluto - r) * verso0;
      v.copy(P).addScaledVector(asse, lungoA).addScaledVector(radiale, nuovo / r);
      pos.setXYZ(i, v.x, v.y, v.z);
    });

    // i pesi: il polsino va con l'avambraccio, la mano con le sue ossa
    const tratti = [];
    ["Index1", "Middle1", "Ring1", "Pinky1"].forEach(function (nn) { tratti.push(["Hand", "Hand", "Hand" + nn]); });
    ["Thumb", "Index", "Middle", "Ring", "Pinky"].forEach(function (d) {
      for (let f = 1; f <= 3; f++) tratti.push(["Hand" + d + f, "Hand" + d + f, "Hand" + d + (f + 1), f === 3]);
    });
    const seg = tratti.map(function (t) {
      const a = dove(lato + t[1]), b = dove(lato + t[2]);
      if (t[3]) b.sub(a).multiplyScalar(1.6).add(a);     // l'ultima falange: fino in punta al guanto
      return { i: ossa.indexOf(osso(lato + t[0])), a: a, ab: b.sub(a) };
    }).filter(function (s) { return s.i >= 0; });
    const iAvambraccio = ossa.indexOf(osso(lato + "ForeArm")), iMano = ossa.indexOf(osso(lato + "Hand"));
    const indici = new Uint16Array(n * 4), pesi = new Float32Array(n * 4);
    const morbido = lungo * .06;                         // quanto sfumano i pesi tra un osso e l'altro
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      const lungoAsse = q.copy(v).sub(P).dot(dita) / lungo;   // dove sta lungo la mano (0 = polso)
      // dal polsino alla mano: avambraccio → mano, sfumando attorno al polso
      const suBraccio = Math.min(1, Math.max(0, (.06 - lungoAsse) / .18));
      const d = seg.map(function (s) {
        const u = Math.min(1, Math.max(0, q.copy(v).sub(s.a).dot(s.ab) / s.ab.lengthSq()));
        return { i: s.i, d: q.copy(s.a).addScaledVector(s.ab, u).distanceTo(v) };
      }).sort(function (x, y) { return x.d - y.d; });
      const presi = [];                                  // i più vicini (un osso compare una volta sola)
      for (let j = 0; j < d.length && presi.length < 3; j++) if (!presi.some(function (p) { return p.i === d[j].i; })) presi.push(d[j]);
      let somma = 0;
      presi.forEach(function (p) { p.w = Math.exp(-(p.d - presi[0].d) / morbido * 3); somma += p.w; });
      // vicino al polso la mano conta tutta sull'osso della mano (niente dita che tirano il polsino)
      const vicinoPolso = Math.min(1, Math.max(0, (.28 - lungoAsse) / .2));
      presi.forEach(function (p) { p.w = p.w / somma * (1 - vicinoPolso); });
      presi.push({ i: iMano, w: vicinoPolso });
      const finali = [{ i: iAvambraccio, w: suBraccio }];
      presi.forEach(function (p) {
        const w = p.w * (1 - suBraccio), gia = finali.find(function (x) { return x.i === p.i; });
        if (gia) gia.w += w; else finali.push({ i: p.i, w: w });
      });
      finali.sort(function (x, y) { return y.w - x.w; });
      let tot = 0;
      for (let j = 0; j < 4 && j < finali.length; j++) tot += finali[j].w;
      for (let j = 0; j < 4 && j < finali.length; j++) { indici[i * 4 + j] = finali[j].i; pesi[i * 4 + j] = finali[j].w / tot; }
    }
    ge.applyMatrix4(versoPelle);                         // nelle coordinate del corpo del modello
    ge.setAttribute("skinIndex", new THREE.BufferAttribute(indici, 4));
    ge.setAttribute("skinWeight", new THREE.BufferAttribute(pesi, 4));
    const guanto = new THREE.SkinnedMesh(ge, materiale);
    guanto.castShadow = true;
    guanto.frustumCulled = false;
    guanto.position.copy(pelle.position); guanto.quaternion.copy(pelle.quaternion); guanto.scale.copy(pelle.scale);
    pelle.parent.add(guanto);
    guanto.bind(pelle.skeleton, pelle.bindMatrix);
  });
}
