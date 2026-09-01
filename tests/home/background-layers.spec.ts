import { test, expect } from "@playwright/test";

test("switching hue crossfades the background layer to the new gradient", async ({ page }) => {
  await page.goto("");
  const layersHost = page.locator('div[aria-hidden="true"]');
  const layers = layersHost.locator("> div");
  await expect(layers).toHaveCount(2);

  const initialGradient = await layers.nth(0).evaluate((el) => getComputedStyle(el).backgroundImage);

  await page.getByRole("button", { name: "Cor de destaque: Azul" }).click();

  // whichever layer settles at opacity 1 should now show a different
  // gradient than the one the page loaded with (the hue actually changed),
  // and the other layer should be the one left at opacity 0.
  await expect
    .poll(async () => {
      const count = await layers.count();
      const states = [];
      for (let i = 0; i < count; i++) {
        const el = layers.nth(i);
        const opacity = await el.evaluate((e) => getComputedStyle(e).opacity);
        const bg = await el.evaluate((e) => getComputedStyle(e).backgroundImage);
        states.push({ opacity, bg });
      }
      const visible = states.find((s) => s.opacity === "1");
      const hidden = states.find((s) => s.opacity === "0");
      return !!visible && !!hidden && visible.bg !== initialGradient;
    }, { timeout: 10000 })
    .toBe(true);
});

test("the 404 page picks up the selected theme instead of a hardcoded look", async ({ page }) => {
  await page.goto("");
  await page.getByRole("button", { name: "Cor de destaque: Azul" }).click();
  await page.waitForTimeout(300);

  await page.goto("some/unknown/route");
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
  expect(accent.toLowerCase()).toBe("#3b82f6");

  const layersHost = page.locator('div[aria-hidden="true"]');
  await expect(layersHost).toBeVisible();
});
