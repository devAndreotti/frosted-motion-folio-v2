import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
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

const panel = () => screen.getByRole('tabpanel');
const cardsIn = () => within(panel()).getAllByRole('listitem');
const pick = (name: string) => fireEvent.click(screen.getByRole('tab', { name }));

const groupItems = (ids: string[]) => USES_CATEGORIES.filter((c) => ids.includes(c.id)).flatMap((c) => c.items);

describe('uses page', () => {
  beforeEach(() => localStorage.clear());

  it('has its own title, the six tabs in order, and the first category open', () => {
    renderPage();
    expect(document.title).toBe('O que eu uso — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'O que eu uso.' })).toBeTruthy();
    const tabs = within(screen.getByRole('tablist', { name: 'Categorias' })).getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Hardware', 'Sistema', 'Editor e terminal', 'IA', 'Serviços', 'Stack']);
    expect(screen.getByRole('tab', { name: 'Hardware' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Sistema' }).getAttribute('aria-selected')).toBe('false');
    expect(screen.getByText('Atualizado em 17 de outubro de 2026.')).toBeTruthy();
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('pt-BR');
  });

  it('wires each tab to its panel', () => {
    renderPage();
    const tab = screen.getByRole('tab', { name: 'Hardware' });
    expect(tab.getAttribute('aria-controls')).toBe('us-panel-hardware');
    expect(panel().getAttribute('aria-labelledby')).toBe('us-tab-hardware');
  });

  it('shows only the selected category, with its item count', () => {
    renderPage();
    const hardware = USES_CATEGORIES.find((c) => c.id === 'hardware');
    expect(cardsIn()).toHaveLength(hardware?.items.length ?? -1);
    expect(screen.queryByText('Cloudflare')).toBeNull();
    pick('Serviços');
    expect(screen.getByText('Cloudflare')).toBeTruthy();
    expect(within(panel()).getByText('4 itens')).toBeTruthy();
  });

  it('counts each category from the data and tags one main pick per category', () => {
    renderPage();
    const counts = new Map<string, number>();
    for (const tab of ['Hardware', 'Sistema', 'Editor e terminal', 'IA', 'Serviços', 'Stack']) {
      pick(tab);
      counts.set(tab, cardsIn().length);
    }
    expect(counts.get('Editor e terminal')).toBe(groupItems(['editor', 'terminal']).length);
    expect(counts.get('IA')).toBe(USES_CATEGORIES.find((c) => c.id === 'ai')?.items.length);
    expect(counts.get('Stack')).toBe(21);
  });

  it('marks the main picks only in the selected category', () => {
    renderPage();
    expect(screen.getAllByText('principal')).toHaveLength(USES_CATEGORIES.find((c) => c.id === 'hardware')?.items.filter((i) => i.main).length ?? 0);
    pick('IA');
    expect(screen.getAllByText('principal')).toHaveLength(1);
    expect(screen.getByText('Claude Code')).toBeTruthy();
  });

  it('moves between tabs with arrow keys, Home and End', () => {
    renderPage();
    const list = screen.getByRole('tablist');
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Sistema' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(list, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Stack' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Hardware' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Stack' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(list, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Hardware' }).getAttribute('aria-selected')).toBe('true');
  });

  it('has previous and next buttons and one dot per card', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(document.querySelectorAll('.us-dot')).toHaveLength(cardsIn().length);
  });

  it('shows the Stack levels as tags on the cards, in Portuguese', () => {
    renderPage();
    pick('Stack');
    const tags = Array.from(document.querySelectorAll('.us-level')).map((tag) => tag.textContent);
    expect(tags).toEqual([...Array(8).fill('uso diário'), ...Array(9).fill('confortável'), ...Array(4).fill('aprendendo')]);
    expect(within(panel()).getByText('Rust')).toBeTruthy();
  });

  it('says the same in English', () => {
    localStorage.setItem('lang.picked', 'en');
    renderPage();
    expect(document.title).toBe('Uses — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'What I use.' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Services' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
    pick('Stack');
    const tags = Array.from(document.querySelectorAll('.us-level')).map((tag) => tag.textContent);
    expect(tags).toEqual([...Array(8).fill('daily'), ...Array(9).fill('comfortable'), ...Array(4).fill('learning')]);
    expect(screen.getByText('Updated on October 17, 2026.')).toBeTruthy();
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('en');
  });
});
