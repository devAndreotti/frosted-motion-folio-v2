import { useEffect, useState } from 'react';

const GITHUB_USER = 'devAndreotti';
const CACHE_KEY = 'github-contributions-cache-v1';
const CACHE_TTL_MS = 10 * 60 * 1000;

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

function writeCache(days: ContributionDay[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ days, fetchedAt: Date.now() } satisfies CachedPayload));
  } catch {
    // sessionStorage unavailable — fine to skip caching
  }
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

    async function load() {
      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`);
        if (!res.ok) throw new Error('contributions api error');
        const data = await res.json();
        const fetched: ContributionDay[] = Array.isArray(data?.contributions) ? data.contributions : [];
        if (!cancelled) {
          setDays(fetched);
          writeCache(fetched);
        }
      } catch {
        // Network hiccup or the third-party API is down — heatmap just stays empty.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { days, loading };
}
