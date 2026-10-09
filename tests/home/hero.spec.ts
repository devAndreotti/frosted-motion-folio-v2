import { test, expect } from "@playwright/test";
import { personalInfo } from "../../src/data/personal";

test("hero shows the rotating headline and the photo card", async ({ page }) => {
  await page.goto("");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Desenvolvo");

  const hero = page.locator("#header");
  await expect(hero.getByText(personalInfo.name, { exact: true })).toBeVisible();
  await expect(hero.getByText(personalInfo.title.pt, { exact: true })).toBeVisible();
});

test("clicking the front card of the stack sends it to the back", async ({ page }) => {
  await page.goto("");
  const hero = page.locator("#header");
  // The card's accessible name is its visible text (name + title), so match on the name.
  const photoCard = hero.getByRole("button", { name: new RegExp(personalInfo.name) });

  await expect(photoCard).toBeVisible();
  const zBefore = await photoCard.evaluate((el) => window.getComputedStyle(el).zIndex);

  await photoCard.click({ force: true });

  await expect
    .poll(async () => {
      return await photoCard.evaluate((el) => window.getComputedStyle(el).zIndex);
    })
    .not.toBe(zBefore);
});

test('"Modo recrutador" opens a one-screen summary that closes again', async ({ page }) => {
  await page.goto("");
  const hero = page.locator("#header");

  await hero.getByRole("button", { name: "Modo recrutador" }).click();
  const dialog = page.getByRole("dialog", { name: "Resumo rápido para recrutadores" });
  await expect(dialog.getByText("Resumo rápido")).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Self-Sync Daily/ })).toBeVisible();

  await dialog.getByRole("button", { name: "Fechar" }).click();
  await expect(dialog).not.toBeVisible();
});

test("the stats row shows projects, repositories, contributions and semester", async ({ page }) => {
  await page.goto("");
  const hero = page.locator("#header");
  for (const label of ["Projetos", "Repositórios", "Contribuições", "Semestre"]) {
    await expect(hero.getByText(label, { exact: true })).toBeVisible();
  }
});
