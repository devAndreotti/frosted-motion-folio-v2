import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BOOT_LOADER_ID, BOOT_SEEN_KEY, decodeImage, dismissBootLoader } from './bootLoader';
import { buildBootPalette } from './bootPalette';
import { HUE_ORDER, HUE_THEMES } from './theme';

function mountLoader() {
  const el = document.createElement('div');
  el.id = BOOT_LOADER_ID;
  document.body.appendChild(el);
  return el;
}

describe('dismissBootLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('waits for the minimum time, fades out, remembers the session and removes the node', async () => {
    const el = mountLoader();
    const done = dismissBootLoader({ minMs: 500, maxMs: 2500, elapsed: 100 });

    await vi.advanceTimersByTimeAsync(399);
    expect(el.classList.contains('is-out')).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(el.classList.contains('is-out')).toBe(true);
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(sessionStorage.getItem(BOOT_SEEN_KEY)).toBe('1');
    expect(document.getElementById(BOOT_LOADER_ID)).not.toBeNull();

    await vi.advanceTimersByTimeAsync(600);
    await done;
    expect(document.getElementById(BOOT_LOADER_ID)).toBeNull();
  });

  it('never waits past maxMs for something that hangs', async () => {
    const el = mountLoader();
    dismissBootLoader({ minMs: 0, maxMs: 2500, elapsed: 0, waitFor: new Promise(() => {}) });

    await vi.advanceTimersByTimeAsync(2499);
    expect(el.classList.contains('is-out')).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(el.classList.contains('is-out')).toBe(true);
  });

  it('is a no-op when the loader was already skipped', async () => {
    await expect(dismissBootLoader({ elapsed: 0 })).resolves.toBeUndefined();
  });

  it('treats a rejected waitFor like a resolved one', async () => {
    const el = mountLoader();
    dismissBootLoader({ minMs: 0, maxMs: 2500, elapsed: 0, waitFor: Promise.reject(new Error('decode failed')) });
    await vi.advanceTimersByTimeAsync(0);
    expect(el.classList.contains('is-out')).toBe(true);
  });
});

describe('decodeImage', () => {
  it('never rejects, even when decoding fails', async () => {
    const decode = vi.fn().mockRejectedValue(new Error('nope'));
    vi.stubGlobal(
      'Image',
      class {
        src = '';
        decode = decode;
      }
    );
    await expect(decodeImage('x.webp')).resolves.toBeUndefined();
    expect(decode).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('buildBootPalette', () => {
  it('mirrors the app theme tokens for every hue and mode', () => {
    const palette = buildBootPalette();
    for (const hue of HUE_ORDER) {
      for (const mode of ['light', 'dark'] as const) {
        expect(palette[hue][mode].bg).toBe(HUE_THEMES[hue][mode].bg);
        expect(palette[hue][mode].accent).toBe(HUE_THEMES[hue][mode].accent);
      }
    }
  });
});
