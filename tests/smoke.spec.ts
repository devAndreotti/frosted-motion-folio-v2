import { test, expect } from "@playwright/test";

test("home page loads and shows the hero", async ({ page }) => {
  await page.goto("");
  await expect(page.getByRole("heading", { name: /Ricardo/i })).toBeVisible();
});
