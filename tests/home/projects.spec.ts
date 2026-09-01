import { test, expect } from "@playwright/test";
import { projects } from "../../src/data/projects";
import { featuredProject, curatedProjects, CATEGORY_FILTERS } from "../../src/data/curatedProjects";

const OTHERS_COUNT = projects.length - (curatedProjects.length + 1);

test("shows the featured case and every curated project in the ranked list", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#projects");

  await expect(section.getByRole("heading", { name: featuredProject.title })).toBeVisible();
  for (const project of curatedProjects) {
    await expect(section.getByText(project.title, { exact: true })).toBeVisible();
  }
});

test("category filters narrow the ranked list", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#projects");
  const mobileOnly = curatedProjects.filter((p) => p.cat === "mobile");
  const nonMobile = curatedProjects.filter((p) => p.cat !== "mobile");
  test.skip(mobileOnly.length === 0, "no curated project is tagged mobile");

  await section.getByRole("button", { name: "Mobile", exact: true }).click();

  for (const project of mobileOnly) {
    await expect(section.getByText(project.title, { exact: true })).toBeVisible();
  }
  for (const project of nonMobile) {
    await expect(section.getByText(project.title, { exact: true })).not.toBeVisible();
  }

  await section.getByRole("button", { name: CATEGORY_FILTERS[0].label, exact: true }).click();
  for (const project of curatedProjects) {
    await expect(section.getByText(project.title, { exact: true })).toBeVisible();
  }
});

test("opening a project from the ranked list shows its case study", async ({ page }) => {
  await page.goto("");
  const section = page.locator("#projects");
  const sample = curatedProjects[0];

  await section.getByRole("button", { name: new RegExp(sample.title) }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: sample.title })).toBeVisible();
  await expect(dialog.getByText(sample.long)).toBeVisible();

  await dialog.getByRole("button", { name: "Fechar" }).click();
  await expect(dialog).not.toBeVisible();
});

test('"outros projetos no GitHub" link points at the real profile with the right count', async ({ page }) => {
  await page.goto("");
  const link = page.locator("#projects").getByRole("link", { name: `+ ${OTHERS_COUNT} outros projetos no GitHub` });

  await expect(link).toHaveAttribute("href", "https://github.com/devAndreotti?tab=repositories");
});
