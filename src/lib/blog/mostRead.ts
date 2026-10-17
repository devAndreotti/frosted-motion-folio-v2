// "Mais lidos" on /blog/: the Worker's answer (worker/views.js). Only an enabled answer with posts shows the list.
export interface MostReadEntry {
  slug: string;
  views: number;
}

export interface MostReadAnswer {
  enabled: boolean;
  total: number;
  posts: MostReadEntry[];
}

export const topUrl = () => `${import.meta.env.BASE_URL}api/blog/top`;

function isEntry(value: unknown): value is MostReadEntry {
  const e = value as MostReadEntry | null;
  return typeof e?.slug === 'string' && typeof e?.views === 'number';
}

/** The answer, or null when the request fails or the answer is not the one expected (then nothing is shown). */
export async function fetchMostRead(): Promise<MostReadAnswer | null> {
  try {
    const res = await fetch(topUrl(), { headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const body = (await res.json()) as Partial<MostReadAnswer> | null;
    if (typeof body?.enabled !== 'boolean' || typeof body?.total !== 'number') return null;
    const posts = Array.isArray(body.posts) ? body.posts.filter(isEntry) : [];
    return { enabled: body.enabled, total: body.total, posts };
  } catch {
    return null;
  }
}
