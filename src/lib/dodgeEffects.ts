// Juice for the dodge game: particles, score popups and a short screen shake.
// Particles and shake only exist with normal motion; popups stay, but do not drift under reduced motion.
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

export interface Effects {
  motion: boolean;
  particles: Particle[];
  popups: Popup[];
  /** Seconds of shake left. */
  shake: number;
}

const PARTICLES_PER_BURST = 8;
export const PARTICLE_LIFE = 0.45;
const PARTICLE_SPEED = 130; // field units per second
const POPUP_LIFE = 0.9;
const POPUP_RISE = 28; // field units per second, motion only
const SHAKE_SECONDS = 0.22;
const SHAKE_AMPLITUDE = 3; // field units
const MAX_STEP = 0.05;

export function createEffects(motion: boolean): Effects {
  return { motion, particles: [], popups: [], shake: 0 };
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

/** Applies one game event: a hit bursts bug-coloured dots and shakes; a coffee bursts and pops "+5". */
export function applyEvent(effects: Effects, event: DodgeEvent, rng: Rng): Effects {
  if (event.kind === 'hit') {
    const burstEffects = burst(effects, event.x, event.y, 'bug', rng);
    return { ...burstEffects, shake: effects.motion ? SHAKE_SECONDS : 0 };
  }
  const popup: Popup = { x: event.x, y: event.y, text: `+${event.points}`, life: POPUP_LIFE };
  return { ...burst(effects, event.x, event.y, 'coffee', rng), popups: [...effects.popups, popup] };
}

/** Moves particles and popups on by `dt` seconds and runs the shake down. */
export function stepEffects(effects: Effects, dt: number): Effects {
  const step = Math.min(MAX_STEP, Math.max(0, dt));
  const particles = effects.particles
    .map((p) => ({ ...p, x: p.x + p.vx * step, y: p.y + p.vy * step, life: p.life - step }))
    .filter((p) => p.life > 0);
  const popups = effects.popups
    .map((p) => ({ ...p, y: effects.motion ? p.y - POPUP_RISE * step : p.y, life: p.life - step }))
    .filter((p) => p.life > 0);
  const shake = Math.max(0, effects.shake - step);
  return { ...effects, particles, popups, shake };
}

/** Offset of the whole field for the current shake; zero when still or under reduced motion. */
export function shakeOffset(effects: Effects): { x: number; y: number } {
  if (!effects.motion || effects.shake <= 0) return { x: 0, y: 0 };
  const strength = (effects.shake / SHAKE_SECONDS) * SHAKE_AMPLITUDE;
  return { x: Math.sin(effects.shake * 90) * strength, y: Math.cos(effects.shake * 70) * strength * 0.5 };
}
