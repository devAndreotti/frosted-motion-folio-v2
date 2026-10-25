import type { KeyKind } from './keymap';

/**
 * Click of a laptop chiclet key, synthesized with Web Audio (no sound files).
 * A short band-passed noise burst gives the click, a very short low sine gives the thump.
 */

/** Presses closer together than this are ignored, so a fast typist never sounds like a machine gun. */
const MIN_GAP_MS = 25;
const PEAK = 0.25;
const THUMP = 0.12;
const NOISE_SEC = 0.06;
const THUMP_SEC = 0.025;

/** Filter frequency, click length and a small pitch shift per key size. */
const CLICK: Record<KeyKind, { freq: number; sec: number }> = {
  normal: { freq: 2800, sec: 0.04 },
  space: { freq: 1200, sec: 0.06 },
  wide: { freq: 1800, sec: 0.05 },
};

type Browser = { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };

/** Random variation of +-pct, so repeated presses do not sound robotic. */
const jitter = (x: number, pct: number) => x * (1 + (Math.random() * 2 - 1) * pct);

function makeNoise(ac: AudioContext): AudioBuffer {
  const len = Math.ceil(ac.sampleRate * NOISE_SEC);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function playClick(ac: AudioContext, noise: AudioBuffer, kind: KeyKind) {
  const spec = CLICK[kind];
  const t = ac.currentTime;
  const vol = jitter(1, 0.06);

  const src = ac.createBufferSource();
  src.buffer = noise;
  const band = ac.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = jitter(spec.freq, 0.06);
  band.Q.value = 1.4;
  const env = ac.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(PEAK * vol, t + 0.0015);
  env.gain.exponentialRampToValueAtTime(0.0001, t + spec.sec);
  src.connect(band);
  band.connect(env);
  env.connect(ac.destination);
  src.start(t);
  src.stop(t + spec.sec + 0.01);

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = jitter(160, 0.06);
  const thump = ac.createGain();
  thump.gain.setValueAtTime(THUMP * vol, t);
  thump.gain.exponentialRampToValueAtTime(0.0001, t + THUMP_SEC);
  osc.connect(thump);
  thump.connect(ac.destination);
  osc.start(t);
  osc.stop(t + THUMP_SEC + 0.01);
}

/** Sound for the keyboard. The AudioContext is created on the first press, since browsers need a user gesture. */
export function createKeySound(): {
  press(kind: KeyKind): void;
  setEnabled(on: boolean): void;
  enabled(): boolean;
  dispose(): void;
} {
  let on = true;
  let ctx: AudioContext | null = null;
  let noise: AudioBuffer | null = null;
  let last = -Infinity;

  function ensure(): AudioContext | null {
    if (ctx) return ctx;
    if (typeof window === 'undefined') return null;
    const w = window as unknown as Browser;
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
    return ctx;
  }

  return {
    press(kind) {
      if (!on) return;
      const now = performance.now();
      if (now - last < MIN_GAP_MS) return;
      const ac = ensure();
      if (!ac) return;
      last = now;
      try {
        if (ac.state === 'suspended') ac.resume().catch(() => undefined);
        noise ??= makeNoise(ac);
        playClick(ac, noise, kind);
      } catch {
        // a sound must never break typing
      }
    },
    setEnabled(v) {
      on = v;
    },
    enabled() {
      return on;
    },
    dispose() {
      const old = ctx;
      ctx = null;
      noise = null;
      try {
        old?.close().catch(() => undefined);
      } catch {
        // already closed
      }
    },
  };
}
