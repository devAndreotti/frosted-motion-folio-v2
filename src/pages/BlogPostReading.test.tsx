import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { PostMeta } from '@/lib/blog/types';
import BlogPost from './BlogPost';

const POST = vi.hoisted(
  (): PostMeta => ({ slug: 'novo', title: 'Post novo', date: '2026-10-15', description: 'Sobre', tags: ['css'], minutes: 4, draft: false })
);

vi.mock('@/lib/blog/catalog', () => ({
  posts: [POST],
  findPost: (slug: string) => (slug === POST.slug ? POST : undefined),
  hasTranslation: () => true,
  localize: (post: PostMeta) => post,
  loadPostBody: () => Promise.resolve({ html: '<p>Corpo do post.</p>', toc: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], lang: 'pt' }),
}));

const renderPost = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/blog/novo/']}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>
  );

const frame = () => document.querySelector('.blog');

describe('post reading mode', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn();
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no worker'))));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('turns on and off with its button, with aria-pressed, and remembers it on the next visit', async () => {
    const first = renderPost();
    expect(await screen.findByText('Corpo do post.')).toBeTruthy();
    const button = screen.getByRole('button', { name: 'Modo leitura' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(frame()?.classList.contains('reading')).toBe(false);

    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(frame()?.classList.contains('reading')).toBe(true);
    expect(localStorage.getItem('post-reading-mode')).toBe('1');
    first.unmount();

    // a later visit starts in reading mode; the same button turns it off
    renderPost();
    expect(await screen.findByText('Corpo do post.')).toBeTruthy();
    expect(frame()?.classList.contains('reading')).toBe(true);
    const again = screen.getByRole('button', { name: 'Modo leitura' });
    expect(again.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(again);
    expect(frame()?.classList.contains('reading')).toBe(false);
    expect(localStorage.getItem('post-reading-mode')).toBe('0');
  });

  it('leaves with Escape', async () => {
    localStorage.setItem('post-reading-mode', '1');
    renderPost();
    expect(await screen.findByText('Corpo do post.')).toBeTruthy();
    expect(frame()?.classList.contains('reading')).toBe(true);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(frame()?.classList.contains('reading')).toBe(false);
    expect(screen.getByRole('button', { name: 'Modo leitura' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('shows the English label to an English visitor', async () => {
    localStorage.setItem('lang.picked', 'en');
    renderPost();
    expect(await screen.findByText('Corpo do post.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reading mode' }));
    expect(frame()?.classList.contains('reading')).toBe(true);
  });
});
