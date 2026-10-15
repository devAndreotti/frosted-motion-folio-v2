import { test, expect } from "@playwright/test";

// The dev server: posts come straight from src/content/posts/ (drafts too) and there
// is no Worker, so the like button stays hidden and the rest of the page works.
test("the nav leads to the blog, the list opens a post and the post leads back", async ({ page }) => {
  await page.goto("");
  const blogLink = page.getByTestId("nav-bar").getByRole("link", { name: "Blog" });
  await expect(blogLink).toHaveAttribute("href", /\/blog\/$/);

  await page.goto("blog/");
  await expect(page.getByRole("heading", { level: 1, name: "Escritos" })).toBeVisible();
  await expect(page.getByRole("search")).toHaveAttribute("action", "https://duckduckgo.com/");

  const first = page.locator(".blog-row").first();
  const title = (await first.locator(".blog-row-t").textContent()) ?? "";
  await first.click();
  await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+\/$/);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.locator(".prose p").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar link" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Curtir/ })).toHaveCount(0);

  await page.getByRole("link", { name: "~/blog" }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test("an unknown post shows the 404 page", async ({ page }) => {
  await page.goto("blog/post-que-nao-existe/");
  await expect(page.getByText("/blog/post-que-nao-existe/")).toBeVisible();
});

test("the blog pages fit a phone without sideways scroll", async ({ page }) => {
  for (const [width, path] of [320, 390].flatMap((w) => ["blog/", "blog/um-blog-publicado-com-git-push/"].map((p) => [w, p] as const))) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
    // the bar is clipped, not scrolled: its last control must still be on screen
    const theme = await page.getByRole("button", { name: "Alternar tema claro/escuro" }).boundingBox();
    expect(theme!.x + theme!.width, `${width} ${path}`).toBeLessThanOrEqual(width);
  }
});
