import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { PostMeta } from '@/lib/blog/types';
import Blog from './Blog';

// 25 posts, one a day, newest first (as the catalog gives them), so the list has to be cut at 20
const POSTS = vi.hoisted(() =>
  Array.from({ length: 25 }, (_, i) => {
    const day = String(25 - i).padStart(2, '0');
    return { slug: `falso-${day}`, title: `Falso ${day}`, date: `2026-10-${day}`, description: '', tags: ['teste'], minutes: 1, draft: false } as PostMeta;
  })
);

vi.mock('@/lib/blog/catalog', () => ({
  posts: POSTS,
  findPost: () => undefined,
  hasTranslation: () => false,
  localize: (post: PostMeta) => post,
  loadPostBody: () => Promise.reject(new Error('not used')),
}));

const renderList = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog/']}>
          <Routes>
            <Route path="/blog" element={<Blog />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>
  );

describe('lista do blog com mais de 20 posts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no worker'))));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('shows 20 posts and loads the rest with "Carregar mais posts"', () => {
    renderList();
    expect(screen.getAllByText('Falso 25').length).toBeGreaterThan(0);
    expect(screen.queryByText('Falso 06')).toBeTruthy();
    expect(screen.queryByText('Falso 05')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais posts' }));
    expect(screen.getByText('Falso 05')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Carregar mais posts' })).toBeNull();
  });
});
