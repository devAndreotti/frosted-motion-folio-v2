import { useEffect, useState } from 'react';

const GITHUB_USER = 'devAndreotti';
const CACHE_KEY = 'github-activity-cache-v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — keeps us well under the unauthenticated rate limit

interface GithubActivity {
  publicRepos: number | null;
  lastCommit: {
    repo: string;
    message: string;
    relativeTime: string;
  } | null;
  loading: boolean;
}

interface CachedPayload {
  fetchedAt: number;
  publicRepos: number | null;
  lastCommit: GithubActivity['lastCommit'];
}

export function relativeTime(iso: string, now: number = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
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

function writeCache(payload: Omit<CachedPayload, 'fetchedAt'>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, fetchedAt: Date.now() }));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — fine to skip caching
  }
}

/** Live public-repo count + last push, straight from the GitHub REST API — session-cached to stay well inside the unauthenticated rate limit. */
export function useGithubActivity(): GithubActivity {
  const [publicRepos, setPublicRepos] = useState<number | null>(null);
  const [lastCommit, setLastCommit] = useState<GithubActivity['lastCommit']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setPublicRepos(cached.publicRepos);
      setLastCommit(cached.lastCommit);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [userRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USER}`),
          fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=10`),
        ]);
        if (!userRes.ok || !eventsRes.ok) throw new Error('github api error');

        const user = await userRes.json();
        const events = await eventsRes.json();

        // GitHub's public events feed sometimes omits `payload.commits` on a
        // PushEvent (large pushes, API trimming) — don't require it to exist,
        // just prefer the real commit message when it's there.
        const pushEvent = Array.isArray(events) ? events.find((e) => e.type === 'PushEvent') : null;

        const commit = pushEvent
          ? {
              repo: pushEvent.repo.name.replace(`${GITHUB_USER}/`, ''),
              message:
                pushEvent.payload?.commits?.length > 0
                  ? pushEvent.payload.commits[pushEvent.payload.commits.length - 1].message
                  : `push em ${(pushEvent.payload?.ref ?? 'refs/heads/main').replace('refs/heads/', '')}`,
              relativeTime: relativeTime(pushEvent.created_at),
            }
          : null;

        if (!cancelled) {
          setPublicRepos(user.public_repos ?? null);
          setLastCommit(commit);
          writeCache({ publicRepos: user.public_repos ?? null, lastCommit: commit });
        }
      } catch {
        // Network hiccup or rate limit — the UI falls back to its static copy, nothing to show.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { publicRepos, lastCommit, loading };
}
