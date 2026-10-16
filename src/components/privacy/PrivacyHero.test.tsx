import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyHero from './PrivacyHero';
import PrivacyNumbers from './PrivacyNumbers';
import { PRIVACY } from '@/data/privacy';

describe('PrivacyHero and PrivacyNumbers', () => {
  it('shows the title, the three promises and the four numbers in Portuguese', () => {
    render(
      <>
        <PrivacyHero copy={PRIVACY.pt} />
        <PrivacyNumbers copy={PRIVACY.pt} />
      </>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Seus dados, sem letras miúdas.' })).toBeTruthy();
    expect(screen.getByText('Guardo o mínimo')).toBeTruthy();
    expect(screen.getByText('Você apaga quando quiser')).toBeTruthy();
    expect(screen.getByText('7 dias')).toBeTruthy();
    expect(screen.getByText('na hora')).toBeTruthy();
  });

  it('shows the English title and numbers', () => {
    render(
      <>
        <PrivacyHero copy={PRIVACY.en} />
        <PrivacyNumbers copy={PRIVACY.en} />
      </>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Your data, no fine print.' })).toBeTruthy();
    expect(screen.getByText('7 days')).toBeTruthy();
    expect(screen.getByText('at once')).toBeTruthy();
  });
});
