import { HUE_ORDER, HUE_THEMES, type Hue, type Mode } from './theme';

export interface BootTokens {
  bg: string;
  accent: string;
  glass: string;
  border: string;
}

export type BootPalette = Record<Hue, Record<Mode, BootTokens>>;

/**
 * The slice of the hue x mode palette the boot loader needs, derived from
 * the same tokens the app uses -- so the inline loader in index.html (which
 * paints before any JS bundle loads) can never drift from the real theme.
 * Injected into index.html at build time by the vite plugin in vite.config.ts.
 */
export function buildBootPalette(): BootPalette {
  const pick = (hue: Hue, mode: Mode): BootTokens => {
    const tokens = HUE_THEMES[hue][mode];
    return {
      bg: tokens.bg,
      accent: tokens.accent,
      glass: tokens.glassStrongSurface,
      border: tokens.glassStrongBorder,
    };
  };
  return Object.fromEntries(
    HUE_ORDER.map((hue) => [hue, { light: pick(hue, 'light'), dark: pick(hue, 'dark') }])
  ) as BootPalette;
}
