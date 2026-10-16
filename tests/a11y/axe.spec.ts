import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Roadmap item 13: axe (WCAG 2.0/2.1 A and AA) on the main pages, in both modes.
// Runs once, on the plain "chromium" project (the responsive viewports skip it).
const PAGES = [
  { name: "home", path: "" },
  { name: "blog", path: "blog/" },
  { name: "post", path: "blog/um-blog-publicado-com-git-push/" },
  { name: "privacidade", path: "privacidade/" },
  { name: "404", path: "pagina-que-nao-existe/" },
];

const MODES = ["light", "dark"] as const;

async function openWithTheme(page: Page, path: string, mode: (typeof MODES)[number]) {
  await page.addInitScript((theme) => {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage blocked: the page still renders */
    }
  }, mode);
  await page.emulateMedia({ colorScheme: mode });
  await page.goto(path);
  await expect(page.locator("#root")).not.toBeEmpty();
}

for (const { name, path } of PAGES) {
  for (const mode of MODES) {
    test(`axe: ${name} (${mode}) sem violações serious ou critical`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "chromium", "axe roda uma vez, no projeto chromium");
      await openWithTheme(page, path, mode);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const blocking = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
      expect(blocking, `${name} ${mode}`).toEqual([]);
    });
  }
}
