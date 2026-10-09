import { lazy, Suspense, useState } from 'react';
import { ArrowDown, Briefcase } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGithubActivity } from '@/hooks/useGithubActivity';
import { useGithubContributions } from '@/hooks/useGithubContributions';
import { useLocalClock } from '@/hooks/useLocalClock';
import { lastYear, summarize } from '@/lib/contributions';
import { track } from '@/lib/track';
import CardStack from './CardStack';
import RotatingRole from './RotatingRole';
import { SocialButtons } from './NavExtras';

// Only opened from the recruiter CTA, so it is split out of the first screen's bundle.
const RecruiterModal = lazy(() => import('./RecruiterModal'));

const ROLE_INTERVAL_MS = 2750;

const Header = () => {
  const { lang, t } = useLanguage();
  const [recruiterMode, setRecruiterMode] = useState(false);
  const clock = useLocalClock();
  const { publicRepos } = useGithubActivity();
  const { days } = useGithubContributions();
  const contributions = days.length > 0 ? summarize(lastYear(days, new Date().toISOString().slice(0, 10))).total : null;
  const fmt = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US');
  const s = t.header.stats;
  const stats = [
    { value: s.projects.value, ...s.projects },
    { value: publicRepos == null ? '—' : fmt.format(publicRepos), ...s.repos },
    { value: contributions == null ? '—' : fmt.format(contributions), ...s.contributions },
    { value: s.semester.value, ...s.semester },
  ];

  return (
    <section id="header" className="wrap" aria-label={t.header.badge}>
      <div className="hero">
        <div>
          <div className="eyebrow rv" style={{ '--d': '.05s' } as React.CSSProperties}>
            <span className="chip">{t.header.badge}</span>
            <span>
              {t.header.location} · <span className="tabular-nums">{clock}</span>
            </span>
          </div>
          <h1 className="h1 rv" style={{ '--d': '.12s' } as React.CSSProperties}>
            <span>
              {t.header.lead1} {t.header.lead2}
            </span>{' '}
            <RotatingRole roles={t.header.roles} intervalMs={ROLE_INTERVAL_MS} />
          </h1>
          <p className="lead rv" style={{ '--d': '.2s' } as React.CSSProperties}>
            {t.header.paragraph}
          </p>
          <p className="avail rv" style={{ '--d': '.26s' } as React.CSSProperties}>
            <span className="pulse" />
            {t.header.availability}
          </p>
          <div className="ctas rv" style={{ '--d': '.32s' } as React.CSSProperties}>
            <a
              className="btn btn-pri"
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                track('cta-projects');
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t.header.ctaProjects}
              <ArrowDown className="ic s" />
            </a>
            <button type="button" className="btn btn-gh" onClick={() => setRecruiterMode(true)}>
              <Briefcase className="ic s" />
              {t.header.ctaRecruiter}
            </button>
            <span className="vsep" />
            <SocialButtons />
          </div>
        </div>
        <CardStack />
      </div>

      <div className="stats rv" style={{ '--d': '.4s' } as React.CSSProperties}>
        {stats.map((stat) => (
          <div key={stat.label} className="st">
            <span className="st-v">{stat.value}</span>
            <span className="st-l">{stat.label}</span>
            <span className="st-d">{stat.desc}</span>
          </div>
        ))}
      </div>

      {recruiterMode && (
        <Suspense fallback={null}>
          <RecruiterModal onClose={() => setRecruiterMode(false)} />
        </Suspense>
      )}
    </section>
  );
};

export default Header;
