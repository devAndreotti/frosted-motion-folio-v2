import { describe, expect, it } from 'vitest';
import { relatedPosts } from './related';
import { PAGE_SIZE } from './list';
import type { PostMeta } from './types';

const post = (slug: string, date: string, tags: string[]): PostMeta => ({ slug, title: slug, date, description: '', tags, minutes: 1, draft: false });

describe('relatedPosts', () => {
  const posts = [
    post('atual', '2026-10-10', ['css', 'react']),
    post('mesmo-duas', '2026-01-01', ['css', 'react']),
    post('mesmo-uma-nova', '2026-09-01', ['react']),
    post('mesmo-uma-velha', '2025-01-01', ['css']),
    post('sem-tag', '2026-10-01', ['go']),
    post('sem-tag-2', '2026-05-01', ['go']),
  ];

  it('puts the posts sharing the most tags first', () => {
    expect(relatedPosts(posts, 'atual').map((p) => p.slug).slice(0, 2)).toEqual(['mesmo-duas', 'mesmo-uma-nova']);
  });

  it('fills up with the newest posts when there are not enough with shared tags', () => {
    const slugs = relatedPosts(posts, 'atual', 5).map((p) => p.slug);
    expect(slugs).toEqual(['mesmo-duas', 'mesmo-uma-nova', 'mesmo-uma-velha', 'sem-tag', 'sem-tag-2']);
  });

  it('never includes the post itself, and returns [] for an unknown slug', () => {
    expect(relatedPosts(posts, 'atual').some((p) => p.slug === 'atual')).toBe(false);
    expect(relatedPosts(posts, 'nao-existe')).toEqual([]);
  });

  it('respects the count (3 by default)', () => {
    expect(relatedPosts(posts, 'atual')).toHaveLength(3);
  });

  it('keeps the list page size at 20', () => {
    expect(PAGE_SIZE).toBe(20);
  });
});
