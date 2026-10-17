// Pure rules for the "desvie dos bugs" mini game on the 404 page.
// No DOM, no timers: the caller feeds elapsed time, input and an RNG, and gets back a new state.
import { BUG_SIZE, COFFEE_SIZE, FIELD, PLAYER_SIZE, type Rng } from './dodgeConfig';
import { BURST_SECONDS, burstDrops, patternOf, waveOf, type Drop } from './dodgeWaves';

export { BUG_SIZE, COFFEE_SIZE, FIELD, PLAYER_SIZE, type Rng } from './dodgeConfig';

const PLAYER_Y = FIELD.height - PLAYER_SIZE / 2 - 12;
const PLAYER_KEY_SPEED = 420; // units per second with ArrowLeft/Right or A/D
const PLAYER_FOLLOW_SPEED = 1000; // max units per second when chasing a pointer or finger
const MAX_STEP = 0.05; // seconds; a long pause (hidden tab, slow frame) must not teleport the bugs

const FALL_START = 90;
const FALL_RAMP = 7; // extra units per second for every second survived
const FALL_MAX = 430;
const SPAWN_START = 1; // seconds between bugs at the beginning
const SPAWN_RAMP = 0.02; // seconds shaved off per second survived
const SPAWN_MIN = 0.35;
const HITBOX_INSET = 3; // forgiveness on each side, so grazing a bug is not a death

export const LIVES = 3;
const INVULN_SECONDS = 1.2; // after a hit: the bug is gone and the player blinks
const COFFEE_FIRST = 6; // seconds before the first coffee
const COFFEE_MIN_GAP = 8; // coffees come much rarer than bugs: 8 to 14 seconds apart
const COFFEE_JITTER = 6;
export const COFFEE_BONUS = 5;
const SLOW_SECONDS = 3; // a coffee slows the bugs for this long
export const SLOW_SCALE = 0.45;
const SWAY_AMP = 9; // units: how far a bug drifts sideways from where it dropped
const SWAY_SPEED = 2.2; // radians per second

export type DodgeStatus = 'ready' | 'playing' | 'over';

/** A falling object (bug or coffee), centre in field units. */
export interface Bug {
  x: number;
  y: number;
  /** Bugs only: the drop column and the phase of their sideways drift. Missing means no drift. */
  sway?: { base: number; phase: number };
}

/** Things that happened during the last step, for effects; the rules themselves do not use them. */
export type DodgeEvent = { kind: 'hit'; x: number; y: number } | { kind: 'collect'; x: number; y: number; points: number };

export interface DodgeGame {
  status: DodgeStatus;
  elapsed: number;
  playerX: number;
  bugs: Bug[];
  coffees: Bug[];
  /** Seconds until the next bug drops. */
  spawnIn: number;
  /** Seconds until the next coffee drops. */
  coffeeIn: number;
  lives: number;
  /** Elapsed time until which hits do nothing. */
  invulnUntil: number;
  /** Elapsed time until which bugs fall slowly. */
  slowUntil: number;
  /** Points from coffees, added to the survived seconds. */
  bonus: number;
  /** Pattern bugs still waiting to drop. */
  drops: Drop[];
  /** Elapsed time of the next pattern burst. */
  nextBurst: number;
  events: DodgeEvent[];
}

export interface DodgeInput {
  left: boolean;
  right: boolean;
  /** Where a pointer or finger currently is, in field units; null when nothing is held. */
  targetX: number | null;
}

export type { Drop };

export const NO_INPUT: DodgeInput = { left: false, right: false, targetX: null };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Speed multiplier: prefers-reduced-motion runs at half speed with slower spawns. */
export const reducedScale = 0.5;

/** A game waiting for the player to press start. */
export function createGame(): DodgeGame {
  return {
    status: 'ready',
    elapsed: 0,
    playerX: FIELD.width / 2,
    bugs: [],
    coffees: [],
    spawnIn: SPAWN_START,
    coffeeIn: COFFEE_FIRST,
    lives: LIVES,
    invulnUntil: 0,
    slowUntil: 0,
    bonus: 0,
    drops: [],
    nextBurst: BURST_SECONDS,
    events: [],
  };
}

/** A fresh run, already playing. */
export function startGame(): DodgeGame {
  return { ...createGame(), status: 'playing' };
}

const dropX = (size: number, rng: Rng) => size / 2 + clamp(rng(), 0, 0.999999) * (FIELD.width - size);

/** Bugs drop at a random horizontal position across the whole field, each with its own drift. */
export function spawnBug(rng: Rng): Bug {
  const x = dropX(BUG_SIZE, rng);
  return { x, y: -BUG_SIZE / 2, sway: { base: x, phase: rng() * Math.PI * 2 } };
}

/** A bug dropping at a fixed horizontal position, used by pattern bursts. */
export const bugAt = (x: number): Bug => ({ x, y: -BUG_SIZE / 2, sway: { base: x, phase: x * 0.05 } });

/** Moves a swaying bug sideways; with reduced motion it stays in its drop column. */
function swayed(bug: Bug, elapsed: number, motion: boolean): Bug {
  if (!bug.sway) return bug;
  const offset = motion ? Math.sin(elapsed * SWAY_SPEED + bug.sway.phase) * SWAY_AMP : 0;
  return { ...bug, x: clamp(bug.sway.base + offset, BUG_SIZE / 2, FIELD.width - BUG_SIZE / 2) };
}

