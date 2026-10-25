import { describe, expect, it, vi } from 'vitest';
import { GLOW, createGlow } from './glow';

describe('createGlow', () => {
  it('renders straight with the light off, without building the bloom passes', () => {
    const renderer = { render: vi.fn(), getSize: vi.fn(), getPixelRatio: () => 1 };
    const g = createGlow(renderer as never, {} as never, {} as never);
    g.setLevel(0, "#ffffff");
    g.render();
    expect(renderer.render).toHaveBeenCalledTimes(1);
    expect(renderer.getSize).not.toHaveBeenCalled();
  });

  it('blooms harder on the high level', () => {
    expect(GLOW[0]).toBe(0);
    expect(GLOW[2]).toBeGreaterThan(GLOW[1]);
  });
});
