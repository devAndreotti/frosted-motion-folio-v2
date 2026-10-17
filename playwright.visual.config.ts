import { defineConfig, devices } from "@playwright/test";

// Testes visuais (roadmap 14): home, /blog/, /privacidade/ e 404 em 390 e 1280 px, claro e escuro.
// Roda sobre o build de produção (vite preview), não sobre o dev server: no dev o blog mostra rascunhos.
// Precisa do build antes (npm run build; os scripts test:visual* já fazem isso). As bases ficam em tests/visual/*-snapshots/
// e são geradas no CI (Linux x64); atualizar com npm run test:visual:update.
const PORT = 8081;
const BASE = `http://localhost:${PORT}/frosted-motion-folio-v2/`;

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
};

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled", caret: "hide" },
  },
  use: {
    baseURL: BASE,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    reducedMotion: "reduce",
    trace: "off",
  },
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
  projects: Object.entries(VIEWPORTS).flatMap(([size, viewport]) =>
    (["light", "dark"] as const).map((colorScheme) => ({
      name: `${size}-${colorScheme}`,
      use: { ...devices["Desktop Chrome"], viewport, colorScheme },
    })),
  ),
});
