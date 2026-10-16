import { sortPosts } from './list';
import type { PostMeta } from './types';

/**
 * Posts related to `slug`: the ones sharing the most tags first (newest first among equals),
 * then the newest of the rest, until there are `count`. Pure: runs on the list the page already has.
 */
export function relatedPosts(posts: PostMeta[], slug: string, count = 3): PostMeta[] {
  const current = posts.find((post) => post.slug === slug);
  if (!current) return [];
  const others = sortPosts(posts.filter((post) => post.slug !== slug));
  const shared = (post: PostMeta) => post.tags.filter((tag) => current.tags.includes(tag)).length;
  const withTags = others.filter((post) => shared(post) > 0).sort((a, b) => shared(b) - shared(a));
  const picked = withTags.slice(0, count);
  for (const post of others) {
    if (picked.length >= count) break;
    if (!picked.includes(post)) picked.push(post);
  }
  return picked;
}
