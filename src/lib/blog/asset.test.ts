import { describe, expect, it } from 'vitest';
import { blogAsset } from './asset';

describe('blogAsset', () => {
  it('returns empty string for falsy input', () => {
    expect(blogAsset()).toBe('');
    expect(blogAsset('')).toBe('');
  });

  it('keeps external URLs intact', () => {
    expect(blogAsset('https://example.com/pic.png')).toBe('https://example.com/pic.png');
    expect(blogAsset('http://example.com/pic.png')).toBe('http://example.com/pic.png');
    expect(blogAsset('data:image/png;base64,...')).toBe('data:image/png;base64,...');
  });

  it('prepends BASE_URL and strips leading slashes or dots', () => {
    const base = import.meta.env.BASE_URL || '/';
    expect(blogAsset('/blog/my-post/pic.jpg')).toBe(`${base}blog/my-post/pic.jpg`);
    expect(blogAsset('./blog/my-post/pic.jpg')).toBe(`${base}blog/my-post/pic.jpg`);
    expect(blogAsset('blog/my-post/pic.jpg')).toBe(`${base}blog/my-post/pic.jpg`);
  });
});
