// Pure rules for the "desvie dos bugs" mini game on the 404 page.
// No DOM, no timers: the caller feeds elapsed time, input and an RNG, and gets back a new state.

export const FIELD = { width: 400, height: 250 } as const;
export const PLAYER_SIZE = 24;
export const BUG_SIZE = 18;

const PLAYER_Y = FIELD.height - PLAYER_SIZE / 2 - 10;
const PLAYER_KEY_SPEED = 260; // units per second with ArrowLeft/Right or A/D
const PLAYER_FOLLOW_SPEED = 900; // max units per second when chasing a pointer or finger
const MAX_STEP = 0.05; // seconds; a long pause (hidden tab, slow frame) must not teleport the bugs

const FALL_START = 70;
const FALL_RAMP = 6; // extra units per second for every second survived
const FALL_MAX = 340;
const SPAWN_START = 1; // seconds between bugs at the beginning
const SPAWN_RAMP = 0.02; // seconds shaved off per second survived
const SPAWN_MIN = 0.35;
const HITBOX_INSET = 3; // forgiveness on each side, so grazing a bug is not a death

export type DodgeStatus = 'ready' | 'playing' | 'over';

export interface Bug {
  /** Centre of the bug, in field units. */
  x: number;
  y: number;
}

export interface DodgeGame {
  status: DodgeStatus;
  elapsed: number;
  playerX: number;
  bugs: Bug[];
  /** Seconds until the next bug drops. */
  spawnIn: number;
}

export interface DodgeInput {
  left: boolean;
  right: boolean;
  /** Where a pointer or finger currently is, in field units; null when nothing is held. */
  targetX: number | null;
}

export type Rng = () => number;

export const NO_INPUT: DodgeInput = { left: false, right: false, targetX: null };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Speed multiplier: prefers-reduced-motion runs at half speed with slower spawns. */
export const reducedScale = 0.5;

/** A game waiting for the player to press start. */
export function createGame(): DodgeGame {
  return { status: 'ready', elapsed: 0, playerX: FIELD.width / 2, bugs: [], spawnIn: SPAWN_START };
}

/** A fresh run, already playing. */
export function startGame(): DodgeGame {
  return { ...createGame(), status: 'playing' };
}

/** Bugs drop at a random horizontal position across the whole field. */
export function spawnBug(rng: Rng): Bug {
  const half = BUG_SIZE / 2;
  return { x: half + clamp(rng(), 0, 0.999999) * (FIELD.width - BUG_SIZE), y: -half };
}

/** Falling speed in field units per second after `elapsed` seconds. */
export function fallSpeedAt(elapsed: number, scale = 1): number {
  return Math.min(FALL_MAX, FALL_START + elapsed * FALL_RAMP) * scale;
}

/** Seconds between two drops after `elapsed` seconds. */
export function spawnIntervalAt(elapsed: number, scale = 1): number {
  return Math.max(SPAWN_MIN, SPAWN_START - elapsed * SPAWN_RAMP) / scale;
}

/** Overlap test between the player square and one bug, using the inset hitbox. */
export function hits(playerX: number, bug: Bug): boolean {
  const reach = (PLAYER_SIZE + BUG_SIZE) / 2 - HITBOX_INSET;
  return Math.abs(bug.x - playerX) < reach && Math.abs(bug.y - PLAYER_Y) < reach;
}

/** Whole seconds survived, which is the score. */
export function scoreOf(game: DodgeGame): number {
  return Math.floor(game.elapsed);
}

function movePlayer(playerX: number, dt: number, input: DodgeInput): number {
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let next = playerX;
  if (direction !== 0) {
    next += direction * PLAYER_KEY_SPEED * dt;
  } else if (input.targetX !== null) {
    const maxStep = PLAYER_FOLLOW_SPEED * dt;
    next += clamp(input.targetX - playerX, -maxStep, maxStep);
  }
  return clamp(next, PLAYER_SIZE / 2, FIELD.width - PLAYER_SIZE / 2);
}

/**
 * Advances a running game by `dt` seconds. Games that are not playing are returned unchanged,
 * so a finished run stays frozen on screen until the caller starts a new one.
 */
export function stepGame(game: DodgeGame, dt: number, input: DodgeInput, rng: Rng, scale = 1): DodgeGame {
  if (game.status !== 'playing') return game;

  const step = clamp(dt, 0, MAX_STEP);
  const elapsed = game.elapsed + step;
  const playerX = movePlayer(game.playerX, step, input);
  const fall = fallSpeedAt(elapsed, scale) * step;

  let bugs = game.bugs.map((bug) => ({ ...bug, y: bug.y + fall }));
  bugs = bugs.filter((bug) => bug.y - BUG_SIZE / 2 <= FIELD.height);

  let spawnIn = game.spawnIn - step;
  if (spawnIn <= 0) {
    bugs = [...bugs, spawnBug(rng)];
    spawnIn = spawnIntervalAt(elapsed, scale);
  }

  const next = { ...game, elapsed, playerX, bugs, spawnIn };
  if (bugs.some((bug) => hits(playerX, bug))) return { ...next, status: 'over' };
  return next;
}
