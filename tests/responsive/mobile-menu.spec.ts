import { test, expect } from "@playwright/test";

// The mobile hamburger trigger had zero E2E coverage before this audit --
// only the desktop nav row (home/navigation.spec.ts) was tested.
test("mobile hamburger menu opens, navigates to a section, and closes itself", async ({ page }) => {
  const viewport = page.viewportSize();
  test.skip(!viewport || viewport.width >= 768, "hamburger menu only renders below md");

  await page.goto("");
  const menu = page.getByTestId("mobile-menu");
  await expect(menu).not.toBeVisible();

  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(menu).toBeVisible();

  await menu.getByRole("button", { name: "Projetos", exact: true }).click();

  await expect(page.locator("#projects")).toBeInViewport();
  await expect(menu).not.toBeVisible();
});
