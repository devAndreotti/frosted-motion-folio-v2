---
title: Um blog dentro do portfólio, publicado com git push
date: 2026-10-15
description: Como os posts deste site viram páginas de verdade a partir de arquivos Markdown, sem CMS, e tudo o que dá para usar num post.
tags: [blog, vite, cloudflare]
draft: false
---

Este blog não tem painel nem login. Cada post é um arquivo Markdown em
`src/content/posts/`, e publicar é fazer commit e `git push` na `main`.

Este post também é o **modelo**: ele usa tudo o que o blog suporta. Compare o
texto que você está lendo com o [arquivo-fonte no GitHub](https://github.com/devAndreotti/frosted-motion-folio-v2/blob/main/src/content/posts/2026-10-15-um-blog-publicado-com-git-push.md).

## Como um arquivo vira página

O build do Vite lê os arquivos, converte o Markdown em HTML e escreve uma página
estática para cada post em `blog/<slug>/index.html`. Quem chega por um buscador
recebe o texto pronto; no navegador, o React assume a página em seguida.

O mesmo build gera o feed RSS em `/blog/rss.xml` e acrescenta os posts ao `sitemap.xml`.

## Criando um post

Pelo terminal, o script cria o arquivo com data, slug e cabeçalho:

```bash
npm run novo-post -- "Título do post"             # rascunho (draft: true)
npm run novo-post -- "Título do post" --publicar  # já publicado
git add -A && git commit -m "post: título" && git push
```

O começo do arquivo diz o que o site precisa saber:

```md
---
title: Meu post
date: 2026-10-15
description: Uma frase para o buscador e para o card.
tags: [react, css]
draft: false
---
```

Com `draft: true`, o post aparece só no `npm run dev`. O build deixa o texto de fora.

## Tudo o que dá para usar

### Texto

Dá para usar **negrito**, *itálico*, `código em linha` e [links](https://devandreotti.com).
Links para fora do site abrem em outra aba.

> Citações ganham uma barra na cor de destaque do site.

### Listas

- listas com marcadores;
- com quantos itens precisar.

1. listas numeradas;
2. para passo a passo.

### Código

Blocos de código ficam com fonte monoespaçada e rolagem lateral:

```ts
export function slugFromPath(file: string): string {
  const name = file.split(/[\\/]/).pop() ?? '';
  return name.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}
```

### Tabelas

| Campo | Obrigatório | Exemplo |
| --- | --- | --- |
| `title` | sim | `Meu post` |
| `date` | sim | `2026-10-15` |
| `description` | não | `Uma frase para o card` |
| `tags` | não | `[react, css]` |
| `draft` | não | `true` |

### Imagens

Coloque o arquivo em `public/blog/<slug-do-post>/` e aponte para
`/blog/<slug-do-post>/arquivo.jpg`. Uma imagem do próprio site, como exemplo:

![Imagem de compartilhamento do portfólio](/og-image.png)

---

## Curtidas sem conta

O botão de curtir fala com o Worker que já serve o site. Cada visitante vira um hash
de IP, navegador e um segredo, e o banco (D1, da Cloudflare) aceita uma curtida por
hash em cada post. Não há cookie nem conta.
