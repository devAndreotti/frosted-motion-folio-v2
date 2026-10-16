import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNewsletter } from '@/hooks/useNewsletter';
import { loadTurnstile } from '@/lib/turnstile';

/** The weekly digest sign-up: one field, double opt-in by e-mail. Hidden where this host can't send it. */
const NewsletterForm = () => {
  const { lang, setLang, t } = useLanguage();
  const n = t.blog.newsletter;
  const { status, siteKey, state, submit } = useNewsletter();
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [token, setToken] = useState('');
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (status !== 'ready' || !siteKey || !widget.current) return;
    let alive = true;
    loadTurnstile()
      .then((turnstile) => {
        if (!alive || !widget.current) return;
        widgetId.current = turnstile.render(widget.current, {
          sitekey: siteKey,
          theme: 'auto',
          callback: setToken,
          'expired-callback': () => setToken(''),
          'error-callback': () => setToken(''),
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [status, siteKey, state === 'sent']);

  // a refused or failed attempt burns the token: ask Turnstile for a new one
  useEffect(() => {
    if (state === 'check' || state === 'error' || state === 'invalid' || state === 'too-many') {
      setToken('');
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    }
  }, [state]);

  if (status !== 'ready') return null;

  const waitingForCheck = Boolean(siteKey) && !token;
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (state === 'sending' || state === 'sent') return;
    if (waitingForCheck) return; // the button is off too: Enter in the field must not skip the check
    void submit({ email: email.trim(), lang, website, turnstile: token });
  };

  const message = { sent: n.sent, invalid: n.invalid, error: n.error, check: n.check, 'too-many': n.tooMany, sending: '', idle: '' }[state];
  const bad = state === 'invalid' || state === 'error' || state === 'too-many' || state === 'check';

  return (
    <section className="nws glass" aria-labelledby="nws-title">
      <p className="nws-k">
        <Mail className="ic s" aria-hidden="true" />
        {n.kicker}
      </p>
      <h2 id="nws-title" className="nws-h">
        {n.title}
      </h2>
      <p className="nws-p">{n.text}</p>
      {state === 'sent' ? (
        <p className="nws-msg ok" role="status">
          {n.sent}
        </p>
      ) : (
        <form className="nws-row" onSubmit={onSubmit}>
          <label htmlFor="nws-email" className="sr-only">
            {n.label}
          </label>
          <input
            id="nws-email"
            className="nws-in"
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder={n.placeholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {/* a field only a bot fills: the Worker ignores whoever does */}
          <input className="nws-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(event) => setWebsite(event.target.value)} />
          <button type="submit" className="btn btn-pri" disabled={state === 'sending' || waitingForCheck}>
            {state === 'sending' ? n.sending : n.button}
          </button>
          <fieldset className="nws-lang">
            <legend>{n.langLabel}</legend>
            {/* the same choice as the site's PT | EN: picking one here switches the whole page, so the reader sees it before typing */}
            {(['pt', 'en'] as const).map((code) => (
              <label key={code} className={lang === code ? 'on' : ''}>
                <input type="radio" name="newsletter-lang" value={code} checked={lang === code} onChange={() => setLang(code)} />
                {code.toUpperCase()}
              </label>
            ))}
          </fieldset>
          {siteKey && <div ref={widget} className="nws-check" />}
        </form>
      )}
      <p className={`nws-msg${bad ? ' bad' : ''}`} role={message && state !== 'sent' ? 'alert' : undefined} hidden={!message || state === 'sent'}>
        {state === 'sent' ? '' : message}
      </p>
      <p className="nws-fine">
        {n.privacy} <Link to="/privacidade/">{n.privacyLink}</Link>
      </p>
    </section>
  );
};

export default NewsletterForm;
