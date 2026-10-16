import type { Page } from "@playwright/test";

// Tudo que muda sem o código mudar é congelado aqui: relógio, dados do GitHub, Math.random e o fim das animações.

// 16 out 2026, 12:00 em São Paulo: o relógio do site e os "há X dias" ficam fixos.
export const FIXED_NOW = new Date("2026-10-16T15:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

const GH_PATTERN = /\/api\/gh\/|api\.github\.com\/|github-contributions-api\.jogruber\.de\//;

function contributions() {
  const end = FIXED_NOW.getTime();
  const days = [];
  for (let i = 729; i >= 0; i--) {
    const date = new Date(end - i * DAY_MS).toISOString().slice(0, 10);
    const count = (i * 7 + 3) % 11 === 0 ? 0 : (i * 13) % 9;
    const level = count === 0 ? 0 : Math.min(4, Math.ceil(count / 2));
    days.push({ date, count, level });
  }
  return { contributions: days };
}

function events() {
  const ago = (min: number) => new Date(end() - min * 60000).toISOString();
  const end = () => FIXED_NOW.getTime();
  return [
    { id: "1", type: "PushEvent", repo: { name: "devAndreotti/self-sync-daily" }, created_at: ago(35), payload: { commits: [{ message: "fix: corrige cálculo" }] } },
    { id: "2", type: "PullRequestEvent", repo: { name: "devAndreotti/ai-memory" }, created_at: ago(190), payload: { action: "opened", pull_request: { title: "feat: add scoped queries" } } },
    { id: "3", type: "WatchEvent", repo: { name: "shadcn-ui/ui" }, created_at: ago(60 * 26), payload: {} },
    { id: "4", type: "CreateEvent", repo: { name: "devAndreotti/quality-gate" }, created_at: ago(60 * 50), payload: { ref_type: "branch", ref: "main" } },
  ];
}

/** Congela o relógio, mocka o GitHub e fixa o gerador aleatório antes da primeira navegação. */
export async function stabilize(page: Page) {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript(() => {
    let seed = 42;
    Math.random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  });
  await page.route(GH_PATTERN, (route) => {
    const url = route.request().url();
    const body = url.includes("contributions") ? contributions() : url.includes("events") ? events() : { public_repos: 42 };
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
}

/** Espera a rede parar, carrega as seções preguiçosas rolando a página e volta ao topo. */
export async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const step = Math.max(400, window.innerHeight);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  await page.waitForLoadState("networkidle");
  await page.mouse.move(0, 0);
}
