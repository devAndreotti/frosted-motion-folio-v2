// WCAG 2 contrast helpers for the theme audit (src/lib/contrast.test.ts).
// Only the color syntaxes the theme and index.css actually use: #rrggbb,
// rgb()/rgba() and hsl()/hsla(), with an optional alpha (number or %).

export type Rgba = { r: number; g: number; b: number; a: number };

function alphaOf(raw: string | undefined): number {
  if (raw === undefined) return 1;
  const v = raw.trim();
  return v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = ((h % 360) + 360) % 360 / 360;
  const ss = s / 100;
  const ll = l / 100;
  if (ss === 0) return [ll * 255, ll * 255, ll * 255];
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const hue = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [hue(hh + 1 / 3) * 255, hue(hh) * 255, hue(hh - 1 / 3) * 255];
}

/** Parses `#rrggbb`, `rgb(...)`/`rgba(...)` or `hsl(...)`/`hsla(...)` into 0-255 channels and a 0-1 alpha. */
export function parseColor(input: string): Rgba {
  const s = input.trim().toLowerCase();
  const hex = /^#([0-9a-f]{6})$/.exec(s);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const fn = /^(rgba?|hsla?)\(\s*([^)]*)\)$/.exec(s);
  if (!fn) throw new Error(`cor não suportada: ${input}`);
  // Accept both `a, b, c, d` and `a b c / d` syntaxes.
  const parts = fn[2].split(/\s*[,/]\s*|\s+/).filter(Boolean);
  const [c1, c2, c3, c4] = parts;
  if (fn[1].startsWith('rgb')) {
    return { r: parseFloat(c1), g: parseFloat(c2), b: parseFloat(c3), a: alphaOf(c4) };
  }
  const [r, g, b] = hslToRgb(parseFloat(c1), parseFloat(c2), parseFloat(c3));
  return { r, g, b, a: alphaOf(c4) };
}

/** Puts `top` (with its alpha) over an opaque `bottom`, returning an opaque color. */
export function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of an opaque color. */
export function luminance(c: Rgba): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/** WCAG contrast ratio (1 to 21) between two opaque colors. */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Every `hsl(...)`/`#hex`/`rgb(...)` literal inside a CSS value, in order (e.g. a gradient). */
export function colorsIn(css: string): string[] {
  return css.match(/hsla?\([^)]*\)|rgba?\([^)]*\)|#[0-9a-fA-F]{6}\b/g) ?? [];
}
