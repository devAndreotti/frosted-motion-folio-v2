import { describe, expect, it } from 'vitest';
import { BANNER_SECONDS, bannerVisible, burstDrops, patternOf, waveOf } from './dodgeWaves';
import { BUG_SIZE, FIELD } from './dodgeConfig';

const fixedRng = (value: number) => () => value;

describe('dodgeWaves: timing', () => {
  it('a wave lasts 15 seconds and numbers start at 1', () => {
    expect(waveOf(0)).toBe(1);
    expect(waveOf(14.99)).toBe(1);
    expect(waveOf(15)).toBe(2);
    expect(waveOf(30)).toBe(3);
    expect(waveOf(-1)).toBe(1);
  });

  it('the banner shows for a short moment at the start of each wave only', () => {
    expect(bannerVisible(0)).toBe(true);
    expect(bannerVisible(BANNER_SECONDS - 0.01)).toBe(true);
    expect(bannerVisible(BANNER_SECONDS)).toBe(false);
    expect(bannerVisible(15)).toBe(true);
    expect(bannerVisible(20)).toBe(false);
  });

  it('wave 1 is plain rain, then the patterns cycle', () => {
    expect([1, 2, 3, 4, 5, 6].map(patternOf)).toEqual(['random', 'diagonal', 'rain', 'random', 'diagonal', 'rain']);
  });
});

describe('dodgeWaves: burst patterns', () => {
  it('plain rain adds nothing', () => {
    expect(burstDrops('random', 10, fixedRng(0.5))).toEqual([]);
  });

  it('a diagonal line sweeps across the field, one bug every 0.22 seconds', () => {
    const left = burstDrops('diagonal', 10, fixedRng(0.9));
    expect(left).toHaveLength(6);
    expect(left.map((d) => d.at)).toEqual([10, 10.22, 10.44, 10.66, 10.88, 11.1].map((t) => expect.closeTo(t, 5)));
    const xs = left.map((d) => d.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
    expect(xs[0]).toBe(BUG_SIZE / 2);

    const right = burstDrops('diagonal', 10, fixedRng(0.1));
    expect(right[0].x).toBeGreaterThan(right[5].x);
  });

  it('a rain row drops everywhere at once except one column', () => {
    const drops = burstDrops('rain', 20, fixedRng(0.5));
    expect(drops).toHaveLength(9);
    expect(drops.every((d) => d.at === 20)).toBe(true);
    const xs = drops.map((d) => d.x);
    const gaps = xs.slice(1).map((x, i) => x - xs[i]);
    const step = (FIELD.width - BUG_SIZE) / 9;
    expect(Math.max(...gaps)).toBeCloseTo(step * 2);
    expect(Math.min(...gaps)).toBeCloseTo(step);
  });

  it('the gap of a rain row can be on either edge', () => {
    expect(burstDrops('rain', 0, fixedRng(0))[0].x).toBeGreaterThan(BUG_SIZE);
    expect(burstDrops('rain', 0, fixedRng(0.999))[8].x).toBeLessThan(FIELD.width - BUG_SIZE / 2);
  });
});
