import { useEffect, useState } from 'react';

const GITHUB_USER = 'devAndreotti';
const CACHE_KEY = 'github-activity-feed-cache-v2';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — keeps us well under the unauthenticated rate limit
const FEED_LIMIT = 8;

export type ActivityKind = 'push' | 'pr' | 'star' | 'branch' | 'issue';

export interface GithubActivityItem {
  id: string;
  kind: ActivityKind;
  repo: string;
  text: string;
  detail?: string;
  time: string;
}

interface GithubActivityState {
  publicRepos: number | null;
  items: GithubActivityItem[];
  fetchedAt: number | null;
  loading: boolean;
}

interface CachedPayload {
  fetchedAt: number;
  publicRepos: number | null;
  items: GithubActivityItem[];
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

// GitHub's public events API returns many event types; only these five map
// to something worth showing, and each one covers only its meaningful
// actions — a PR "synchronize" or an edited issue is real activity but not
// activity worth a card, so those return null and get filtered out.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEvent(event: any): GithubActivityItem | null {
  // Keep the full "owner/repo" as-is — a star or an issue can land on
  // someone else's repository, where prefixing our own username would lie.
  const repo = typeof event?.repo?.name === 'string' ? event.repo.name : null;
  if (!repo || typeof event?.id !== 'string' || typeof event?.created_at !== 'string') return null;

  const base = { id: event.id, repo, time: event.created_at };

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload?.commits;
      const detail =
        Array.isArray(commits) && commits.length > 0
          ? commits[commits.length - 1].message
          : `push em ${(event.payload?.ref ?? 'refs/heads/main').replace('refs/heads/', '')}`;
      return { ...base, kind: 'push', text: 'Fez push', detail };
    }
    case 'PullRequestEvent': {
      const action = event.payload?.action;
      const title = event.payload?.pull_request?.title;
      if (action === 'opened') return { ...base, kind: 'pr', text: 'Abriu um PR', detail: title };
      if (action === 'closed' && event.payload?.pull_request?.merged) {
        return { ...base, kind: 'pr', text: 'Fez merge de um PR', detail: title };
      }
      return null;
    }
    case 'WatchEvent':
      return { ...base, kind: 'star', text: 'Deu estrela', detail: undefined };
    case 'CreateEvent': {
      const refType = event.payload?.ref_type;
      if (refType === 'branch') return { ...base, kind: 'branch', text: 'Criou a branch', detail: event.payload?.ref };
      if (refType === 'tag') return { ...base, kind: 'branch', text: 'Criou a tag', detail: event.payload?.ref };
      if (refType === 'repository') return { ...base, kind: 'branch', text: 'Criou o repositório', detail: undefined };
      return null;
    }
    case 'IssuesEvent': {
      const action = event.payload?.action;
      const title = event.payload?.issue?.title;
      if (action === 'opened') return { ...base, kind: 'issue', text: 'Abriu uma issue', detail: title };
      if (action === 'closed') return { ...base, kind: 'issue', text: 'Fechou uma issue', detail: title };
      return null;
    }
    default:
      return null;
  }
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

function writeCache(payload: Omit<CachedPayload, 'fetchedAt'>): number {
  const fetchedAt = Date.now();
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, fetchedAt }));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — fine to skip caching
  }
  return fetchedAt;
}

/** Live public-repo count + a typed feed of recent activity, straight from the GitHub REST API — session-cached to stay well inside the unauthenticated rate limit. */
export function useGithubActivity(): GithubActivityState {
  const [publicRepos, setPublicRepos] = useState<number | null>(null);
  const [items, setItems] = useState<GithubActivityItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setPublicRepos(cached.publicRepos);
      setItems(cached.items);
      setFetchedAt(cached.fetchedAt);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [userRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USER}`),
          fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`),
        ]);
        if (!userRes.ok || !eventsRes.ok) throw new Error('github api error');

        const user = await userRes.json();
        const events = await eventsRes.json();
        const feed = (Array.isArray(events) ? events : [])
          .map(mapEvent)
          .filter((item): item is GithubActivityItem => item !== null)
          .slice(0, FEED_LIMIT);

        if (!cancelled) {
          setPublicRepos(user.public_repos ?? null);
          setItems(feed);
          setFetchedAt(writeCache({ publicRepos: user.public_repos ?? null, items: feed }));
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

  return { publicRepos, items, fetchedAt, loading };
}
