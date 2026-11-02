#!/usr/bin/env python3
"""Aggiorna calendario, risultati e classifiche del sito da Tuttocampo.

    cd strumenti
    python3 aggiorna_risultati.py                 # legge Tuttocampo e aggiorna il sito
    python3 aggiorna_risultati.py --solo-archivio # rifà il sito con i dati già letti, senza internet

Cosa fa:
  1. per ogni squadra (calendari_lnd.py) legge su Tuttocampo le giornate già
     giocate e la prossima; le giornate complete restano salvate in
     strumenti/archivio/ e non vengono rilette;
  2. per ogni partita del Castelverde prende da Tuttocampo data, ora, campo
     di casa/trasferta, risultato e marcatori; per le partite future usa il
     calendario ufficiale LND;
  3. scarica i loghi degli avversari (originali in alta risoluzione) in
     assets/img/avversari/<nome-squadra>.webp, se non ci sono già;
  4. calcola la classifica di ogni girone dai risultati;
  5. riscrive js/dati/partite.js (da NON modificare a mano).

Richiede solo Python 3 e curl. Va un po' piano di proposito (6 secondi tra
una richiesta e l'altra): se Tuttocampo mette in pausa le richieste, il
programma si ferma, salva quello che ha letto e al giro dopo riparte da lì.
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
SITO = os.path.dirname(QUI)
sys.path.insert(0, QUI)

import tuttocampo                      # noqa: E402
from calendari_lnd import SQUADRE, CAMPO_CASTELVERDE   # noqa: E402

ARCHIVIO = os.path.join(QUI, "archivio")
LOGHI = os.path.join(SITO, "assets", "img", "avversari")
LATO_LOGO = 180   # px: gli stemmi nel sito sono larghi al massimo 88 px, 180 basta anche per gli schermi retina
USCITA = os.path.join(SITO, "js", "dati", "partite.js")
GIORNI_AVANTI = 8          # legge anche le giornate dei prossimi 8 giorni (orari e campi aggiornati)
GIORNI_RILETTURA = 10      # una giornata non conclusa viene riletta per 10 giorni (risultati inseriti in ritardo)
# Nota: Tuttocampo blocca chi fa più di ~20 richieste di fila. Con queste impostazioni
# un aggiornamento settimanale legge circa 2 giornate per squadra (16 richieste).


def chiave(nome):
    return re.sub(r"[^a-z]", "", (nome or "").lower())


def stessa_squadra(a, b):
    """'Pol. San Biagio' = 'San Biagio', 'Sangiuliano CVS' = 'Sangiuliano', 'Primavera Bassa' = 'Primavera Bassa Cremonese'…"""
    ka, kb = chiave(a), chiave(b)
    if not ka or not kb:
        return False
    if ka in kb or kb in ka:
        return True
    # parole significative di uno dei due nomi tutte presenti nell'altro (si prova nei due versi:
    # "Pol. San Giovanni" = "Polisportiva San Giovanni")
    comuni = ("calcio", "oratorio", "polisportiva")
    for x, ky in ((a, kb), (b, ka)):
        parole = [p for p in re.findall(r"[a-z]{4,}", (x or "").lower()) if p not in comuni]
        if parole and all(p in ky for p in parole):
            return True
    return False


def e_castelverde(nome):
    return "castelverde" in chiave(nome)


def giorno_prima(iso):
    return (dt.date.fromisoformat(iso) - dt.timedelta(days=1)).isoformat()


def nome_file(nome):
    """'Polisportiva San Giovanni' -> 'polisportiva-san-giovanni'"""
    return re.sub(r"[^a-z0-9]+", "-", (nome or "").lower()).strip("-")


def scarica_logo(team_id, nome):
    """Logo della squadra in assets/img/avversari/<nome-squadra>.webp.

    Se il file c'è già (anche messo a mano, es. un logo migliore trovato sul sito
    del club, .webp o .png) si usa quello. Altrimenti si scarica l'ORIGINALE da
    Tuttocampo (alta risoluzione) e lo si prepara come gli altri: bordi vuoti
    tagliati, sfondo trasparente, al massimo LATO_LOGO px, formato WebP (leggero).
    Lo stesso club in categorie diverse usa lo stesso file."""
    os.makedirs(LOGHI, exist_ok=True)
    for estensione in (".webp", ".png"):
        if os.path.exists(os.path.join(LOGHI, nome_file(nome) + estensione)):
            return "assets/img/avversari/" + nome_file(nome) + estensione
    nome_png = nome_file(nome) + ".webp"
    file = os.path.join(LOGHI, nome_png)
    tmp = file + ".scaricato"
    for misura in ("Original", "500", "200"):
        r = subprocess.run(["curl", "-sS", "-m", "30", "-A", tuttocampo.UA, "-o", tmp, "-w", "%{http_code}",
                            "https://b2-content.tuttocampo.it/Teams/%s/%d.png" % (misura, team_id)],
                           capture_output=True, text=True)
        if r.stdout == "200" and os.path.getsize(tmp) > 500:
            break
    else:
        if os.path.exists(tmp):
            os.remove(tmp)
        return ""
    try:
        from PIL import Image, ImageDraw
        im = Image.open(tmp).convert("RGBA")
        W, H = im.size
        angoli = [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1)]
        if all(im.getpixel(p)[3] > 200 for p in angoli):          # sfondo pieno -> trasparente
            c = im.getpixel((0, 0))
            for p in angoli:
                ImageDraw.floodfill(im, p, (c[0], c[1], c[2], 0), thresh=40)
        bordo = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
        if bordo:
            im = im.crop(bordo)
        im.thumbnail((LATO_LOGO, LATO_LOGO), Image.LANCZOS)
        im.save(file, "WEBP", quality=90, method=6)
        os.remove(tmp)
    except ImportError:                                           # senza Pillow si tiene il PNG com'è
        nome_png = nome_file(nome) + ".png"
        os.replace(tmp, os.path.join(LOGHI, nome_png))
    print("  nuovo logo:", nome_png)
    return "assets/img/avversari/" + nome_png


def ritirata(nome, cfg):
    return any(stessa_squadra(nome, r) for r in cfg["ritirate"])


def leggi_tuttocampo(sq, cfg, oggi):
    """Partite del girone su Tuttocampo, dalla 1ª giornata fino a quella dei prossimi giorni."""
    G = cfg["giornate"]
    date = {}
    for (k, da, dr, *_r) in cfg["calendario"]:
        date[k], date[k + G] = da, dr
    limite = (oggi + dt.timedelta(days=GIORNI_AVANTI)).isoformat()
    ultima = max([n for n, d in date.items() if d <= limite] or [0])
    if not ultima:
        return []

    os.makedirs(ARCHIVIO, exist_ok=True)
    archivio = os.path.join(ARCHIVIO, sq + ".json")
    gia = json.load(open(archivio)) if os.path.exists(archivio) else {}
    # rilegge le giornate recenti non concluse (partite da giocare, rinviate, risultati non ancora inseriti)
    da_rileggere = (oggi - dt.timedelta(days=GIORNI_RILETTURA)).isoformat()
    for n, partite in list(gia.items()) if "--solo-archivio" not in sys.argv else []:
        if date.get(int(n), "") >= da_rileggere and any(p["gol_casa"] is None for p in partite):
            del gia[n]
    if "--solo-archivio" in sys.argv:
        return [x for n in range(1, ultima + 1) for x in gia.get(str(n), [])]
    json.dump(gia, open(archivio, "w"), ensure_ascii=False)

    try:
        return tuttocampo.leggi_girone(cfg["tuttocampo"], range(1, ultima + 1), archivio)
    except tuttocampo.Bloccato as e:
        print("  ⚠", e)
        gia = json.load(open(archivio))
        return [x for n in range(1, ultima + 1) for x in gia.get(str(n), [])]


def partite_squadra(sq, cfg, tc):
    G = cfg["giornate"]
    risultato = []
    # tutte le squadre del girone viste su Tuttocampo: servono per dare nome e logo
    # giusti anche alle partite future (es. "San Biagio" -> "San Biagio", logo tc-…)
    squadre_tc = {}
    for x in tc:
        for lato in ("casa", "ospite"):
            squadre_tc[x[lato]["nome"]] = x[lato]["id"]
    for (k, da, dr, avversario, casa_andata) in cfg["calendario"]:
        if avversario is None:
            continue                      # turno di riposo
        for n, data_lnd, in_casa in ((k, da, casa_andata), (k + G, dr, not casa_andata)):
            if ritirata(avversario, cfg):
                continue
            # la partita su Tuttocampo (stessa giornata, c'è il Castelverde)
            m = next((x for x in tc if x["giornata"] == n and
                      (e_castelverde(x["casa"]["nome"]) or e_castelverde(x["ospite"]["nome"]))), None)
            if m:
                casa = e_castelverde(m["casa"]["nome"])
                loro = m["ospite"] if casa else m["casa"]
                if ritirata(loro["nome"], cfg):
                    continue
                nome_avv = loro["nome"]
                stemma = scarica_logo(loro["id"], loro["nome"])
                data, ora = m["data"] or data_lnd, m["ora"]
                gol_n = m["gol_casa"] if casa else m["gol_ospite"]
                gol_l = m["gol_ospite"] if casa else m["gol_casa"]
                marc_n = m["marcatori_casa"] if casa else m["marcatori_ospite"]
                marc_l = m["marcatori_ospite"] if casa else m["marcatori_casa"]
                stato = m["stato"]
            else:
                casa, nome_avv, stemma = in_casa, avversario, ""
                nome_tc = next((n for n in squadre_tc if stessa_squadra(n, avversario) and not e_castelverde(n)), None)
                if nome_tc:
                    nome_avv, stemma = nome_tc, scarica_logo(squadre_tc[nome_tc], nome_tc)
                data, ora, gol_n, gol_l, marc_n, marc_l, stato = data_lnd, "", None, None, [], [], ""

            # campo e orario di riferimento dal calendario ufficiale
            if casa:
                campo, ora_lnd, sabato = cfg["casa"]
            else:
                chiave_campo = next((c for c in cfg["campi"] if stessa_squadra(c, nome_avv) or stessa_squadra(c, avversario)), None)
                campo, ora_lnd, sabato = cfg["campi"].get(chiave_campo, ("Campo da definire", "", ""))
            if not m and sabato == "sab" and dt.date.fromisoformat(data).weekday() == 6:
                data = giorno_prima(data)
            ora = ora or ora_lnd or "orario ufficiale"

            p = {
                "squadra": sq, "giornata": n, "data": data, "ora": ora,
                "competizione": "%s · %dª giornata" % (cfg["competizione"].split(" · ")[0], n),
                "casa": casa, "avversario": nome_avv, "stemma": stemma, "campo": campo,
                "golNostri": gol_n, "golLoro": gol_l,
            }
            if marc_n or marc_l:
                p["marcatori"] = {"nostri": marc_n, "loro": marc_l}
            if stato and gol_n is None and "giocare" not in stato.lower():
                p["nota"] = stato           # es. "Rinviata", "Sospesa"
            risultato.append(p)
    return sorted(risultato, key=lambda p: p["data"])


def classifica(tc, cfg):
    tab = {}
    for x in tc:
        if x["gol_casa"] is None:
            continue
        if ritirata(x["casa"]["nome"], cfg) or ritirata(x["ospite"]["nome"], cfg):
            continue
        for lato, gf, gs in (("casa", x["gol_casa"], x["gol_ospite"]), ("ospite", x["gol_ospite"], x["gol_casa"])):
            s = tab.setdefault(x[lato]["id"], {"nome": x[lato]["nome"], "id": x[lato]["id"],
                                                "pt": 0, "g": 0, "v": 0, "n": 0, "p": 0, "gf": 0, "gs": 0})
            s["g"] += 1; s["gf"] += gf; s["gs"] += gs
            if gf > gs: s["v"] += 1; s["pt"] += 3
            elif gf == gs: s["n"] += 1; s["pt"] += 1
            else: s["p"] += 1
    righe = sorted(tab.values(), key=lambda s: (-s["pt"], -(s["gf"] - s["gs"]), -s["gf"], s["nome"]))
    for s in righe:
        s["noi"] = e_castelverde(s["nome"])
        s["stemma"] = "" if s["noi"] else scarica_logo(s["id"], s["nome"])
        del s["id"]
    return righe


def scrivi_js(partite, classifiche, oggi):
    righe = ",\n".join("  " + json.dumps(p, ensure_ascii=False) for p in partite)
    js = """/* ==================================================================
   A.C. Castelverde — js/dati/partite.js
   ⚠ FILE GENERATO: non modificarlo a mano, verrebbe sovrascritto.
   Lo scrive strumenti/aggiorna_risultati.py unendo i calendari ufficiali
   LND (strumenti/calendari_lnd.py) e i risultati di Tuttocampo.
   Per correggere un dato: cambia calendari_lnd.py e rilancia il programma.

   Aggiornato il %s
   ================================================================== */

