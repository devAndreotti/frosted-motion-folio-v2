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
    await stabilize(page);
    await page.goto(path);
    await settle(page);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      // canvas e vídeo são efeitos de TV e fundo em loop, e o palco do notebook 3D troca a imagem pelo canvas quando
      // carrega: a comparação ignora o que eles desenham
      mask: [page.locator("canvas, video, .nb3d-stage")],
    });
  });
}
