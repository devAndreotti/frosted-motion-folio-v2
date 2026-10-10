import { useEffect, useState } from 'react';
import { fetchJsonWithFallback } from '@/lib/githubFetch';

const GITHUB_USER = 'devAndreotti';
const CACHE_KEY = 'github-contributions-cache-v2';
const CACHE_TTL_MS = 10 * 60 * 1000;
// ?y=all returns every year the API has (grouped by year, newest first, but
// ascending within each year) — sort it properly and keep ~2 years so the
// heatmap has enough history to fill a wide screen without scrolling, while
// not shipping 5 years of mostly-irrelevant cells.
const MAX_DAYS = 730;

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface CachedPayload {
  fetchedAt: number;
  days: ContributionDay[];
}

function readCache(): CachedPayload | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ?y=all groups by year, newest year first, ascending within each year — not
// globally chronological — so week-chunking downstream needs a real sort
// first, not just a slice off either end.
export function sortAndTrim(days: ContributionDay[], maxDays: number): ContributionDay[] {
  return [...days].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).slice(-maxDays);
}

function writeCache(days: ContributionDay[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ days, fetchedAt: Date.now() } satisfies CachedPayload));
  } catch {
    // sessionStorage unavailable — fine to skip caching
  }
}

// The hero stats and the heatmap both mount at once; share one request.
let inflight: Promise<ContributionDay[]> | null = null;

async function fetchContributions(): Promise<ContributionDay[]> {
  const data = await fetchJsonWithFallback<{ contributions?: ContributionDay[] }>(
    '/api/gh/contributions',
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=all`,
  );
  const raw: ContributionDay[] = Array.isArray(data?.contributions) ? data.contributions : [];
  const fetched = sortAndTrim(raw, MAX_DAYS);
  writeCache(fetched);
  return fetched;
}

function loadContributions(): Promise<ContributionDay[]> {
  if (!inflight) {
    inflight = fetchContributions().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

/** Last-year GitHub contribution calendar (day, count, 0-4 level) — same shape as the profile's heatmap. */
export function useGithubContributions(): { days: ContributionDay[]; loading: boolean } {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setDays(cached.days);
      setLoading(false);
      return;
    }

    let cancelled = false;
    loadContributions()
      .then((fetched) => {
        if (!cancelled) setDays(fetched);
      })
      .catch(() => {
        // Network hiccup or the third-party API is down — heatmap just stays empty.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { days, loading };
}
