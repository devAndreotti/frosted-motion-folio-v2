import { test, expect } from "@playwright/test";
import { curatedProjects } from "../../src/data/curatedProjects";

const MIN_TOUCH_TARGET = 24; // WCAG 2.5.8 AA minimum

test("CaseModal close/gallery buttons meet the minimum touch-target size", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#projects");
  const sample = curatedProjects[0];
  await section.getByRole("button", { name: new RegExp(sample.title) }).click();

  const dialog = page.getByRole("dialog");
  const closeBox = await dialog.getByRole("button", { name: "Fechar" }).boundingBox();
  expect(closeBox).not.toBeNull();
  expect(closeBox!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  expect(closeBox!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);

  // Gallery arrows only render when a case has more than one image -- not
  // true for any curated project today, but keep this forward-compatible.
  const prevBtn = dialog.getByRole("button", { name: "Imagem anterior" });
  if ((await prevBtn.count()) > 0) {
    const prevBox = await prevBtn.boundingBox();
    expect(prevBox!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(prevBox!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  }
});

test("color swatch picker dots meet the minimum touch-target size in the mobile menu", async ({ page }) => {
  const viewport = page.viewportSize();
  test.skip(!viewport || viewport.width >= 768, "mobile hamburger menu only renders below md");

  await page.goto("");
  await page.getByRole("button", { name: "Abrir menu" }).click();

  const dots = page.getByTestId("mobile-menu").getByRole("button", { name: /^Cor de destaque:/ });
  const count = await dots.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const box = await dots.nth(i).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  }
});
