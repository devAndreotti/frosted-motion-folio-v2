import { describe, expect, it, vi } from 'vitest';
import { drawDodge, type DodgePalette } from './dodgeDraw';
import { applyEvent, createEffects, shakeOffset } from './dodgeEffects';
import { startGame, type DodgeGame } from './dodgeGame';

const palette: DodgePalette = { accent: '#f00', bug: '#0f0', coffee: '#ff0', line: '#00f', text: '#fff', font: 'mono' };

const fakeContext = () => {
  const methods = ['setTransform', 'clearRect', 'beginPath', 'moveTo', 'lineTo', 'stroke', 'setLineDash', 'fill', 'fillRect', 'fillText', 'ellipse', 'arc', 'roundRect'];
  return Object.fromEntries(methods.map((name) => [name, vi.fn()])) as unknown as CanvasRenderingContext2D & Record<string, ReturnType<typeof vi.fn>>;
};

const game = (overrides: Partial<DodgeGame> = {}): DodgeGame => ({ ...startGame(), playerX: 100, bugs: [{ x: 50, y: 20 }, { x: 300, y: 80 }], ...overrides });

describe('drawDodge', () => {
  it('clears the frame, draws the lanes, two bugs and the player square', () => {
    const ctx = fakeContext();
    drawDodge(ctx, game(), createEffects(true), palette, 2);

    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(ctx.clearRect).toHaveBeenCalledWith(-12, -12, 664, 344);
    expect(ctx.ellipse).toHaveBeenCalledTimes(2);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.roundRect).toHaveBeenLastCalledWith(86, 280, 28, 28, 7);
  });

  it('draws coffee cups as their own shape, in their own colour', () => {
    const ctx = fakeContext();
    drawDodge(ctx, game({ coffees: [{ x: 400, y: 50 }] }), createEffects(true), palette, 1);
    expect(ctx.roundRect).toHaveBeenCalledWith(393, 45, 14, 13, [2, 2, 6, 6]);
    expect(ctx.arc).toHaveBeenCalledWith(406, 50, 3.5, -Math.PI / 2, Math.PI / 2);
  });

  it('blinks the player while invulnerable, and dims it under reduced motion', () => {
    const ctx = fakeContext();
    const blinking = { ...game(), invulnUntil: 5, elapsed: 1 };
    drawDodge(ctx, blinking, createEffects(true), palette, 1);
    expect(ctx.globalAlpha).toBe(1);

    const seen: number[] = [];
    Object.defineProperty(ctx, 'globalAlpha', { configurable: true, get: () => 1, set: (v: number) => seen.push(v) });
    drawDodge(ctx, { ...blinking, elapsed: 1.05 }, createEffects(true), palette, 1);
    drawDodge(ctx, { ...blinking, elapsed: 1.15 }, createEffects(true), palette, 1);
    expect(seen).toContain(0.25);
    expect(seen).toContain(1);

    seen.length = 0;
    drawDodge(ctx, blinking, createEffects(false), palette, 1);
    expect(seen).toContain(0.45);
  });

  it('draws particles and score popups over the field', () => {
    const ctx = fakeContext();
    const effects = applyEvent(createEffects(true), { kind: 'collect', x: 200, y: 100, points: 5 }, () => 0.5);
    drawDodge(ctx, game(), effects, palette, 1);
    expect(ctx.fillRect).toHaveBeenCalledTimes(8);
    expect(ctx.fillText).toHaveBeenCalledWith('+5', 200, 100);
  });

  it('moves the whole field by the shake offset, scaled to the backing store', () => {
    const ctx = fakeContext();
    const effects = applyEvent(createEffects(true), { kind: 'hit', x: 10, y: 10 }, () => 0.5);
    const offset = shakeOffset(effects);
    drawDodge(ctx, game(), effects, palette, 2);
    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, offset.x * 2, offset.y * 2);
  });
});
