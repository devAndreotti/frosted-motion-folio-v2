import { test, expect } from "@playwright/test";

// Regressions from the responsive QA: things that didn't overflow the page
// (so no-overflow.spec missed them) but still looked broken on small screens.

test("every rotating hero role fits on one line, so no blank line is reserved under the headline", async ({ page }) => {
  await page.goto("");
  // Measure with the real font: the wider fallback can wrap for a moment before Geist loads.
  await page.evaluate(() => document.fonts.ready);
  const lines = await page.locator('[data-testid="rotating-role"]').evaluate((role) =>
    // Count each role's own line boxes -- the spans share one grid cell and all stretch to the tallest.
    [...role.children].map((span) => {
      const range = document.createRange();
      range.selectNodeContents(span);
      return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
    })
  );
  expect(lines.every((n) => n === 1), `role line counts: ${lines.join(",")}`).toBe(true);
});

test("daily tool names never break in the middle of a word", async ({ page }) => {
  await page.goto("");
  const broken = await page.locator("#skills .tile-n").evaluateAll((names) =>
    names
      .filter((el) => !(el.textContent ?? "").includes(" "))
      .filter((el) => el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * 1.5)
      .map((el) => el.textContent)
  );
  expect(broken).toEqual([]);
});

test("contact handles are shown in full on phones", async ({ page }) => {
  const viewport = page.viewportSize();
  test.skip(!viewport || viewport.width > 480, "handles sit beside the labels (and may truncate) on wider screens");
  await page.goto("");
  const cut = await page.locator("#contact .dl-h").evaluateAll((handles) => handles.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent));
  expect(cut).toEqual([]);
});
