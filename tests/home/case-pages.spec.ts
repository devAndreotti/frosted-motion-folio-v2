import { test, expect } from "@playwright/test";
import { curatedProjects } from "../../src/data/curatedProjects";
import { moreProjects } from "../../src/data/moreProjects";

const sample = curatedProjects[0];
const card = moreProjects[0];

// The 3D laptop above the gallery is not under test here. CI has no GPU (WebGL runs on SwiftShader, on the CPU), and setting
// the scene up there can hold the main thread for seconds right when a card is clicked, so these tests keep its still picture.
test.beforeEach(async ({ page }) => {
  await page.route(/notebook-loq\.glb$/, (route) => route.abort());
});

test("a ranked row goes to the case's own address, and going back closes the popup", async ({ page }) => {
  await page.goto("");
  await page.locator("#projects").getByRole("link", { name: new RegExp(sample.title) }).click();
  await expect(page).toHaveURL(new RegExp(`/projetos/${sample.slug}/$`));
  await expect(page.getByRole("dialog").getByRole("heading", { name: sample.title })).toBeVisible();

  await page.goBack();
  await expect(page).not.toHaveURL(/\/projetos\//);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a gallery card opens its popup, and Esc closes it", async ({ page }) => {
  await page.goto("");
  await page.locator("#projects").getByRole("link", { name: `Ver as telas de ${card.title}` }).click();
  await expect(page).toHaveURL(new RegExp(`/projetos/${card.slug}/$`));
  await expect(page.getByRole("dialog").getByRole("heading", { name: card.title })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a shared case link opens the popup of that project", async ({ page }) => {
  await page.goto(`projetos/${sample.slug}/`);
  await expect(page.getByRole("dialog").getByRole("heading", { name: sample.title })).toBeVisible();
});

test("an unknown case shows the 404 page", async ({ page }) => {
  await page.goto("projetos/caso-que-nao-existe/");
  await expect(page.getByText("/projetos/caso-que-nao-existe/")).toBeVisible();
});
