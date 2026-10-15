import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { PostMeta } from '@/lib/blog/types';

const catalog = vi.hoisted(() => ({ posts: [] as PostMeta[] }));
vi.mock('@/lib/blog/catalog', () => catalog);

import BlogTeaser from './BlogTeaser';

const post = (n: number): PostMeta => ({
  slug: `post-${n}`,
  title: `Post ${n}`,
  date: `2026-0${n}-01`,
  description: n === 1 ? 'Resumo' : '',
  tags: ['css'],
  minutes: 2,
  draft: false,
});

const renderTeaser = () =>
  render(
    <LanguageProvider>
      <BlogTeaser />
    </LanguageProvider>
  );

describe('BlogTeaser', () => {
  it('stays out of the home page until a post is published', () => {
    catalog.posts = [];
    const { container } = renderTeaser();
    expect(container.innerHTML).toBe('');
  });

  it('shows the three newest posts and the way into the blog', () => {
    catalog.posts = [post(4), post(3), post(2), post(1)];
    renderTeaser();
    expect(screen.getByRole('heading', { name: 'Notas de quem constrói o próprio site.' })).toBeTruthy();
    expect(screen.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/blog/',
      '/blog/rss.xml',
      '/blog/post-4/',
      '/blog/post-3/',
      '/blog/post-2/',
    ]);
  });
});
