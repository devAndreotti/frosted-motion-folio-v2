#!/usr/bin/env node
// Cria um post novo em src/content/posts/ com o front matter pronto.
//   npm run novo-post -- "Título do post"            cria o rascunho (draft: true)
//   npm run novo-post -- "Título do post" --publicar  cria já publicado (draft: false)
// Depois é só escrever o texto, trocar draft para false e fazer commit + push.
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.resolve(__dirname, '../src/content/posts');

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildPost({ title, date, draft }) {
  return `---
title: ${title}
date: ${date}
description: Uma frase para o card do blog e para o buscador.
tags: [blog]
draft: ${draft}
---

Escreva aqui. Use \`## Subtítulo\` para criar seções.
`;
}

function main(argv) {
  const args = argv.filter((a) => !a.startsWith('--'));
  const publish = argv.includes('--publicar');
  const title = args.join(' ').trim();
  if (!title) {
    console.error('Uso: npm run novo-post -- "Título do post" [--publicar]');
    process.exit(1);
  }
  const slug = slugify(title);
  if (!slug) {
    console.error('O título precisa ter letras ou números.');
    process.exit(1);
  }
  const date = today();
  const file = path.join(DIR, `${date}-${slug}.md`);
  const taken = fs.readdirSync(DIR).find((f) => f.replace(/^\d{4}-\d{2}-\d{2}-/, '') === `${slug}.md`);
  if (taken) {
    console.error(`Já existe um post com o slug "${slug}": src/content/posts/${taken}`);
    process.exit(1);
  }
  fs.writeFileSync(file, buildPost({ title, date, draft: !publish }));
  console.log(`Criado: ${path.relative(process.cwd(), file)}`);
  console.log(publish ? 'Publicado (draft: false). Faça commit + push.' : 'Rascunho (draft: true). Quando terminar, troque para draft: false, commit + push.');
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { slugify, buildPost };
