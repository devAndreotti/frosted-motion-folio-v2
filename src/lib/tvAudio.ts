/**
 * The only sound on the site: Memory Apartment's TV. The recordings (the static click and the CRT hum) and the
 * synthesized clicks are the ones from the game's own site; everything is built on demand, after a click, and closed
 * again with the dialog.
 */
type Ctx = AudioContext;

let ctx: Ctx | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;
let loading: Promise<void> | null = null;
const samples: Record<string, AudioBuffer | undefined> = {};
let hum: { gain: GainNode; sources: AudioScheduledSourceNode[] } | null = null;

const BASE = () => `${import.meta.env.BASE_URL}now/tv/`;

function audio(): Ctx | null {
  const AC = typeof window === 'undefined' ? undefined : window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = 0.7;
    out.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Fetches and decodes the two recordings once; a failure just leaves the synthesized sounds. */
export function loadTvSounds(): Promise<void> {
  const a = audio();
  if (!a) return Promise.resolve();
  loading ??= Promise.all(
    [
      ['click', 'static-click.mp3'],
      ['hum', 'crt-hum.mp3'],
    ].map(([key, file]) =>
      fetch(BASE() + file)
        .then((r) => r.arrayBuffer())
        .then((buf) => a.decodeAudioData(buf))
        .then((decoded) => {
          samples[key] = decoded;
        })
        .catch(() => undefined)
    )
  ).then(() => undefined);
  return loading;
}

/** A short burst of filtered noise: the building block of the synthesized clicks. */
function burst(t: number, gain: number, highpass: number, len: number) {
  if (!ctx || !out || !noise) return;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = noise;
  filter.type = 'highpass';
  filter.frequency.value = highpass;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(filter);
  filter.connect(g);
  g.connect(out);
  src.start(t, Math.random() * 0.9, len + 0.02);
}

/** The knob / power-on click: the game's recording, or a synthesized tick until it has loaded. */
export function tvClick(gain = 0.7) {
  const a = audio();
  if (!a || !out) return;
  const sample = samples.click;
  if (sample) {
    const src = a.createBufferSource();
    const g = a.createGain();
    src.buffer = sample;
    g.gain.value = gain;
    src.connect(g);
    g.connect(out);
    src.start();
    return;
  }
  const t = a.currentTime + 0.01;
  burst(t, 0.3, 2500, 0.012);
  burst(t + 0.07, 0.16, 1200, 0.02);
}

/** Power off, and a knock on the TV: a dull thunk. */
export function tvClunk() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + 0.005;
  burst(t, 0.35, 600, 0.03);
  burst(t + 0.04, 0.2, 2000, 0.015);
}

/** The CRT hum, looped under a faint crackle, fading in. */
export function startTvHum() {
  const a = audio();
  if (!a || !out || hum) return;
  const now = a.currentTime;
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(1, now + 0.8);
  gain.connect(out);
  const sources: AudioScheduledSourceNode[] = [];
  const recording = samples.hum;
  if (recording) {
    const h = a.createBufferSource();
    const g = a.createGain();
    h.buffer = recording;
    h.loop = true;
    g.gain.value = 0.45;
    h.connect(g);
    g.connect(gain);
    sources.push(h);
  } else {
    const o1 = a.createOscillator();
    const g1 = a.createGain();
    o1.frequency.value = 60;
    g1.gain.value = 0.035;
    o1.connect(g1);
    g1.connect(gain);
    sources.push(o1);
  }
  // now and then a pop, like a tube TV
  const crackle = a.createBuffer(1, a.sampleRate * 3, a.sampleRate);
  const d = crackle.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.7 : 0) + (Math.random() * 2 - 1) * 0.004;
  const c = a.createBufferSource();
  const f = a.createBiquadFilter();
  const gc = a.createGain();
  c.buffer = crackle;
  c.loop = true;
  f.type = 'highpass';
  f.frequency.value = 900;
  gc.gain.value = recording ? 0.12 : 0.25;
  c.connect(f);
  f.connect(gc);
  gc.connect(gain);
  sources.push(c);
  sources.forEach((s) => s.start());
  hum = { gain, sources };
}

export function stopTvHum() {
  if (!hum || !ctx) return;
  const { gain, sources } = hum;
  hum = null;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  sources.forEach((s) => s.stop(t + 0.35));
}

/** Everything off and released: the dialog is closed. */
export function closeTvAudio() {
  stopTvHum();
  const c = ctx;
  ctx = null;
  out = null;
  noise = null;
  loading = null;
  for (const key of Object.keys(samples)) delete samples[key];
  if (c) void c.close().catch(() => undefined);
}
