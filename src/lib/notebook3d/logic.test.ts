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

describe('notebook3d power, lid and live screen', () => {
  it('lights the power LED blue, red while loading, and turns it off asleep or closed', async () => {
    const { ledState, LED_COLORS } = await import('./logic');
    expect(ledState(true, true, false)).toBe('on');
    expect(ledState(true, true, true)).toBe('busy');
    expect(ledState(false, true, true)).toBe('off');
    expect(ledState(true, false, false)).toBe('off');
    expect(LED_COLORS.busy).not.toBe(LED_COLORS.on);
  });

  it('moves the lid with an eased curve that starts and ends exactly', async () => {
    const { lidAt } = await import('./logic');
    expect(lidAt(0, 1, 0, 900)).toBe(0);
    expect(lidAt(0, 1, 450, 900)).toBeCloseTo(0.5);
    expect(lidAt(1, 0, 2000, 900)).toBe(0);
    expect(lidAt(0, 1, 10, 0)).toBe(1);
  });

  it('only puts https sites on the screen, and only when enabled', async () => {
    const { liveUrlFor } = await import('./logic');
    expect(liveUrlFor('https://devandreotti.github.io/pokedex', true)).toBe('https://devandreotti.github.io/pokedex');
    expect(liveUrlFor('https://devandreotti.github.io/pokedex', false)).toBeNull();
    expect(liveUrlFor('http://example.com', true)).toBeNull();
    expect(liveUrlFor(undefined, true)).toBeNull();
  });
});
