import { useLanguage } from '@/contexts/LanguageContext';
import { useGithubContributions, type ContributionDay } from '@/hooks/useGithubContributions';

const CELL = 11;
const GAP = 3;
const LEVEL_ALPHA = [0, 0.3, 0.5, 0.75, 1];

function levelColor(level: number): string {
  return level === 0 ? 'var(--surface-2)' : `rgba(var(--accent-rgb), ${LEVEL_ALPHA[level]})`;
}

function chunkIntoWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return [];
  const weeks: (ContributionDay | null)[][] = [];
  let current: (ContributionDay | null)[] = [];
  const firstDow = new Date(days[0].date).getDay();
  for (let i = 0; i < firstDow; i++) current.push(null);
  for (const day of days) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length > 0) weeks.push(current);
  return weeks;
}

/** Calendar-style contribution heatmap (last 12 months) — the volume/consistency companion to the activity cards above it. */
const ContributionHeatmap = () => {
  const { lang, t } = useLanguage();
  const { days, loading } = useGithubContributions();

  if (loading) {
    return <div className="shimmer rounded-xl mb-9" style={{ height: 7 * CELL + 6 * GAP + 20 }} />;
  }
  if (days.length === 0) return null;

  const weeks = chunkIntoWeeks(days);
  const monthFmt = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'short' });
  const dateFmt = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short' });
  let lastMonth = -1;
  const monthLabels = weeks.map((week) => {
    const firstDay = week.find((d): d is ContributionDay => d !== null);
    if (!firstDay) return '';
    const month = new Date(firstDay.date).getMonth();
    if (month === lastMonth) return '';
    lastMonth = month;
    return monthFmt.format(new Date(firstDay.date));
  });

  return (
    <div className="mb-9 overflow-x-auto pb-1" data-testid="contribution-heatmap">
      <div className="inline-flex flex-col gap-1.5">
        <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: `${CELL + GAP}px` }}>
          {monthLabels.map((label, i) => (
            <span key={i} className="text-[9.5px]" style={{ color: 'var(--fg-4)' }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoFlow: 'column', gridAutoColumns: `${CELL}px`, gap: GAP }}>
          {weeks.flatMap((week, wi) =>
            week.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                data-testid={day ? 'contribution-day' : undefined}
                title={day ? t.activity.heatmapTooltip(day.count, dateFmt.format(new Date(day.date))) : undefined}
                style={{ width: CELL, height: CELL, borderRadius: 2, background: day ? levelColor(day.level) : 'transparent' }}
              />
            ))
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9.5px]" style={{ color: 'var(--fg-4)' }}>
            {t.activity.heatmapLess}
          </span>
          {LEVEL_ALPHA.map((_, level) => (
            <div key={level} style={{ width: CELL, height: CELL, borderRadius: 2, background: levelColor(level) }} />
          ))}
          <span className="text-[9.5px]" style={{ color: 'var(--fg-4)' }}>
            {t.activity.heatmapMore}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
