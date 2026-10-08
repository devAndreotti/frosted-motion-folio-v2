import { useEffect, useState } from 'react';

const canMatch = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/** Live `matchMedia(query).matches`; `fallback` where matchMedia doesn't exist (tests, very old browsers). */
export function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState(() => (canMatch() ? window.matchMedia(query).matches : fallback));

  useEffect(() => {
    if (!canMatch()) return;
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, [query]);

  return matches;
}
