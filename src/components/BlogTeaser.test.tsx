import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { PostMeta } from '@/lib/blog/types';

const catalog = vi.hoisted(() => ({ posts: [] as PostMeta[] }));
vi.mock('@/lib/blog/catalog', () => catalog);

import BlogTeaser from './BlogTeaser';

const post = (n: number, extra?: Partial<PostMeta>): PostMeta => ({
  slug: `post-${n}`,
  title: `Post ${n}`,
  date: `2026-0${n}-01`,
  description: n === 1 ? 'Resumo' : '',
  tags: ['css'],
  minutes: 2,
  draft: false,
  ...extra,
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

  it('renders thumbnail when post.image is present and omits when absent', () => {
    catalog.posts = [
      post(1, { image: '/blog/post-1/thumb.webp' }),
      post(2, { image: undefined }),
    ];
    renderTeaser();
    const thumbs = document.querySelectorAll('.teaser-thumb');
    expect(thumbs).toHaveLength(1);
    expect(thumbs[0].getAttribute('src')).toBe('/blog/post-1/thumb.webp');
    expect(thumbs[0].getAttribute('loading')).toBe('lazy');
  });

  it('renders metadata with date, bullet separator and reading time', () => {
    catalog.posts = [post(1, { date: '2026-01-15', minutes: 5 })];
    renderTeaser();
    const meta = document.querySelector('.teaser-m');
    expect(meta).toBeTruthy();
    expect(meta?.querySelector('time')?.getAttribute('dateTime')).toBe('2026-01-15');
    expect(meta?.querySelector('.teaser-dot')?.textContent).toBe('•');
    expect(meta?.textContent).toContain('5 min de leitura');
  });

  it('renders title, description and tag pill badges', () => {
    catalog.posts = [
      post(1, {
        title: 'Guia de CSS Moderno',
        description: 'Aprenda tudo sobre flex e grid em duas linhas.',
        tags: ['css', 'frontend'],
      }),
    ];
    renderTeaser();
    const heading = screen.getByRole('heading', { name: 'Guia de CSS Moderno' });
    expect(heading.tagName.toLowerCase()).toBe('h3');
    expect(heading.className).toContain('teaser-h');

    const desc = document.querySelector('.teaser-p');
    expect(desc?.textContent).toBe('Aprenda tudo sobre flex e grid em duas linhas.');

    const tags = document.querySelectorAll('.teaser-tags .blog-card-tag');
    expect(tags).toHaveLength(2);
    expect(tags[0].textContent).toBe('#css');
    expect(tags[1].textContent).toBe('#frontend');
  });

  it('omits tags container when post has no tags', () => {
    catalog.posts = [post(1, { tags: [] })];
    renderTeaser();
    expect(document.querySelector('.teaser-tags')).toBeNull();
  });
});
