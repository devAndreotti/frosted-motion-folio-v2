import type { PostMeta } from './types';

/** Newest first; same day falls back to the title so the order never depends on file order. */
export function sortPosts(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** What a visitor may see: drafts only where the caller says (the dev server). */
export function visiblePosts(posts: PostMeta[], showDrafts: boolean): PostMeta[] {
  return sortPosts(posts.filter((post) => showDrafts || !post.draft));
}

export function filterByTag(posts: PostMeta[], tag: string | null): PostMeta[] {
  return tag ? posts.filter((post) => post.tags.includes(tag)) : posts;
}

/** Every tag in use, the most used first. */
export function collectTags(posts: PostMeta[]): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);
}

/** Sorted posts grouped by year, newest year first. */
export function groupByYear(posts: PostMeta[]): { year: string; posts: PostMeta[] }[] {
  const groups: { year: string; posts: PostMeta[] }[] = [];
  for (const post of sortPosts(posts)) {
    const year = post.date.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last?.year === year) last.posts.push(post);
    else groups.push({ year, posts: [post] });
  }
  return groups;
}

/** The posts on either side of `slug` in the newest-first list (newer = the one above). */
export function neighbours(posts: PostMeta[], slug: string): { newer?: PostMeta; older?: PostMeta } {
  const sorted = sortPosts(posts);
  const i = sorted.findIndex((post) => post.slug === slug);
  if (i < 0) return {};
  return { newer: sorted[i - 1], older: sorted[i + 1] };
}

const MONTHS: Record<'pt' | 'en', string[]> = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** `2026-10-15` -> `15 out 2026` / `Oct 15, 2026`; `withYear: false` drops the year (the archive rows). */
export function formatDay(date: string, lang: 'pt' | 'en', withYear = true): string {
  const [y, m, d] = date.split('-');
  const month = MONTHS[lang][Number(m) - 1] ?? m;
  if (lang === 'en') return withYear ? `${month} ${Number(d)}, ${y}` : `${month} ${Number(d)}`;
  return withYear ? `${d} ${month} ${y}` : `${d} ${month}`;
}
