import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // A single Vite dev server can't keep up with many concurrent full page
  // loads (each test opens a fresh page against the same dev process) --
  // uncapped workers caused real navigation timeouts, not app bugs.
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8080/frosted-motion-folio-v2/",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