const AGGIORNAMENTO = "%s";
const CAMPO_CASA = %s;

const PARTITE = [
%s
];

// Classifiche calcolate dai risultati (squadra -> righe in ordine)
const CLASSIFICHE = %s;

// Compatibilità: la classifica della prima squadra
const CLASSIFICA = CLASSIFICHE["prima-squadra"];
""" % (oggi.strftime("%d/%m/%Y"), oggi.strftime("%d/%m/%Y"), json.dumps(CAMPO_CASTELVERDE, ensure_ascii=False), righe,
       json.dumps(classifiche, ensure_ascii=False, indent=2))
    open(USCITA, "w", encoding="utf-8").write(js)


def main():
    oggi = dt.date.today()
    tutte, classifiche, riepilogo = [], {}, []
    for sq, cfg in SQUADRE.items():
        print("•", sq)
        tc = leggi_tuttocampo(sq, cfg, oggi)
        partite = partite_squadra(sq, cfg, tc)
        tutte += partite
        classifiche[sq] = {
            "titolo": cfg["competizione"],
            "aggiornata": oggi.isoformat(),
            "linkUfficiale": cfg["tuttocampo"] + "/Classifica",
            "squadre": classifica(tc, cfg),
        }
        # risultati dell'ultima settimana, per il riepilogo
        settimana = (oggi - dt.timedelta(days=7)).isoformat()
        for p in partite:
            if p["golNostri"] is not None and p["data"] >= settimana:
                a, b = ("Castelverde", p["avversario"]) if p["casa"] else (p["avversario"], "Castelverde")
                ga, gb = (p["golNostri"], p["golLoro"]) if p["casa"] else (p["golLoro"], p["golNostri"])
                riepilogo.append("%s: %s %d-%d %s" % (sq, a, ga, gb, b))
    scrivi_js(tutte, classifiche, oggi)
    print("\nScritto", USCITA, "-", len(tutte), "partite")
    print("Risultati dell'ultima settimana:\n  " + ("\n  ".join(riepilogo) or "nessuno"))


if __name__ == "__main__":
    main()
