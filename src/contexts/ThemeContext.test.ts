import { describe, expect, it } from "vitest";
import { hexToRgbTriplet, HUES, HUE_ORDER } from "./ThemeContext";

describe("hexToRgbTriplet", () => {
  it("converts a hex color to a space-separated rgb triplet", () => {
    expect(hexToRgbTriplet("#3b82f6")).toBe("59 130 246");
  });

  it("handles pure black and white", () => {
    expect(hexToRgbTriplet("#000000")).toBe("0 0 0");
    expect(hexToRgbTriplet("#ffffff")).toBe("255 255 255");
  });
});

describe("HUES", () => {
  it("defines a dark and light shade for every hue in HUE_ORDER", () => {
    for (const hue of HUE_ORDER) {
      expect(HUES[hue].dark.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(HUES[hue].light.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(HUES[hue].swatch).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
