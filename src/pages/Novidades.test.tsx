import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CHANGELOG, LATEST_CHANGE } from '@/data/changelog';
import { SEEN_KEY } from '@/lib/novidades';
import Novidades from './Novidades';

const renderPage = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <MemoryRouter>
          <Novidades />
        </MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>
  );

describe('novidades page', () => {
  beforeEach(() => localStorage.clear());

  it('lists the changes in Portuguese, grouped by date, newest first', () => {
    renderPage();
    expect(document.title).toBe('Novidades — Ricardo A. Gonçalves');
    expect(screen.getByRole('heading', { level: 1, name: 'Novidades' })).toBeTruthy();
    const dates = Array.from(document.querySelectorAll('section.blog-year time')).map((t) => t.getAttribute('datetime'));
    expect(dates[0]).toBe(LATEST_CHANGE);
    expect(dates).toEqual([...new Set(CHANGELOG.map((entry) => entry.date))]);
    expect(screen.getByRole('heading', { level: 3, name: CHANGELOG[0].title.pt })).toBeTruthy();
  });

  it('shows the same list in English', () => {
    localStorage.setItem('lang.picked', 'en');
    renderPage();
    expect(document.title).toBe("What's new — Ricardo A. Gonçalves");
    expect(screen.getByRole('heading', { level: 3, name: CHANGELOG[0].title.en })).toBeTruthy();
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('en');
  });

  it('marks the newest change as seen, so the badge goes away', () => {
    renderPage();
    expect(localStorage.getItem(SEEN_KEY)).toBe(LATEST_CHANGE);
  });
});
