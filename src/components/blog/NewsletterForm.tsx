import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNewsletter } from '@/hooks/useNewsletter';

/** The weekly digest sign-up: one field, double opt-in by e-mail. Hidden where this host can't send it. */
const NewsletterForm = () => {
  const { lang, t } = useLanguage();
  const n = t.blog.newsletter;
  const { status, state, submit } = useNewsletter(lang);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  if (status !== 'ready') return null;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (state !== 'sending' && state !== 'sent') void submit(email.trim(), website);
  };

  const message = { sent: n.sent, invalid: n.invalid, error: n.error, 'too-many': n.tooMany, sending: '', idle: '' }[state];

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
          {message}
        </p>
      ) : (
        <form className="nws-row" onSubmit={onSubmit} noValidate={false}>
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
          <button type="submit" className="btn btn-pri" disabled={state === 'sending'}>
            {state === 'sending' ? n.sending : n.button}
          </button>
        </form>
      )}
      <p className={`nws-msg${state === 'invalid' || state === 'error' || state === 'too-many' ? ' bad' : ''}`} role={message && state !== 'sent' ? 'alert' : undefined} hidden={!message || state === 'sent'}>
        {state === 'sent' ? '' : message}
      </p>
      <p className="nws-fine">{n.privacy}</p>
    </section>
  );
};

export default NewsletterForm;
