import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { isTranslationFile, parsePost } from '../src/lib/blog/parse';
import { renderMarkdown } from '../src/lib/blog/markdown';
import { sortPosts } from '../src/lib/blog/list';
import { BLOG_DESCRIPTION, buildRss, extendSitemap, postImage, renderIndexPage, renderPostPage } from '../src/lib/blog/page';
import { writeShareImages } from './og-image';
import type { PostMeta } from '../src/lib/blog/types';

// The blog: posts are Markdown files in src/content/posts/.
//   - `import x from 'post.md'` becomes { meta, html, toc } (`?meta` -> meta only, so the
//     list stays small and each post's text lands in its own lazy chunk)
//   - drafts exist on the dev server only: a build ships none of their text and makes no page
//   - after a build, writes the real HTML pages (blog/index.html, blog/<slug>/index.html),
//     blog/rss.xml, blog/index.json (the slugs the Worker accepts) and the sitemap entries
//   - and the share images og/<slug>.png (and og/<slug>-en.png for a translated post), 1200x630

// the kicker above a card's title: the blog's name in each language
const BLOG_KICKER = 'Escritos · devandreotti.com';
const BLOG_KICKER_EN = 'Writing · devandreotti.com';
const BLOG_DESCRIPTION_EN = 'Notes on front-end, small infrastructure and the decisions behind devandreotti.com.';

export const POSTS_DIR = path.resolve(__dirname, '../src/content/posts');

interface PostFile {
  meta: PostMeta;
  body: string;
  /** true for `<post>.en.md`, the English version of `<post>.md` */
  en: boolean;
}

function readPosts(dir: string): PostFile[] {
  if (!fs.existsSync(dir)) return [];
  const posts = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({ ...parsePost(file, fs.readFileSync(path.join(dir, file), 'utf8')), en: isTranslationFile(file) }));
  const seen = new Set<string>();
  for (const { meta, en } of posts) {
    const key = `${meta.slug}:${en ? 'en' : 'pt'}`;
    if (seen.has(key)) throw new Error(`blog: two ${en ? 'English versions' : 'posts'} use the slug "${meta.slug}"`);
    seen.add(key);
  }
  for (const { meta, en } of posts) {
    if (en && !seen.has(`${meta.slug}:pt`)) throw new Error(`blog: the English version of "${meta.slug}" has no original post`);
  }
  return posts;
}

/** An English version follows its original: a draft original ships no English text either. */
function originalIsDraft(dir: string, slug: string): boolean {
  const original = readPosts(dir).find((post) => !post.en && post.meta.slug === slug);
  return !original || original.meta.draft;
}

function write(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export function blogPlugin(dir = POSTS_DIR): Plugin {
  let isBuild = false;
  let outDir = '';
  let base = '/';
  return {
    name: 'blog',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
      outDir = path.resolve(config.root, config.build.outDir);
      base = config.base;
    },
    transform(code, id) {
      const [file, query = ''] = id.split('?');
      if (!file.endsWith('.md') || !path.resolve(file).startsWith(dir)) return null;
      const { meta, body } = parsePost(path.basename(file), code);
      // a build ships nothing of a draft, not even its title
      const dropped = meta.draft || (isTranslationFile(file) && originalIsDraft(dir, meta.slug));
      if (dropped && isBuild) return { code: 'export const meta = null;\nexport const html = "";\nexport const toc = [];\n', map: null };
      if (/(^|&)meta(&|$)/.test(query)) return { code: `export const meta = ${JSON.stringify(meta)};\n`, map: null };
      const { html, toc } = renderMarkdown(body);
      return {
        code: `export const meta = ${JSON.stringify(meta)};\nexport const html = ${JSON.stringify(html)};\nexport const toc = ${JSON.stringify(toc)};\n`,
        map: null,
      };
    },
    async closeBundle() {
      if (!isBuild) return;
      const all = readPosts(dir);
      const posts = all.filter(({ meta, en }) => !en && !meta.draft);
      const translated = new Set(all.filter(({ en }) => en).map(({ meta }) => meta.slug));
      const metas = sortPosts(posts.map(({ meta }) => meta));
      // one card per published post, and one per English version of a published post (its title and description)
      const englishOf = all.filter(({ en, meta }) => en && posts.some((post) => post.meta.slug === meta.slug));
      const cards = [
        ...posts.map(({ meta }) => ({ name: meta.slug, card: { kicker: BLOG_KICKER, title: meta.title, subtitle: meta.description || BLOG_DESCRIPTION } })),
        ...englishOf.map(({ meta }) => ({ name: `${meta.slug}-en`, card: { kicker: BLOG_KICKER_EN, title: meta.title, subtitle: meta.description || BLOG_DESCRIPTION_EN } })),
      ];
      const images = await writeShareImages(outDir, cards);
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      write(path.join(outDir, 'blog/index.html'), renderIndexPage(template, metas, base));
      for (const { meta, body } of posts) {
        const image = images.has(meta.slug) ? postImage(meta.slug) : undefined;
        write(path.join(outDir, 'blog', meta.slug, 'index.html'), renderPostPage(template, meta, renderMarkdown(body).html, base, translated.has(meta.slug), image));
      }
      write(path.join(outDir, 'blog/rss.xml'), buildRss(metas));
      write(path.join(outDir, 'blog/index.json'), JSON.stringify({ slugs: metas.map((meta) => meta.slug) }));
      const sitemap = path.join(outDir, 'sitemap.xml');
      if (fs.existsSync(sitemap)) write(sitemap, extendSitemap(fs.readFileSync(sitemap, 'utf8'), metas));
    },
  };
}
