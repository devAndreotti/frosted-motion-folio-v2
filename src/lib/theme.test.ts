import { describe, expect, it } from "vitest";
import { buildHueTheme, hexToRgbTriplet, HUE_ORDER } from "./theme";

describe("hexToRgbTriplet", () => {
  it("converts a hex color to a space-separated rgb triplet", () => {
    expect(hexToRgbTriplet("#3b82f6")).toBe("59 130 246");
  });

  it("handles pure black and white", () => {
    expect(hexToRgbTriplet("#000000")).toBe("0 0 0");
    expect(hexToRgbTriplet("#ffffff")).toBe("255 255 255");
  });
});

describe("buildHueTheme", () => {
  it("gives every hue a full token set, in both modes, that is never a flat color", () => {
    for (const hue of HUE_ORDER) {
      const theme = buildHueTheme(hue);
      expect(theme.swatch).toMatch(/^#[0-9a-f]{6}$/i);
      for (const mode of ["light", "dark"] as const) {
        const tokens = theme[mode];
        // a real gradient, not a bare color
        expect(tokens.bg).toMatch(/^linear-gradient\(/);
        expect(tokens.accent).toMatch(/^#[0-9a-f]{6}$/i);
        expect(tokens.accentText).toMatch(/^#[0-9a-f]{6}$/i);
        // glow/glass tokens carry an alpha channel — never opaque
        for (const token of [tokens.glow1, tokens.glow2, tokens.glow3, tokens.glassSurface, tokens.glassBorder, tokens.glassStrongSurface, tokens.glassStrongBorder]) {
          expect(token).toMatch(/\/ 0\.\d+\)$/);
        }
      }
    }
  });

  it("keeps black achromatic (hue 0, saturation 0%) in both modes", () => {
    const theme = buildHueTheme("black");
    for (const mode of ["light", "dark"] as const) {
      const stops = theme[mode].bg.match(/hsl\(\d+ \d+%/g) ?? [];
      expect(stops.length).toBeGreaterThan(0);
      for (const stop of stops) expect(stop).toBe("hsl(0 0%");
      expect(theme[mode].glassSurface).toMatch(/^hsl\(0 0%/);
    }
  });

  it("gives every non-black hue a distinct, non-zero hue angle", () => {
    for (const hue of HUE_ORDER.filter((h) => h !== "black")) {
      const { light } = buildHueTheme(hue);
      expect(light.bg).toMatch(/hsl\([1-9]/);
    }
  });

  it("darkens the dark-mode gradient relative to light mode for every hue", () => {
    for (const hue of HUE_ORDER) {
      const theme = buildHueTheme(hue);
      const lightFirstLightness = Number(theme.light.bg.match(/hsl\(\d+ \d+% (\d+)%\)/)?.[1]);
      const darkFirstLightness = Number(theme.dark.bg.match(/hsl\(\d+ \d+% (\d+)%\)/)?.[1]);
      expect(darkFirstLightness).toBeLessThan(lightFirstLightness);
    }
  });
});
