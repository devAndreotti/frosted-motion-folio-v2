import { Github, Linkedin } from 'lucide-react';
import { contact } from '@/data/personal';
import { track } from '@/lib/track';
import type { Lang } from '@/lib/i18n';

/** GitHub + LinkedIn as the round 48 px buttons that close the hero's CTA row -- kept together when the row wraps. */
export const SocialButtons = () => (
  <span className="soc">
    <a href={contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" onClick={() => track('click-github')} className="ibtn">
      <Github className="ic" />
    </a>
    <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onClick={() => track('click-linkedin')} className="ibtn">
      <Linkedin className="ic" />
    </a>
  </span>
);

interface RepoPillProps {
  loading: boolean;
  count: number | null;
  label: (count: number) => string;
}

/** "N repositórios" pill in the nav bar -- hidden until the GitHub count is known. */
export const RepoPill = ({ loading, count, label }: RepoPillProps) => {
  if (loading) {
    return (
      <span className="np fix nav-pill" aria-hidden="true">
        <span className="dot shimmer" />
        <span className="shimmer" style={{ width: 92, height: 10, borderRadius: 4 }} />
      </span>
    );
  }
  if (count == null) return null;
  return (
    <a className="np nav-pill" href={contact.repos} target="_blank" rel="noopener noreferrer">
      <span className="dot" />
      {label(count)}
    </a>
  );
};

interface LangSwitchProps {
  lang: Lang;
  onPick: (lang: Lang) => void;
  ariaLabel: string;
  className?: string;
}

/** PT | EN segmented pill -- the active language sits on the accent. */
export const LangSwitch = ({ lang, onPick, ariaLabel, className = '' }: LangSwitchProps) => (
  <div className={`np lang ${className}`} role="group" aria-label={ariaLabel}>
    {(['pt', 'en'] as const).map((option) => (
      <button key={option} type="button" aria-pressed={lang === option} className={`lg${lang === option ? ' on' : ''}`} onClick={() => onPick(option)}>
        {option.toUpperCase()}
      </button>
    ))}
  </div>
);
