import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import PrivacyRights from './PrivacyRights';
import { PRIVACY } from '@/data/privacy';
import { contact } from '@/data/personal';

const writeText = vi.fn();

describe('PrivacyRights', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });
  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('links the contact and copies it, then goes back to the label', async () => {
    render(<PrivacyRights copy={PRIVACY.pt} />);
    expect(screen.getByRole('link', { name: contact.email }).getAttribute('href')).toBe(`mailto:${contact.email}`);

    fireEvent.click(screen.getByRole('button', { name: 'Copiar e-mail' }));
    await act(async () => {});
    expect(writeText).toHaveBeenCalledWith(contact.email);
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1800);
    });
    expect(screen.getByRole('button', { name: 'Copiar e-mail' })).toBeTruthy();
  });

  it('keeps the page working when the clipboard refuses', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    render(<PrivacyRights copy={PRIVACY.en} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy email' }));
    await act(async () => {});
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeTruthy();
    expect(screen.getByRole('link', { name: contact.email })).toBeTruthy();
  });
});
