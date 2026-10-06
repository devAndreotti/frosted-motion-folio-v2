import { test, expect } from "@playwright/test";
import { CORE_SKILLS, STACK_AREAS } from "../../src/data/skills";
import { strings } from "../../src/lib/i18n";

test("Bento/Radar toggle swaps the skills view", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#skills");
  // The bento view's area filter chips (e.g. "Dados") are its only content
  // that isn't also present in the radar view's legend, which reuses
  // CORE_SKILLS names -- so they're what actually proves which view is showing.
  const dataArea = STACK_AREAS.find((a) => a.id === "data")!;
  const bentoOnlyText = section.getByText(dataArea.label.pt, { exact: true });

  await expect(bentoOnlyText).toBeVisible();

  await section.getByRole("button", { name: "Radar", exact: true }).click();
  await expect(section.getByText("Radar da stack")).toBeVisible();
  await expect(section.getByRole("img", { name: /Radar de proficiência/ })).toBeVisible();
  await expect(bentoOnlyText).not.toBeVisible();

  await section.getByRole("button", { name: strings.pt.skills.bentoTab, exact: true }).click();
  await expect(bentoOnlyText).toBeVisible();
});

test('a skill marked as "learning" shows the badge', async ({ page }) => {
  await page.goto("");
  const learning = CORE_SKILLS.find((s) => s.learning);
  test.skip(!learning, "no core skill is currently flagged as learning");

  const section = page.locator("#skills");
  const row = section.locator("div", { hasText: learning!.name }).filter({ hasText: "aprendendo" }).first();
  await expect(row).toBeVisible();
});
