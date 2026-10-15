import { formatDay } from './list';
import type { PostMeta } from './types';

// Build-time only: turns the app's index.html into real HTML pages for /blog/ and
// each post, plus the RSS feed and the sitemap entries. Crawlers (and DuckDuckGo's
// site: search) read this HTML; in a browser React replaces the #root content on mount.

export const SITE = 'https://devandreotti.com';
export const BLOG_TITLE = 'Escritos — Ricardo A. Gonçalves';
export const BLOG_DESCRIPTION = 'Notas sobre front-end, infraestrutura pequena e as decisões por trás do devandreotti.com.';

export const blogUrl = (slug?: string) => (slug ? `${SITE}/blog/${slug}/` : `${SITE}/blog/`);

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

interface Head {
  title: string;
  description: string;
  url: string;
  type: 'website' | 'article';
  jsonLd?: object;
  /** hreflang links, for a post that has an English version. */
  alternates?: { hreflang: string; href: string }[];
}

function setMeta(html: string, attr: 'name' | 'property', key: string, value: string): string {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, (_m, open: string, close: string) => `${open}${escapeHtml(value)}${close}`);
}

/** Swaps the home page's title, description, canonical and social tags for the page's own. */
export function applyHead(template: string, head: Head): string {
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(head.title)}</title>`);
  html = setMeta(html, 'name', 'description', head.description);
  html = setMeta(html, 'property', 'og:title', head.title);
  html = setMeta(html, 'property', 'og:description', head.description);
  html = setMeta(html, 'property', 'og:type', head.type);
  html = setMeta(html, 'property', 'og:url', head.url);
  html = setMeta(html, 'name', 'twitter:title', head.title);
  html = setMeta(html, 'name', 'twitter:description', head.description);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${head.url}$2`);
  // the hreflang alternates point at the home page's ?lang= versions; posts have one language
  html = html.replace(/[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>\r?\n?/g, '');
  const ld = head.jsonLd ? `<script type="application/ld+json">${JSON.stringify(head.jsonLd).replace(/</g, '\\u003c')}</script>\n` : '';
  const alternates = (head.alternates ?? []).map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />\n`).join('');
  return html.replace('</head>', `${alternates}${ld}</head>`);
}

export function injectRoot(template: string, markup: string): string {
  if (!template.includes('<div id="root"></div>')) throw new Error('blog: index.html has no empty <div id="root"></div>');
  return template.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
}

const meta = (post: PostMeta) =>
  `<p class="post-meta"><time datetime="${post.date}">${formatDay(post.date, 'pt')}</time> · ${post.minutes} min de leitura</p>`;

export function renderPostPage(template: string, post: PostMeta, bodyHtml: string, base: string, hasEnglish = false): string {
  const markup =
    `<main class="wrap blog-main"><article class="post">` +
    `<a class="post-back" href="${base}blog/">~/blog</a>` +
    `<h1 class="post-h">${escapeHtml(post.title)}</h1>${meta(post)}` +
    `<div class="prose">${bodyHtml}</div></article></main>`;
  const head = applyHead(template, {
    title: `${post.title} — Ricardo A. Gonçalves`,
    description: post.description || BLOG_DESCRIPTION,
    url: blogUrl(post.slug),
    type: 'article',
    alternates: hasEnglish
      ? [
          { hreflang: 'pt-BR', href: blogUrl(post.slug) },
          { hreflang: 'en', href: `${blogUrl(post.slug)}?lang=en` },
          { hreflang: 'x-default', href: blogUrl(post.slug) },
        ]
      : undefined,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: blogUrl(post.slug),
      keywords: post.tags.join(', '),
      inLanguage: 'pt-BR',
      author: { '@type': 'Person', name: 'Ricardo A. Gonçalves', url: `${SITE}/` },
    },
  });
  return injectRoot(head, markup);
}

export function renderIndexPage(template: string, posts: PostMeta[], base: string): string {
  const items = posts
    .map((post) => `<li><a href="${base}blog/${post.slug}/">${escapeHtml(post.title)}</a> ${meta(post)}</li>`)
    .join('');
  const markup = `<main class="wrap blog-main"><h1 class="blog-h">Escritos</h1><p class="lead">${escapeHtml(BLOG_DESCRIPTION)}</p><ul>${items}</ul></main>`;
  const head = applyHead(template, { title: BLOG_TITLE, description: BLOG_DESCRIPTION, url: blogUrl(), type: 'website' });
  return injectRoot(head, markup);
}

const rfc822 = (date: string) => new Date(`${date}T12:00:00Z`).toUTCString();

export function buildRss(posts: PostMeta[]): string {
  const items = posts
    .map(
      (post) =>
        `  <item>\n    <title>${escapeHtml(post.title)}</title>\n    <link>${blogUrl(post.slug)}</link>\n` +
        `    <guid isPermaLink="true">${blogUrl(post.slug)}</guid>\n    <pubDate>${rfc822(post.date)}</pubDate>\n` +
        `    <description>${escapeHtml(post.description)}</description>\n` +
        post.tags.map((tag) => `    <category>${escapeHtml(tag)}</category>\n`).join('') +
        `  </item>\n`
    )
    .join('');
  const updated = posts[0] ? `  <lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>\n` : '';
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n` +
    `  <title>${escapeHtml(BLOG_TITLE)}</title>\n  <link>${blogUrl()}</link>\n  <description>${escapeHtml(BLOG_DESCRIPTION)}</description>\n` +
    `  <language>pt-BR</language>\n  <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />\n${updated}` +
    `${items}</channel>\n</rss>\n`
  );
}

/** Adds /blog/ and every post to the site's sitemap (public/sitemap.xml, copied into the build). */
export function extendSitemap(sitemap: string, posts: PostMeta[]): string {
  if (!sitemap.includes('</urlset>')) throw new Error('blog: sitemap.xml has no </urlset>');
  const lastmod = posts[0] ? `<lastmod>${posts[0].date}</lastmod>` : '';
  const entries = [
    `  <url>\n    <loc>${blogUrl()}</loc>\n    ${lastmod}\n    <changefreq>weekly</changefreq>\n  </url>\n`,
    ...posts.map((post) => `  <url>\n    <loc>${blogUrl(post.slug)}</loc>\n    <lastmod>${post.date}</lastmod>\n  </url>\n`),
  ].join('');
  return sitemap.replace('</urlset>', `${entries}</urlset>`);
}
