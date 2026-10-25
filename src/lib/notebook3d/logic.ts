/**
 * Pure pieces of the 3D notebook (no three.js), kept apart so they can be unit tested.
 * The keyboard backlight mirrors the real Lenovo LOQ 15IRH8: Fn+Space cycles off -> low -> high.
 */
export type BacklightLevel = 0 | 1 | 2;

/** Emissive strength of the key legends per level, and how strong the glow between the keys is. */
export const BACKLIGHT_LEGEND = [0, 0.6, 1.1] as const;
export const BACKLIGHT_HALO = [0, 0.3, 0.65] as const;
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
