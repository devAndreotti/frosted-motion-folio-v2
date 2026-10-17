import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NOW_ARCHIVE } from '@/data/now-archive';
import { NOW_UPDATED } from '@/data/now';
import Agora from './Agora';

const renderPage = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <MemoryRouter>
          <Agora />
        </MemoryRouter>
      </ThemeProvider>
    </LanguageProvider>
  );

const dateOf = (iso: string, lang: 'pt-BR' | 'en-US') =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });

describe('página /agora', () => {
  beforeEach(() => localStorage.clear());

  it('mostra em PT a data mais recente (NOW_UPDATED) e o arquivo por data', () => {
    renderPage();
    expect(document.title).toBe('Agora — Ricardo A. Gonçalves');
    const latest = document.querySelector('time[datetime]');
    expect(latest?.getAttribute('datetime')).toBe(NOW_UPDATED);
    expect(latest?.textContent).toBe(`Atualizado em ${dateOf(NOW_UPDATED, 'pt-BR')}`);
    expect(screen.getByRole('heading', { level: 2, name: 'Arquivo' })).toBeTruthy();
    for (const v of NOW_ARCHIVE.slice(1)) {
      expect(document.querySelector(`time[datetime="${v.date}"]`)?.textContent).toBe(dateOf(v.date, 'pt-BR'));
    }
  }, 20000); // the first render of a page on this 2-core box is slow

  it('mostra em inglês', () => {
    localStorage.setItem('lang.picked', 'en');
    renderPage();
    expect(document.querySelector('main')?.getAttribute('lang')).toBe('en');
    expect(screen.getByRole('heading', { level: 2, name: 'Archive' })).toBeTruthy();
    expect(document.querySelector('time[datetime]')?.textContent).toBe(`Updated on ${dateOf(NOW_UPDATED, 'en-US')}`);
  });
});
