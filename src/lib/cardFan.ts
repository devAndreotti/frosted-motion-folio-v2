/**
 * Hero card fan (wide screens): the cards sit on an arc and the active one
 * stands in the middle. Pure helpers, so the choreography is testable
 * without a DOM. The transforms themselves live in hero-cards.css, driven by
 * the offsets these return, so each breakpoint can size the arc.
 */

/** Position of card `i` on the arc: 0 is the centre, ±1 its neighbours, ±2 the far ones. */
export function arcOffset(i: number, active: number, n: number): number {
  const d = (((i - active) % n) + n) % n;
  return d > n / 2 ? d - n : d;
}

/**
 * How a card moves when the fan turns:
 * - `in`: arrives at the centre (lifts past its spot, light sweeps across it)
 * - `out`: leaves the centre (swings a little past its new angle)
 * - `wr`: goes round the back of the fan (drops below it, comes up on the other side)
 * - `mv`: everyone else just slides along the arc
 */
export type FanRole = 'mv' | 'in' | 'out' | 'wr';

export function fanRole(off: number, was: number): FanRole {
  if (Math.abs(off - was) >= 3) return 'wr';
  if (off === 0) return 'in';
  if (was === 0) return 'out';
  return 'mv';
}

/** Cards further out get darker, so the centre one always reads first. */
export function fanDim(off: number): string {
  return `brightness(${(1 - Math.abs(off) * 0.16).toFixed(2)})`;
}

/** The far cards fade back so the fan doesn't compete with the headline. */
export function fanOpacity(off: number): number {
  return Math.abs(off) >= 2 ? 0.55 : 1;
}

/** Centre card on top, then the neighbours, then the far ones. */
export function fanZ(off: number): number {
  return off === 0 ? 20 : 10 - Math.abs(off);
}
