import { test, expect } from "@playwright/test";

test("theme toggle flips the dark class and persists across reload", async ({ page }) => {
  // The redesign's own default is dark ("black glass") -- pin the system
  // preference so this test verifies the toggle/persistence mechanics, not
  // whichever OS color-scheme happens to be a first-time visitor's default
  // (see the dedicated system-preference test below for that behavior).
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("");
  const html = page.locator("html");
  const toggle = page.getByRole("button", { name: "Alternar tema claro/escuro" });

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
  // Blue's dark-mode accent hex is the one asserted below; pin the
  // color-scheme so this isn't coupled to the system-preference default.
  await page.emulateMedia({ colorScheme: "dark" });
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

test("a first-time visitor with no saved preference gets their OS color scheme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("");
  const html = page.locator("html");

  await expect(html).not.toHaveClass(/dark/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("light");
});

test("an already-saved theme preference wins over the OS color scheme", async ({ page }) => {
  // OS stays "dark" for this whole test; only the saved choice changes to
  // "light" -- reloading must keep the saved value, not fall back to the OS.
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("");
  await page.getByRole("button", { name: "Alternar tema claro/escuro" }).click(); // dark -> light, saved
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
