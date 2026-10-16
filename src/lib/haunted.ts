/** Haunted 3:17: the visitor's own clock (local time, not Sorocaba) reads 03:17 for one minute. */
export const HAUNTED_HOUR = 3;
export const HAUNTED_MINUTE = 17;
/** The window is 60 s long, so polling every 15 s always lands inside it. */
export const HAUNTED_POLL_MS = 15_000;

export type TimeSource = () => Date;

export const systemNow: TimeSource = () => new Date();

/** True while the given moment's local clock reads 03:17. Pure: the caller decides which moment. */
export function isHauntedMinute(date: Date): boolean {
  return date.getHours() === HAUNTED_HOUR && date.getMinutes() === HAUNTED_MINUTE;
}

/** `?haunted=1` forces the mode on (screenshots, demos). Any other value is ignored. */
export function isHauntedForced(search: string): boolean {
  try {
    return new URLSearchParams(search).get('haunted') === '1';
  } catch {
    return false;
  }
}

/** Whether the haunted mode applies right now, given the page's query string and an injectable clock. */
export function hauntedActive(search: string, now: TimeSource = systemNow): boolean {
  return isHauntedForced(search) || isHauntedMinute(now());
}
