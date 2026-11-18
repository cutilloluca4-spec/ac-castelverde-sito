// ==================================================================
// A.C. Castelverde — strumenti/server.mjs
// Un piccolo server per vedere il sito nel browser, senza installare altro.
//   node strumenti/server.mjs [cartella] [porta]
//   (npm run dev lo avvia sulla cartella del progetto, npm run preview su _site)
// ==================================================================
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const cartella = resolve(process.argv[2] || ".");
const porta = Number(process.argv[3] || process.env.PORT || 8000);

const TIPI = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff",
};

createServer(async (richiesta, risposta) => {
  try {
    let percorso = decodeURIComponent(new URL(richiesta.url, "http://x").pathname);
    if (percorso.endsWith("/")) percorso += "index.html";
    const file = normalize(join(cartella, percorso));
    if (!file.startsWith(cartella)) throw new Error("fuori dalla cartella");
    if (!(await stat(file)).isFile()) throw new Error("non è un file");
    risposta.writeHead(200, { "Content-Type": TIPI[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    risposta.end(await readFile(file));
  } catch {
    // come GitHub Pages: le pagine che non esistono mostrano 404.html
    const pagina404 = await readFile(join(cartella, "404.html")).catch(() => "Pagina non trovata");
    risposta.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    risposta.end(pagina404);
  }
}).listen(porta, () => console.log(`Sito su http://localhost:${porta}  (cartella: ${cartella})`));
