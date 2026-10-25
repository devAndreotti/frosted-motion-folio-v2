import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createKeySound } from './keysound';

/** Records every node the sound graph creates, so the tests can check what was started. */
const made: FakeCtx[] = [];

function node() {
  return { connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
}

class FakeCtx {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = {};
  createBuffer = vi.fn((_ch: number, len: number) => ({ getChannelData: () => new Float32Array(len) }));
  createBufferSource = vi.fn(() => ({ ...node(), buffer: null }));
  createBiquadFilter = vi.fn(() => ({ ...node(), type: '', frequency: { value: 0 }, Q: { value: 0 } }));
  createGain = vi.fn(() => ({
    ...node(),
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  }));
  createOscillator = vi.fn(() => ({ ...node(), type: '', frequency: { value: 0 } }));
  close = vi.fn(() => Promise.resolve());

  constructor() {
    made.push(this);
  }
}

const win = window as unknown as { AudioContext?: unknown; webkitAudioContext?: unknown };

describe('notebook3d key sound', () => {
  beforeEach(() => {
    made.length = 0;
    delete win.AudioContext;
    delete win.webkitAudioContext;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete win.AudioContext;
    delete win.webkitAudioContext;
  });

  it('does nothing and does not throw without an AudioContext', () => {
    const s = createKeySound();
    expect(() => s.press('normal')).not.toThrow();
    expect(() => s.press('space')).not.toThrow();
    expect(() => s.dispose()).not.toThrow();
  });

  it('creates the context on the first press and plays a click with a thump', () => {
    win.AudioContext = FakeCtx;
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    const s = createKeySound();
    expect(made).toHaveLength(0);

    s.press('normal');
    expect(made).toHaveLength(1);
    const ctx = made[0];
    expect(ctx.createBufferSource).toHaveBeenCalledTimes(1);
    expect(ctx.createBiquadFilter).toHaveBeenCalledTimes(1);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
    expect(ctx.createBufferSource.mock.results[0].value.start).toHaveBeenCalled();
    expect(ctx.createOscillator.mock.results[0].value.start).toHaveBeenCalled();
  });

  it('uses the webkit constructor when the standard one is missing', () => {
    win.webkitAudioContext = FakeCtx;
    const s = createKeySound();
    s.press('wide');
    expect(made).toHaveLength(1);
  });

  it('tunes the click per key size', () => {
    win.AudioContext = FakeCtx;
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // no jitter
    const freqs: number[] = [];
    vi.spyOn(performance, 'now').mockReturnValue(0);
    for (const kind of ['normal', 'space', 'wide'] as const) {
      const s = createKeySound();
      s.press(kind);
      const filter = made[made.length - 1].createBiquadFilter.mock.results[0].value as { frequency: { value: number } };
      freqs.push(filter.frequency.value);
    }
    expect(freqs[0]).toBeGreaterThanOrEqual(2200);
    expect(freqs[0]).toBeLessThanOrEqual(3500);
    expect(freqs[1]).toBeCloseTo(1200);
    expect(freqs[2]).toBeCloseTo(1800);
  });

  it('plays nothing while disabled, and reports the state', () => {
    win.AudioContext = FakeCtx;
    const s = createKeySound();
    expect(s.enabled()).toBe(true);
    s.setEnabled(false);
    expect(s.enabled()).toBe(false);
    s.press('normal');
    expect(made).toHaveLength(0);
    s.setEnabled(true);
    s.press('normal');
    expect(made).toHaveLength(1);
  });

  it('ignores a press that comes less than 25 ms after the last sound', () => {
    win.AudioContext = FakeCtx;
    const now = vi.spyOn(performance, 'now').mockReturnValue(100);
    const s = createKeySound();
    s.press('normal');
    now.mockReturnValue(110);
    s.press('normal');
    expect(made[0].createBufferSource).toHaveBeenCalledTimes(1);
    now.mockReturnValue(125);
    s.press('normal');
    expect(made[0].createBufferSource).toHaveBeenCalledTimes(2);
  });

  it('builds the noise once and reuses it', () => {
    win.AudioContext = FakeCtx;
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    const s = createKeySound();
    s.press('normal');
    now.mockReturnValue(100);
    s.press('space');
    expect(made[0].createBuffer).toHaveBeenCalledTimes(1);
    expect(made[0].createBufferSource).toHaveBeenCalledTimes(2);
  });

  it('closes the context on dispose, tolerating errors', () => {
    win.AudioContext = FakeCtx;
    const s = createKeySound();
    s.press('normal');
    s.dispose();
    expect(made[0].close).toHaveBeenCalledTimes(1);

    made[0].close.mockImplementationOnce(() => {
      throw new Error('already closed');
    });
    const t = createKeySound();
    t.press('normal');
    expect(() => t.dispose()).not.toThrow();
  });
});
