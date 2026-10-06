import { useEffect, useState } from 'react';
import { Skeleton } from 'boneyard-js/react';
import { ArrowUpRight, CircleDot, GitBranch, GitCommit, GitPullRequest, Star } from 'lucide-react';
import { useGithubActivity, relativeTime, type ActivityKind, type GithubActivityItem } from '@/hooks/useGithubActivity';
import { useLanguage } from '@/contexts/LanguageContext';
import { contact } from '@/data/personal';
import { ACTIVITY_TEXT_EN } from '@/lib/i18n';
import ContributionHeatmap from './ContributionHeatmap';

const KIND_ICON: Record<ActivityKind, typeof GitCommit> = {
  push: GitCommit,
  pr: GitPullRequest,
  star: Star,
  branch: GitBranch,
  issue: CircleDot,
};

const FEED_SIZE = 4;
const OWNER_PREFIX = 'devAndreotti/';

// My own repos read better by name alone; someone else's keep the owner.
const repoLabel = (repo: string) => (repo.startsWith(OWNER_PREFIX) ? repo.slice(OWNER_PREFIX.length) : repo);

const FIXTURE_ITEMS: GithubActivityItem[] = [
  { id: 'f1', kind: 'push', repo: 'devAndreotti/self-sync-daily', text: 'Fez push', detail: 'fix: corrige cálculo de energia semanal', time: new Date().toISOString() },
  { id: 'f2', kind: 'pr', repo: 'devAndreotti/ai-memory', text: 'Abriu um PR', detail: 'feat: add scoped queries', time: new Date().toISOString() },
  { id: 'f3', kind: 'star', repo: 'shadcn-ui/ui', text: 'Deu estrela', time: new Date().toISOString() },
  { id: 'f4', kind: 'branch', repo: 'devAndreotti/quality-gate', text: 'Criou a branch', time: new Date().toISOString() },
];

const Card = ({ item, now, lang, inRepo }: { item: GithubActivityItem; now: number; lang: 'pt' | 'en'; inRepo: string }) => {
  const Icon = KIND_ICON[item.kind];
  const text = lang === 'pt' ? item.text : (ACTIVITY_TEXT_EN[item.text] ?? item.text);
  return (
    <div className="fc glass" data-testid="activity-card">
      <span className="fc-i">
        <Icon className="ic s" />
      </span>
      <p className="fc-p">
        {text} {inRepo} <span className="fc-r" title={item.repo}>
          {repoLabel(item.repo)}
        </span>
        {item.count && item.count > 1 && <span className="fc-n">×{item.count}</span>}
      </p>
      {item.detail && <p className="fc-d">{item.detail}</p>}
      <span className="fc-t">{relativeTime(item.time, now, lang)}</span>
    </div>
  );
};

/** Real GitHub activity: last year's contributions at a glance, then the latest four things I did. */
const GithubActivityFeed = () => {
  const { lang, t } = useLanguage();
  const { items, fetchedAt, loading } = useGithubActivity();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="github-activity" className="wrap sec" aria-labelledby="h-act">
      <div className="sh">
        <div>
          <p className="lbl">{t.activity.sectionLabel}</p>
          <h2 id="h-act" className="h2">
            {t.activity.title}
          </h2>
        </div>
        <div className="sh-r">
          {fetchedAt && (
            <span className="np fix">
              <span className="dot" />
              {t.activity.updated(relativeTime(new Date(fetchedAt).toISOString(), now, lang))}
            </span>
          )}
          <a className="np" href={contact.github} target="_blank" rel="noopener noreferrer">
            {t.activity.viewProfile}
            <ArrowUpRight className="ic" />
          </a>
        </div>
      </div>

      <ContributionHeatmap />

      <Skeleton
        name="github-activity-feed"
        loading={loading}
        fixture={
          <div className="feed">
            {FIXTURE_ITEMS.map((item) => (
              <Card key={item.id} item={item} now={Date.now()} lang={lang} inRepo={t.activity.inRepo} />
            ))}
          </div>
        }
      >
        {items.length > 0 ? (
          <div className="feed">
            {items.slice(0, FEED_SIZE).map((item) => (
              <Card key={item.id} item={item} now={now} lang={lang} inRepo={t.activity.inRepo} />
            ))}
          </div>
        ) : (
          <div className="feed-empty glass">{t.activity.emptyState}</div>
        )}
      </Skeleton>
    </section>
  );
};

export default GithubActivityFeed;
