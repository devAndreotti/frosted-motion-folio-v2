import { useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGithubContributions, type ContributionDay } from '@/hooks/useGithubContributions';
import { lastYear, summarize, toWeeks, YEAR_WEEKS } from '@/lib/contributions';

interface MonthLabel {
  week: number;
  label: string;
}

/** A label at the first week of each month, the year added on January; skips one that would crowd the previous. */
export function monthLabels(weeks: (ContributionDay | null)[][], lang: 'pt' | 'en'): MonthLabel[] {
  const fmt = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', timeZone: 'UTC' });
  const out: MonthLabel[] = [];
  let lastMonth = -1;
  weeks.forEach((week, w) => {
    const first = week.find((d): d is ContributionDay => d !== null);
    if (!first) return;
    const date = new Date(`${first.date}T00:00:00Z`);
    const month = date.getUTCMonth();
    if (month === lastMonth) return;
    lastMonth = month;
    if (out.length > 0 && w - out[out.length - 1].week < 3) return;
    const name = fmt.format(date).replace('.', '');
    out.push({ week: w, label: month === 0 ? `${name} ${String(date.getUTCFullYear()).slice(2)}` : name });
  });
  return out;
}

/** Last 12 months of contributions: three headline numbers, then a GitHub-style calendar that stretches to the box. */
const ContributionHeatmap = () => {
  const { lang, t } = useLanguage();
  const { days, loading } = useGithubContributions();
  const [hovered, setHovered] = useState<{ day: ContributionDay; x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  if (loading) return <div className="shimmer" style={{ height: 260, borderRadius: 24, marginTop: 36 }} />;
  if (days.length === 0) return null;

  const year = lastYear(days, new Date().toISOString().slice(0, 10));
  const weeks = toWeeks(year);
  const { total, activeDays, longestStreak } = summarize(year);
  const num = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US');
  const dateFmt = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const tip = (day: ContributionDay) => t.activity.heatmapTooltip(day.count, dateFmt.format(new Date(`${day.date}T00:00:00Z`)));
  // The tooltip lives in the box, outside the scrolling strip, so the top rows' tooltips aren't clipped.
  const hover = (day: ContributionDay | null, cell: HTMLElement) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!day || !box) return setHovered(null);
    const r = cell.getBoundingClientRect();
    const x = Math.min(Math.max(r.left - box.left + r.width / 2, 96), box.width - 96);
    setHovered({ day, x, y: r.top - box.top });
  };

  return (
    <>
      <div className="hsum">
        <div>
          <span className="hsum-v">{num.format(total)}</span>
          <span className="hsum-l">{t.activity.summary.contributions}</span>
        </div>
        <div>
          <span className="hsum-v">{num.format(activeDays)}</span>
          <span className="hsum-l">{t.activity.summary.activeDays}</span>
        </div>
        <div>
          <span className="hsum-v">{t.activity.summary.streakValue(longestStreak)}</span>
          <span className="hsum-l">{t.activity.summary.streak}</span>
        </div>
      </div>
      <div ref={boxRef} className="hm-box glass" data-testid="contribution-heatmap" onMouseLeave={() => setHovered(null)}>
        <div className="hm-scroll">
          <div className="hm-in">
            {monthLabels(weeks, lang).map((m) => (
              <span
                key={m.week}
                className="hm-m"
                // The current month's label sits in the last columns: anchor it to the right edge so it isn't cut off.
                style={m.week >= YEAR_WEEKS - 3 ? { right: 0 } : { left: `${((m.week / YEAR_WEEKS) * 100).toFixed(2)}%` }}
              >
                {m.label}
              </span>
            ))}
            <div className="hm-grid" role="img" aria-label={t.activity.heatmapAria(num.format(total))}>
              {weeks.map((week, w) => (
                <div key={w} className="hm-col">
                  {week.map((day, d) => (
                    <i
                      key={d}
                      className={`hm ${day ? `l${day.level}` : 'lx'}`}
                      data-testid={day ? 'contribution-day' : undefined}
                      onMouseEnter={(e) => hover(day, e.currentTarget)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        {hovered && (
          <span className="hm-tip glass-strong" style={{ left: hovered.x, top: hovered.y - 8 }}>
            {tip(hovered.day)}
          </span>
        )}
        <div className="hm-leg">
          {t.activity.heatmapLess}
          <i className="hm-gap" />
          {[0, 1, 2, 3, 4].map((level) => (
            <i key={level} className={`hm l${level}`} />
          ))}
          <i className="hm-gap" />
          {t.activity.heatmapMore}
        </div>
      </div>
    </>
  );
};

export default ContributionHeatmap;
