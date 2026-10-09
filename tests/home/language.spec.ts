import { test, expect } from "@playwright/test";

// A real mouse click on the nav's PT | EN switch -- a click dispatched in JS
// would miss anything painted on top of the buttons (it happened: the pill's
// tap-area ::before swallowed every click).
test("the PT | EN switch in the nav changes the language and remembers it", async ({ page }) => {
  await page.goto("");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("Desenvolvo");

  const group = page.getByRole("group", { name: "Idioma" }).first();
  await group.getByRole("button", { name: "EN", exact: true }).click();
  await expect(h1).toContainText("I build");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I build");

  await page.getByRole("group", { name: "Language" }).first().getByRole("button", { name: "PT", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Desenvolvo");
});

test.describe("a visitor whose browser is in English", () => {
  test.use({ locale: "en-US" });

  test("lands in English without touching the switch", async ({ page }) => {
    await page.goto("");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("I build");
  });

  test("still gets Portuguese from a ?lang=pt link", async ({ page }) => {
    await page.goto("?lang=pt");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Desenvolvo");
  });
});