/** A coffee cup drops at a random horizontal position. */
export function spawnCoffee(rng: Rng): Bug {
  return { x: dropX(COFFEE_SIZE, rng), y: -COFFEE_SIZE / 2 };
}

/** Seconds until the next coffee after one has dropped. */
export function coffeeGapOf(rng: Rng): number {
  return COFFEE_MIN_GAP + clamp(rng(), 0, 0.999999) * COFFEE_JITTER;
}

/** Falling speed in field units per second after `elapsed` seconds. */
export function fallSpeedAt(elapsed: number, scale = 1): number {
  return Math.min(FALL_MAX, FALL_START + elapsed * FALL_RAMP) * scale;
}

/** Seconds between two drops after `elapsed` seconds. */
export function spawnIntervalAt(elapsed: number, scale = 1): number {
  return Math.max(SPAWN_MIN, SPAWN_START - elapsed * SPAWN_RAMP) / scale;
}

const overlaps = (playerX: number, x: number, y: number, size: number) => {
  const reach = (PLAYER_SIZE + size) / 2 - HITBOX_INSET;
  return Math.abs(x - playerX) < reach && Math.abs(y - PLAYER_Y) < reach;
};

/** Overlap test between the player square and one bug, using the inset hitbox. */
export function hits(playerX: number, bug: Bug): boolean {
  return overlaps(playerX, bug.x, bug.y, BUG_SIZE);
}

/** Overlap test between the player square and one coffee cup. */
export function catches(playerX: number, coffee: Bug): boolean {
  return overlaps(playerX, coffee.x, coffee.y, COFFEE_SIZE);
}

/** Whole seconds survived plus coffee bonuses, which is the score. */
export function scoreOf(game: DodgeGame): number {
  return Math.floor(game.elapsed) + game.bonus;
}

/** True while hits do nothing (right after losing a life). */
export function isInvulnerable(game: DodgeGame): boolean {
  return game.elapsed < game.invulnUntil;
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

/** Pattern bursts for the current wave, plus the drops that are due now. */
function scheduleDrops(game: DodgeGame, elapsed: number, rng: Rng) {
  let drops = game.drops;
  let nextBurst = game.nextBurst;
  if (elapsed >= nextBurst) {
    drops = [...drops, ...burstDrops(patternOf(waveOf(elapsed)), elapsed, rng)];
    nextBurst += BURST_SECONDS;
  }
  const due = drops.filter((drop) => drop.at <= elapsed).map((drop) => bugAt(drop.x));
  return { due, drops: drops.filter((drop) => drop.at > elapsed), nextBurst };
}

/**
 * Advances a running game by `dt` seconds. Games that are not playing are returned unchanged,
 * so a finished run stays frozen on screen until the caller starts a new one.
 */
export function stepGame(game: DodgeGame, dt: number, input: DodgeInput, rng: Rng, scale = 1, motion = true): DodgeGame {
  if (game.status !== 'playing') return game;

  const step = clamp(dt, 0, MAX_STEP);
  const elapsed = game.elapsed + step;
  const playerX = movePlayer(game.playerX, step, input);
  const fall = fallSpeedAt(elapsed, scale) * step;
  const slow = elapsed < game.slowUntil ? SLOW_SCALE : 1;
  const events: DodgeEvent[] = [];

  let bugs = game.bugs
    .map((bug) => swayed({ ...bug, y: bug.y + fall * slow }, elapsed, motion))
    .filter((bug) => bug.y - BUG_SIZE / 2 <= FIELD.height);
  let coffees = game.coffees.map((cup) => ({ ...cup, y: cup.y + fall })).filter((cup) => cup.y - COFFEE_SIZE / 2 <= FIELD.height);

  const scheduled = scheduleDrops(game, elapsed, rng);
  bugs = [...bugs, ...scheduled.due];

  let spawnIn = game.spawnIn - step;
  if (spawnIn <= 0) {
    bugs = [...bugs, spawnBug(rng)];
    spawnIn = spawnIntervalAt(elapsed, scale);
  }

  let coffeeIn = game.coffeeIn - step;
  if (coffeeIn <= 0) {
    coffees = [...coffees, spawnCoffee(rng)];
    coffeeIn = coffeeGapOf(rng);
  }

  let bonus = game.bonus;
  let slowUntil = game.slowUntil;
  const caught = coffees.filter((cup) => catches(playerX, cup));
  if (caught.length > 0) {
    coffees = coffees.filter((cup) => !caught.includes(cup));
    for (const cup of caught) {
      bonus += COFFEE_BONUS;
      events.push({ kind: 'collect', x: cup.x, y: cup.y, points: COFFEE_BONUS });
    }
    slowUntil = elapsed + SLOW_SECONDS;
  }

  let lives = game.lives;
  let invulnUntil = game.invulnUntil;
  let status: DodgeStatus = 'playing';
  if (elapsed >= game.invulnUntil) {
    const struck = bugs.filter((bug) => hits(playerX, bug));
    if (struck.length > 0) {
      bugs = bugs.filter((bug) => !struck.includes(bug));
      lives -= 1;
      invulnUntil = elapsed + INVULN_SECONDS;
      events.push({ kind: 'hit', x: struck[0].x, y: struck[0].y });
      if (lives <= 0) status = 'over';
    }
  }

  return {
    ...game,
    status,
    elapsed,
    playerX,
    bugs,
    coffees,
    spawnIn,
    coffeeIn,
    lives,
    invulnUntil,
    slowUntil,
    bonus,
    drops: scheduled.drops,
    nextBurst: scheduled.nextBurst,
    events,
  };
}
