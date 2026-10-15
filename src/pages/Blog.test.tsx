import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { PostMeta } from '@/lib/blog/types';
import Blog from './Blog';
import BlogPost from './BlogPost';

const POSTS = vi.hoisted(() => {
  const meta = (slug: string, date: string, tags: string[]): PostMeta => ({
    slug,
    title: `Post ${slug}`,
    date,
    description: `Sobre ${slug}`,
    tags,
    minutes: 4,
    draft: false,
  });
  return [meta('novo', '2026-10-15', ['css', 'react']), meta('meio', '2026-03-01', ['react']), meta('velho', '2025-05-20', ['css'])];
});

vi.mock('@/lib/blog/catalog', () => ({
  posts: POSTS,
  findPost: (slug: string) => POSTS.find((post) => post.slug === slug),
  loadPostBody: (slug: string) =>
    slug === 'meio' ? Promise.reject(new Error('chunk failed')) : Promise.resolve({ html: '<h2 id="a">A</h2><p>Corpo do post.</p>', toc: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }] }),
}));

const renderAt = (path: string) =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>
  );

describe('blog pages', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no worker'))));
    window.scrollTo = vi.fn();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('lists the posts by year with the newest featured, and searches through DuckDuckGo', () => {
    renderAt('/blog/');
    expect(document.title).toBe('Escritos — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'Escritos' })).toBeTruthy();
    expect(screen.getByText(/Mais recente/).closest('a')?.getAttribute('href')).toBe('/blog/novo/');
    expect(screen.getByRole('heading', { name: '2026 · 2 posts' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '2025 · 1 post' })).toBeTruthy();
    const form = screen.getByRole('search');
    expect(form.getAttribute('action')).toBe('https://duckduckgo.com/');
    expect((form.querySelector('input[name="sites"]') as HTMLInputElement).value).toBe('devandreotti.com');
  });

  it('filters by tag, without the featured post', () => {
    renderAt('/blog/');
    fireEvent.click(screen.getByRole('button', { name: '#css' }));
    expect(screen.getByRole('button', { name: '#css' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByText(/Mais recente/)).toBeNull();
    expect(screen.queryByText('Post meio')).toBeNull();
    expect(screen.getByText('Post velho')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'todos' }));
    expect(screen.getByText('Post meio')).toBeTruthy();
  });

  it('opens a post: text, table of contents, neighbours, and no like button without a Worker', async () => {
    renderAt('/blog/novo/');
    expect(screen.getByRole('heading', { level: 1, name: 'Post novo' })).toBeTruthy();
    expect(await screen.findByText('Corpo do post.')).toBeTruthy();
    expect(screen.getByRole('complementary', { name: 'Neste post' })).toBeTruthy();
    expect(screen.getByText('Post meio').closest('a')?.getAttribute('href')).toBe('/blog/meio/');
    expect(document.title).toBe('Post novo — Ricardo A. Gonçalves');
    await waitFor(() => expect(screen.queryByRole('button', { name: /Curtir/ })).toBeNull());
    expect(screen.getByRole('button', { name: 'Copiar link' })).toBeTruthy();
  });

  it('says so when the text fails to load', async () => {
    renderAt('/blog/meio/');
    expect(await screen.findByText('Não foi possível carregar este post.')).toBeTruthy();
  });

  it('answers an unknown post with the 404 page', async () => {
    renderAt('/blog/nao-existe/');
    expect(await screen.findByText('/blog/nao-existe/')).toBeTruthy();
  });
});
