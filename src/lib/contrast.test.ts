import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildHueTheme, HUE_ORDER, type Hue, type Mode } from './theme';
import { colorsIn, contrastRatio, over, parseColor, type Rgba } from './contrast';

// Tokens are read from index.css (the mode blocks) so the audit follows the real CSS.
const css = readFileSync(resolve(import.meta.dirname, '../index.css'), 'utf8');
const block = (selector: RegExp): string => selector.exec(css)?.[1] ?? '';
const ROOT_CSS = block(/:root\s*\{([^}]*)\}/);
const DARK_CSS = block(/\.dark\s*\{([^}]*)\}/);
function cssToken(mode: Mode, name: string): string {
  const scoped = mode === 'dark' ? DARK_CSS : ROOT_CSS;
  const re = new RegExp(`${name}:\\s*([^;]+);`);
  const value = re.exec(scoped)?.[1] ?? re.exec(ROOT_CSS)?.[1];
  if (!value) throw new Error(`token ausente no index.css: ${name} (${mode})`);
  return value.trim();
}

// Minimums from roadmap item 13: 4.5:1 for text, 3:1 for large text and control borders.
const TEXT = 4.5;
const CONTROL = 3;
const TEXT_TOKENS = ['--fg-1', '--fg-2', '--fg-3', '--fg-4'];

type Kind = 'texto' | 'accent' | 'borda' | 'botao';

interface Check {
  kind: Kind;
  pair: string;
  ratio: number;
  min: number;
}

// Each text/border is checked against every stop of the page gradient and every glass layer
// that can sit under it (none, the regular surface, the strong surface). Worst case wins.
function backdrops(hue: Hue, mode: Mode): { name: string; color: Rgba }[] {
  const theme = buildHueTheme(hue)[mode];
  const stops = colorsIn(theme.bg).map(parseColor);
  const glass = [
    { name: 'vidro', color: parseColor(theme.glassSurface) },
    { name: 'vidro forte', color: parseColor(theme.glassStrongSurface) },
  ];
  return stops.flatMap((stop, i) => [
    { name: `parada ${i + 1}, sem vidro`, color: stop },
    ...glass.map((g) => ({ name: `parada ${i + 1}, ${g.name}`, color: over(g.color, stop) })),
  ]);
}

function checksFor(hue: Hue, mode: Mode): Check[] {
  const theme = buildHueTheme(hue)[mode];
  const accent = parseColor(theme.accent);
  const accentInk = parseColor(theme.accentInk);
  const accentText = parseColor(theme.accentText);
  const border = parseColor(cssToken(mode, '--border-1'));
  const out: Check[] = [];
  for (const bg of backdrops(hue, mode)) {
    for (const token of TEXT_TOKENS) {
      const fg = over(parseColor(cssToken(mode, token)), bg.color);
      out.push({ kind: 'texto', pair: `${token} / ${bg.name}`, ratio: contrastRatio(fg, bg.color), min: TEXT });
    }
    out.push({ kind: 'accent', pair: `accentInk (texto) / ${bg.name}`, ratio: contrastRatio(accentInk, bg.color), min: TEXT });
    const edge = over(border, bg.color);
    out.push({ kind: 'borda', pair: `borda de controle (--border-1) / ${bg.name}`, ratio: contrastRatio(edge, bg.color), min: CONTROL });
  }
  out.push({ kind: 'botao', pair: 'accentText / accent (botão preenchido)', ratio: contrastRatio(accentText, accent), min: TEXT });
  return out;
}

// Dívida conhecida (medida em 2026-10-17): só a borda de controle no tema escuro segue abaixo de 3:1
// (1.30 a 1.42:1). O pedido de contraste nesta rodada cobriu o tema claro; subir a borda escura deixa o
// contorno de cada card como um traço branco forte sobre o vidro escuro, então é decisão visual do dono.
// Cada linha sobe quando a borda escura for corrigida.
const DEBT: Record<string, number> = {
  'black dark borda': 1.4,
  'blue dark borda': 1.38,
  'purple dark borda': 1.42,
  'orange dark borda': 1.4,
  'red dark borda': 1.38,
  'green dark borda': 1.3,
  'yellow dark borda': 1.34,
};

describe('contraste dos tokens (7 tons x 2 modos)', () => {
  for (const mode of ['light', 'dark'] as const) {
    for (const hue of HUE_ORDER) {
      it(`${hue} ${mode}: nenhum par abaixo do mínimo, salvo a dívida registrada`, () => {
        const checks = checksFor(hue, mode);
        const failing = checks.filter((c) => c.ratio < c.min);
        const novel = failing.filter((c) => !DEBT[`${hue} ${mode} ${c.kind}`]);
        expect(novel.map((c) => `${c.pair}: ${c.ratio.toFixed(2)}:1 (mínimo ${c.min}:1)`), `${hue} ${mode}`).toEqual([]);
        for (const kind of ['texto', 'accent', 'borda', 'botao'] as const) {
          const key = `${hue} ${mode} ${kind}`;
          if (!(key in DEBT)) continue;
          const worst = Math.min(...checks.filter((c) => c.kind === kind).map((c) => c.ratio));
          expect(Math.round(worst * 100) / 100, `piorou: ${key}`).toBeGreaterThanOrEqual(DEBT[key]);
        }
      });
    }
  }
});

describe('helpers de cor', () => {
  it('lê hex, rgba e hsl (com alfa em número e em %)', () => {
    expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(parseColor('hsl(0 0% 100% / 50%)')).toEqual({ r: 255, g: 255, b: 255, a: 0.5 });
    const red = parseColor('hsl(0 100% 50%)');
    expect(Math.round(red.r)).toBe(255);
    expect(Math.round(red.g)).toBe(0);
  });

  it('calcula a razão de contraste conhecida (preto no branco = 21:1)', () => {
    expect(contrastRatio(parseColor('#000000'), parseColor('#ffffff'))).toBeCloseTo(21, 5);
  });

  it('compõe o alfa sobre a cor de fundo', () => {
    expect(over({ r: 255, g: 255, b: 255, a: 0.5 }, { r: 0, g: 0, b: 0, a: 1 })).toEqual({ r: 127.5, g: 127.5, b: 127.5, a: 1 });
  });

  it('rejeita sintaxe não suportada', () => {
    expect(() => parseColor('oklch(0.5 0 0)')).toThrow(/não suportada/);
  });
});

