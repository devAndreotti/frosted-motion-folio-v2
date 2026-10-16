import { describe, expect, it, vi } from 'vitest';
import { drawDodge, type DodgePalette } from './dodgeDraw';
import { startGame } from './dodgeGame';

const palette: DodgePalette = { accent: '#f00', bug: '#0f0', line: '#00f' };

const fakeContext = () => {
  const methods = ['setTransform', 'clearRect', 'beginPath', 'moveTo', 'lineTo', 'stroke', 'setLineDash', 'fill', 'ellipse', 'arc', 'roundRect'];
  return Object.fromEntries(methods.map((name) => [name, vi.fn()])) as unknown as CanvasRenderingContext2D & Record<string, ReturnType<typeof vi.fn>>;
};

describe('drawDodge', () => {
  it('clears the frame, draws the lanes, two bugs and the player square', () => {
    const ctx = fakeContext();
    const game = { ...startGame(), playerX: 100, bugs: [{ x: 50, y: 20 }, { x: 300, y: 80 }] };

    drawDodge(ctx, game, palette, 2);

    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 400, 250);
    expect(ctx.ellipse).toHaveBeenCalledTimes(2);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.roundRect).toHaveBeenCalledWith(88, 216, 24, 24, 6);
  });
});
