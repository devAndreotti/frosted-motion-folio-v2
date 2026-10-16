import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LATEST_CHANGE } from '@/data/changelog';
import { SEEN_KEY } from '@/lib/novidades';
import NovidadesBadge from './NovidadesBadge';

const renderBadge = () =>
  render(
    <LanguageProvider>
      <MemoryRouter>
        <NovidadesBadge />
      </MemoryRouter>
    </LanguageProvider>
  );

describe('NovidadesBadge', () => {
  beforeEach(() => localStorage.clear());

  it('shows "Novo" to a visitor who has not seen the newest change', () => {
    renderBadge();
    const badge = screen.getByRole('link', { name: 'Novidades do site' });
    expect(badge.textContent).toBe('Novo');
    expect(badge.getAttribute('href')).toBe('/novidades/');
  });

  it('is gone once the newest change has been seen', () => {
    localStorage.setItem(SEEN_KEY, LATEST_CHANGE);
    const { container } = renderBadge();
    expect(container.querySelector('a')).toBeNull();
  });

  it('hides when clicked, before the page opens', () => {
    const { container } = renderBadge();
    fireEvent.click(screen.getByRole('link', { name: 'Novidades do site' }));
    expect(container.querySelector('a')).toBeNull();
  });
});
