// ==================================================================
// A.C. Castelverde — test/sito.spec.js   (npm test)
// Controlli automatici del sito con Playwright (un browser vero):
//   - i dati e le funzioni (la pagina test/index.html: tutti ✅)
//   - ogni pagina a ogni larghezza: niente errori, niente scorrimento
//     di lato, immagini caricate
//   - menu da telefono, schede delle squadre, filtri, modulo contatti
//   - tutti i link interni portano a una pagina che esiste
// ==================================================================
const { test, expect } = require("@playwright/test");

const PAGINE = [
  "index.html", "notizie.html", "notizia.html?id=stagione-2026-27", "squadre.html", "calendario.html",
  "societa.html", "dirigenza.html", "contatti.html", "privacy-cookie.html", "404.html",
];
// telefono piccolo, iPhone, pieghevole aperto (iPhone Duo), tablet, computer
const LARGHEZZE = [320, 390, 626, 768, 1024, 1440];

// Apre una pagina raccogliendo errori JavaScript e file che non si caricano
async function apri(page, indirizzo) {
  const problemi = [];
  page.on("pageerror", (e) => problemi.push(`errore JavaScript: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().startsWith("http://localhost")) problemi.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(indirizzo);
  return problemi;
}

test("dati e funzioni: tutti i controlli di test/index.html sono a posto", async ({ page }) => {
  await page.goto("test/index.html");
  const riepilogo = page.locator("#riepilogo");
  await expect(riepilogo).not.toHaveText(/in corso/);
  const errori = await page.locator("#elenco").getByText("❌").allInnerTexts();
  expect(errori, errori.join("\n")).toEqual([]);
  await expect(riepilogo).toContainText("Tutti i");
});

for (const larghezza of LARGHEZZE) {
  test.describe(`larghezza ${larghezza}px`, () => {
    test.use({ viewport: { width: larghezza, height: 900 }, isMobile: larghezza < 900, hasTouch: larghezza < 900 });

    for (const pagina of PAGINE) {
      test(pagina, async ({ page }) => {
        const problemi = await apri(page, `${pagina}${pagina.includes("?") ? "&" : "?"}statico`);
        // carica subito tutte le immagini (di solito arrivano scorrendo)
        await page.evaluate(async () => {
          document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
          await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((ok) => (i.onload = i.onerror = ok)))));
        });
        const stato = await page.evaluate(() => ({
          scorrimentoDiLato: document.documentElement.scrollWidth - window.innerWidth,
          immaginiRotte: [...document.images].filter((i) => i.src && !i.naturalWidth).map((i) => i.src),
          senzaAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src),
        }));
        expect(problemi, problemi.join("\n")).toEqual([]);
        expect(stato.scorrimentoDiLato, "la pagina non deve scorrere di lato").toBeLessThanOrEqual(0);
        expect(stato.immaginiRotte).toEqual([]);
        expect(stato.senzaAlt, "ogni immagine ha l'attributo alt").toEqual([]);
      });
    }
  });
}

test.describe("telefono", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("il menu non compare per un istante quando si apre una pagina", async ({ page }) => {
    await page.addInitScript(() => {
      window.menuVisto = false;
      const t0 = performance.now();
      (function guarda() {
        const m = document.getElementById("menuMobile");
        if (m && m.getBoundingClientRect().left < window.innerWidth - 1 && getComputedStyle(m).visibility !== "hidden") window.menuVisto = true;
        if (performance.now() - t0 < 2000) requestAnimationFrame(guarda);
      })();
    });
    await page.goto("calendario.html");
    await page.waitForTimeout(2200);
    expect(await page.evaluate(() => window.menuVisto)).toBe(false);
  });

  test("menu: si apre, porta alle pagine, si chiude con Esc", async ({ page }) => {
    await page.goto("index.html");
    const menu = page.locator("#menuMobile");
    await page.locator("#apriMenu").click();
    await expect(menu).toHaveClass(/is-aperto/);
    await expect(page.locator("#apriMenu")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveClass(/is-aperto/);
    await page.locator("#apriMenu").click();
    await menu.getByRole("link", { name: "Squadre", exact: true }).click();
    await expect(page).toHaveURL(/squadre\.html/);
  });

  test("schede delle squadre su una riga (da 360 px) e cliccabili", async ({ page }) => {
    for (const [pagina, schede] of [["index.html", "#schedePartite"], ["calendario.html", "#schedeCalendario"], ["squadre.html", "#indiceSquadre"]]) {
      await page.goto(`${pagina}?statico`);
      const righe = await page.locator(schede).evaluate((e) => new Set([...e.children].map((c) => Math.round(c.getBoundingClientRect().top))).size);
      expect(righe, `${pagina}: schede su ${righe} righe`).toBe(1);
    }
    await page.goto("calendario.html?statico");
    await page.locator("#schedeCalendario").getByRole("tab", { name: "Allievi" }).click();
    await expect(page).toHaveURL(/squadra=allievi/);
  });

  test("notizie: filtri e 'carica altre'", async ({ page }) => {
    await page.goto("notizie.html?statico");
    const prima = await page.locator("#elencoNotizie > *").count();
    const altre = page.getByRole("button", { name: /Carica altre/ });
    if (await altre.isVisible()) {
      await altre.click();
      await expect.poll(() => page.locator("#elencoNotizie > *").count()).toBeGreaterThan(prima);
    }
    await page.locator("#filtriNotizie").getByRole("tab", { name: "Storia" }).click();
    await expect(page).toHaveURL(/categoria=Storia/);
  });

  test("contatti: il modulo vuoto non si invia", async ({ page }) => {
    await page.goto("contatti.html?statico");
    await page.locator("form button[type=submit]").click();
    expect(await page.locator("form").evaluate((f) => f.checkValidity())).toBe(false);
    await expect(page).toHaveURL(/contatti\.html/);
  });
});

test("tutti i link interni portano a una pagina che esiste", async ({ page, request }) => {
  const link = new Set();
  for (const pagina of PAGINE) {
    await page.goto(`${pagina}${pagina.includes("?") ? "&" : "?"}statico`);
    (await page.$$eval("a[href]", (a) => a.map((x) => x.href))).forEach((h) => link.add(h));
  }
  const rotti = [];
  for (const indirizzo of link) {
    if (!indirizzo.startsWith("http://localhost")) continue;
    const [pagina, ancora] = indirizzo.split("#");
    const risposta = await request.get(pagina);
    if (risposta.status() >= 400) { rotti.push(`${risposta.status()} ${pagina}`); continue; }
    if (ancora) {
      await page.goto(indirizzo);
      if (!(await page.locator(`[id="${ancora}"]`).count())) rotti.push(`#${ancora} manca in ${pagina}`);
    }
  }
  expect(rotti, rotti.join("\n")).toEqual([]);
});

