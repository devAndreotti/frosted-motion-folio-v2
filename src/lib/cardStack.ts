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
 * Resting transform for a card at `depth` (0 = front). Offsets read the
 * --fan-x/--fan-y custom properties the stack sets per breakpoint, so one
 * formula serves every screen size; the tilt alternates side to side.
 */
export function stackTransform(depth: number): string {
  const d = Math.max(0, Math.min(depth, MAX_VISIBLE_DEPTH));
  const tilt = d === 0 ? 0 : (d % 2 === 0 ? 1 : -1) * d * 1.5;
  return `translate(calc(var(--fan-x) * ${d}), calc(var(--fan-y) * ${d})) rotate(${tilt}deg)`;
}

/** Which flight a click on `id` triggers: the front card flies to the back, any other comes forward. */
export function moveKind<T>(order: T[], id: T): StackMove {
  return order.indexOf(id) === 0 ? 'back' : 'front';
}
