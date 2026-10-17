// Juice for the dodge game: particles, score popups, a short screen shake and flash, the fading
// ghost of a bug that was hit, and a combo for coffees caught close together.
// Everything here is decoration: the score and the lives come from dodgeGame, not from this module.
// Particles, shake, flash and ghosts only exist with normal motion; popups stay, but do not drift under reduced motion.
import type { Rng } from './dodgeConfig';
import type { DodgeEvent } from './dodgeGame';

export type ParticleColor = 'bug' | 'coffee';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: ParticleColor;
}

export interface Popup {
  x: number;
  y: number;
  text: string;
  life: number;
}

/** A bug that was hit, shown for a moment while it shrinks away. */
export interface Ghost {
  x: number;
  y: number;
  life: number;
}

export interface Effects {
  motion: boolean;
  particles: Particle[];
  popups: Popup[];
  /** Seconds of shake left. */
  shake: number;
  /** Seconds of screen flash left. */
  flash: number;
  ghosts: Ghost[];
  /** Seconds since the effects started; the combo window is measured on it. */
  clock: number;
  /** `clock` at the last coffee caught. */
  lastCatch: number;
  /** Coffees caught in a row inside the combo window. */
  combo: number;
}

const PARTICLES_PER_BURST = 8;
export const PARTICLE_LIFE = 0.45;
const PARTICLE_SPEED = 130; // field units per second
const POPUP_LIFE = 0.9;
const POPUP_RISE = 28; // field units per second, motion only
export const SHAKE_SECONDS = 0.22;
const SHAKE_AMPLITUDE = 3; // field units
export const FLASH_SECONDS = 0.2;
export const GHOST_LIFE = 0.3;
const COMBO_WINDOW = 4; // seconds between two coffees to count as a combo
const MAX_STEP = 0.05;

export function createEffects(motion: boolean): Effects {
  return { motion, particles: [], popups: [], shake: 0, flash: 0, ghosts: [], clock: 0, lastCatch: -Infinity, combo: 0 };
}

function burst(effects: Effects, x: number, y: number, color: ParticleColor, rng: Rng): Effects {
  if (!effects.motion) return effects;
  const fresh: Particle[] = Array.from({ length: PARTICLES_PER_BURST }, () => {
    const angle = rng() * Math.PI * 2;
    const speed = PARTICLE_SPEED * (0.4 + rng() * 0.6);
    return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: PARTICLE_LIFE, color };
  });
  return { ...effects, particles: [...effects.particles, ...fresh] };
}

/** Applies one game event: a hit bursts, shakes, flashes and leaves a ghost; a coffee bursts and pops "+5" (and "×2", "×3"... for a combo). */
export function applyEvent(effects: Effects, event: DodgeEvent, rng: Rng): Effects {
  if (event.kind === 'hit') {
    const burstEffects = burst(effects, event.x, event.y, 'bug', rng);
    const ghosts = effects.motion ? [...effects.ghosts, { x: event.x, y: event.y, life: GHOST_LIFE }] : effects.ghosts;
    return {
      ...burstEffects,
      shake: effects.motion ? SHAKE_SECONDS : 0,
      flash: effects.motion ? FLASH_SECONDS : 0,
      ghosts,
    };
  }

  const combo = effects.clock - effects.lastCatch <= COMBO_WINDOW ? effects.combo + 1 : 1;
  const popups: Popup[] = [{ x: event.x, y: event.y, text: `+${event.points}`, life: POPUP_LIFE }];
  if (combo > 1) popups.push({ x: event.x, y: event.y - 16, text: `×${combo}`, life: POPUP_LIFE });
  return {
    ...burst(effects, event.x, event.y, 'coffee', rng),
    popups: [...effects.popups, ...popups],
    combo,
    lastCatch: effects.clock,
  };
}

/** Moves particles, popups and ghosts on by `dt` seconds and runs the shake and flash down. */
export function stepEffects(effects: Effects, dt: number): Effects {
  const step = Math.min(MAX_STEP, Math.max(0, dt));
  const particles = effects.particles
    .map((p) => ({ ...p, x: p.x + p.vx * step, y: p.y + p.vy * step, life: p.life - step }))
    .filter((p) => p.life > 0);
  const popups = effects.popups
    .map((p) => ({ ...p, y: effects.motion ? p.y - POPUP_RISE * step : p.y, life: p.life - step }))
    .filter((p) => p.life > 0);
  const ghosts = effects.ghosts.map((g) => ({ ...g, life: g.life - step })).filter((g) => g.life > 0);
  return {
    ...effects,
    particles,
    popups,
    ghosts,
    shake: Math.max(0, effects.shake - step),
    flash: Math.max(0, effects.flash - step),
    clock: effects.clock + step,
  };
}

/** Offset of the whole field for the current shake; zero when still or under reduced motion. */
export function shakeOffset(effects: Effects): { x: number; y: number } {
  if (!effects.motion || effects.shake <= 0) return { x: 0, y: 0 };
  const strength = (effects.shake / SHAKE_SECONDS) * SHAKE_AMPLITUDE;
  return { x: Math.sin(effects.shake * 90) * strength, y: Math.cos(effects.shake * 70) * strength * 0.5 };
}
