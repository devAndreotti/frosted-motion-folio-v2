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
