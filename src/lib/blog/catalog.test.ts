import { describe, expect, it } from 'vitest';
import { findPost, hasTranslation, loadPostBody, localize, posts } from './catalog';

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

  it('serves the English version where there is one, and Portuguese where there is not', async () => {
    const translated = posts.filter((post) => hasTranslation(post.slug));
    expect(translated.length).toBeGreaterThan(0);
    for (const post of translated) {
      const en = await loadPostBody(post.slug, 'en');
      expect(en.lang).toBe('en');
      expect(localize(post, 'en').title).not.toBe(post.title);
      expect(localize(post, 'pt')).toBe(post);
      expect(localize(post, 'en').slug).toBe(post.slug);
      expect(localize(post, 'en').date).toBe(post.date);
    }
    // a post without an English file falls back: same object, Portuguese text
    const alone = posts.find((post) => !hasTranslation(post.slug));
    if (alone) {
      expect(localize(alone, 'en')).toBe(alone);
      expect((await loadPostBody(alone.slug, 'en')).lang).toBe('pt');
    }
  });

  it('knows no post that is not there', async () => {
    expect(findPost('nao-existe')).toBeUndefined();
    expect(findPost(undefined)).toBeUndefined();
    await expect(loadPostBody('nao-existe')).rejects.toThrow(/nao-existe/);
  });
});
