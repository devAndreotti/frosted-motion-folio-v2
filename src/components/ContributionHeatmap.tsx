import { useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGithubContributions, type ContributionDay } from '@/hooks/useGithubContributions';

const CELL = 11;
const GAP = 3;
const MIN_DAYS = 84; // ~12 weeks — floor so the strip never shrinks to near-nothing on tiny screens
const LEVEL_ALPHA = [0, 0.3, 0.5, 0.75, 1];

function levelColor(level: number): string {
  return level === 0 ? 'var(--surface-2)' : `rgb(var(--accent-rgb) / ${LEVEL_ALPHA[level]})`;
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

/** Calendar-style contribution heatmap (up to ~2 years) — the volume/consistency companion to the activity cards above it. */
const ContributionHeatmap = () => {
  const { lang, t } = useLanguage();
  const { days, loading } = useGithubContributions();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleDays, setVisibleDays] = useState(0);
  const [hovered, setHovered] = useState<{ day: ContributionDay; wi: number; di: number } | null>(null);

  useLayoutEffect(() => {
    // Show as much history as fits the available width — more than a year
    // when there's room, fewer weeks on a narrow screen — instead of a fixed
    // span the container has to scroll to see.
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const weeksFit = Math.floor(el.clientWidth / (CELL + GAP));
      setVisibleDays(Math.min(days.length, Math.max(MIN_DAYS, weeksFit * 7)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [days.length]);

  if (loading) {
    return <div className="shimmer rounded-xl mb-9" style={{ height: 7 * CELL + 6 * GAP + 34 }} />;
  }
  if (days.length === 0) return null;

  const shown = visibleDays > 0 ? days.slice(-visibleDays) : days;
  const weeks = chunkIntoWeeks(shown);
  const monthFmt = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'short' });
  const dateFmt = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short' });
  let lastMonth = -1;
  let lastYear = -1;
  const monthLabels = weeks.map((week) => {
    const firstDay = week.find((d): d is ContributionDay => d !== null);
    if (!firstDay) return '';
    const date = new Date(firstDay.date);
    const month = date.getMonth();
    const year = date.getFullYear();
    if (month === lastMonth && year === lastYear) return '';
    // More than a year of history can repeat month names -- disambiguate by
    // showing the year on the very first label and at every year boundary,
    // not on every column (that would be redundant noise the rest of the time).
    const showYear = year !== lastYear;
    lastMonth = month;
    lastYear = year;
    return showYear ? `${monthFmt.format(date)} '${String(year).slice(2)}` : monthFmt.format(date);
  });

  return (
    <div className="mb-9" data-testid="contribution-heatmap">
      <div ref={containerRef} className="overflow-hidden pb-2">
        <div className="inline-flex flex-col gap-1.5">
          <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: `${CELL + GAP}px` }}>
            {monthLabels.map((label, i) => (
              <span key={i} className="text-[9.5px]" style={{ color: 'var(--fg-4)' }}>
                {label}
              </span>
            ))}
          </div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoFlow: 'column', gridAutoColumns: `${CELL}px`, gap: GAP }}>
            {weeks.flatMap((week, wi) =>
              week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  data-testid={day ? 'contribution-day' : undefined}
                  aria-label={day ? t.activity.heatmapTooltip(day.count, dateFmt.format(new Date(day.date))) : undefined}
                  onMouseEnter={() => day && setHovered({ day, wi, di })}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    background: day ? levelColor(day.level) : 'transparent',
                    outline: hovered?.day === day ? '1.5px solid var(--fg-1)' : undefined,
                    outlineOffset: 1,
                  }}
                />
              ))
            )}
            {hovered && (
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  left: hovered.wi * (CELL + GAP) + CELL / 2,
                  top: hovered.di * (CELL + GAP) - 10,
                  transform: 'translate(-50%, -100%)',
                  padding: '6px 11px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                {t.activity.heatmapTooltip(hovered.day.count, dateFmt.format(new Date(hovered.day.date)))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
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
  );
};

export default ContributionHeatmap;
