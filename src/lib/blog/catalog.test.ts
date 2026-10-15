import { describe, expect, it } from 'vitest';
import { findPost, loadPostBody, posts } from './catalog';

// Runs the real posts in src/content/posts/ through the blog plugin (vitest.config.ts),
// so a post that would fail the build fails here too.
describe('blog catalog', () => {
  it('reads every post, newest first, each with its text in its own chunk', async () => {
    expect(posts.length).toBeGreaterThan(0);
    expect([...posts].sort((a, b) => b.date.localeCompare(a.date))).toEqual(posts);
    for (const post of posts) {
      expect(findPost(post.slug)).toBe(post);
      const { html } = await loadPostBody(post.slug);
      expect(html.length).toBeGreaterThan(0);
    }
  });

  it('knows no post that is not there', async () => {
    expect(findPost('nao-existe')).toBeUndefined();
    expect(findPost(undefined)).toBeUndefined();
    await expect(loadPostBody('nao-existe')).rejects.toThrow(/nao-existe/);
  });
});
