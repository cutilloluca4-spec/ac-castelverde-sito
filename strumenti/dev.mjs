// ==================================================================
// A.C. Castelverde — strumenti/dev.mjs   (npm run dev)
// Per lavorare sul sito: avvia Tailwind in ascolto (rigenera
// css/stile.min.css a ogni salvataggio) e il server su http://localhost:8000.
// Si ferma con Ctrl+C. Basta ricaricare la pagina per vedere le modifiche.
// ==================================================================
import { spawn } from "node:child_process";

const avvia = (comando, argomenti) =>
  spawn(comando, argomenti, { stdio: "inherit", shell: process.platform === "win32" });

const processi = [
  avvia("npx", ["tailwindcss", "-i", "./css/tailwind.css", "-o", "./css/stile.min.css", "--watch"]),
  avvia("node", ["strumenti/server.mjs", ".", process.env.PORT || "8000"]),
];
const chiudi = () => { processi.forEach((p) => p.kill()); process.exit(); };
process.on("SIGINT", chiudi);
process.on("SIGTERM", chiudi);
