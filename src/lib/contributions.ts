import type { ContributionDay } from '@/hooks/useGithubContributions';

export const YEAR_WEEKS = 53;

export interface ContributionSummary {
  total: number;
  activeDays: number;
  longestStreak: number;
}

/**
 * The 365 days ending at the latest entry on or before `today` (YYYY-MM-DD).
 * `days` must be sorted ascending; the API also returns the rest of the
 * current year as zero-count future days, which this drops.
 */
export function lastYear(days: ContributionDay[], today: string): ContributionDay[] {
  const past = days.filter((d) => d.date <= today);
  if (past.length === 0) return [];
  const end = new Date(`${past[past.length - 1].date}T00:00:00Z`).getTime();
  const start = end - 364 * 86400000;
  return past.filter((d) => new Date(`${d.date}T00:00:00Z`).getTime() >= start);
}

/** Total, days with at least one contribution and the longest run of consecutive such days. */
export function summarize(days: ContributionDay[]): ContributionSummary {
  let total = 0;
  let activeDays = 0;
  let run = 0;
  let longestStreak = 0;
  for (const day of days) {
    total += day.count;
    if (day.count > 0) {
      activeDays++;
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }
  return { total, activeDays, longestStreak };
}

/**
 * Lays `days` out as GitHub does: one column per week (Sunday first), the
 * newest week last. Slots before the first day or after the last are null.
 */
export function toWeeks(days: ContributionDay[], weeks = YEAR_WEEKS): (ContributionDay | null)[][] {
  if (days.length === 0) return [];
  const last = new Date(`${days[days.length - 1].date}T00:00:00Z`);
  const trailing = 6 - last.getUTCDay();
  const slots: (ContributionDay | null)[] = [...days, ...Array<null>(trailing).fill(null)];
  const needed = weeks * 7;
  const padded = slots.length >= needed ? slots.slice(-needed) : [...Array<null>(needed - slots.length).fill(null), ...slots];
  const out: (ContributionDay | null)[][] = [];
  for (let w = 0; w < weeks; w++) out.push(padded.slice(w * 7, w * 7 + 7));
  return out;
}
