/**
 * Pure pieces of the 3D notebook (no three.js), kept apart so they can be unit tested.
 * The keyboard backlight mirrors the real Lenovo LOQ 15IRH8: Fn+Space cycles off -> low -> high.
 */
export type BacklightLevel = 0 | 1 | 2;

/** Emissive strength of the key legends per level, and how strong the glow between the keys is. */
export const BACKLIGHT_LEGEND = [0, 0.8, 1.5] as const;
/** The lit keyboard well: light coming from under every key and filling the gaps. */
export const BACKLIGHT_HALO = [0, 0.4, 0.85] as const;
/** The glow (bloom) around the legends, drawn just above the keys. */
export const BACKLIGHT_GLOW = [0, 0.55, 1] as const;
/** The room light dims a little as the backlight goes up, so the color reads like it does at night. */
export const ROOM_LIGHT = [0.55, 0.45, 0.34] as const;

export const nextBacklight = (level: BacklightLevel): BacklightLevel => ((level + 1) % 3) as BacklightLevel;

/** Saved choice between visits; anything unexpected falls back to off. */
const SAVED: Record<string, BacklightLevel> = { '1': 1, '2': 2 };
export const parseBacklight = (raw: string | null): BacklightLevel => SAVED[raw ?? ''] ?? 0;

/** Carousel index that wraps both ways. */
export const wrapIndex = (i: number, n: number) => (n <= 0 ? 0 : ((i % n) + n) % n);

/**
 * Where to draw a screenshot inside the browser area of the screen: it fills the width and keeps its top edge
 * (a page's header matters more than its footer), cropping the bottom when it is taller than the area.
 */
export function fitTop(iw: number, ih: number, w: number, h: number) {
  if (iw <= 0 || ih <= 0) return { sx: 0, sy: 0, sw: 0, sh: 0 };
  const scale = w / iw;
  const sh = Math.min(ih, h / scale);
  return { sx: 0, sy: 0, sw: iw, sh };
}

/** Host shown in the fake address bar; a project without a live site shows its GitHub path. */
export function hostOf(url: string | undefined) {
  if (!url) return 'github.com/devAndreotti';
  try {
    const u = new URL(url);
    return (u.host + u.pathname).replace(/\/$/, '');
  } catch {
    return url;
  }
}

/** Power LED: blue while on, red while the screen is busy loading a page (the LOQ's "high load" red), off asleep or closed. */
export type LedState = 'off' | 'on' | 'busy';
export const LED_COLORS: Record<Exclude<LedState, 'off'>, string> = { on: '#2f7bff', busy: '#ff2b2b' };

export function ledState(lidOpen: boolean, screenOn: boolean, busy: boolean): LedState {
  if (!lidOpen || !screenOn) return 'off';
  return busy ? 'busy' : 'on';
}

/** Lid angle (0 closed .. 1 open) at time `t` of a `ms` long move from `from` to `to`, eased in and out. */
export function lidAt(from: number, to: number, t: number, ms: number) {
  const p = ms <= 0 ? 1 : Math.min(1, Math.max(0, t / ms));
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  return from + (to - from) * e;
}

/** The page shown on the laptop's screen: the live site when there is one and the device can afford it. */
export function liveUrlFor(url: string | undefined, enabled: boolean) {
  if (!enabled || !url) return null;
  return /^https:\/\//.test(url) ? url : null;
}
