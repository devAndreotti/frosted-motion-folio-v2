// Waves for the dodge game: every WAVE_SECONDS the field gets a short "Onda N!" banner, and
// every BURST_SECONDS a pattern of bugs drops on top of the usual random rain.
import { BUG_SIZE, FIELD, type Rng } from './dodgeConfig';

export const WAVE_SECONDS = 15;
export const BURST_SECONDS = 7.5;
export const BANNER_SECONDS = 1.8;

/** random: only the usual rain. diagonal: a sweeping line of bugs. rain: a full row with one safe gap. */
export type Pattern = 'random' | 'diagonal' | 'rain';

/** A bug scheduled to drop at `at` seconds of game time, at horizontal centre `x`. */
export interface Drop {
  at: number;
  x: number;
}

const CYCLE: Pattern[] = ['diagonal', 'rain', 'random'];
const DIAGONAL_BUGS = 6;
const DIAGONAL_GAP = 0.22; // seconds between two bugs of the line
const RAIN_COLUMNS = 10;

/** 1-based wave number: 1 for the first WAVE_SECONDS, then 2, 3, ... */
export function waveOf(elapsed: number): number {
  return Math.floor(Math.max(0, elapsed) / WAVE_SECONDS) + 1;
}

/** Wave 1 keeps to plain rain; later waves cycle through the patterns so each one feels new. */
export function patternOf(wave: number): Pattern {
  if (wave <= 1) return 'random';
  return CYCLE[(wave - 2) % CYCLE.length];
}

/** True while the "Onda N!" banner should be on screen. */
export function bannerVisible(elapsed: number): boolean {
  const intoWave = Math.max(0, elapsed) - (waveOf(elapsed) - 1) * WAVE_SECONDS;
  return intoWave < BANNER_SECONDS;
}

/** The drops a pattern adds at game time `now`. Only the wave's own pattern is used. */
export function burstDrops(pattern: Pattern, now: number, rng: Rng): Drop[] {
  const half = BUG_SIZE / 2;
  const span = FIELD.width - BUG_SIZE;

  if (pattern === 'diagonal') {
    const step = span / (DIAGONAL_BUGS - 1);
    const fromRight = rng() < 0.5;
    return Array.from({ length: DIAGONAL_BUGS }, (_, i) => ({
      at: now + i * DIAGONAL_GAP,
      x: half + (fromRight ? DIAGONAL_BUGS - 1 - i : i) * step,
    }));
  }

  if (pattern === 'rain') {
    // one column is left out at random, so the row always has a way through
    const gap = Math.min(RAIN_COLUMNS - 1, Math.floor(rng() * RAIN_COLUMNS));
    const step = span / (RAIN_COLUMNS - 1);
    const drops: Drop[] = [];
    for (let column = 0; column < RAIN_COLUMNS; column++) {
      if (column !== gap) drops.push({ at: now, x: half + column * step });
    }
    return drops;
  }

  return [];
}
