/**
 * Click-to-reorder rule for the hero's card stack: clicking the front card
 * sends it to the back; clicking any other card brings it to the front.
 * Pure so it's trivial to test independently of the DOM/click handlers.
 */
export function reorderStack<T>(order: T[], id: T): T[] {
  const next = [...order];
  const idx = next.indexOf(id);
  if (idx === -1) return next;
  if (idx === 0) {
    next.push(next.shift() as T);
  } else {
    next.splice(idx, 1);
    next.unshift(id);
  }
  return next;
}

/** Cards deeper than this share the last visible slot, hidden right behind it -- keeps the pile tidy instead of fanning off the column. */
export const MAX_VISIBLE_DEPTH = 3;

export type StackMove = 'back' | 'front';

/**
 * Resting transform for a card at `depth` (0 = front): each step back shifts
 * down-right, tilts a little more and shrinks 4.5%, so the pile reads as one
 * deck leaning the same way.
 */
export function stackTransform(depth: number): string {
  const d = Math.max(0, Math.min(depth, MAX_VISIBLE_DEPTH));
  return `translate(${d * 18}px, ${d * 12}px) rotate(${(d * 3).toFixed(1)}deg) scale(${(1 - d * 0.045).toFixed(3)})`;
}

/** Cards further back get darker, so the front one always reads first. */
export function stackDim(depth: number): string {
  const d = Math.max(0, Math.min(depth, MAX_VISIBLE_DEPTH));
  return `brightness(${(1 - d * 0.14).toFixed(2)})`;
}

/** Which flight a click on `id` triggers: the front card flies to the back, any other comes forward. */
export function moveKind<T>(order: T[], id: T): StackMove {
  return order.indexOf(id) === 0 ? 'back' : 'front';
}
