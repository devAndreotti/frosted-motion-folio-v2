import { test, expect } from "@playwright/test";

// Scoped to #header (the hero section) because the theme-toggle button also
// appears in Navigation's desktop and mobile bars with the same accessible
// name — scoping avoids the strict-mode "multiple elements match" error.
test("theme toggle flips the dark class and persists across reload", async ({ page }) => {
  await page.goto("");
  const html = page.locator("html");
  const toggle = page.locator("#header").getByRole("button", { name: "Alternar tema" });

  // Playwright's default color scheme is light, and no prior test in this
  // context has written to localStorage, so the app starts in light mode.
  await expect(html).not.toHaveClass(/dark/);

  await toggle.click();
  await expect(html).toHaveClass(/dark/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("dark");

  await page.reload();
  await expect(html).toHaveClass(/dark/);

  await page.locator("#header").getByRole("button", { name: "Alternar tema" }).click();
  await expect(html).not.toHaveClass(/dark/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("light");
});
