/* ==================================================================
   A.C. Castelverde — js/giocatori-3d.js
   Il calciatore 3D della storia (pagina Società): un modello realistico
   con i movimenti registrati da calciatori veri (motion capture Mixamo),
   in assets/3d/calciatore.glb (personaggio e movimenti in un solo file).

     caricaCalciatori(url) → Promise di un "modello" con:
       crea({ tinta })                       un nuovo giocatore (copia del modello)
       spostamento(movimento, t)             quanto si è spostato il corpo al tempo t
       durata(movimento)                     quanto dura un movimento (secondi)

     crea({ tinta, guanti: true })          un portiere: i guantoni seguono mani e dita

     ogni giocatore creato ha:
       radice                                il gruppo da aggiungere alla scena
       metti([{ movimento, t, peso, origine, yaw }])
                                             lo mette nella posa: uno o più movimenti
                                             fusi insieme (peso), ognuno al suo tempo t
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
    const finito = function (gltf) { fatto(preparaCalciatori(gltf)); };
    if (window.CALCIATORE_3D) {
      const binario = atob(window.CALCIATORE_3D);
      const byte = new Uint8Array(binario.length);
      for (let i = 0; i < binario.length; i++) byte[i] = binario.charCodeAt(i);
      caricatore.parse(byte.buffer, "", finito, errore);
    } else {
      caricatore.load(url, finito, undefined, errore);
    }
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
    function metti(stati) {
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

// I guantoni del portiere: pezzi attaccati alle ossa della mano (palmo, dita, polsino),
// così seguono ogni movimento registrato, anche le dita.
function mettiGuanti(corpo, materiali) {
  corpo.updateMatrixWorld(true);
  const guanto = new THREE.MeshStandardMaterial({ color: "#2b2d30", roughness: .75 });
  const polsino = new THREE.MeshStandardMaterial({ color: "#f2f2f2", roughness: .6 });
  materiali.push(guanto, polsino);
  const V = THREE.Vector3;
  function pezzo(geo, mat, osso) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    osso.add(m);
    return m;
  }
  ["Left", "Right"].forEach(function (lato) {
    const mano = corpo.getObjectByName("mixamorig5" + lato + "Hand");
    if (!mano) return;
    const scala = mano.getWorldScale(new V()).x || 1;       // le ossa possono essere in centimetri
    const m = function (metri) { return metri / scala; };
    const dito = function (nome, i) { return corpo.getObjectByName("mixamorig5" + lato + "Hand" + nome + i); };
    // le dita (e il pollice): un cilindro arrotondato per ogni falange
    ["Thumb", "Index", "Middle", "Ring", "Pinky"].forEach(function (nome) {
      for (let i = 1; i <= 3; i++) {
        const osso = dito(nome, i), dopo = dito(nome, i + 1);
        if (!osso || !dopo) continue;
        const lungo = dopo.position.length();
        const r = m(nome === "Thumb" ? .0135 : .0125);
        const p = pezzo(new THREE.CapsuleGeometry(r, Math.max(lungo - r, r * .2), 4, 10), guanto, osso);
        p.position.copy(dopo.position).multiplyScalar(.5);
        p.quaternion.setFromUnitVectors(new V(0, 1, 0), dopo.position.clone().normalize());
      }
    });
    // il palmo: un ovale schiacciato tra il polso e la base delle dita
    const indice = dito("Index", 1), medio = dito("Middle", 1), mignolo = dito("Pinky", 1);
    if (indice && medio && mignolo) {
      const su = medio.position.clone().normalize();
      const largo = indice.position.clone().sub(mignolo.position);
      const lato2 = largo.clone().addScaledVector(su, -largo.dot(su)).normalize();
      const fuori = new V().crossVectors(lato2, su).normalize();
      const palmo = pezzo(new THREE.SphereGeometry(1, 18, 12), guanto, mano);
      palmo.position.copy(medio.position).multiplyScalar(.5);
      palmo.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(lato2, su, fuori));
      palmo.scale.set(largo.length() / 2 + m(.016), medio.position.length() * .62, m(.026));
    }
    // il polsino
    const cuff = pezzo(new THREE.CylinderGeometry(m(.041), m(.037), m(.06), 16), polsino, mano);
    cuff.position.y = m(-.012);
  });
}
