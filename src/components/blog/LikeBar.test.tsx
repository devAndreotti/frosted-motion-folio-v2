import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LikeBar from './LikeBar';

const answer = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } }));

const renderBar = () =>
  render(
    <LanguageProvider>
      <LikeBar slug="meu-post" title="Meu post" />
    </LanguageProvider>
  );

describe('LikeBar', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('likes once and shows the server count', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => (init.method === 'GET' ? answer({ count: 7, liked: false }) : answer({ count: 8, liked: true })))
    );
    renderBar();
    await waitFor(() => expect(screen.getByTestId('like-count').textContent).toBe('7'));
    expect(screen.getByText('Sem conta e sem cookie de rastreio. Uma curtida por visitante.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Curtir/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Curtido/ }).getAttribute('aria-pressed')).toBe('true'));
    expect(screen.getByTestId('like-count').textContent).toBe('8');
  });

  it('copies the link, then goes back to the label', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no worker'))));
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderBar();
    fireEvent.click(screen.getByRole('button', { name: 'Copiar link' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Link copiado' })).toBeTruthy());
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByRole('button', { name: 'Copiar link' })).toBeTruthy();
  });

  it('answers by email with the post in the subject', () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no worker'))));
    renderBar();
    expect(screen.getByRole('link', { name: /Responder por e-mail/ }).getAttribute('href')).toBe('mailto:OrlaEK@proton.me?subject=Meu%20post');
  });
});
