import { test, expect } from "@playwright/test";

// Anchors driven by Navigation.tsx's navItems (Início/Sobre/Skills/Projetos/Contato),
// excluding "Início" which is covered separately below (it starts already in view).
const sections = [
  { label: "Sobre", id: "about" },
  { label: "Skills", id: "skills" },
  { label: "Projetos", id: "projects" },
  { label: "Contato", id: "contact" },
];

for (const { label, id } of sections) {
  test(`nav link "${label}" scrolls the ${id} section into view`, async ({ page }) => {
    await page.goto("");
    const target = page.locator(`#${id}`);
    await expect(target).not.toBeInViewport();

    await page.getByRole("button", { name: label, exact: true }).click();

    await expect(target).toBeInViewport();
  });
}

test('nav link "Início" scrolls back to the top', async ({ page }) => {
  await page.goto("");
  const header = page.locator("#header");

  await page.getByRole("button", { name: "Contato", exact: true }).click();
  await expect(header).not.toBeInViewport();

  await page.getByRole("button", { name: "Início", exact: true }).click();
  await expect(header).toBeInViewport();
});
