import { test, expect } from "@playwright/test";

test("unknown route renders the 404 page", async ({ page }) => {
  await page.goto("some/unknown/route");

  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.getByText("Essa página não existe.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar ao início" })).toBeVisible();
});
