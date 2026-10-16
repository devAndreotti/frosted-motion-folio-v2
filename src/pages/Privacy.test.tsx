import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getByText('Privacidade', { selector: 'span.lbl' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Seus dados, sem letras miúdas.' })).toBeTruthy();
    // the newsletter card is the first one: its "how long" row
    expect(screen.getAllByText(/apagado em até 7 dias/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Cookies e navegador' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Cookies e armazenamento' })).toBeTruthy();
    // the contact shows in the page and in the shell's footer
    for (const link of screen.getAllByRole('link', { name: 'devandreotti@gmail.com' })) expect(link.getAttribute('href')).toBe('mailto:devandreotti@gmail.com');
    expect(screen.getByText('Atualizado em 15 de outubro de 2026.')).toBeTruthy();
  });

  it('says the same in English', () => {
    localStorage.setItem('lang.picked', 'en');
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Your data, no fine print.' })).toBeTruthy();
    expect(screen.getAllByText(/deleted within 7 days/).length).toBeGreaterThan(0);
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('en');
  });
});
