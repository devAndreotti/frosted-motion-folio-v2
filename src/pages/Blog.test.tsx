import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { PostMeta } from '@/lib/blog/types';
import Blog from './Blog';
import BlogPost from './BlogPost';

const POSTS = vi.hoisted(() => {
  const meta = (slug: string, date: string, tags: string[], image?: string): PostMeta => ({
    slug,
    title: `Post ${slug}`,
    date,
    description: `Sobre ${slug}`,
    tags,
    minutes: 4,
    draft: false,
    ...(image ? { image } : {}),
  });
  return [
    meta('novo', '2026-10-15', ['css', 'react'], '/blog/novo/midia-1.jpg'),
    meta('meio', '2026-03-01', ['react']),
    meta('velho', '2025-05-20', ['css']),
  ];
});

// only 'novo' has an English version
vi.mock('@/lib/blog/catalog', () => ({
  posts: POSTS,
  findPost: (slug: string) => POSTS.find((post) => post.slug === slug),
  hasTranslation: (slug: string) => slug === 'novo',
  localize: (post: PostMeta, lang: string) => (lang === 'en' && post.slug === 'novo' ? { ...post, title: 'Post novo (EN)', minutes: 2 } : post),
  loadPostBody: (slug: string, lang = 'pt') =>
    slug === 'meio'
      ? Promise.reject(new Error('chunk failed'))
      : Promise.resolve({
          html: lang === 'en' && slug === 'novo' ? '<p>English body.</p>' : '<h2 id="a">A</h2><p>Corpo do post.</p>',
          toc: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
          lang: lang === 'en' && slug === 'novo' ? 'en' : 'pt',
        }),
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

  it('lists the posts by year with newest featured, card grid, instant search, and external fallback', () => {
    renderAt('/blog/');
    expect(document.title).toBe('Escritos — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'Escritos' })).toBeTruthy();
    expect(screen.getByText(/Mais recente/).closest('a')?.getAttribute('href')).toBe('/blog/novo/');
    expect(screen.getByRole('heading', { name: '2026 · 2 posts' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '2025 · 1 post' })).toBeTruthy();

    // Cards and thumbnail verification
    const cards = document.querySelectorAll('.blog-card');
    expect(cards.length).toBe(3);
    const novoCard = document.querySelector('article.blog-card a[href="/blog/novo/"]');
    expect(novoCard?.querySelector('img')?.getAttribute('src')).toBe('/blog/novo/midia-1.jpg');
    const velhoCard = document.querySelector('article.blog-card a[href="/blog/velho/"]');
    expect(velhoCard?.querySelector('img')).toBeNull();

    // Discrete DuckDuckGo external fallback link
    const extLink = screen.getByRole('link', { name: /DuckDuckGo/i });
    expect(extLink.getAttribute('href')).toContain('https://duckduckgo.com/?q=site%3Adevandreotti.com');
    expect(extLink.getAttribute('target')).toBe('_blank');

    // Instant search filtering
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'velho' } });
    expect(screen.queryByText(/Mais recente/)).toBeNull();
    expect(screen.queryByText('Post meio')).toBeNull();
    expect(screen.getByText('Post velho')).toBeTruthy();
    expect(screen.getByText(/Exibindo 1 post para "velho"/)).toBeTruthy();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Post meio')).toBeTruthy();
  });

  it('searches posts in real time by description and tags', () => {
    renderAt('/blog/');
    const searchInput = screen.getByRole('searchbox');

    // Search by description "Sobre meio"
    fireEvent.change(searchInput, { target: { value: 'Sobre meio' } });
    expect(screen.getByText('Post meio')).toBeTruthy();
    expect(screen.queryByText('Post velho')).toBeNull();

    // Search by tag "react"
    fireEvent.change(searchInput, { target: { value: 'react' } });
    expect(screen.getByText('Post meio')).toBeTruthy();
    expect(screen.queryByText('Post velho')).toBeNull();
  });

  it('lets the visitor change the accent color from the blog bar, as on the home page', () => {
    renderAt('/blog/');
    fireEvent.click(screen.getByRole('button', { name: 'Escolher cor de destaque' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cor de destaque: Roxo' }));
    expect(localStorage.getItem('hue')).toBe('purple');
    // the popover closes after a pick
    expect(screen.queryByRole('button', { name: 'Cor de destaque: Roxo' })).toBeNull();
  });

  it('filters by tag, without the featured post, shows active counter indicator, and clears via button', () => {
    renderAt('/blog/');
    const cssBtn = screen.getByRole('button', { name: '#css' });
    fireEvent.click(cssBtn);
    expect(cssBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByText(/Mais recente/)).toBeNull();
    expect(screen.queryByText('Post meio')).toBeNull();
    expect(screen.getByText('Post velho')).toBeTruthy();

    // Active tag indicator and clear button
    expect(screen.getByText('Exibindo 2 posts com a tag #css')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeTruthy();

    // Toggle off by clicking the active tag pill again
    fireEvent.click(cssBtn);
    expect(cssBtn.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('Post meio')).toBeTruthy();
    expect(screen.queryByText('Limpar filtros')).toBeNull();

    // Filter again and clear with the "Limpar filtros" button
    fireEvent.click(cssBtn);
    expect(screen.getByText('Exibindo 2 posts com a tag #css')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByText('Post meio')).toBeTruthy();
    expect(screen.queryByText('Limpar filtros')).toBeNull();

    // Also verify "todos" button resets active tag
    fireEvent.click(screen.getByRole('button', { name: '#css' }));
    expect(screen.getByText('Exibindo 2 posts com a tag #css')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'todos' }));
    expect(screen.getByText('Post meio')).toBeTruthy();
  });

  it('shows the English version to an English visitor, and says so', async () => {
    localStorage.setItem('lang.picked', 'en');
    renderAt('/blog/novo/');
    expect(screen.getByRole('heading', { level: 1, name: 'Post novo (EN)' })).toBeTruthy();
    expect(await screen.findByText('English body.')).toBeTruthy();
    expect(screen.getByText('Translated from Portuguese by AI.')).toBeTruthy();
    expect(document.querySelector('article')?.getAttribute('lang')).toBe('en');
  });

  it('tells an English visitor when a post only exists in Portuguese', async () => {
    localStorage.setItem('lang.picked', 'en');
    renderAt('/blog/velho/');
    expect(await screen.findByText('This post is only available in Portuguese.')).toBeTruthy();
    expect(document.querySelector('article')?.getAttribute('lang')).toBe('pt-BR');
  });

  it('lists the English titles for an English visitor', () => {
    localStorage.setItem('lang.picked', 'en');
    renderAt('/blog/');
    expect(screen.getAllByText('Post novo (EN)').length).toBeGreaterThan(0);
    expect(screen.getByText('Post velho')).toBeTruthy();
  });

  it('opens a post: text, table of contents, neighbours, and no like button without a Worker', async () => {
    renderAt('/blog/novo/');
    expect(screen.getByRole('heading', { level: 1, name: 'Post novo' })).toBeTruthy();
    expect(await screen.findByText('Corpo do post.')).toBeTruthy();
    expect(screen.getByRole('complementary', { name: 'Neste post' })).toBeTruthy();
    expect(screen.getAllByText('Post meio')[0].closest('a')?.getAttribute('href')).toBe('/blog/meio/');
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

  it('supports initial filter via URL and card footer tag badges', () => {
    renderAt('/blog/?tag=react');
    expect(screen.getByRole('button', { name: '#react' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByText('Post velho')).toBeNull();
    expect(screen.getByText('Post meio')).toBeTruthy();

    // Click tag badge on card to switch filter to #css
    const cssBadge = screen.getByRole('button', { name: 'Tag #css' });
    fireEvent.click(cssBadge);
    expect(screen.getByRole('button', { name: '#css' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Post velho')).toBeTruthy();
  });
});
