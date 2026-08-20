import { test, expect } from "@playwright/test";
import { projects } from "../../src/data/projects";

test("renders a card for every project", async ({ page }) => {
  await page.goto("");
  // Card titles are h3s scoped under #projects; count proves every entry in
  // the data file actually rendered, not just that the section exists.
  await expect(
    page.locator("#projects").getByRole("heading", { level: 3 })
  ).toHaveCount(projects.length);
});

test('project card with a live demo shows working "Código" and "Demo" links', async ({
  page,
}) => {
  const sample = projects.find((p) => p.githubUrl && p.liveUrl);
  if (!sample) test.skip(true, "no project in the data file has both links to test");

  await page.goto("");
  const card = page.getByTestId(`project-${sample!.id}`);
  await card.scrollIntoViewIfNeeded();

  await expect(card.getByRole("link", { name: "Código" })).toHaveAttribute(
    "href",
    sample!.githubUrl!
  );
  await expect(card.getByRole("link", { name: "Demo" })).toHaveAttribute(
    "href",
    sample!.liveUrl!
  );
});

test('project card without a live demo has no "Demo" link', async ({ page }) => {
  const sample = projects.find((p) => p.githubUrl && !p.liveUrl);
  if (!sample) test.skip(true, "every project in the data file has a liveUrl");

  await page.goto("");
  const card = page.getByTestId(`project-${sample!.id}`);
  await card.scrollIntoViewIfNeeded();

  await expect(card.getByRole("link", { name: "Código" })).toHaveAttribute(
    "href",
    sample!.githubUrl!
  );
  await expect(card.getByRole("link", { name: "Demo" })).toHaveCount(0);
});
