import { describe, expect, it } from 'vitest';
import { BACKLIGHT_HALO, BACKLIGHT_LEGEND, fitTop, hostOf, nextBacklight, parseBacklight, wrapIndex } from './logic';

describe('notebook3d logic', () => {
  it('cycles the backlight like Fn+Space: off, low, high, off', () => {
    expect(nextBacklight(0)).toBe(1);
    expect(nextBacklight(1)).toBe(2);
    expect(nextBacklight(2)).toBe(0);
    expect(BACKLIGHT_LEGEND[0]).toBe(0);
    expect(BACKLIGHT_HALO[2]).toBeGreaterThan(BACKLIGHT_HALO[1]);
  });

  it('reads a saved level and ignores junk', () => {
    expect(parseBacklight('2')).toBe(2);
    expect(parseBacklight('1')).toBe(1);
    expect(parseBacklight(null)).toBe(0);
    expect(parseBacklight('9')).toBe(0);
  });

  it('wraps the carousel index both ways', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(3, 0)).toBe(0);
  });

  it('fits a 16:10 shot to the width and crops its bottom', () => {
    const r = fitTop(1600, 1000, 1024, 540);
    expect(r.sw).toBe(1600);
    expect(r.sh).toBeCloseTo(540 / (1024 / 1600));
    expect(fitTop(0, 0, 10, 10).sw).toBe(0);
  });

  it('shows the host and path of the live site, or the GitHub fallback', () => {
    expect(hostOf('https://devandreotti.github.io/pokedex/')).toBe('devandreotti.github.io/pokedex');
    expect(hostOf(undefined)).toBe('github.com/devAndreotti');
    expect(hostOf('not a url')).toBe('not a url');
  });
});
