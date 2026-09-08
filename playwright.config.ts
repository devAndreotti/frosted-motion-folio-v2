import { defineConfig, devices } from "@playwright/test";

// The 9 viewports required for the responsive audit. Scoped to
// tests/responsive/** only (via testMatch below) -- the 8 functional specs
// keep running once, on the plain "chromium" project, so this doesn't
// multiply the whole suite by 9.
const RESPONSIVE_VIEWPORTS: Record<string, { width: number; height: number }> = {
  "vp-1920x1080": { width: 1920, height: 1080 },
  "vp-1440x900": { width: 1440, height: 900 },
  "vp-1280x720": { width: 1280, height: 720 },
  "vp-1024x768": { width: 1024, height: 768 },
  "vp-768x1024": { width: 768, height: 1024 },
  "vp-430x932": { width: 430, height: 932 },
  "vp-390x844": { width: 390, height: 844 },
  "vp-360x800": { width: 360, height: 800 },
  "vp-320x568": { width: 320, height: 568 },
};

const RESPONSIVE_TEST_MATCH = /responsive[\\/].*\.spec\.ts/;

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
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", testIgnore: RESPONSIVE_TEST_MATCH, use: { ...devices["Desktop Chrome"] } },
    ...Object.entries(RESPONSIVE_VIEWPORTS).map(([name, viewport]) => ({
      name,
      testMatch: RESPONSIVE_TEST_MATCH,
      use: { ...devices["Desktop Chrome"], viewport },
    })),
    // Real device presets -- touch, UA and viewport together -- for the
    // checks that specifically care about touch behavior (hamburger menu,
    // tap targets), not just raw pixel width. iOS presets default to WebKit,
    // which isn't installed alongside the rest of this Chromium-only suite --
    // force Chromium back so these run without a separate browser install.
    { name: "device-iphone13", testMatch: RESPONSIVE_TEST_MATCH, use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
    { name: "device-ipad-pro", testMatch: RESPONSIVE_TEST_MATCH, use: { ...devices["iPad Pro 11"], defaultBrowserType: "chromium" } },
    { name: "device-pixel7", testMatch: RESPONSIVE_TEST_MATCH, use: { ...devices["Pixel 7"] } },
  ],
});
