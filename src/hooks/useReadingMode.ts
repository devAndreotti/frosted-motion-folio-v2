import { useCallback, useState } from 'react';
import { useEscapeKey } from './useEscapeKey';

export const READING_KEY = 'post-reading-mode';

/** The saved choice; without storage (private window, blocked site data) it is simply off. */
function readSaved(): boolean {
  try {
    return window.localStorage.getItem(READING_KEY) === '1';
  } catch {
    return false;
  }
}

function save(on: boolean) {
  try {
    window.localStorage.setItem(READING_KEY, on ? '1' : '0');
  } catch {
    // no storage: the choice lasts only while the page is open
  }
}

/** Reading mode for the post pages: remembered for every post, left with the same button or Esc. */
export function useReadingMode() {
  const [on, setOn] = useState(readSaved);

  const set = useCallback((next: boolean) => {
    save(next);
    setOn(next);
  }, []);

  const toggle = useCallback(() => set(!on), [on, set]);

  useEscapeKey(on, () => set(false));

  return { on, toggle };
}
