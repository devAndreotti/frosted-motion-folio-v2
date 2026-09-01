import { test, expect } from "@playwright/test";
import { personalInfo } from "../../src/data/personal";

test("hero shows the rotating headline and the photo card", async ({ page }) => {
  await page.goto("");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Desenvolvo");

  const hero = page.locator("#header");
  await expect(hero.getByText(personalInfo.name, { exact: true })).toBeVisible();
  await expect(hero.getByText(personalInfo.title, { exact: true })).toBeVisible();
});

test("clicking the front card of the stack sends it to the back", async ({ page }) => {
  await page.goto("");
  const hero = page.locator("#header");
  const photoCard = hero.getByRole("button", { name: `Foto de ${personalInfo.name}` });

  await expect(photoCard).toBeVisible();
  const zBefore = await photoCard.evaluate((el) => el.style.zIndex);

  await photoCard.click();

  await expect
    .poll(() => photoCard.evaluate((el) => el.style.zIndex))
    .not.toBe(zBefore);
});

test('"Modo recrutador" swaps in a condensed resume view and back', async ({ page }) => {
  await page.goto("");
  const hero = page.locator("#header");

  await hero.getByRole("button", { name: "Modo recrutador" }).click();
  await expect(hero.getByText("Resumo rápido")).toBeVisible();

  await hero.getByRole("button", { name: "Voltar ao normal" }).click();
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
});
