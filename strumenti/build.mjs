// ==================================================================
// A.C. Castelverde — strumenti/build.mjs   (npm run build)
// Prepara nella cartella _site/ il sito da pubblicare (lo usa GitHub Actions,
// vedi .github/workflows/pubblica.yml). Prima, npm run build rigenera lo stile
// (css/stile.min.css) con Tailwind.
//
//   1. copia in _site/ solo quello che serve al sito (pagine, stile, script,
//      immagini): niente sorgenti, strumenti, test, documentazione;
//   2. aggiunge a ogni CSS e JS l'impronta del file (es. stile.min.css?v=3fa9c1d2):
//      quando un file cambia cambia anche l'impronta, e i browser scaricano
//      la versione nuova invece di usare quella in memoria. Niente più ?v= a mano;
//   3. scrive sitemap.xml e robots.txt per i motori di ricerca, con l'indirizzo
//      del sito preso da "homepage" in package.json (da cambiare con il dominio
//      definitivo).
// ==================================================================
import { createHash } from "node:crypto";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const RADICE = new URL("..", import.meta.url).pathname;
const USCITA = join(RADICE, "_site");
const pacchetto = JSON.parse(await readFile(join(RADICE, "package.json"), "utf8"));
const INDIRIZZO = pacchetto.homepage.replace(/\/?$/, "/");

// 1. Copia ----------------------------------------------------------
const DA_COPIARE = ["assets", "js", "css/stile.min.css"];
await rm(USCITA, { recursive: true, force: true });
await mkdir(join(USCITA, "css"), { recursive: true });
for (const voce of DA_COPIARE) await cp(join(RADICE, voce), join(USCITA, voce), { recursive: true });
const pagine = (await readdir(RADICE)).filter((f) => f.endsWith(".html"));
for (const pagina of pagine) await cp(join(RADICE, pagina), join(USCITA, pagina));
await writeFile(join(USCITA, ".nojekyll"), ""); // GitHub Pages: pubblica i file così come sono

// 2. Impronte dei file ----------------------------------------------
const impronte = new Map();
async function impronta(percorso) {
  if (!impronte.has(percorso)) {
    const contenuto = await readFile(join(USCITA, percorso));
    impronte.set(percorso, createHash("sha256").update(contenuto).digest("hex").slice(0, 8));
  }
  return impronte.get(percorso);
}
for (const pagina of pagine) {
  let html = await readFile(join(USCITA, pagina), "utf8");
  const riferimenti = [...html.matchAll(/(?:src|href)="((?:css|js)\/[^"?#]+\.(?:css|js))"/g)].map((m) => m[1]);
  for (const rif of new Set(riferimenti)) html = html.replaceAll(`"${rif}"`, `"${rif}?v=${await impronta(rif)}"`);
  await writeFile(join(USCITA, pagina), html);
}

// 3. sitemap.xml e robots.txt ---------------------------------------
const testoNotizie = await readFile(join(RADICE, "js/dati/notizie.js"), "utf8");
const idNotizie = [...testoNotizie.matchAll(/^\s*id:\s*"([^"]+)"/gm)].map((m) => m[1]);
const indirizzi = [
  ...pagine.filter((p) => !["404.html", "notizia.html"].includes(p)).map((p) => (p === "index.html" ? "" : p)),
  ...idNotizie.map((id) => `notizia.html?id=${encodeURIComponent(id)}`),
];
const oggi = new Date().toISOString().slice(0, 10);
await writeFile(
  join(USCITA, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    indirizzi.map((u) => `  <url><loc>${INDIRIZZO}${u.replace(/&/g, "&amp;")}</loc><lastmod>${oggi}</lastmod></url>`).join("\n") +
    "\n</urlset>\n",
);
await writeFile(join(USCITA, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${INDIRIZZO}sitemap.xml\n`);

console.log(`Sito pronto in _site/: ${pagine.length} pagine, ${impronte.size} file con impronta, ${indirizzi.length} indirizzi nella sitemap.`);
