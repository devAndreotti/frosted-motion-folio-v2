import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { PostMeta } from '@/lib/blog/types';
import MostRead from './MostRead';

const POSTS = vi.hoisted(() => {
  const meta = (slug: string): PostMeta => ({ slug, title: `Post ${slug}`, date: '2026-10-01', description: '', tags: [], minutes: 3, draft: false });
  return [meta('um'), meta('dois')];
});

vi.mock('@/lib/blog/catalog', () => ({
  posts: POSTS,
  localize: (post: PostMeta) => post,
}));

const answer = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } }));

const renderList = () =>
  render(
    <LanguageProvider>
      <MemoryRouter>
        <MostRead />
      </MemoryRouter>
    </LanguageProvider>
  );

describe('MostRead', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows nothing while the blog is below the limit', async () => {
    const fetchMock = vi.fn(() => answer({ enabled: false, total: 42 }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderList();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(container.querySelector('section')).toBeNull();
    expect(screen.queryByText('Mais lidos')).toBeNull();
  });

  it('shows the ranked posts once enabled', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        answer({
          enabled: true,
          total: 500,
          posts: [
            { slug: 'dois', views: 300 },
            { slug: 'um', views: 200 },
          ],
        })
      )
    );
    renderList();
    expect(await screen.findByText('Mais lidos')).toBeTruthy();
    const items = screen.getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['Post dois300 leituras', 'Post um200 leituras']);
  });

  it('shows nothing when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    const { container } = renderList();
    await Promise.resolve();
    await Promise.resolve();
    expect(container.querySelector('section')).toBeNull();
  });
});
