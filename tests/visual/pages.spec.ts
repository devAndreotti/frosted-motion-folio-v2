import { test, expect } from "@playwright/test";
import { settle, stabilize } from "./stable";

// Quatro páginas x 4 projetos (390 e 1280 px, claro e escuro): nomes em playwright.visual.config.ts.
const PAGES = [
  { name: "home", path: "" },
  { name: "blog", path: "blog/" },
  { name: "privacidade", path: "privacidade/" },
  { name: "404", path: "rota-que-nao-existe/" },
];

for (const { name, path } of PAGES) {
  test(`${name} não muda sem querer`, async ({ page }) => {
    if (name === "home") {
      test.setTimeout(75_000);
    }
    await stabilize(page);
    await page.goto(path);
    await settle(page);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      // canvas e vídeo são efeitos de TV e fundo em loop, o palco do notebook 3D e o carrossel de cartas
      // que cicla periodicamente: a comparação ignora o que eles desenham
      mask: [page.locator("canvas, video, .nb3d-stage, .hc-w")],
      // a home tem ~9.600 px de altura e o notebook 3D carrega junto: dois prints iguais seguidos passam dos 5 s padrão
      timeout: name === "home" ? 40_000 : 15_000,
    });
  });
}
