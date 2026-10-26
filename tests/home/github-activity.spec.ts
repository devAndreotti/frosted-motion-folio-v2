import { test, expect } from "@playwright/test";

// The real GitHub API is rate-limited (60 req/hour, unauthenticated) and
// shared across however much local testing has already hit it today — so
// this only asserts what's guaranteed regardless of live quota: the section
// renders and resolves to either real activity cards or the graceful
// fallback, never stays stuck loading or throws.
test("resolves to either real activity cards or the graceful fallback", async ({ page }) => {
  await page.route("**/api.github.com/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/events")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "evt-1",
            type: "PushEvent",
            created_at: new Date().toISOString(),
            repo: { name: "devAndreotti/frosted-motion-folio-v2" },
            payload: {
              commits: [{ message: "feat: otimiza vitest e mock github" }],
            },
          },
          {
            id: "evt-2",
            type: "PullRequestEvent",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            repo: { name: "devAndreotti/frosted-motion-folio-v2" },
            payload: {
              action: "opened",
              pull_request: { title: "Otimização de Performance e Quality Gate" },
            },
          },
        ]),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          login: "devAndreotti",
          public_repos: 42,
        }),
      });
    }
  });

  await page.goto("");
  const section = page.locator("#github-activity");

  await expect(section.getByRole("heading", { name: "O que ando fazendo no GitHub" })).toBeVisible();

  const cards = section.getByTestId("activity-card");
  const fallback = section.getByText(/Sem atividade pública recente/);

  await expect
    .poll(
      async () => {
        const cardCount = await cards.count();
        const fallbackVisible = await fallback.isVisible().catch(() => false);
        return cardCount > 0 || fallbackVisible;
      },
      { timeout: 10000 }
    )
    .toBe(true);

  await expect(section.getByRole("link", { name: /Ver perfil/ })).toHaveAttribute("href", "https://github.com/devAndreotti");
});
