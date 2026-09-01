import { useEffect, useState } from 'react';
import { Skeleton } from 'boneyard-js/react';
import { ChevronLeft, ChevronRight, GitCommit, GitPullRequest, Star, GitBranch, CircleDot, ExternalLink } from 'lucide-react';
import { useGithubActivity, relativeTime, type ActivityKind, type GithubActivityItem } from '@/hooks/useGithubActivity';

const KIND_META: Record<ActivityKind, { icon: typeof GitCommit; tint: string }> = {
  push: { icon: GitCommit, tint: '#3b82f6' },
  pr: { icon: GitPullRequest, tint: '#a855f7' },
  star: { icon: Star, tint: '#eab308' },
  branch: { icon: GitBranch, tint: '#22c55e' },
  issue: { icon: CircleDot, tint: '#ef4444' },
};

const CARD_WIDTH = 280;
const GAP = 20;
const STEP = CARD_WIDTH + GAP;

const FIXTURE_ITEMS: GithubActivityItem[] = [
  { id: 'f1', kind: 'push', repo: 'devAndreotti/self-sync-daily', text: 'Fez push', detail: 'fix: corrige cálculo de energia semanal', time: new Date().toISOString() },
  { id: 'f2', kind: 'pr', repo: 'devAndreotti/ai-memory', text: 'Abriu um PR', detail: 'feat: add scoped queries', time: new Date().toISOString() },
  { id: 'f3', kind: 'star', repo: 'shadcn-ui/ui', text: 'Deu estrela', time: new Date().toISOString() },
];

const Card = ({ item, now }: { item: GithubActivityItem; now: number }) => {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3" style={{ width: CARD_WIDTH, flexShrink: 0 }} data-testid="activity-card">
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center"
        style={{ background: `linear-gradient(155deg, ${meta.tint}, ${meta.tint}99)` }}
      >
        <Icon className="w-4 h-4" color="#08080a" strokeWidth={2.5} />
      </div>
      <div>
        <div className="text-[13px] font-bold mb-1">{item.repo}</div>
        <div className="text-[13.5px] font-semibold" style={{ color: 'var(--fg-2)' }}>
          {item.text}
        </div>
        {item.detail && (
          <div className="text-[12.5px] mt-1 line-clamp-2" style={{ color: 'var(--fg-3)' }}>
            {item.detail}
          </div>
        )}
      </div>
      <div className="text-[11px] mt-auto" style={{ color: 'var(--fg-4)' }}>
        {relativeTime(item.time, now)}
      </div>
    </div>
  );
};

/** Horizontal, arrow-navigable feed of recent real GitHub activity — pushes, PRs, stars, branches, issues. */
const GithubActivityFeed = () => {
  const { items, fetchedAt, loading } = useGithubActivity();
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const maxOffset = -(STEP * Math.max(items.length - 1, 0));
  const go = (delta: number) => setOffset((prev) => Math.max(maxOffset, Math.min(0, prev + delta)));

  return (
    <section id="github-activity" className="relative py-16 md:py-20 overflow-hidden">
      <div
        className="absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 container mx-auto px-4 flex items-end justify-between mb-9 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-7 h-0.5" style={{ background: 'var(--accent)' }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
              Atividade
            </span>
          </div>
          <h2 className="text-2xl md:text-[30px] font-extrabold">O que ando fazendo no GitHub</h2>
        </div>
        <div className="flex items-center gap-3">
          {fetchedAt && (
            <span className="text-[11.5px]" style={{ color: 'var(--fg-4)' }}>
              atualizado {relativeTime(new Date(fetchedAt).toISOString(), now)}
            </span>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Atividade anterior"
              onClick={() => go(STEP)}
              className="glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Próxima atividade"
              onClick={() => go(-STEP)}
              className="glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 overflow-hidden pb-2">
        <Skeleton
          name="github-activity-feed"
          loading={loading}
          fixture={
            <div className="flex gap-5">
              {FIXTURE_ITEMS.map((item) => (
                <Card key={item.id} item={item} now={Date.now()} />
              ))}
            </div>
          }
        >
          {items.length > 0 ? (
            <div className="flex gap-5" style={{ transform: `translateX(${offset}px)`, transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1)' }}>
              {items.map((item) => (
                <Card key={item.id} item={item} now={now} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 text-center text-[13.5px]" style={{ color: 'var(--fg-3)' }}>
              Sem atividade pública recente —{' '}
              <a href="https://github.com/devAndreotti" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                confira o perfil
              </a>
              .
            </div>
          )}
        </Skeleton>
      </div>

      <div className="relative z-10 container mx-auto px-4 mt-8 text-center">
        <a
          href="https://github.com/devAndreotti"
          target="_blank"
          rel="noopener noreferrer"
          className="glass inline-flex items-center gap-2 px-6 py-3 rounded-full text-[13px]"
          style={{ color: 'var(--fg-3)' }}
        >
          Ver tudo no GitHub
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};

export default GithubActivityFeed;
