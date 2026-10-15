---
title: Um blog dentro do portfólio, publicado com git push
date: 2026-10-15
description: Como os posts deste site viram páginas de verdade a partir de arquivos Markdown, sem CMS e sem banco de dados.
tags: [blog, vite, cloudflare]
draft: true
---

Este blog não tem painel nem login. Cada post é um arquivo Markdown em
`src/content/posts/`, e publicar é fazer commit e `git push` na `main`.

## Como um arquivo vira página

O build do Vite lê os arquivos, converte o Markdown em HTML e escreve uma página
estática para cada post em `blog/<slug>/index.html`. Quem chega por um buscador
recebe o texto pronto; no navegador, o React assume a página em seguida.

O mesmo build gera o feed RSS em `/blog/rss.xml` e acrescenta os posts ao `sitemap.xml`.

## Escrevendo um post

O começo do arquivo diz o que o site precisa saber:

```md
---
title: Meu post
date: 2026-10-15
description: Uma frase para o buscador e para o card.
tags: [react, css]
draft: true
---
```

Com `draft: true`, o post aparece só no `npm run dev`. O build deixa o texto de fora.

## Curtidas sem conta

O botão de curtir fala com o Worker que já serve o site. Cada visitante vira um hash
de IP, navegador e um segredo, e o banco aceita uma curtida por hash em cada post.
