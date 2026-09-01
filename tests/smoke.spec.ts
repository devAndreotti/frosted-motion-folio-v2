import { test, expect } from "@playwright/test";

test("home page loads and shows the hero", async ({ page }) => {
  await page.goto("");
  await expect(page).toHaveTitle(/Ricardo/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
