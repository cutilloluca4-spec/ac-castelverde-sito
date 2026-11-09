"""Rigenera assets/3d/calciatore.glb.js a partire da assets/3d/calciatore.glb.

Il calciatore 3D va scritto dentro uno script perché la pagina Società funzioni anche
aperta con un doppio clic (file://), dove il browser non lascia caricare il .glb.
Uso, dalla cartella del sito:  python3 strumenti/glb_in_js.py
"""
import base64
from pathlib import Path

radice = Path(__file__).resolve().parent.parent
glb = radice / "assets/3d/calciatore.glb"
js = radice / "assets/3d/calciatore.glb.js"
testo = base64.b64encode(glb.read_bytes()).decode()
js.write_text(
    "/* A.C. Castelverde — assets/3d/calciatore.glb.js\n"
    "   Il calciatore 3D (assets/3d/calciatore.glb) scritto dentro uno script, in base64.\n"
    "   Serve perché la pagina funzioni anche aperta con un doppio clic (file://): in quel\n"
    "   caso il browser non lascia caricare il file .glb. Se si aggiorna il .glb, rigenerare\n"
    "   questo file con: python3 strumenti/glb_in_js.py */\n"
    f'window.CALCIATORE_3D = "{testo}";\n'
)
print("scritto", js.relative_to(radice), f"({len(testo) / 1e6:.1f} MB)")
