import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyHead, buildRss, escapeHtml, extendSitemap, injectRoot, renderIndexPage, renderPostPage } from './page';
import type { PostMeta } from './types';

// the real app shell, so a change to index.html that breaks the swaps fails here
const template = readFileSync('index.html', 'utf8');
const sitemap = readFileSync('public/sitemap.xml', 'utf8');

const post: PostMeta = {
  slug: 'meu-post',
  title: 'Meu <post> & "aspas"',
  date: '2026-10-15',
  description: 'Uma frase.',
  tags: ['css'],
  minutes: 3,
  draft: false,
};

describe('prerendered blog pages', () => {
  it('escapes text for HTML', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  it("gives a post page its own head: title, description, canonical, og, and no home hreflang", () => {
    const html = renderPostPage(template, post, '<p>corpo</p>', '/');
    expect(html).toContain('<title>Meu &lt;post&gt; &amp; &quot;aspas&quot; — Ricardo A. Gonçalves</title>');
    expect(html).toContain('<meta name="description" content="Uma frase." />');
    expect(html).toContain('<link rel="canonical" href="https://devandreotti.com/blog/meu-post/" />');
    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain('<meta property="og:url" content="https://devandreotti.com/blog/meu-post/" />');
    expect(html).toContain('<meta name="twitter:title" content="Meu &lt;post&gt;');
    expect(html).not.toContain('hreflang');
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('<div id="root"><main class="wrap blog-main"><article class="post"><a class="post-back" href="/blog/">');
    expect(html).toContain('<div class="prose"><p>corpo</p></div>');
    expect(html).toContain('15 out 2026');
  });

  it('points a post with an English version at ?lang=en', () => {
    const html = renderPostPage(template, post, '<p>corpo</p>', '/', true);
    expect(html).toContain('<link rel="alternate" hreflang="pt-BR" href="https://devandreotti.com/blog/meu-post/" />');
    expect(html).toContain('<link rel="alternate" hreflang="en" href="https://devandreotti.com/blog/meu-post/?lang=en" />');
    expect(html).toContain('hreflang="x-default"');
  });

  it('keeps </script> out of the JSON-LD', () => {
    const html = applyHead(template, { title: 't', description: 'd', url: 'u', type: 'article', jsonLd: { x: '</script><b>' } });
    expect(html).toContain('\\u003c/script>');
  });

  it('lists the posts on /blog/ under the build base', () => {
    const html = renderIndexPage(template, [post], '/frosted-motion-folio-v2/');
    expect(html).toContain('<a href="/frosted-motion-folio-v2/blog/meu-post/">');
    expect(html).toContain('<link rel="canonical" href="https://devandreotti.com/blog/" />');
  });

  it('refuses a template without an empty root', () => {
    expect(() => injectRoot('<div id="app"></div>', 'x')).toThrow(/root/);
  });

  it('builds an RSS feed', () => {
    const rss = buildRss([post]);
    expect(rss).toContain('<link>https://devandreotti.com/blog/meu-post/</link>');
    expect(rss).toContain('<pubDate>Thu, 15 Oct 2026 12:00:00 GMT</pubDate>');
    expect(rss).toContain('<category>css</category>');
    expect(buildRss([])).not.toContain('<item>');
  });

  it('adds /blog/ and the posts to the sitemap', () => {
    const xml = extendSitemap(sitemap, [post]);
    expect(xml).toContain('<loc>https://devandreotti.com/</loc>');
    expect(xml).toContain('<loc>https://devandreotti.com/blog/meu-post/</loc>');
    expect(xml.trim().endsWith('</urlset>')).toBe(true);
    expect(() => extendSitemap('<x/>', [])).toThrow(/urlset/);
  });
});
