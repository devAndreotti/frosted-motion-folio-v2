import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CASES, caseBySlug } from '@/data/cases';
import { SITE } from '../blog/page';
import { isPlainClick } from './caseLink';
import { caseUrl, extendSitemapWithCases, projectsIndex, renderCasePage } from './page';

// the real app shell, so a change to index.html that breaks the swap fails here
const template = readFileSync('index.html', 'utf8');
const sitemap = readFileSync('public/sitemap.xml', 'utf8');
const starbucks = caseBySlug('starbucks')!;

describe('prerendered case pages', () => {
  it('gives a case its own head: title, description, canonical, og and hreflang for PT and EN', () => {
    const html = renderCasePage(template, starbucks, '/');
    expect(html).toContain(`<title>${starbucks.title} — Ricardo A. Gonçalves</title>`);
    expect(html).toContain(`<meta name="description" content="${starbucks.description.pt}" />`);
    expect(html).toContain(`<link rel="canonical" href="${SITE}/projetos/starbucks/" />`);
    expect(html).toContain('<meta property="og:url" content="https://devandreotti.com/projetos/starbucks/" />');
    expect(html).toContain('<link rel="alternate" hreflang="en" href="https://devandreotti.com/projetos/starbucks/?lang=en" />');
  });

  it('describes the case as a CreativeWork in JSON-LD', () => {
    const html = renderCasePage(template, starbucks, '/');
    // the home page's Person block comes first in the template; the case's own block is the CreativeWork one
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const ld = blocks.find((block) => block['@type'] === 'CreativeWork')!;
    expect(ld).toBeDefined();
    expect(ld.name).toBe(starbucks.title);
    expect(ld.codeRepository).toBe(starbucks.githubUrl);
  });

  it('puts the case text in the root and keeps the app shell', () => {
    const html = renderCasePage(template, starbucks, '/');
    expect(html).toContain('<div id="root"><main class="wrap blog-main">');
    expect(html).toContain(`<h1 class="post-h">${starbucks.title}</h1>`);
    expect(html).toContain(`<p>${starbucks.long.pt}</p>`);
    expect(html).toContain('<a class="post-back" href="/#projects">~/projetos</a>');
    expect(html).toContain(`<img src="/projects/starbucks/01.webp"`);
  });

  it('escapes what comes from the data, and leaves out the "what I did" list when there is none', () => {
    const escaped = { ...starbucks, title: 'A <b> & "c"', points: { pt: [], en: [] } };
    const html = renderCasePage(template, escaped, '/');
    expect(html).toContain('A &lt;b&gt; &amp; &quot;c&quot;');
    expect(html).not.toContain('O que eu fiz');
  });

  it('builds a page for every case, each on its own URL', () => {
    const urls = new Set(CASES.map((c) => caseUrl(c.slug)));
    expect(urls.size).toBe(CASES.length);
  });
});

describe('case pages in the build outputs', () => {
  it('lists the slugs the Worker accepts', () => {
    expect(JSON.parse(projectsIndex(CASES)).slugs).toEqual(CASES.map((c) => c.slug));
  });

  it('adds one sitemap entry per case, and keeps the existing ones', () => {
    const out = extendSitemapWithCases(sitemap, CASES);
    for (const c of CASES) expect(out).toContain(`<loc>${SITE}/projetos/${c.slug}/</loc>`);
    expect(out).toContain('<loc>https://devandreotti.com/privacidade/</loc>');
    expect(out.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('refuses a sitemap without its closing tag', () => {
    expect(() => extendSitemapWithCases('<urlset></urlset-broken>', CASES)).toThrow(/no <\/urlset>/);
  });
});

describe('isPlainClick', () => {
  const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
  it('is a left click without modifiers', () => {
    expect(isPlainClick(click)).toBe(true);
    expect(isPlainClick({ ...click, button: 1 })).toBe(false);
    for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const) expect(isPlainClick({ ...click, [key]: true })).toBe(false);
  });
});
