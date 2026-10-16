import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const param = () => ({ value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() });
const node = () => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), gain: param(), frequency: param(), type: "", buffer: null as unknown, loop: false });

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state = "running";
  currentTime = 0;
  sampleRate = 100;
  destination = {};
  sources: ReturnType<typeof node>[] = [];
  close = vi.fn(() => Promise.resolve());
  resume = vi.fn();
  constructor() {
    FakeAudioContext.instances.push(this);
  }
  createGain = () => node();
  createBiquadFilter = () => node();
  createOscillator = () => node();
  createBufferSource = () => {
    const n = node();
    this.sources.push(n);
    return n;
  };
  createBuffer = (_c: number, length: number) => ({ getChannelData: () => new Float32Array(length) });
  decodeAudioData = vi.fn(() => Promise.resolve({ decoded: true }));
}

describe("tvAudio", () => {
  beforeEach(() => {
    vi.resetModules();
    FakeAudioContext.instances = [];
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)) })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("plays the click as a synthesized tick until the recording has loaded, then as the recording", async () => {
    const tv = await import("./tvAudio");
    tv.tvClick();
    const ctx = FakeAudioContext.instances[0];
    expect(ctx.sources.length).toBe(2); // two noise bursts
    await tv.loadTvSounds();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.map((c) => String(c[0]).split("/").pop()).sort()).toEqual(["crt-hum.mp3", "static-click.mp3"]);
    tv.tvClick(0.5);
    expect(ctx.sources.length).toBe(3); // one recording
    expect((ctx.sources[2].buffer as { decoded: boolean }).decoded).toBe(true);
  });

  it("starts the hum once, fades it out on stop, and releases everything on close", async () => {
    const tv = await import("./tvAudio");
    tv.startTvHum();
    tv.startTvHum(); // already humming
    const ctx = FakeAudioContext.instances[0];
    expect(ctx.sources.filter((s) => s.loop).length).toBe(1); // the crackle (no recording yet)
    expect(ctx.sources.length).toBe(1);
    tv.stopTvHum();
    tv.closeTvAudio();
    expect(ctx.close).toHaveBeenCalled();
  });

  it("knocks with a dull thunk", async () => {
    const tv = await import("./tvAudio");
    tv.tvClunk();
    expect(FakeAudioContext.instances[0].sources.length).toBe(2);
  });

  it("is silent where there is no Web Audio", async () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("webkitAudioContext", undefined);
    const tv = await import("./tvAudio");
    expect(() => {
      tv.tvClick();
      tv.tvClunk();
      tv.startTvHum();
      tv.stopTvHum();
    }).not.toThrow();
    await expect(tv.loadTvSounds()).resolves.toBeUndefined();
  });
});
