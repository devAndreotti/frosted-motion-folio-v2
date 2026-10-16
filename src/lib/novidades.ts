import { LATEST_CHANGE } from '@/data/changelog';

// The date of the newest change the visitor has seen on /novidades. Per browser only; it can be missing
// or unreadable (private windows, blocked storage), and then the badge simply stays on.
export const SEEN_KEY = 'novidades.visto';

export function readSeen(): string {
  try {
    return localStorage.getItem(SEEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function markSeen(date: string = LATEST_CHANGE): void {
  try {
    localStorage.setItem(SEEN_KEY, date);
  } catch {
    // no storage: the badge keeps showing, which is harmless
  }
}

/** True while there is a change newer than the one the visitor last saw. ISO dates compare as strings. */
export function hasUnseen(seen: string, latest: string = LATEST_CHANGE): boolean {
  return latest !== '' && latest > seen;
}
