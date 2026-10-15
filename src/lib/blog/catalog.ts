import type { TocEntry } from './markdown';
import { visiblePosts } from './list';
import type { PostMeta } from './types';

// The posts the app knows about, read from src/content/posts/ at build time by
// vite-plugins/blog.ts. The list (`?meta`) is small and bundled; each post's text
// is its own chunk, fetched when the post opens. `<post>.en.md` is the English
// version of `<post>.md`: same slug, its own title, description and text.

type Body = { html: string; toc: TocEntry[] };
type Lang = 'pt' | 'en';

const metas = import.meta.glob<PostMeta | null>('/src/content/posts/*.md', { eager: true, import: 'meta', query: '?meta' });
const bodies = import.meta.glob<Body>('/src/content/posts/*.md');

const isEnglish = (file: string) => /\.en\.md(\?meta)?$/.test(file);

const originals = Object.entries(metas).filter(([file, meta]) => meta && !isEnglish(file));

/** Newest first; drafts only on the dev server. */
export const posts: PostMeta[] = visiblePosts(
  originals.map(([, meta]) => meta as PostMeta),
  import.meta.env.DEV
);

const loaders = new Map<string, () => Promise<Body>>();
const translations = new Map<string, { meta: PostMeta; load: () => Promise<Body> }>();
for (const [file, meta] of Object.entries(metas)) {
  if (!meta) continue;
  const load = bodies[file.replace(/\?meta$/, '')];
  if (!load) continue;
  if (isEnglish(file)) translations.set(meta.slug, { meta, load });
  else loaders.set(meta.slug, load);
}

export function findPost(slug: string | undefined): PostMeta | undefined {
  return posts.find((post) => post.slug === slug);
}

export function hasTranslation(slug: string): boolean {
  return translations.has(slug);
}

/** The post as the visitor's language shows it: the English title, description and reading time when there is an English version. */
export function localize(post: PostMeta, lang: Lang): PostMeta {
  const en = lang === 'en' ? translations.get(post.slug)?.meta : undefined;
  return en ? { ...post, title: en.title, description: en.description, minutes: en.minutes } : post;
}

/** The post's text in `lang`, falling back to Portuguese; `lang` says which one came back. */
export async function loadPostBody(slug: string, lang: Lang = 'pt'): Promise<Body & { lang: Lang }> {
  const original = loaders.get(slug);
  if (!original || !findPost(slug)) throw new Error(`no post "${slug}"`);
  const en = lang === 'en' ? translations.get(slug) : undefined;
  const { html, toc } = await (en ? en.load() : original());
  return { html, toc, lang: en ? 'en' : 'pt' };
}
