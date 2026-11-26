import { describe, expect, it } from 'vitest';
import { collectTags, filterByTag, filterPosts, formatDay, groupByYear, neighbours, searchPosts, sortPosts, visiblePosts } from './list';
import type { PostMeta } from './types';

const p = (slug: string, date: string, tags: string[] = [], draft = false): PostMeta => ({
  slug,
  title: slug.toUpperCase(),
  date,
  description: '',
  tags,
  minutes: 1,
  draft,
});

const posts = [p('b', '2025-12-01', ['css']), p('a', '2026-10-15', ['css', 'react']), p('c', '2026-03-02', ['react']), p('d', '2026-11-01', [], true)];

describe('blog list', () => {
  it('sorts newest first, title on ties', () => {
    expect(sortPosts([p('z', '2026-01-01'), p('y', '2026-01-01'), p('x', '2026-02-01')]).map((post) => post.slug)).toEqual(['x', 'y', 'z']);
  });

  it('hides drafts unless asked', () => {
    expect(visiblePosts(posts, false).map((post) => post.slug)).toEqual(['a', 'c', 'b']);
    expect(visiblePosts(posts, true)[0].slug).toBe('d');
  });

  it('filters by tag and ranks tags by use', () => {
    expect(filterByTag(posts, 'react').map((post) => post.slug)).toEqual(['a', 'c']);
    expect(filterByTag(posts, null)).toBe(posts);
    expect(collectTags(posts)).toEqual(['css', 'react']);
  });

  it('searches and filters posts by query in title, description and tags', () => {
    const list: PostMeta[] = [
      { slug: 'p1', title: 'Aprenda React', date: '2026-01-01', description: 'Guia basico', tags: ['frontend'], minutes: 2, draft: false },
      { slug: 'p2', title: 'Dominando CSS', date: '2026-01-02', description: 'Grid e Flex', tags: ['estilo'], minutes: 3, draft: false },
      { slug: 'p3', title: 'TypeScript avancado', date: '2026-01-03', description: 'Tipagem de React', tags: ['ts'], minutes: 4, draft: false },
    ];
    // Search in title
    expect(searchPosts(list, 'CSS').map((p) => p.slug)).toEqual(['p2']);
    // Search in description
    expect(searchPosts(list, 'flex').map((p) => p.slug)).toEqual(['p2']);
    // Search in tags
    expect(searchPosts(list, 'frontend').map((p) => p.slug)).toEqual(['p1']);
    // Filter combined
    expect(filterPosts(list, 'frontend', 'react').map((p) => p.slug)).toEqual(['p1']);
    expect(filterPosts(list, 'frontend', 'css').map((p) => p.slug)).toEqual([]);
  });

  it('groups by year, newest year first', () => {
    expect(groupByYear(visiblePosts(posts, false)).map((g) => [g.year, g.posts.map((post) => post.slug)])).toEqual([
      ['2026', ['a', 'c']],
      ['2025', ['b']],
    ]);
  });

  it('finds the newer and older post', () => {
    const shown = visiblePosts(posts, false);
    expect(neighbours(shown, 'c')).toEqual({ newer: shown[0], older: shown[2] });
    expect(neighbours(shown, 'a').newer).toBeUndefined();
    expect(neighbours(shown, 'nope')).toEqual({});
  });

  it('formats a calendar day in both languages', () => {
    expect(formatDay('2026-10-05', 'pt')).toBe('05 out 2026');
    expect(formatDay('2026-10-05', 'pt', false)).toBe('05 out');
    expect(formatDay('2026-10-05', 'en')).toBe('Oct 5, 2026');
    expect(formatDay('2026-10-05', 'en', false)).toBe('Oct 5');
  });
});
