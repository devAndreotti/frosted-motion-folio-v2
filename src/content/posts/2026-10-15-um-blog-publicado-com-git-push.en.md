---
title: A blog inside my portfolio, published with git push
date: 2026-10-15
description: How the posts on this site become real pages from Markdown files, with no CMS, and everything you can use in a post.
tags: [blog, vite, cloudflare]
draft: false
source: dab116de3cf5
---

This blog has no dashboard and no login. Each post is a Markdown file in
`src/content/posts/`, and publishing is a commit and a `git push` to `main`.

This post is also the **template**: it uses everything the blog supports. Compare the
text you are reading with the [source file on GitHub](https://github.com/devAndreotti/frosted-motion-folio-v2/blob/main/src/content/posts/2026-10-15-um-blog-publicado-com-git-push.md).

## How a file becomes a page

The Vite build reads the files, converts the Markdown into HTML and writes a static page
for each post at `blog/<slug>/index.html`. Whoever arrives from a search engine gets the
finished text; in the browser, React takes over the page right after.

The same build generates the RSS feed at `/blog/rss.xml` and adds the posts to `sitemap.xml`.

## Creating a post

From the terminal, the script creates the file with the date, slug and header:

```bash
npm run novo-post -- "Título do post"             # rascunho (draft: true)
npm run novo-post -- "Título do post" --publicar  # já publicado
git add -A && git commit -m "post: título" && git push
```

The top of the file tells the site what it needs to know:

```md
---
title: Meu post
date: 2026-10-15
description: Uma frase para o buscador e para o card.
tags: [react, css]
draft: false
---
```

With `draft: true`, the post only shows up on `npm run dev`. The build leaves the text out.

## Everything you can use

### Text

You can use **bold**, *italic*, `inline code` and [links](https://devandreotti.com).
Links to other sites open in a new tab.

> Quotes get a bar in the site's accent color.

### Lists

- bulleted lists;
- with as many items as you need.

1. numbered lists;
2. for step-by-step guides.

### Code

Code blocks use a monospaced font and scroll sideways:

```ts
export function slugFromPath(file: string): string {
  const name = file.split(/[\\/]/).pop() ?? '';
  return name.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}
```

### Tables

| Field | Required | Example |
| --- | --- | --- |
| `title` | yes | `Meu post` |
| `date` | yes | `2026-10-15` |
| `description` | no | `Uma frase para o card` |
| `tags` | no | `[react, css]` |
| `draft` | no | `true` |

### Images

Put the file in `public/blog/<post-slug>/` and point to
`/blog/<post-slug>/file.jpg`. An image from the site itself, as an example:

![Sharing image of the portfolio](/og-image.png)

---

## Likes without an account

The like button talks to the Worker that already serves the site. Each visitor becomes a
hash of IP, browser and a secret, and the database (D1, from Cloudflare) accepts one like
per hash on each post. There are no cookies and no accounts.
