/**
 * Pure pieces of the easter eggs: the key sequences, the "is the user typing?" guard,
 * the triple-click detector and the events that let the hooks open things they don't own.
 */

/** Window events the egg hooks dispatch and the components that own the UI listen to. */
export const EGG_EVENTS = {
  openTerminal: 'egg:open-terminal',
  openTv: 'egg:open-tv',
} as const;

export const KONAMI_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'] as const;

/** Words that open the Memory Apartment TV when typed as a whole word, outside inputs. */
export const TV_WORDS = ['tv', 'memory'] as const;

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/** True when the key press belongs to a field the user is typing in (inputs, textareas, selects, contenteditable). */
export function isEditableTarget(target: EventTarget | null | undefined): boolean {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return target.matches(EDITABLE_SELECTOR) || target.closest(EDITABLE_SELECTOR) !== null;
}

export interface KonamiState {
  /** How many keys of KONAMI_SEQUENCE are matched so far. */
  index: number;
  /** True on the key that completes the sequence. */
  matched: boolean;
}

/** Feeds one key into the Konami matcher. Letters compare case-insensitively; a wrong key restarts the count (and may be the first key again). */
export function advanceKonami(index: number, key: string): KonamiState {
  const normalized = key.length === 1 ? key.toLowerCase() : key;
  if (normalized === KONAMI_SEQUENCE[index]) {
    const next = index + 1;
    if (next === KONAMI_SEQUENCE.length) return { index: 0, matched: true };
    return { index: next, matched: false };
  }
  return { index: normalized === KONAMI_SEQUENCE[0] ? 1 : 0, matched: false };
}

/**
 * Builds the typed-word buffer: letters accumulate, anything else (space, digits, punctuation, Enter) starts a new word.
 * Returns the new buffer; a buffer equal to one of TV_WORDS means the word was just typed.
 */
export function advanceWord(word: string, key: string): string {
  if (key.length === 1 && /^[a-z]$/i.test(key)) return word + key.toLowerCase();
  return '';
}

export function isTvWord(word: string): boolean {
  return (TV_WORDS as readonly string[]).includes(word);
}

/** Counts clicks that land within `windowMs` of each other; the third one returns true (and starts over). */
export function createTripleClickDetector(windowMs = 600) {
  let times: number[] = [];
  return (now: number = Date.now()): boolean => {
    times = [...times.filter((time) => now - time <= windowMs), now];
    if (times.length < 3) return false;
    times = [];
    return true;
  };
}
