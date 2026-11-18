// ==================================================================
// A.C. Castelverde — configurazione dei controlli automatici (npm test)
// Prima dei controlli rigenera lo stile e avvia il sito su http://localhost:4173.
// I controlli sono in test/sito.spec.js. Se qualcosa non va, il rapporto
// si apre con: npx playwright show-report
// ==================================================================
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "test",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4173",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run css && node strumenti/server.mjs . 4173",
    url: "http://localhost:4173/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
