import { useCallback, useEffect, useRef, useState } from 'react';

// Likes live in the Worker (worker/likes.js): one per visitor per post, no account.
// Where there is no Worker (GitHub Pages, the dev server) or no database behind it,
// the first GET fails and the button stays hidden instead of showing a broken count.

export interface LikeState {
  /** loading: first GET in flight; off: no likes on this host; ready: count and liked are real. */
  status: 'loading' | 'off' | 'ready';
  count: number;
  liked: boolean;
  busy: boolean;
  error: boolean;
}

interface LikeAnswer {
  count: number;
  liked: boolean;
}

export const likesUrl = (slug: string) => `${import.meta.env.BASE_URL}api/likes/${encodeURIComponent(slug)}`;

function isAnswer(body: unknown): body is LikeAnswer {
  const b = body as LikeAnswer | null;
  return typeof b?.count === 'number' && typeof b?.liked === 'boolean';
}

async function call(slug: string, method: 'GET' | 'POST' | 'DELETE'): Promise<LikeAnswer> {
  const res = await fetch(likesUrl(slug), { method, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`likes ${method} ${res.status}`);
  const body: unknown = await res.json();
  if (!isAnswer(body)) throw new Error('likes: unexpected answer');
  return body;
}

export function useLikes(slug: string): LikeState & { toggle: () => void } {
  const [state, setState] = useState<LikeState>({ status: 'loading', count: 0, liked: false, busy: false, error: false });
  const current = useRef(state);
  current.current = state;

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', count: 0, liked: false, busy: false, error: false });
    call(slug, 'GET')
      .then((answer) => alive && setState({ status: 'ready', ...answer, busy: false, error: false }))
      .catch(() => alive && setState((s) => ({ ...s, status: 'off' })));
    return () => {
      alive = false;
    };
  }, [slug]);

  const toggle = useCallback(() => {
    const before = current.current;
    if (before.status !== 'ready' || before.busy) return;
    const liked = !before.liked;
    // optimistic: the click shows at once, the server's count replaces it (or rolls it back)
    setState({ ...before, liked, count: Math.max(0, before.count + (liked ? 1 : -1)), busy: true, error: false });
    call(slug, liked ? 'POST' : 'DELETE')
      .then((answer) => setState({ status: 'ready', ...answer, busy: false, error: false }))
      .catch(() => setState({ ...before, busy: false, error: true }));
  }, [slug]);

  return { ...state, toggle };
}
