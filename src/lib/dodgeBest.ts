// Best score of the 404 mini game, kept per browser. Storage can be blocked or missing
// (private windows, disabled site data), so every access is guarded and falls back to 0.

export const BEST_KEY = 'dodge.best';

const storageOrNull = (): Storage | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

/** The stored best score in whole seconds; 0 when nothing valid is stored. */
export function readBest(storage: Storage | null = storageOrNull()): number {
  try {
    const value = Number(storage?.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

/** Stores `score` when it beats the current best and returns the best that now applies. */
export function saveBest(score: number, storage: Storage | null = storageOrNull()): number {
  const best = Math.max(readBest(storage), Math.floor(score));
  try {
    storage?.setItem(BEST_KEY, String(best));
  } catch {
    // storage full or blocked: the score still shows for this visit
  }
  return best;
}
