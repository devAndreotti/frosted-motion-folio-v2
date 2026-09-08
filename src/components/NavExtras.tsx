import { Github, Linkedin } from 'lucide-react';
import { track } from '@/lib/track';

const GITHUB_URL = 'https://github.com/devAndreotti';
const LINKEDIN_URL = 'https://www.linkedin.com/in/ricardo-andreotti-gon%C3%A7alves-0b5785283/';

/** GitHub + LinkedIn icon links — identical in the desktop bar and the mobile menu, just sized differently. */
export const SocialLinks = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10';
  return (
    <>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub" onClick={() => track('click-github')} className={`glass ${dim} rounded-full flex items-center justify-center`}>
        <Github className="w-4 h-4" />
      </a>
      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onClick={() => track('click-linkedin')} className={`glass ${dim} rounded-full flex items-center justify-center`}>
        <Linkedin className="w-4 h-4" />
      </a>
    </>
  );
};

interface RepoBadgeProps {
  loading: boolean;
  count: number | null;
  label: (count: number) => string;
  compact?: boolean;
}

/** "N public repos" pill — same content in the desktop bar and the mobile menu, just different padding/width. */
export const RepoBadge = ({ loading, count, label, compact }: RepoBadgeProps) => {
  const pad = compact ? 'px-3 py-2' : 'px-3 py-1.5';
  if (loading) {
    return (
      <div className={`glass flex items-center gap-2 ${pad} rounded-full ${compact ? 'mb-1' : 'w-[124px]'}`}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 shimmer" />
        <span className={`h-2.5 rounded shimmer ${compact ? 'w-32' : 'flex-1'}`} />
      </div>
    );
  }
  if (count == null) return null;
  return (
    <div className={`glass flex items-center gap-2 ${pad} rounded-full ${compact ? 'mb-1' : 'min-w-0 max-w-[220px]'}`}>
      <span className="relative w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0">
        <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
      </span>
      <span className={compact ? 'text-[12px]' : 'text-[11px] truncate'} style={{ color: 'var(--fg-3)' }}>
        {label(count)}
      </span>
    </div>
  );
};

interface LangToggleButtonProps {
  lang: 'pt' | 'en';
  onClick: () => void;
  ariaLabel: string;
}

/** PT/EN toggle — identical in the desktop bar and the mobile menu. */
export const LangToggleButton = ({ lang, onClick, ariaLabel }: LangToggleButtonProps) => (
  <button type="button" onClick={onClick} aria-label={ariaLabel} className="glass w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold uppercase">
    {lang === 'pt' ? 'EN' : 'PT'}
  </button>
);
