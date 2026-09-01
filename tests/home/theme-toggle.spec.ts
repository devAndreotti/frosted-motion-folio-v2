import { test, expect } from "@playwright/test";

test("theme toggle flips the dark class and persists across reload", async ({ page }) => {
  await page.goto("");
  const html = page.locator("html");
  const toggle = page.getByRole("button", { name: "Alternar tema claro/escuro" });

  // The redesign defaults to dark ("black glass"), regardless of system preference.
  await expect(html).toHaveClass(/dark/);

  await toggle.click();
  await expect(html).not.toHaveClass(/dark/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("light");

  await page.reload();
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Alternar tema claro/escuro" }).click();
  await expect(html).toHaveClass(/dark/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("dark");
});

test("picking a color swatch updates the accent and persists across reload", async ({ page }) => {
  await page.goto("");

  const blueSwatch = page.getByRole("button", { name: "Cor de destaque: Azul" });
  await blueSwatch.click();

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("hue")))
    .toBe("blue");
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()))
    .toBe("#3b82f6");

  await page.reload();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()))
    .toBe("#3b82f6");
});
