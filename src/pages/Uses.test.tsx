import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
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

  it('has its own title and the six categories in Portuguese', () => {
    renderPage();
    expect(document.title).toBe('O que eu uso — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'O que eu uso no dia a dia.' })).toBeTruthy();
    for (const name of ['Hardware', 'Sistema', 'Editor', 'Terminal', 'IA', 'Serviços']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    }
    expect(screen.getByText('Cloudflare')).toBeTruthy();
    expect(screen.getByText('Atualizado em 16 de outubro de 2026.')).toBeTruthy();
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('pt-BR');
  });

  it('says the same in English', () => {
    localStorage.setItem('lang.picked', 'en');
    renderPage();
    expect(document.title).toBe('Uses — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'What I use day to day.' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Services' })).toBeTruthy();
    expect(screen.getByText('Updated on October 16, 2026.')).toBeTruthy();
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('en');
  });
});
