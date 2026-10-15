import type { TocEntry } from './markdown';
import { visiblePosts } from './list';
import type { PostMeta } from './types';

// The posts the app knows about, read from src/content/posts/ at build time by
// vite-plugins/blog.ts. The list (`?meta`) is small and bundled; each post's text
// is its own chunk, fetched when the post opens.

const metas = import.meta.glob<PostMeta | null>('/src/content/posts/*.md', { eager: true, import: 'meta', query: '?meta' });
const bodies = import.meta.glob<{ html: string; toc: TocEntry[] }>('/src/content/posts/*.md');

/** Newest first; drafts only on the dev server. */
export const posts: PostMeta[] = visiblePosts(Object.values(metas).filter(Boolean), import.meta.env.DEV);

const loaders = new Map<string, () => Promise<{ html: string; toc: TocEntry[] }>>();
for (const [file, meta] of Object.entries(metas)) {
  if (!meta) continue;
  const load = bodies[file.replace(/\?meta$/, '')];
  if (load) loaders.set(meta.slug, load);
}

export function findPost(slug: string | undefined): PostMeta | undefined {
  return posts.find((post) => post.slug === slug);
}

export async function loadPostBody(slug: string): Promise<{ html: string; toc: TocEntry[] }> {
  const load = loaders.get(slug);
  if (!load || !findPost(slug)) throw new Error(`no post "${slug}"`);
  const { html, toc } = await load();
  return { html, toc };
}
