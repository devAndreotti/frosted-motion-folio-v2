import { defineConfig, devices } from "@playwright/test";

// The 4 viewports required for the responsive audit. Scoped to
// tests/responsive/** only (via testMatch below) -- the 8 functional specs
// keep running once, on the plain "chromium" project, so this doesn't
// multiply the whole suite by 4.
const RESPONSIVE_VIEWPORTS: Record<string, { width: number; height: number }> = {
  "vp-1920x1080": { width: 1920, height: 1080 },
  "vp-1280x720": { width: 1280, height: 720 },
  "vp-768x1024": { width: 768, height: 1024 },
  "vp-360x800": { width: 360, height: 800 },
};

const RESPONSIVE_TEST_MATCH = /responsive[\\/].*\.spec\.ts/;
// Os testes visuais têm a própria config (playwright.visual.config.ts) e ficam fora do E2E.
const VISUAL_TEST_MATCH = /visual[\\/].*\.spec\.ts/;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // A single Vite dev server can't keep up with many concurrent full page
  // loads (each test opens a fresh page against the same dev process) --
  // uncapped workers caused real navigation timeouts, not app bugs.
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:8080/frosted-motion-folio-v2/",
    // the site follows the browser language when nothing was picked; the specs read the Portuguese copy
    locale: "pt-BR",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", testIgnore: [RESPONSIVE_TEST_MATCH, VISUAL_TEST_MATCH], use: { ...devices["Desktop Chrome"] } },
    ...Object.entries(RESPONSIVE_VIEWPORTS).map(([name, viewport]) => ({
      name,
      testMatch: RESPONSIVE_TEST_MATCH,
      use: { ...devices["Desktop Chrome"], viewport },
    })),
    // Real device preset -- touch, UA and viewport together -- for the
    // checks that specifically care about touch behavior (hamburger menu,
    // tap targets), not just raw pixel width.
    { name: "device-pixel7", testMatch: RESPONSIVE_TEST_MATCH, use: { ...devices["Pixel 7"] } },
  ],
});
