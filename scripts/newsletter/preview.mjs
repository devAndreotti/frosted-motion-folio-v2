#!/usr/bin/env node
// Gera HTMLs de prévia do e-mail: node scripts/newsletter/preview.mjs <pasta> [cor ...]
// Sem cores, gera a cor sorteada da semana. Ex.: preview.mjs /tmp/prev black blue purple
import fs from 'node:fs';
import path from 'node:path';
import { renderConfirmation, renderNewsletter } from './template.mjs';
import { SAMPLE } from './sample.mjs';

const [dir, ...hues] = process.argv.slice(2);
if (!dir) {
  console.error('uso: node scripts/newsletter/preview.mjs <pasta> [cor ...]');
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });
for (const hue of hues.length ? hues : [undefined]) {
  const { html, hue: used } = renderNewsletter(SAMPLE.pt, { hue });
  fs.writeFileSync(path.join(dir, `news-${used}.html`), html);
  console.log(`news-${used}.html`);
}
const confirmation = renderConfirmation({ lang: 'pt', confirmUrl: 'https://devandreotti.com/api/newsletter/confirm?t=exemplo&l=pt' });
fs.writeFileSync(path.join(dir, 'confirm.html'), confirmation.html);
console.log('confirm.html');
