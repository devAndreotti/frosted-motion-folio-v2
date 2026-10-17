import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { USES_CATEGORIES } from '@/data/uses';
import Uses from './Uses';

const renderPage = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <MemoryRouter>
          <Uses />
        </MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>
  );

describe('uses page', () => {
  beforeEach(() => localStorage.clear());

  it('has its own title and the seven categories in Portuguese', () => {
    renderPage();
    expect(document.title).toBe('O que eu uso — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'O que eu uso no dia a dia.' })).toBeTruthy();
    for (const name of ['Hardware', 'Sistema', 'Editor', 'Terminal', 'IA', 'Serviços', 'Stack']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    }
    expect(screen.getByText('Cloudflare')).toBeTruthy();
    expect(screen.getByText('Atualizado em 17 de outubro de 2026.')).toBeTruthy();
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('pt-BR');
  });

  it('links the categories from an index, in the order of the page', () => {
    renderPage();
    const index = screen.getByRole('navigation', { name: 'Categorias' });
    const links = within(index).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#hardware', '#sistema', '#editor-terminal', '#ia', '#servicos', '#stack']);
    expect(links[2].textContent).toBe(`Editor e terminal${USES_CATEGORIES.filter((c) => c.id === 'editor' || c.id === 'terminal').reduce((n, c) => n + c.items.length, 0)}`);
  });

  it('counts the items of each category from the data, and tags one main pick per category', () => {
    renderPage();
    for (const category of USES_CATEGORIES) {
      const heading = screen.getByRole('heading', { level: 2, name: category.label.pt });
      expect(heading.parentElement?.querySelector('.us-count')?.textContent).toBe(
        category.items.length === 1 ? '1 item' : `${category.items.length} itens`
      );
    }
    expect(screen.getAllByText('principal')).toHaveLength(USES_CATEGORIES.filter((c) => c.items.some((i) => i.main)).length);
  });

  it('shows the Stack levels as tags on the cards, in Portuguese', () => {
    renderPage();
    const stack = document.getElementById('stack');
    expect(stack).toBeTruthy();
    const tags = Array.from(stack?.querySelectorAll('.us-level') ?? []).map((tag) => tag.textContent);
    expect(tags).toEqual([...Array(3).fill('uso diário'), ...Array(3).fill('alta habilidade'), ...Array(4).fill('aprendendo')]);
    expect(within(stack as HTMLElement).getByText('Rust')).toBeTruthy();
  });

  it('says the same in English', () => {
    localStorage.setItem('lang.picked', 'en');
    renderPage();
    expect(document.title).toBe('Uses — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'What I use day to day.' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Services' })).toBeTruthy();
    const tags = Array.from(document.querySelectorAll('#stack .us-level')).map((tag) => tag.textContent);
    expect(tags).toEqual([...Array(3).fill('daily'), ...Array(3).fill('expert'), ...Array(4).fill('learning')]);
    expect(screen.getByText('Updated on October 17, 2026.')).toBeTruthy();
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('en');
  });
});
