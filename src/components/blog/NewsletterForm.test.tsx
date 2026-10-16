import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
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
      <MemoryRouter>
        <NewsletterForm />
      </MemoryRouter>
    </LanguageProvider>
  );

const ON = json(200, { enabled: true, turnstileSiteKey: null });
const bodyOf = (calls: { init?: RequestInit }[]) => JSON.parse(String(calls.find((c) => c.init?.method === 'POST')?.init?.body));

describe('NewsletterForm', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.turnstile;
    document.head.querySelectorAll('script[src*="turnstile"]').forEach((node) => node.remove());
  });

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
    const calls = stubFetch(ON);
    renderForm();
    const input = await screen.findByLabelText('Seu e-mail');
    fireEvent.change(input, { target: { value: ' leitor@example.com ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inscrever' }));
    expect(await screen.findByText(/Enviei um e-mail de confirmação/)).toBeTruthy();
    expect(calls.find((c) => c.init?.method === 'POST')?.url).toContain('/api/newsletter/subscribe');
    expect(bodyOf(calls)).toEqual({ email: 'leitor@example.com', lang: 'pt', website: '', turnstile: '' });
    expect(screen.queryByRole('button', { name: 'Inscrever' })).toBeNull();
  });

  it('switches the site to the language picked here, so the reader sees it before typing', async () => {
    const calls = stubFetch(ON);
    renderForm();
    fireEvent.click(await screen.findByLabelText('EN'));
    expect(await screen.findByRole('heading', { name: 'Get the weekly digest' })).toBeTruthy();
    expect(localStorage.getItem('lang.picked')).toBe('en');
    fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'leitor@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));
    await screen.findByText(/Almost there/);
    expect(bodyOf(calls).lang).toBe('en');
  });

  it('follows the site when its language is switched elsewhere, not only here', async () => {
    const calls = stubFetch(ON);
    const SiteSwitch = () => {
      const { setLang } = useLanguage();
      return (
        <button type="button" onClick={() => setLang('en')}>
          site EN
        </button>
      );
    };
    render(
      <LanguageProvider>
        <MemoryRouter>
          <SiteSwitch />
          <NewsletterForm />
        </MemoryRouter>
      </LanguageProvider>
    );
    fireEvent.click(await screen.findByRole('button', { name: 'site EN' }));
    expect(((await screen.findByLabelText('EN')) as HTMLInputElement).checked).toBe(true);
    fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'leitor@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));
    await screen.findByText(/Almost there/);
    expect(bodyOf(calls).lang).toBe('en');
  });

  it('links to the privacy policy, on a line of its own under the note', async () => {
    stubFetch(ON);
    renderForm();
    const link = await screen.findByRole('link', { name: 'Política de privacidade' });
    expect(link.getAttribute('href')).toBe('/privacidade/');
    expect(link.textContent).toBe('Política de privacidade');
    expect(link.parentElement?.className).toBe('nws-fine');
    expect(link.parentElement?.textContent).toBe('Uso o seu e-mail só para a newsletter. Política de privacidade');
  });

  it('speaks English to an English visitor, and starts on English', async () => {
    localStorage.setItem('lang.picked', 'en');
    stubFetch(ON);
    renderForm();
    expect(await screen.findByRole('heading', { name: 'Get the weekly digest' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeTruthy();
    expect((screen.getByLabelText('EN') as HTMLInputElement).checked).toBe(true);
  });

  it.each([
    ['an invalid address', json(400, { error: 'email' }), /não parece válido/],
    ['a failed robot check', json(403, { error: 'check' }), /não é um robô/],
    ['too many attempts', json(429, { error: 'too many' }), /Muitas tentativas/],
    ['a mail failure', json(502, { error: 'mail' }), /Não consegui enviar/],
    ['no connection', new Error('offline'), /Não consegui enviar/],
  ])('tells the reader about %s and lets them try again', async (_name, answer, message) => {
    stubFetch(ON, answer);
    renderForm();
    fireEvent.change(await screen.findByLabelText('Seu e-mail'), { target: { value: 'leitor@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inscrever' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(message);
    expect((screen.getByRole('button', { name: 'Inscrever' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('passes along what a bot types into the hidden field, for the Worker to ignore', async () => {
    const calls = stubFetch(ON);
    const { container } = renderForm();
    fireEvent.change(await screen.findByLabelText('Seu e-mail'), { target: { value: 'bot@example.com' } });
    fireEvent.change(container.querySelector('input[name="website"]') as HTMLInputElement, { target: { value: 'http://spam.example' } });
    fireEvent.click(screen.getByRole('button', { name: 'Inscrever' }));
    await waitFor(() => expect(calls.some((c) => c.init?.method === 'POST')).toBe(true));
    expect(bodyOf(calls).website).toBe('http://spam.example');
  });

  describe('with Turnstile', () => {
    function fakeTurnstile() {
      const api = {
        callback: (_token: string) => undefined,
        render: vi.fn((_el: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => {
          api.callback = options.callback;
          return 'widget-1';
        }),
        reset: vi.fn(),
        remove: vi.fn(),
      };
      window.turnstile = api;
      return api;
    }

    it('shows the check, keeps the button off until it passes, and sends its token', async () => {
      const api = fakeTurnstile();
      const calls = stubFetch(json(200, { enabled: true, turnstileSiteKey: '0xKEY' }));
      renderForm();
      const button = (await screen.findByRole('button', { name: 'Inscrever' })) as HTMLButtonElement;
      await waitFor(() => expect(api.render).toHaveBeenCalled());
      expect(api.render.mock.calls[0][1].sitekey).toBe('0xKEY');
      expect(button.disabled).toBe(true);

      fireEvent.change(screen.getByLabelText('Seu e-mail'), { target: { value: 'leitor@example.com' } });
      fireEvent.submit(button.closest('form') as HTMLFormElement); // Enter in the field
      expect(calls.some((c) => c.init?.method === 'POST')).toBe(false);

      act(() => api.callback('token-123'));
      expect(button.disabled).toBe(false);
      fireEvent.click(button);
      await screen.findByText(/Enviei um e-mail de confirmação/);
      expect(bodyOf(calls).turnstile).toBe('token-123');
    });

    it('asks for a new token after a refused attempt', async () => {
      const api = fakeTurnstile();
      stubFetch(json(200, { enabled: true, turnstileSiteKey: '0xKEY' }), json(403, { error: 'check' }));
      renderForm();
      const button = (await screen.findByRole('button', { name: 'Inscrever' })) as HTMLButtonElement;
      await waitFor(() => expect(api.render).toHaveBeenCalled());
      fireEvent.change(screen.getByLabelText('Seu e-mail'), { target: { value: 'leitor@example.com' } });
      act(() => api.callback('token-1'));
      fireEvent.click(button);
      await screen.findByRole('alert');
      expect(api.reset).toHaveBeenCalledWith('widget-1');
      expect(button.disabled).toBe(true);
    });
  });
});
