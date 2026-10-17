import { test, expect } from "@playwright/test";

test("unknown route renders the 404 page", async ({ page }) => {
  await page.goto("some/unknown/route");

  await expect(page.getByRole("heading", { name: "Essa página não existe." })).toBeVisible();
  await expect(page.getByText("/some/unknown/route")).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar ao início" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Talvez você procurasse" }).getByRole("link")).toHaveCount(4);
});

test("offline page stands alone and offers a way back", async ({ page }) => {
  await page.goto("offline.html");

  await expect(page.getByRole("heading", { name: "Saí do ar por um instante." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tentar de novo" })).toBeVisible();
  await expect(page.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/devAndreotti");
});
