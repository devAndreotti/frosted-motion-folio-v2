import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import PrintFooter from './PrintFooter';

describe('PrintFooter', () => {
  it('carries the Ctrl+P note in Portuguese by default', () => {
    const { container } = render(
      <LanguageProvider>
        <PrintFooter />
      </LanguageProvider>,
    );
    expect(screen.getByText('Psiu: você achou o easter egg do Ctrl+P.')).toBeTruthy();
    expect(container.querySelector('.print-foot')).not.toBeNull();
  });
});
