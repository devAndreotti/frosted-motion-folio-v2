import { test, expect } from "@playwright/test";

// The real GitHub API is rate-limited (60 req/hour, unauthenticated) and
// shared across however much local testing has already hit it today — so
// this only asserts what's guaranteed regardless of live quota: the section
// renders and resolves to either real activity cards or the graceful
// fallback, never stays stuck loading or throws.
test("resolves to either real activity cards or the graceful fallback, and prev/next don't throw", async ({ page }) => {
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

  const next = section.getByRole("button", { name: "Próxima atividade" });
  await next.click();
  await section.getByRole("button", { name: "Atividade anterior" }).click();
  await expect(section.getByRole("heading", { name: "O que ando fazendo no GitHub" })).toBeVisible();

  await expect(section.getByRole("link", { name: "Ver tudo no GitHub" })).toHaveAttribute("href", "https://github.com/devAndreotti");
});