// Apertura della Home: in ogni formato, verticale e orizzontale, lo stemma è al
// centro dello schermo visibile, non tocca la freccia e il rosso del Match Day
// si vede solo scorrendo
test.describe("apertura della Home", () => {
  const FORMATI = [
    [320, 568], [360, 740], [390, 844], [430, 932], [626, 800], [768, 1024],
    [568, 320], [667, 375], [740, 360], [844, 390], [932, 430], [1024, 600],
    [1024, 768], [1280, 720], [1440, 900], [1920, 1080], [2560, 1440],
  ];
  for (const [larghezza, altezza] of FORMATI) {
    test(`${larghezza}x${altezza}`, async ({ page }) => {
      await page.setViewportSize({ width: larghezza, height: altezza });
      await page.goto("index.html?statico");
      const m = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const testata = r("header").bottom, stemma = r(".apertura__stemma img"), freccia = r(".apertura__giu");
        return {
          scarto: Math.abs((stemma.top + stemma.bottom) / 2 - (testata + innerHeight) / 2),
          spazioSopra: stemma.top - testata,
          // distanza tra stemma e freccia (0 o meno = si toccano)
          spazioFreccia: Math.max(freccia.top - stemma.bottom, freccia.left - stemma.right, stemma.left - freccia.right),
          frecciaDentro: freccia.bottom <= innerHeight,
          rossoNascosto: r("#apertura").bottom >= innerHeight - 1,
        };
      });
      expect(m.scarto, "stemma al centro").toBeLessThan(2);
      expect(m.spazioSopra, "spazio tra header e stemma").toBeGreaterThan(8);
      expect(m.spazioFreccia, "spazio tra stemma e freccia").toBeGreaterThan(8);
      expect(m.frecciaDentro, "freccia visibile").toBe(true);
      expect(m.rossoNascosto, "rosso visibile solo scorrendo").toBe(true);
    });
  }
});

// Sicurezza: la Content Security Policy di ogni pagina non blocca niente del sito
// (se compare un blocco, qualcosa carica codice o file da fuori, oppure lo script
// nel <head> è cambiato e va ricalcolata la sua impronta sha256: vedi README)
test("nessun blocco della Content Security Policy", async ({ page }) => {
  const blocchi = [];
  page.on("console", (m) => { if (/Content Security Policy/i.test(m.text())) blocchi.push(page.url() + " → " + m.text()); });
  for (const pagina of PAGINE) {
    await page.goto(pagina);
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
  }
  expect(blocchi).toEqual([]);
});

