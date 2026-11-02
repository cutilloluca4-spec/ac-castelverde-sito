"""Lettura di calendari e risultati da Tuttocampo (solo libreria standard di Python).

    leggi_girone(url_girone) -> lista di partite di TUTTO il girone:
      { giornata, data "AAAA-MM-GG", ora, casa:{id,nome}, ospite:{id,nome},
        gol_casa, gol_ospite (None se non giocata), stato, marcatori_casa, marcatori_ospite }

Usato da aggiorna_risultati.py. Tuttocampo carica i risultati con una
chiamata interna (ResultsView.php) dopo aver aperto la pagina della giornata:
qui si fa la stessa cosa, con una pausa tra le richieste per non pesare sul sito.
"""
import html, re, subprocess, tempfile, time

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Safari/605.1.15")
PAUSA = 8.0   # secondi tra una richiesta e l'altra (non abbassare: Tuttocampo blocca chi va troppo veloce)

MESI = {"gennaio": 1, "febbraio": 2, "marzo": 3, "aprile": 4, "maggio": 5, "giugno": 6, "luglio": 7,
        "agosto": 8, "settembre": 9, "ottobre": 10, "novembre": 11, "dicembre": 12}


class Bloccato(Exception):
    pass


class Sessione:
    """Scarica le pagine con curl (Tuttocampo risponde vuoto alle richieste
    fatte direttamente da Python) e conserva i cookie tra una richiesta e l'altra."""
    def __init__(self):
        self.cookie = tempfile.NamedTemporaryFile(prefix="tc_", suffix=".txt", delete=False).name

    def get(self, url, referer=None):
        cmd = ["curl", "-sSL", "--compressed", "-m", "30", "-c", self.cookie, "-b", self.cookie,
               "-A", UA, "-H", "Accept-Language: it-IT,it;q=0.9"]
        if referer:
            cmd += ["-H", "Referer: " + referer]
        r = subprocess.run(cmd + [url], capture_output=True)
        testo = r.stdout.decode("utf-8", "ignore")
        time.sleep(PAUSA)
        if r.returncode == 0 and len(testo) > 200:
            return testo
        # risposta vuota = Tuttocampo ha attivato la protezione anti-bot: ci si ferma, senza insistere
        raise Bloccato("Tuttocampo ha messo in pausa le richieste: riprovare più tardi (" + url + ")")


def pulisci(s):
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s))).strip()


def leggi_giornata(sess, url_girone, n):
    pagina = url_girone + "/Giornata%d" % n
    p = sess.get(pagina)
    tk = re.search(r"tckk='([a-f0-9]+)'", p).group(1)
    v = sess.get("https://www.tuttocampo.it/Web/Views/Results/ResultsView.php?tckk=%s&v=1" % tk, referer=pagina)
    totale = len(set(re.findall(r'data-match-day-id="(\d+)"', v)))
    intestazione = re.search(r"(\d+)\|(\d+)\|(\d{4})", v)
    anno_rif = int(intestazione.group(3)) if intestazione else None
    mese_rif = int(intestazione.group(2)) if intestazione else None

    partite, data_corrente = [], None
    corpo = v[v.find('<table class="tc-table table-results">'):]
    for blocco in re.findall(r'<tr class="(date|match[^"]*)"[^>]*>(.*?)</tr>', corpo, re.S):
        classe, cont = blocco
        if classe == "date":
            m = re.search(r"<span>\s*\w+\.?\s+(\d+)\s+(\w+)\s*</span>", cont)
            if m and anno_rif:
                g, mese = int(m.group(1)), MESI.get(m.group(2).lower(), 0)
                anno = anno_rif
                if mese_rif and mese < mese_rif - 6: anno += 1      # giornata a cavallo d'anno
                if mese_rif and mese > mese_rif + 6: anno -= 1
                data_corrente = "%04d-%02d-%02d" % (anno, mese, g)
            continue
        ora = re.search(r'class="hour[^"]*"[^>]*>\s*([^<]*?)\s*<', cont)
        squadre = re.findall(r'<td class="team (home|away)[^"]*" data-team-id="(\d+)">(.*?)</td>', cont, re.S)
        if len(squadre) != 2:
            continue
        info = {}
        for lato, tid, td in squadre:
            nome = pulisci((re.findall(r'class="team-name">(.*?)</a>', td, re.S) or [""])[0])
            gol = re.search(r'<span class="goal[^"]*"[^>]*title="([^"]*)"[^>]*>\s*([^<]*?)\s*</span>', td)
            marc = [pulisci(x) for x in re.findall(r'<li>(.*?)</li>', td, re.S)]
            info[lato] = {"id": int(tid), "nome": nome,
                          "gol": gol.group(2) if gol else "", "stato": gol.group(1) if gol else "",
                          "marcatori": [re.sub(r"\s*\(.*?\)", "", x).strip() for x in marc if x]}
        def numero(x):
            return int(x) if re.fullmatch(r"\d+", x or "") else None
        terminata = "terminata" in (info["home"]["stato"] or "").lower()
        partite.append({
            "giornata": n, "data": data_corrente, "ora": ora.group(1).strip() if ora else "",
            "casa": {"id": info["home"]["id"], "nome": info["home"]["nome"]},
            "ospite": {"id": info["away"]["id"], "nome": info["away"]["nome"]},
            "gol_casa": numero(info["home"]["gol"]) if terminata else None,
            "gol_ospite": numero(info["away"]["gol"]) if terminata else None,
            "stato": info["home"]["stato"],
            "marcatori_casa": info["home"]["marcatori"], "marcatori_ospite": info["away"]["marcatori"],
        })
    return partite, totale


def leggi_girone(url_girone, giornate, archivio=None):
    """Legge le giornate indicate. Se si passa un file "archivio" (JSON), le giornate
    già lette restano salvate lì: se Tuttocampo blocca a metà, al giro dopo si riparte
    da dove ci si era fermati invece di rileggere tutto."""
    import json, os
    gia = json.load(open(archivio)) if archivio and os.path.exists(archivio) else {}
    sess = Sessione()
    try:
        for n in giornate:
            if str(n) in gia:
                continue
            p, _ = leggi_giornata(sess, url_girone, n)
            gia[str(n)] = p
            if archivio:
                json.dump(gia, open(archivio, "w"), ensure_ascii=False)
    finally:
        pass
    return [x for n in giornate for x in gia.get(str(n), [])]
