import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import NewsletterForm from './NewsletterForm';

const json = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** `status` answers GET /status; `subscribe` answers the POST. */
function stubFetch(status: Response | Error, subscribe: Response | Error = json(200, { ok: true })) {
  const calls: { url: string; init?: RequestInit }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      const answer = url.endsWith('/status') ? status : subscribe;
      if (answer instanceof Error) throw answer;
      return answer.clone();
    })
  );
  return calls;
}

const renderForm = () =>
  render(
    <LanguageProvider>
      <NewsletterForm />
    </LanguageProvider>
  );

describe('NewsletterForm', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('stays hidden where there is no Worker or no mail behind it', async () => {
    stubFetch(json(503, { error: 'off' }));
    const { container } = renderForm();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container.querySelector('.nws')).toBeNull();

    stubFetch(new Error('offline'));
    const again = renderForm();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(again.container.querySelector('.nws')).toBeNull();
  });

  it('sends the address with the language, and asks the reader to confirm by e-mail', async () => {
    const calls = stubFetch(json(200, { enabled: true }));
    renderForm();
    const input = await screen.findByLabelText('Seu e-mail');
    fireEvent.change(input, { target: { value: ' leitor@example.com ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inscrever' }));
    expect(await screen.findByText(/Enviei um e-mail de confirmação/)).toBeTruthy();
    const post = calls.find((c) => c.init?.method === 'POST');
    expect(post?.url).toContain('/api/newsletter/subscribe');
    expect(JSON.parse(String(post?.init?.body))).toEqual({ email: 'leitor@example.com', lang: 'pt', website: '' });
    expect(screen.queryByRole('button', { name: 'Inscrever' })).toBeNull();
  });

  it('speaks English to an English visitor', async () => {
    localStorage.setItem('lang.picked', 'en');
    stubFetch(json(200, { enabled: true }));
    renderForm();
    expect(await screen.findByRole('heading', { name: 'Get the weekly digest' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeTruthy();
  });

  it.each([
    ['an invalid address', json(400, { error: 'email' }), /não parece válido/],
    ['too many attempts', json(429, { error: 'too many' }), /Muitas tentativas/],
    ['a mail failure', json(502, { error: 'mail' }), /Não consegui enviar/],
    ['no connection', new Error('offline'), /Não consegui enviar/],
  ])('tells the reader about %s and lets them try again', async (_name, answer, message) => {
    stubFetch(json(200, { enabled: true }), answer);
    renderForm();
    fireEvent.change(await screen.findByLabelText('Seu e-mail'), { target: { value: 'leitor@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inscrever' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(message);
    expect((screen.getByRole('button', { name: 'Inscrever' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('passes along what a bot types into the hidden field, for the Worker to ignore', async () => {
    const calls = stubFetch(json(200, { enabled: true }));
    const { container } = renderForm();
    fireEvent.change(await screen.findByLabelText('Seu e-mail'), { target: { value: 'bot@example.com' } });
    fireEvent.change(container.querySelector('input[name="website"]') as HTMLInputElement, { target: { value: 'http://spam.example' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inscrever' }));
    await waitFor(() => expect(calls.some((c) => c.init?.method === 'POST')).toBe(true));
    expect(JSON.parse(String(calls.find((c) => c.init?.method === 'POST')?.init?.body)).website).toBe('http://spam.example');
  });
});
