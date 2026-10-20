import { beforeEach, describe, expect, it } from 'vitest';
import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import BlogShell from './BlogShell';
import { blogNavActive } from './blogNav';

const renderAt = (path: string) =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <BlogShell title="x">
            <p>conteudo</p>
          </BlogShell>
        </MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>
  );

/** The link marked as the current page, by its text, inside the header nav. */
const currentIn = (scope: HTMLElement) =>
  within(scope)
    .queryAllByRole('link')
    .filter((a) => a.getAttribute('aria-current') === 'page')
    .map((a) => a.textContent);

describe('blogNavActive', () => {
  it('marks the link of the route, with or without trailing slash and sub-paths', () => {
    expect(blogNavActive('/')).toBe('home');
    expect(blogNavActive('/blog')).toBe('blog');
    expect(blogNavActive('/blog/')).toBe('blog');
    expect(blogNavActive('/blog/meu-post')).toBe('blog');
    expect(blogNavActive('/uses')).toBe('uses');
    expect(blogNavActive('/uses/')).toBe('uses');
    expect(blogNavActive('/novidades/')).toBe('novidades');
  });

  it('marks nothing for other routes and for prefixes that only look alike', () => {
    expect(blogNavActive('/agora/')).toBeNull();
    expect(blogNavActive('/privacidade')).toBeNull();
    expect(blogNavActive('/blogueiro')).toBeNull();
    expect(blogNavActive('/usesx')).toBeNull();
  });
});

describe('BlogShell active link', () => {
  beforeEach(() => localStorage.clear());

  it('puts aria-current on "O que eu uso" (not Blog) when the page is /uses', () => {
    const { container } = renderAt('/uses');
    const header = container.querySelector('header') as HTMLElement;
    expect(currentIn(header)).toEqual(['O que eu uso']);
    expect(header.querySelector('a.nl.on')?.textContent).toBe('O que eu uso');
    expect(within(header).getByRole('link', { name: 'Blog' }).getAttribute('aria-current')).toBeNull();
  });

  it('marks Blog on /blog and on a post', () => {
    const { container, unmount } = renderAt('/blog/');
    expect(currentIn(container.querySelector('header') as HTMLElement)).toEqual(['Blog']);
    unmount();
    const post = renderAt('/blog/algum-post');
    expect(currentIn(post.container.querySelector('header') as HTMLElement)).toEqual(['Blog']);
  });

  it('ends with the same bottom bar as the home: copyright and back to top, no link list', () => {
    const { container } = renderAt('/novidades/');
    const footer = container.querySelector('footer') as HTMLElement;
    expect(footer.className).toBe('ft');
    expect(within(footer).getByRole('button', { name: /voltar ao topo|back to top/i })).toBeTruthy();
    expect(within(footer).queryByRole('navigation')).toBeNull();
  });
});
