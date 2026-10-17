import { describe, expect, it } from 'vitest';
import { applyEvent, createEffects, shakeOffset, stepEffects, type Effects } from './dodgeEffects';

const fixedRng = (value: number) => () => value;
const hitEvent = { kind: 'hit' as const, x: 100, y: 200 };
const coinEvent = { kind: 'collect' as const, x: 300, y: 250, points: 5 };
/** Runs `seconds` of game time in 50 ms frames, as the hook does. */
const run = (effects: Effects, seconds: number) => {
  let next = effects;
  for (let t = 0; t < seconds - 1e-9; t += 0.05) next = stepEffects(next, 0.05);
  return next;
};

describe('dodgeEffects: events', () => {
  it('a hit bursts particles and shakes the field when motion is allowed', () => {
    const next = applyEvent(createEffects(true), hitEvent, fixedRng(0.5));
    expect(next.particles).toHaveLength(8);
    expect(next.particles.every((p) => p.color === 'bug' && p.x === 100 && p.y === 200)).toBe(true);
    expect(next.shake).toBeCloseTo(0.22);
    expect(next.popups).toEqual([]);
  });

  it('a coffee bursts coffee-coloured particles and shows its points', () => {
    const next = applyEvent(createEffects(true), coinEvent, fixedRng(0.5));
    expect(next.particles.every((p) => p.color === 'coffee')).toBe(true);
    expect(next.popups).toEqual([expect.objectContaining({ text: '+5', x: 300, y: 250 })]);
    expect(next.shake).toBe(0);
  });

  it('under reduced motion there are no particles and no shake, but the points still show', () => {
    const hit = applyEvent(createEffects(false), hitEvent, fixedRng(0.5));
    expect(hit.particles).toEqual([]);
    expect(hit.shake).toBe(0);
    const coin = applyEvent(createEffects(false), coinEvent, fixedRng(0.5));
    expect(coin.particles).toEqual([]);
    expect(coin.popups).toHaveLength(1);
  });

  it('particle speeds vary with the random source', () => {
    const slow = applyEvent(createEffects(true), hitEvent, fixedRng(0));
    const fast = applyEvent(createEffects(true), hitEvent, fixedRng(0.999));
    expect(Math.hypot(fast.particles[0].vx, fast.particles[0].vy)).toBeGreaterThan(Math.hypot(slow.particles[0].vx, slow.particles[0].vy));
  });
});

describe('dodgeEffects: stepping', () => {
  it('particles move, fade and disappear after their short life', () => {
    const burst = applyEvent(createEffects(true), hitEvent, fixedRng(0.5));
    const moved = stepEffects(burst, 0.05);
    expect(moved.particles[0].x).not.toBe(100);
    expect(moved.particles[0].life).toBeCloseTo(0.4);
    expect(run(burst, 0.5).particles).toEqual([]);
  });

  it('popups rise with normal motion and stay put under reduced motion, then vanish', () => {
    const coin = applyEvent(createEffects(true), coinEvent, fixedRng(0.5));
    expect(stepEffects(coin, 0.1).popups[0].y).toBeLessThan(250);
    const still = applyEvent(createEffects(false), coinEvent, fixedRng(0.5));
    expect(stepEffects(still, 0.1).popups[0].y).toBe(250);
    expect(run(coin, 1).popups).toEqual([]);
  });

  it('the shake runs down to zero', () => {
    const hit = applyEvent(createEffects(true), hitEvent, fixedRng(0.5));
    expect(run(hit, 0.1).shake).toBeCloseTo(0.12);
    expect(run(hit, 1).shake).toBe(0);
  });

  it('a hit flashes the field and leaves a ghost that fades out', () => {
    const hit = applyEvent(createEffects(true), hitEvent, fixedRng(0.5));
    expect(hit.flash).toBeCloseTo(0.2);
    expect(hit.ghosts).toEqual([{ x: 100, y: 200, life: 0.3 }]);
    const later = run(hit, 1);
    expect(later.flash).toBe(0);
    expect(later.ghosts).toEqual([]);
  });

  it('coffees caught close together make a combo, and a slow catch starts again', () => {
    let effects = applyEvent(createEffects(true), coinEvent, fixedRng(0.5));
    expect(effects.popups.map((p) => p.text)).toEqual(['+5']);
    effects = applyEvent(run(effects, 0.5), coinEvent, fixedRng(0.5));
    expect(effects.popups.map((p) => p.text)).toEqual(['+5', '+5', '×2']);
    effects = applyEvent(run(effects, 6), coinEvent, fixedRng(0.5));
    expect(effects.combo).toBe(1);
  });

  it('under reduced motion a hit has no flash and no ghost, and a combo still shows', () => {
    const hit = applyEvent(createEffects(false), hitEvent, fixedRng(0.5));
    expect(hit.flash).toBe(0);
    expect(hit.ghosts).toEqual([]);
    const once = applyEvent(createEffects(false), coinEvent, fixedRng(0.5));
    const twice = applyEvent(run(once, 1), coinEvent, fixedRng(0.5));
    expect(twice.popups.map((p) => p.text)).toContain('×2');
  });

  it('a long frame is capped, like the game step', () => {
    const hit = applyEvent(createEffects(true), hitEvent, fixedRng(0.5));
    expect(stepEffects(hit, 10).shake).toBeCloseTo(0.17);
  });
});

describe('dodgeEffects: shake offset', () => {
  it('is zero when still or under reduced motion', () => {
    expect(shakeOffset(createEffects(true))).toEqual({ x: 0, y: 0 });
    const hit = applyEvent(createEffects(false), hitEvent, fixedRng(0.5));
    expect(shakeOffset(hit)).toEqual({ x: 0, y: 0 });
  });

  it('moves the field a few units while shaking and settles back', () => {
    const hit = applyEvent(createEffects(true), hitEvent, fixedRng(0.5));
    const offset = shakeOffset(hit);
    expect(Math.abs(offset.x)).toBeGreaterThan(0);
    expect(Math.abs(offset.x)).toBeLessThanOrEqual(3);
    expect(shakeOffset(run(hit, 1))).toEqual({ x: 0, y: 0 });
  });
});
