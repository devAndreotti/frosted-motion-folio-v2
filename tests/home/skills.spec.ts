import { test, expect } from "@playwright/test";
import { STACK_AREAS } from "../../src/data/skills";

test("the stack section shows the tool ticker and the usage bento together", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#skills");
  await expect(section.getByTestId("marquee-track")).toBeVisible();
  for (const tier of ["Uso diário", "Confortável", "Aprendendo"]) {
    await expect(section.getByText(tier, { exact: true })).toBeVisible();
  }
});

test("an area filter fades the tools outside it", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#skills");
  const dataArea = STACK_AREAS.find((a) => a.id === "data")!;
  const chip = section.getByRole("button", { name: new RegExp(`^${dataArea.label.pt}`) });

  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect(section.locator('[data-tool="React"]')).toHaveClass(/\boff\b/);

  await chip.click();
  await expect(section.locator('[data-tool="React"]')).not.toHaveClass(/\boff\b/);
});

test("the speed pill toggles the ticker boost", async ({ page }) => {
  await page.goto("");
  const pill = page.locator("#skills").getByRole("button", { name: "clique pra acelerar" });
  await pill.click();
  await expect(page.locator("#skills").getByRole("button", { name: "velocidade normal" })).toHaveAttribute("aria-pressed", "true");
});
