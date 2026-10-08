import { describe, expect, it } from "vitest";
import { arcOffset, fanDim, fanOpacity, fanRole, fanZ } from "./cardFan";

describe("arcOffset", () => {
  it("puts the active card in the centre and the rest on both sides", () => {
    expect([0, 1, 2, 3, 4].map((i) => arcOffset(i, 0, 5))).toEqual([0, 1, 2, -2, -1]);
    expect([0, 1, 2, 3, 4].map((i) => arcOffset(i, 3, 5))).toEqual([2, -2, -1, 0, 1]);
  });
});

describe("fanRole", () => {
  it("names the card arriving at the centre and the one leaving it", () => {
    expect(fanRole(0, 1)).toBe("in");
    expect(fanRole(-1, 0)).toBe("out");
  });

  it("sends the card that changes ends round the back", () => {
    // turning right: the far-left card reappears far right
    expect(fanRole(2, -2)).toBe("wr");
    // jumping two places: the near-left card ends up on the right
    expect(fanRole(1, -2)).toBe("wr");
  });

  it("just slides everyone else along the arc", () => {
    expect(fanRole(1, 2)).toBe("mv");
    expect(fanRole(-2, -1)).toBe("mv");
  });
});

describe("fan depth cues", () => {
  it("darkens, fades and lowers the cards further out", () => {
    expect([0, 1, 2].map(fanDim)).toEqual(["brightness(1.00)", "brightness(0.84)", "brightness(0.68)"]);
    expect(fanDim(-1)).toBe(fanDim(1));
    expect([0, -1, 2].map(fanOpacity)).toEqual([1, 1, 0.55]);
    expect([0, 1, -1, 2].map(fanZ)).toEqual([20, 9, 9, 8]);
  });
});
