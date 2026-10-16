import { useCallback, useEffect, useState } from 'react';

// The sign-up lives in the Worker (worker/newsletter.js). Where there is no Worker (GitHub Pages,
// the dev server) or the mail isn't set up yet, the first GET fails and the form stays hidden
// instead of promising an e-mail that can't be sent.

export type NewsletterStatus = 'loading' | 'off' | 'ready';
export type SubmitState = 'idle' | 'sending' | 'sent' | 'invalid' | 'check' | 'too-many' | 'error';

const url = (action: string) => `${import.meta.env.BASE_URL}api/newsletter/${action}`;

export function useNewsletter() {
  const [status, setStatus] = useState<NewsletterStatus>('loading');
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');

  useEffect(() => {
    let alive = true;
    fetch(url('status'), { headers: { accept: 'application/json' } })
      .then(async (res) => {
        if (!alive) return;
        if (!res.ok) return setStatus('off');
        const body = (await res.json().catch(() => null)) as { turnstileSiteKey?: unknown } | null;
        setSiteKey(typeof body?.turnstileSiteKey === 'string' ? body.turnstileSiteKey : null);
        setStatus('ready');
      })
      .catch(() => alive && setStatus('off'));
    return () => {
      alive = false;
    };
  }, []);

  const submit = useCallback(async (fields: { email: string; lang: 'pt' | 'en'; website: string; turnstile: string }) => {
    setState('sending');
    try {
      const res = await fetch(url('subscribe'), {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(fields),
      });
      if (res.ok) setState('sent');
      else if (res.status === 400) setState('invalid');
      else if (res.status === 403) setState('check');
      else if (res.status === 429) setState('too-many');
      else setState('error');
    } catch {
      setState('error');
    }
  }, []);

  return { status, siteKey, state, submit };
}
