import { useEffect, useState } from 'react';
import { Heart, Link2, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { contact } from '@/data/personal';
import { useLikes } from '@/hooks/useLikes';

const COPIED_MS = 2000;

/** "Did this post help?": like (when this host has likes), copy the link, answer by email. */
const LikeBar = ({ slug, title }: { slug: string; title: string }) => {
  const { t } = useLanguage();
  const b = t.blog;
  const likes = useLikes(slug);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => setCopied(true))
      .catch(() => undefined);
  };

  let hint = '';
  if (likes.error) hint = b.likeError;
  else if (likes.status === 'ready') hint = likes.liked ? b.likedHint : b.likeHint;

  return (
    <section className="likebar glass" aria-label={b.helpful}>
      <p className="likebar-h">{b.helpful}</p>
      <div className="likebar-row">
        {likes.status !== 'off' && (
          <button
            type="button"
            className={`like${likes.liked ? ' on' : ''}`}
            aria-pressed={likes.liked}
            disabled={likes.status === 'loading' || likes.busy}
            onClick={likes.toggle}
          >
            <Heart className="ic s" fill={likes.liked ? 'currentColor' : 'none'} aria-hidden="true" />
            <span>{likes.liked ? b.liked : b.like}</span>
            <span className="like-n" data-testid="like-count">
              {likes.status === 'ready' ? likes.count : '·'}
            </span>
          </button>
        )}
        <button type="button" className="btn btn-gh btn-sm" onClick={copy}>
          <Link2 className="ic s" aria-hidden="true" />
          <span aria-live="polite">{copied ? b.linkCopied : b.copyLink}</span>
        </button>
        <a className="btn btn-gh btn-sm" href={`mailto:${contact.email}?subject=${encodeURIComponent(title)}`}>
          <Mail className="ic s" aria-hidden="true" />
          {b.replyEmail}
        </a>
      </div>
      <p className="likebar-hint" aria-live="polite">
        {hint}
      </p>
    </section>
  );
};

export default LikeBar;
