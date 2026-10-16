// Shared sizes and types for the "desvie dos bugs" game. Kept apart from the rules so the
// wave and effect modules can use them without importing the game module back.

/** Logical field, in units. Wide on purpose: the game sits in a ~760px section and keeps a 2:1 box. */
export const FIELD = { width: 640, height: 320 } as const;
export const PLAYER_SIZE = 28;
export const BUG_SIZE = 22;
export const COFFEE_SIZE = 20;

/** Seeded or fake randomness: returns a number in [0, 1). */
export type Rng = () => number;
