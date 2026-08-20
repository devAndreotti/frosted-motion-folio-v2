import { test, expect } from "@playwright/test";
import { personalInfo, socialLinks } from "../../src/data/personal";

test("hero shows the name, title and social links", async ({ page }) => {
  await page.goto("");

  await expect(
    page.getByRole("heading", { name: personalInfo.name, level: 1 })
  ).toBeVisible();
  await expect(page.getByText(personalInfo.title, { exact: true })).toBeVisible();

  const hero = page.locator("#header");
  for (const social of socialLinks) {
    await expect(hero.getByRole("link", { name: social.name })).toHaveAttribute(
      "href",
      social.url
    );
  }
});
