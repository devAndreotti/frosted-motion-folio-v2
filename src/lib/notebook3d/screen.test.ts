import { describe, expect, it, vi } from 'vitest';
import { createScreen } from './screen';

describe('createScreen', () => {
  it('draws on a 1024x576 canvas and crossfades only between two real slides', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const s = createScreen();
    expect([s.canvas.width, s.canvas.height]).toEqual([1024, 576]);
    const img = { naturalWidth: 1600, naturalHeight: 1000 } as HTMLImageElement;
    // the first slide appears at once: there is nothing to fade from
    s.show({ image: img, host: 'a.dev' }, 0);
    expect(s.draw(10)).toBe(false);
    // the next one fades in, then settles
    s.show({ image: img, host: 'b.dev' }, 100);
    expect(s.draw(200)).toBe(true);
    expect(s.draw(1000)).toBe(false);
    // reduced motion: instant
    s.show({ image: img, host: 'c.dev' }, 2000, true);
    expect(s.draw(2001)).toBe(false);
  });
});
