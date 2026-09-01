import { test, expect } from "@playwright/test";
import { CORE_SKILLS } from "../../src/data/skills";

test("Bento/Radar toggle swaps the skills view", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#skills");

  await expect(section.getByText("Core stack")).toBeVisible();

  await section.getByRole("button", { name: "Radar", exact: true }).click();
  await expect(section.getByText("Radar da stack")).toBeVisible();
  await expect(section.getByRole("img", { name: /Radar de proficiência/ })).toBeVisible();

  await section.getByRole("button", { name: "Bento", exact: true }).click();
  await expect(section.getByText("Core stack")).toBeVisible();
});

test('a skill marked as "learning" shows the badge', async ({ page }) => {
  await page.goto("");
  const learning = CORE_SKILLS.find((s) => s.learning);
  test.skip(!learning, "no core skill is currently flagged as learning");

  const section = page.locator("#skills");
  const row = section.locator("div", { hasText: learning!.name }).filter({ hasText: "aprendendo" }).first();
  await expect(row).toBeVisible();
});
