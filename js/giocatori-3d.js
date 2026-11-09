/* ==================================================================
   A.C. Castelverde — js/giocatori-3d.js
   Il calciatore 3D della storia (pagina Società): un modello realistico
   con i movimenti registrati da calciatori veri (motion capture Mixamo),
   in assets/3d/calciatore.glb (personaggio e movimenti in un solo file).

     caricaCalciatori(url) → Promise di un "modello" con:
       crea({ tinta })                       un nuovo giocatore (copia del modello)
       spostamento(movimento, t)             quanto si è spostato il corpo al tempo t
       durata(movimento)                     quanto dura un movimento (secondi)

     ogni giocatore creato ha:
       radice                                il gruppo da aggiungere alla scena
       metti([{ movimento, t, peso, origine, yaw }])
                                             lo mette nella posa: uno o più movimenti
                                             fusi insieme (peso), ognuno al suo tempo t
       osso(nome)                            dov'è un osso nel mondo (Vector3)
       sbiadisci(0…1)                        trasparenza (se copre la telecamera)

   I movimenti nel file hanno lo spostamento del corpo incorporato (il
   giocatore corre davvero). Al caricamento lo si misura e lo si toglie
   (il movimento diventa "sul posto"): così due movimenti si fondono senza
   scatti e la scena sa sempre dove si trova il giocatore.
   ================================================================== */

// I movimenti usati (nomi dei file Mixamo, convertiti in assets/3d/calciatore.glb)
const MOVIMENTI = {
  attesa: "Soccer_Idle",              // in piedi, si muove appena (si usa solo il primo mezzo secondo)
  ricevi: "Receive_Soccerball",       // arriva di corsa e stoppa il pallone col destro
  passa: "Soccer_Pass",               // rincorsa e passaggio col destro
  tira: "Strike_Foward_Jog",          // tiro in corsa, di collo pieno
  esulta: "Soccer_Header",            // il salto a braccia alte (dal colpo di testa)
  difende: "Goalkeeper_Idle",         // pronto sulle gambe: gli avversari e il portiere
  tuffo: "Goalkeeper_Diving_Save"     // il tuffo del portiere (verso la sua sinistra)
};
// I momenti chiave dei movimenti (secondi), misurati sulla traiettoria del piede destro
const MOMENTI = {
  passaImpatto: .72,     // il destro colpisce il pallone
  tiroImpatto: .40,      // il collo del piede colpisce il pallone
  riceviContatto: .40,   // il destro tocca il pallone e lo ammortizza
  riceviFine: .95,       // il giocatore ha il pallone sotto controllo
  tuffoArrivo: 1.1       // il portiere è disteso in volo
};
const OSSA = {
  bacino: "mixamorig5Hips", testa: "mixamorig5Head",
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
    Object.keys(OSSA).forEach(function (k) { ossa[k] = corpo.getObjectByName(OSSA[k]); });

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
    function osso(nome) { return ossa[nome].getWorldPosition(new THREE.Vector3()); }
    function sbiadisci(v) {
      materiali.forEach(function (m) { m.opacity = v; m.transparent = v < 1 || /hair/i.test(m.name); m.depthWrite = v >= 1; });
    }
    return { radice: radice, metti: metti, osso: osso, sbiadisci: sbiadisci };
  }

  return { crea: crea, spostamento: spostamento, durata: durata };
}
