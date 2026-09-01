export type Hue = 'black' | 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'yellow';
export type Mode = 'light' | 'dark';

export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export interface ModeTokens {
  /** Full CSS gradient for the page background — never a flat color. */
  bg: string;
  /** Three ambient blob colors (page-behind-the-glass "aurora" glow), reusing the same gradient stops. */
  glow1: string;
  glow2: string;
  glow3: string;
  accent: string;
  accentText: string;
  glassSurface: string;
  glassBorder: string;
  glassStrongSurface: string;
  glassStrongBorder: string;
}

export interface HueTheme {
  swatch: string;
  light: ModeTokens;
  dark: ModeTokens;
}

// The 5-stop saturation/lightness "shape" every hue shares — only the hue
// ANGLE changes per color, so a new color is one array entry, not a
// hand-tuned CSS block. Dark mode reuses the project's original blue
// gradient values (--blue-deep/ocean/sky/electric/cyan) verbatim, since
// that rich, deep wash is the whole reference. Light mode is deliberately
// its own, softer shape — pastel tones close together — because the
// original's "light" stops (15-40% lightness at 100% saturation) are not
// actually soft; reusing them would fail the "tons bem suaves" legibility
// requirement for a light background.
const STOP_S_LIGHT = [35, 40, 45, 40, 35];
const STOP_L_LIGHT = [94, 90, 86, 90, 94];
const STOP_S_DARK = [80, 90, 95, 100, 100];
const STOP_L_DARK = [8, 12, 20, 35, 45];

// Blue keeps the project's exact original per-stop hue drift (it was the
// reference/base); every other color uses one fixed angle across its stops.
const HUE_ANGLES: Record<Exclude<Hue, 'black'>, { light: number[]; dark: number[] }> = {
  blue: { light: [210, 200, 200, 210, 200], dark: [220, 210, 200, 195, 185] },
  purple: { light: [270, 270, 270, 270, 270], dark: [265, 265, 265, 265, 265] },
  orange: { light: [28, 28, 28, 28, 28], dark: [22, 22, 22, 22, 22] },
  red: { light: [355, 355, 355, 355, 355], dark: [350, 350, 350, 350, 350] },
  green: { light: [145, 145, 145, 145, 145], dark: [150, 150, 150, 150, 150] },
  yellow: { light: [45, 45, 45, 45, 45], dark: [40, 40, 40, 40, 40] },
};

// Curated per-hue accent + its contrasting text color (not derivable from
// the gradient formula — needs to stay legible on its own as button/number
// color regardless of the background wash).
const ACCENTS: Record<Hue, { light: { accent: string; text: string }; dark: { accent: string; text: string } }> = {
  black: { dark: { accent: '#e4e4e7', text: '#0a0a0a' }, light: { accent: '#18181b', text: '#fafafa' } },
  blue: { dark: { accent: '#3b82f6', text: '#ffffff' }, light: { accent: '#2563eb', text: '#ffffff' } },
  purple: { dark: { accent: '#a855f7', text: '#ffffff' }, light: { accent: '#9333ea', text: '#ffffff' } },
  orange: { dark: { accent: '#f97316', text: '#1a0f00' }, light: { accent: '#ea580c', text: '#fff7ed' } },
  red: { dark: { accent: '#ef4444', text: '#ffffff' }, light: { accent: '#dc2626', text: '#ffffff' } },
  green: { dark: { accent: '#22c55e', text: '#052e16' }, light: { accent: '#16a34a', text: '#f0fdf4' } },
  yellow: { dark: { accent: '#eab308', text: '#1a1400' }, light: { accent: '#ca8a04', text: '#1a1400' } },
};

const SWATCHES: Record<Hue, string> = {
  black: '#8b8b8b',
  blue: '#3b82f6',
  purple: '#a855f7',
  orange: '#f97316',
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#eab308',
};

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${l}%)`;
}

function hsla(h: number, s: number, l: number, a: number): string {
  return `hsl(${h} ${s}% ${l}% / ${a})`;
}

function buildStops(hue: Hue, mode: Mode): string[] {
  if (hue === 'black') {
    // Achromatic: subtle depth only, never a visible color band — "preto
    // selecionado -> branco <-> preto", not "gray gradient with a tint".
    const l = mode === 'light' ? [99, 97, 98, 96, 99] : [3, 5, 7, 4, 6];
    return l.map((L) => hsl(0, 0, L));
  }
  const angles = HUE_ANGLES[hue][mode];
  const s = mode === 'light' ? STOP_S_LIGHT : STOP_S_DARK;
  const l = mode === 'light' ? STOP_L_LIGHT : STOP_L_DARK;
  return angles.map((h, i) => hsl(h, s[i], l[i]));
}

function gradientBg(stops: string[], mode: Mode): string {
  // Mirrors the original project's two gradient shapes exactly (light loops
  // back through the "sky" stop; dark is a symmetric deep->bright->deep sweep).
  return mode === 'light'
    ? `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 20%, ${stops[2]} 40%, ${stops[3]} 60%, ${stops[4]} 80%, ${stops[2]} 100%)`
    : `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 25%, ${stops[2]} 50%, ${stops[1]} 75%, ${stops[0]} 100%)`;
}

function glowColor(stop: string, alpha: number): string {
  // Every stop is `hsl(h s% l%)`; splice in an alpha channel for the ambient blob.
  return stop.replace(')', ` / ${alpha})`);
}

function buildModeTokens(hue: Hue, mode: Mode): ModeTokens {
  const stops = buildStops(hue, mode);
  const [, , sky, electric, cyan] = stops;
  const { accent, text } = ACCENTS[hue][mode];
  const hueAngle = hue === 'black' ? 0 : HUE_ANGLES[hue][mode][0];
  const sat = hue === 'black' ? 0 : 35;

  return {
    bg: gradientBg(stops, mode),
    // Ambient "aurora" blobs behind the glass panels — soft, not eye-catching.
    glow1: glowColor(electric, mode === 'light' ? 0.3 : 0.22),
    glow2: glowColor(cyan, mode === 'light' ? 0.3 : 0.22),
    glow3: glowColor(sky, mode === 'light' ? 0.28 : 0.18),
    accent,
    accentText: text,
    // Glass stays in the white family (matches the reference screenshot and
    // the project's original recipe) with just enough hue tint to feel
    // color-coordinated with the background wash, never opaque.
    glassSurface: hsla(hueAngle, sat, 96, mode === 'light' ? 0.22 : 0.08),
    glassBorder: hsla(hueAngle, sat, 96, mode === 'light' ? 0.4 : 0.2),
    glassStrongSurface: hsla(hueAngle, sat, 96, mode === 'light' ? 0.32 : 0.13),
    glassStrongBorder: hsla(hueAngle, sat, 96, mode === 'light' ? 0.5 : 0.28),
  };
}

export function buildHueTheme(hue: Hue): HueTheme {
  return {
    swatch: SWATCHES[hue],
    light: buildModeTokens(hue, 'light'),
    dark: buildModeTokens(hue, 'dark'),
  };
}

export const HUE_ORDER: Hue[] = ['black', 'blue', 'purple', 'orange', 'red', 'green', 'yellow'];

export const HUE_THEMES: Record<Hue, HueTheme> = Object.fromEntries(HUE_ORDER.map((h) => [h, buildHueTheme(h)])) as Record<Hue, HueTheme>;
