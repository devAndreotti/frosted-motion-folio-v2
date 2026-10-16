import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PrivacyFichas from './PrivacyFichas';
import { PRIVACY } from '@/data/privacy';

describe('PrivacyFichas', () => {
  it('shows the newsletter card first and switches with the tabs', () => {
    render(<PrivacyFichas copy={PRIVACY.pt} />);
    expect(screen.getByRole('button', { name: 'Newsletter' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Curtidas' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('heading', { level: 3, name: 'Newsletter' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Curtidas' }));
    expect(screen.getByRole('button', { name: 'Curtidas' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Newsletter' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('heading', { level: 3, name: 'Curtidas' })).toBeTruthy();
    expect(screen.getByText('Só para impedir curtidas repetidas.')).toBeTruthy();
    expect(screen.queryByText('Até você sair da lista.', { exact: false })).toBeNull();
  });

  it('lists what is kept and what is not, in Portuguese and English', () => {
    const { unmount } = render(<PrivacyFichas copy={PRIVACY.pt} />);
    expect(screen.getByText('Guardo')).toBeTruthy();
    expect(screen.getByText('Não guardo')).toBeTruthy();
    expect(screen.getByText('Abertura dos e-mails').className).toContain('pv-chip-not');
    unmount();

    render(<PrivacyFichas copy={PRIVACY.en} />);
    expect(screen.getByText('I keep')).toBeTruthy();
    expect(screen.getByText('Email opens').className).toContain('pv-chip-not');
    fireEvent.click(screen.getByRole('button', { name: 'Likes' }));
    expect(screen.getByText('Cookie')).toBeTruthy();
    expect(screen.getByText('Only to stop repeated likes.')).toBeTruthy();
  });
});
