import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Build-time only: draws the 1200x630 share image (Open Graph / Twitter card) of a page.
// satori turns a plain element tree into SVG, resvg turns the SVG into PNG. No browser, no network:
// the fonts come from the @fontsource/geist package (WOFF, which satori reads; the variable WOFF2 does not work).

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export interface OgCard {
  /** the page's title (the post's title, or the site's name) */
  title: string;
  /** a line under the title: the post's description */
  subtitle: string;
  /** the small label above the title, e.g. "Escritos" */
  kicker: string;
}

/** Colors are fixed on purpose: a share image is a picture, it does not follow the visitor's theme. */
const COLORS = { bg: '#0a0a0a', fg: '#f5f5f5', muted: '#a3a3a3', accent: '#7aa2ff' };

type Node = { type: string; props: { style?: Record<string, string | number>; children?: Node | string | (Node | string)[] } };

const box = (style: Record<string, string | number>, children?: Node | string | (Node | string)[]): Node => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

/** The card's layout as satori's element tree (plain objects, no React needed). */
export function ogTree(card: OgCard): Node {
  return box(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      background: COLORS.bg,
      color: COLORS.fg,
      fontFamily: 'Geist',
    },
    [
      box({ alignItems: 'center', fontSize: 30, color: COLORS.muted }, [
        box({ width: 14, height: 14, borderRadius: 7, background: COLORS.accent, marginRight: 18 }),
        card.kicker,
      ]),
      box({ flexDirection: 'column', overflow: 'hidden' }, [
        box({ fontSize: 68, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em' }, card.title),
        box({ marginTop: 28, fontSize: 30, lineHeight: 1.35, color: COLORS.muted }, card.subtitle),
      ]),
      box({ justifyContent: 'space-between', alignItems: 'center', fontSize: 26, color: COLORS.muted }, [
        box({}, 'Ricardo A. Gonçalves'),
        box({}, 'devandreotti.com'),
      ]),
    ]
  );
}

export interface OgFont {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: 'normal';
}

/** Geist (regular and bold) from the static @fontsource package, in WOFF. */
export function loadOgFonts(): OgFont[] {
  const require = createRequire(import.meta.url);
  const dir = path.join(path.dirname(require.resolve('@fontsource/geist/package.json')), 'files');
  return [
    { name: 'Geist', data: fs.readFileSync(path.join(dir, 'geist-latin-400-normal.woff')), weight: 400, style: 'normal' },
    { name: 'Geist', data: fs.readFileSync(path.join(dir, 'geist-latin-700-normal.woff')), weight: 700, style: 'normal' },
  ];
}

/** The PNG bytes of one share image. Throws when the fonts or the renderer fail: callers fall back to the site image. */
export async function renderOgPng(card: OgCard, fonts: OgFont[] = loadOgFonts()): Promise<Buffer> {
  const svg = await satori(ogTree(card) as unknown as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
  return Buffer.from(png);
}

/**
 * Renders each card to `<outDir>/og/<name>.png`. A card that fails is skipped with a warning, so the
 * page keeps the site's image. Returns the names that were written.
 */
export async function writeShareImages(outDir: string, cards: { name: string; card: OgCard }[], fonts?: OgFont[]): Promise<Set<string>> {
  const written = new Set<string>();
  const loaded = fonts ?? loadOgFonts();
  for (const { name, card } of cards) {
    try {
      const png = await renderOgPng(card, loaded);
      const file = path.join(outDir, 'og', `${name}.png`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, png);
      written.add(name);
    } catch (error) {
      console.warn(`og-image: ${name} falhou, a página usa a imagem do site (${(error as Error).message})`);
    }
  }
  return written;
}
