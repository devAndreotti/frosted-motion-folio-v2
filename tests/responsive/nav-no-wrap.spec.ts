import { test, expect } from "@playwright/test";

// Regression for a real bug: at exactly 1024px (tablet landscape) the full
// desktop nav row (logo + 5 links + repos badge + color picker + 4 toggles)
// used to activate at the same width the surname re-expanded, with no
// flex-wrap/min-w-0 guard -- risking the row wrapping to 2 lines inside its
// fixed h-16 bar. Only meaningful once the desktop row is shown (>= md).
test("desktop nav bar never wraps to more than one line", async ({ page }) => {
  const viewport = page.viewportSize();
  test.skip(!viewport || viewport.width < 768, "desktop nav row only renders at md and above");

  await page.goto("");
  const navBar = page.getByTestId("nav-bar");
  const box = await navBar.boundingBox();

  expect(box).not.toBeNull();
  // h-16 = 64px; a couple px of tolerance for borders/rounding, but a wrap
  // to a second line would add 20px+ of height, well outside this margin.
  expect(box!.height).toBeLessThanOrEqual(70);
});
