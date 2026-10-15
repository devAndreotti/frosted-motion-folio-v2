import { useCallback, useEffect, useState } from 'react';

// The sign-up lives in the Worker (worker/newsletter.js). Where there is no Worker (GitHub Pages,
// the dev server) or the mail isn't set up yet, the first GET fails and the form stays hidden
// instead of promising an e-mail that can't be sent.

export type NewsletterStatus = 'loading' | 'off' | 'ready';
export type SubmitState = 'idle' | 'sending' | 'sent' | 'invalid' | 'too-many' | 'error';

const url = (action: string) => `${import.meta.env.BASE_URL}api/newsletter/${action}`;

export function useNewsletter(lang: 'pt' | 'en') {
  const [status, setStatus] = useState<NewsletterStatus>('loading');
  const [state, setState] = useState<SubmitState>('idle');

  useEffect(() => {
    let alive = true;
    fetch(url('status'), { headers: { accept: 'application/json' } })
      .then((res) => alive && setStatus(res.ok ? 'ready' : 'off'))
      .catch(() => alive && setStatus('off'));
    return () => {
      alive = false;
    };
  }, []);

  const submit = useCallback(
    async (email: string, website: string) => {
      setState('sending');
      try {
        const res = await fetch(url('subscribe'), {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ email, lang, website }),
        });
        if (res.ok) setState('sent');
        else if (res.status === 400) setState('invalid');
        else if (res.status === 429) setState('too-many');
        else setState('error');
      } catch {
        setState('error');
      }
    },
    [lang]
  );

  return { status, state, submit };
}
