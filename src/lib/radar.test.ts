import { describe, expect, it } from "vitest";
import { radarPoint } from "./radar";

describe("radarPoint", () => {
  it("places the first axis (index 0) straight up from center at full level", () => {
    const p = radarPoint(0, 5, 6, 100, 80);
    expect(p.x).toBeCloseTo(100, 5);
    expect(p.y).toBeCloseTo(20, 5); // 100 - 80 (straight up, -90deg)
  });

  it("collapses to the center at level 0", () => {
    const p = radarPoint(2, 0, 6, 100, 80);
    expect(p.x).toBeCloseTo(100, 5);
    expect(p.y).toBeCloseTo(100, 5);
  });

  it("spaces axes evenly around the circle", () => {
    const total = 4;
    const points = Array.from({ length: total }, (_, i) => radarPoint(i, 5, total, 0, 10));
    // opposite axes (0 and 2 of 4) should be mirrored through the center
    expect(points[0].x).toBeCloseTo(-points[2].x, 5);
    expect(points[0].y).toBeCloseTo(-points[2].y, 5);
  });
});
