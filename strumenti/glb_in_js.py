"""Rigenera assets/3d/calciatore.glb.js e assets/3d/guanti.glb.js a partire dai .glb.

I modelli 3D vanno scritti dentro uno script perché la pagina Società funzioni anche
aperta con un doppio clic (file://), dove il browser non lascia caricare i .glb.
Uso, dalla cartella del sito:  python3 strumenti/glb_in_js.py
"""
import base64
from pathlib import Path

radice = Path(__file__).resolve().parent.parent
MODELLI = {
    "calciatore": ("CALCIATORE_3D", "Il calciatore 3D"),
    "guanti": ("GUANTI_3D", "I guanti del portiere ('Goalkeeper Galaxy Gloves' di cbarreiro, CC BY 4.0)"),
}
for nome, (variabile, cosa) in MODELLI.items():
    glb = radice / f"assets/3d/{nome}.glb"
    js = radice / f"assets/3d/{nome}.glb.js"
    testo = base64.b64encode(glb.read_bytes()).decode()
    js.write_text(
        f"/* A.C. Castelverde — assets/3d/{nome}.glb.js\n"
        f"   {cosa} (assets/3d/{nome}.glb) scritto dentro uno script, in base64.\n"
        "   Serve perché la pagina funzioni anche aperta con un doppio clic (file://): in quel\n"
        "   caso il browser non lascia caricare il file .glb. Se si aggiorna il .glb, rigenerare\n"
        "   questo file con: python3 strumenti/glb_in_js.py */\n"
        f'window.{variabile} = "{testo}";\n'
    )
    print("scritto", js.relative_to(radice), f"({len(testo) / 1e6:.1f} MB)")
