import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadUmami, track } from './track';

describe('track', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.umami;
  });

  it('sends the beacon and, when Umami is loaded, the event too', () => {
    const sendBeacon = vi.fn();
    vi.stubGlobal('navigator', { sendBeacon });
    window.umami = { track: vi.fn() };
    track('cta-projects');
    expect(sendBeacon).toHaveBeenCalledWith('./e/cta-projects');
    expect(window.umami.track).toHaveBeenCalledWith('cta-projects');
  });

  it('never throws, even when the telemetry does', () => {
    vi.stubGlobal('navigator', { sendBeacon: () => { throw new Error('blocked'); } });
    expect(() => track('x')).not.toThrow();
  });
});

describe('loadUmami', () => {
  afterEach(() => document.head.querySelectorAll('script[data-website-id]').forEach((s) => s.remove()));

  it('adds the deferred tracker only when both the script and the id are set', () => {
    loadUmami(undefined, 'abc');
    loadUmami('https://stats.example.com/s.js', '');
    expect(document.head.querySelector('script[data-website-id]')).toBeNull();

    loadUmami('https://stats.example.com/s.js', 'abc');
    const script = document.head.querySelector<HTMLScriptElement>('script[data-website-id]')!;
    expect(script.src).toBe('https://stats.example.com/s.js');
    expect(script.defer).toBe(true);
    expect(script.dataset.websiteId).toBe('abc');
  });
});
