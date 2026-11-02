"""Calendari ufficiali LND 2026/27 delle squadre del Castelverde.

Trascritti dai calendari e dagli elenchi campi della Delegazione di Cremona
e del CRL Lombardia. Servono per le partite non ancora su Tuttocampo
(date, campo, orario); quando Tuttocampo ha la partita, i suoi dati
(data, ora, campo invertito, risultato) hanno la precedenza.

Per ogni squadra:
  tuttocampo   indirizzo del girone su Tuttocampo
  giornate     giornate di andata (il ritorno è la stessa giornata + giornate)
  calendario   (giornata, data andata, data ritorno, avversario, in casa all'andata)
               le date sono quelle del calendario (domenica o sabato)
  campi        avversario -> (campo, orario, "sab" se gioca in casa di sabato)
  casa         il nostro campo e orario
  ritirate     squadre ritirate: le partite con loro non vengono mostrate
"""

CAMPO_CASTELVERDE = "C.S. Comunale N.1 · Via dei Gerani, Castelverde"

SQUADRE = {
    # ------------------------------------------------------------------ PRIMA SQUADRA
    "prima-squadra": {
        "competizione": "Seconda Categoria · Girone H",
        "tuttocampo": "https://www.tuttocampo.it/Lombardia/SecondaCategoria/GironeHCremona",
        "giornate": 15,
        "casa": (CAMPO_CASTELVERDE, "orario ufficiale", ""),
        "calendario": [
            (1, "2026-09-13", "2027-01-10", "Casalromano", True),
            (2, "2026-09-20", "2027-01-17", "Oratorio Cava Digidue", False),
            (3, "2026-09-27", "2027-01-24", "Leoncelli", True),
            (4, "2026-10-04", "2027-01-31", "Solarolese", False),
            (5, "2026-10-11", "2027-02-07", "Canottieri Baldesio", False),
            (6, "2026-10-18", "2027-02-14", "Cannetese", True),
            (7, "2026-10-25", "2027-02-21", "La Piccola Atene", False),
            (8, "2026-11-01", "2027-02-28", "Primavera Bassa Cremonese", True),
            (9, "2026-11-08", "2027-03-07", "Esperia Calcio", False),
            (10, "2026-11-15", "2027-03-14", "Deltapo", True),
            (11, "2026-11-22", "2027-03-21", "Casalbuttano", False),
            (12, "2026-11-29", "2027-04-04", "Pescarolo", True),
            (13, "2026-12-06", "2027-04-11", "Rapid United", False),
            (14, "2026-12-13", "2027-04-18", "United Sesto", True),
            (15, "2026-12-20", "2027-04-25", "Ciria Calcio 2020", False),
        ],
        "campi": {
            "Cannetese": ('C.S. Comunale "Don Tazzoli" · Canneto sull\'Oglio', "15:00", ""),
            "Canottieri Baldesio": ("Campo comunale · Via Monteverdi 3, Malagnino", "", ""),
            "Deltapo": ("Campo sportivo comunale · Via Milano, Spinadesco", "", ""),
            "Esperia Calcio": ('Comunale "G. Baresi" · Via Maffi, Cremona', "14:30", ""),
            "La Piccola Atene": ("C.S. Comunale · Via Santuario, Vigoreto di Sabbioneta", "", ""),
            "Leoncelli": ("Comunale A./A. De Micheli · Via Martiri di Cefalonia 4, Vescovato", "", ""),
            "Primavera Bassa Cremonese": ('Intercomunale "Le Querce" · Via Cremona, Pieve d\'Olmi', "", ""),
            "Casalromano": ("Campo sportivo comunale · Via Pradellata, Casalromano", "", ""),
            "Ciria Calcio 2020": ("C.S. Comunale · Via della Libertà 28, Corte de' Frati", "", ""),
            "Pescarolo": ("C.S. Comunale · Via Campetto, Pescarolo ed Uniti", "", ""),
            "Oratorio Cava Digidue": ('C.S. Comunale "Cavadigidue" · Via G. Grassi 19, Cavatigozzi (CR)', "", ""),
            "Casalbuttano": ("Centro sportivo comunale · Via Leonardo da Vinci 30, Casalbuttano", "", ""),
            "Rapid United": ('C.S. Comunale "Fausto Lana" · Via Don Minzoni, Rivarolo Mantovano', "", ""),
            "Solarolese": ('C.S. Comunale "Fulvio Guerra" · Via Cadeferro, Martignana di Po', "", ""),
            "United Sesto": ("Campo comunale · Via delle Corti, Sesto ed Uniti", "", ""),
        },
        "ritirate": [],
    },

    # ------------------------------------------------------------------ JUNIORES U19
    "juniores": {
        "competizione": "Regionale Under 19 · Girone F",
        "tuttocampo": "https://www.tuttocampo.it/Lombardia/JunioresRegionaliU19/GironeF",
        "giornate": 15,
        "casa": (CAMPO_CASTELVERDE, "14:30", ""),
        "calendario": [   # date di sabato
            (1, "2026-09-12", "2027-01-09", "Leoncelli", True),
            (2, "2026-09-19", "2027-01-16", "San Biagio", False),
            (3, "2026-09-26", "2027-01-23", "Pianenghese", True),
            (4, "2026-10-03", "2027-01-30", "Sancolombano", False),
            (5, "2026-10-10", "2027-02-06", "Verolese", True),
            (6, "2026-10-17", "2027-02-13", "Soncinese", False),
            (7, "2026-10-24", "2027-02-20", "Sangiuliano", True),
            (8, "2026-10-31", "2027-02-27", "Spinese Oratorio", False),
            (9, "2026-11-07", "2027-03-06", "Casalpusterlengo", True),
            (10, "2026-11-14", "2027-03-13", "Real Melegnano", False),
            (11, "2026-11-21", "2027-03-20", "Montanaso", True),
            (12, "2026-11-28", "2027-04-03", "Castelnuovo", False),
            (13, "2026-12-05", "2027-04-10", "Castelvetro", True),
            (14, "2026-12-12", "2027-04-17", "Pro Peschiera", True),
            (15, "2026-12-19", "2027-04-24", "Fanfulla", False),
        ],
        "campi": {
            "Casalpusterlengo": ('C.S. Comunale "Ducatona" N.1 · Casalpusterlengo', "", ""),
            "Castelnuovo": ("C.S. Comunale · Via alla Chiesa, Ricengo", "15:30", ""),
            "Castelvetro": ("C.S. Comunale · Via Bernini 29, Castelvetro Piacentino", "", ""),
            "Fanfulla": ('C.S. Com. "Giacinto Facchetti" · Landriano', "", ""),
            "Leoncelli": ("Comunale A./A. De Micheli · Via Martiri di Cefalonia 4, Vescovato", "", ""),
            "Montanaso": ("C.S. Comunale (E.A.) · S.P. 202, Montanaso Lombardo", "17:00", ""),
            "Pianenghese": ('C.S. Comunale "Enzo Saronni 1" · Via Giovanni XXIII, Pianengo', "", ""),
            "San Biagio": ('C.S. Comunale "Edward Breda" · Via Duca d\'Aosta, Codogno', "", ""),
            "Pro Peschiera": ("Comunale di Linate · Via Pascoli, Peschiera Borromeo", "14:30", ""),
            "Real Melegnano": ("C.S. Comunale N.1 · Via Verdi 7, Vizzolo Predabissi", "15:30", ""),
            "Sancolombano": ('C.S. Comunale "F. Riccardi" · Via Milano 20, San Colombano al Lambro', "", ""),
            "Sangiuliano": ("C.S. Comunale N.1 · Via Toscana 1, San Giuliano Milanese", "", ""),
            "Soncinese": ("C.S. Comunale campo N.2 · Via Pistoia 3, Soncino", "", ""),
            "Spinese Oratorio": ('Stadio comunale "La Bassa" N.1 · Via Milano, Spino d\'Adda', "", ""),
            "Verolese": ('C.S. Com. "Cadignano" (E.A.) · Via Papa Paolo VI, Verolanuova', "15:30", ""),
        },
        "ritirate": ["Fanfulla"],
    },

    # ------------------------------------------------------------------ ALLIEVI U17
    "allievi": {
        "competizione": "Provinciale Under 17 · Girone B",
        "tuttocampo": "https://www.tuttocampo.it/Lombardia/AllieviProvincialiU17/GironeBCremona",
        "giornate": 13,
        "casa": (CAMPO_CASTELVERDE, "14:30", "sab"),
        "calendario": [   # date di domenica; None = turno di riposo
            (1, "2026-09-20", "2027-01-17", "Casalbuttano", True),
            (2, "2026-09-27", "2027-01-24", "Soresinese", False),
            (3, "2026-10-04", "2027-01-31", None, False),
            (4, "2026-10-11", "2027-04-25", "Oratorio Cava Digidue", False),
            (5, "2026-10-18", "2027-02-14", "Persico Dosimo", True),
            (6, "2026-10-25", "2027-02-21", "Leoncelli", False),
            (7, "2026-11-01", "2027-02-28", "San Luigi", True),
            (8, "2026-11-08", "2027-03-07", "Pol. San Giovanni", False),
            (9, "2026-11-15", "2027-03-14", "Torrazzo Malagnino", True),
            (10, "2026-11-22", "2027-03-21", "Grumulus", False),
            (11, "2026-11-29", "2027-04-04", "Castelleone", True),
            (12, "2026-12-20", "2027-04-11", "Castelvetro", False),
            (13, "2026-12-13", "2027-04-18", "Esperia Calcio", True),
        ],
        "campi": {
            "Castelleone": ("Campo oratorio (E.A.) · Viale Santuario 9, Castelleone", "10:00", ""),
            "Esperia Calcio": ('Comunale "G. Baresi" · Via Maffi, Cremona', "15:00", "sab"),
            "Grumulus": ('Campo "Mulinello" · Via L. da Vinci 7, Grumello Cremonese', "10:00", ""),
            "Pol. San Giovanni": ('C.S. Comunale "Loris Ceretti" · Via E. Fermi 3, San Giovanni in Croce', "10:00", ""),
            "Torrazzo Malagnino": ('Comunale "Cambonino" (E.A.) · Via Itis 5, Cremona', "11:00", ""),
            "Leoncelli": ("C.S. Comunale · Via S. Pertini, Pieve San Giacomo", "10:00", ""),
            "Oratorio Cava Digidue": ('C.S. Comunale "Cavadigi" · Via G. Grassi 19, Cavatigozzi (CR)', "10:00", ""),
            "Persico Dosimo": ("Centro sportivo comunale · Via Boldori, Persico Dosimo", "10:00", ""),
            "Casalbuttano": ("Centro sportivo comunale · Via L. da Vinci 30, Casalbuttano", "10:00", ""),
            "San Luigi": ("C.S. Comunale N.2 · Via De Gasperi 2, Pizzighettone", "10:00", ""),
            "Soresinese": ("C.S. Comunale · Via Ortaglia 12, Genivolta", "10:00", ""),
            "Castelvetro": ('C.S. Comunale "La Buca" · Via Matteotti, Castelvetro Piacentino', "10:00", ""),
        },
        "ritirate": [],
    },

    # ------------------------------------------------------------------ GIOVANISSIMI U15
    "giovanissimi": {
        "competizione": "Provinciale Under 15 · Girone C",
        "tuttocampo": "https://www.tuttocampo.it/Lombardia/GiovanissimiProvincialiU15/GironeCCremona",
        "giornate": 13,
        "casa": (CAMPO_CASTELVERDE, "10:00", ""),
        "calendario": [
            (1, "2026-09-20", "2027-01-17", "Castelvetro", True),
            (2, "2026-09-27", "2027-01-24", "Esperia Calcio", False),
            (3, "2026-10-04", "2027-01-31", "Casalromano", True),
            (4, "2026-10-11", "2027-04-25", "Marini 1950", False),
            (5, "2026-10-18", "2027-02-14", "Torrazzo Malagnino", True),
            (6, "2026-10-25", "2027-02-21", "River Club United", True),
            (7, "2026-11-01", "2027-02-28", "La Cantera", False),
            (8, "2026-11-08", "2027-03-07", "Rapid Olimpia", True),
            (9, "2026-11-15", "2027-03-14", "Leoncelli", False),
            (10, "2026-11-22", "2027-03-21", "Fadigati", True),
            (11, "2026-11-29", "2027-04-04", "Pol. San Giovanni", False),
            (12, "2026-12-20", "2027-04-11", "Oratorio S. Ilario", True),
            (13, "2026-12-13", "2027-04-18", "Primavera Bassa", False),
        ],
        "campi": {
            "Fadigati": ('C.S. Comunale "Fadigati" · Piazza Fadigati, Cicognolo', "10:00", ""),
            "La Cantera": ('C.S. Comunale "D. Martelli" · Via Avis, Sargnesco', "10:30", ""),
            "Leoncelli": ("C.S. Comunale · Via S. Pertini, Pieve San Giacomo", "10:00", ""),
            "Marini 1950": ("C.S. Comunale · Via Redenzione, Costa Sant'Abramo (Castelverde)", "10:00", ""),
            "Rapid Olimpia": ("Campo sportivo comunale · Via San Martino, Mariana Mantovana", "16:30", "sab"),
            "Torrazzo Malagnino": ('Comunale "Cambonino" (E.A.) · Via Itis 5, Cremona', "09:30", ""),
            "Casalromano": ("Campo sportivo comunale · Via Pradellata, Casalromano", "15:30", "sab"),
            "Castelvetro": ('C.S. Comunale "La Buca" · Via Matteotti, Castelvetro Piacentino', "10:00", ""),
            "Esperia Calcio": ('C.S. Comunale "Rino Galli" · Via Lonati 2, Gadesco Pieve Delmona', "10:00", ""),
            "Oratorio S. Ilario": ('C.S.S. Sigismondo "Luigi Poli" · Via Sforza, Cremona', "14:30", "sab"),
            "Pol. San Giovanni": ('C.S. Comunale "Loris Ceretti" · Via E. Fermi 3, San Giovanni in Croce', "14:30", ""),
            "Primavera Bassa": ('C. Sportivo Comunale "Jumbo" · P.zza Libertà, Sospiro', "10:00", ""),
            "River Club United": ("Campo sportivo comunale · Via Mazzini 19, Gussola", "10:30", ""),
        },
        "ritirate": ["Fadigati", "Casalromano"],   # ritirate a inizio stagione (tolte da Tuttocampo)
    },
}
