import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Privacy from './Privacy';

const renderPage = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <MemoryRouter>
          <Privacy />
        </MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>
  );

describe('privacy page', () => {
  beforeEach(() => localStorage.clear());

  it('says in Portuguese what is kept, for how long, and how to leave', () => {
    renderPage();
    expect(document.title).toBe('Privacidade — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'Privacidade' })).toBeTruthy();
    expect(screen.getByText(/apagado em até 7 dias/)).toBeTruthy();
    expect(screen.getByText(/Ao sair, o endereço é apagado na hora/)).toBeTruthy();
    // the contact shows in the page and in the shell's footer
    for (const link of screen.getAllByRole('link', { name: 'devandreotti@gmail.com' })) expect(link.getAttribute('href')).toBe('mailto:devandreotti@gmail.com');
  });

  it('says the same in English', () => {
    localStorage.setItem('lang.picked', 'en');
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy' })).toBeTruthy();
    expect(screen.getByText(/deleted within 7 days/)).toBeTruthy();
    expect(document.querySelector('article')?.getAttribute('lang')).toBe('en');
  });
});
