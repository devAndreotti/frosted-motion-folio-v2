import { describe, expect, it } from "vitest";
import { scrambled } from "./Navigation";

describe("scrambled", () => {
  it("preserves the input length", () => {
    expect(scrambled("Ricardo Andreotti")).toHaveLength("Ricardo Andreotti".length);
  });

  it("keeps spaces in place", () => {
    const result = scrambled("Ricardo Andreotti");
    const spaceIndex = "Ricardo Andreotti".indexOf(" ");
    expect(result[spaceIndex]).toBe(" ");
  });

  it("only ever uses characters from the glitch charset (or the original letter)", () => {
    const glitchChars = new Set("#$%&01</>{}=+*".split(""));
    const original = "Ricardo";
    const result = scrambled(original);
    for (let i = 0; i < result.length; i++) {
      expect(glitchChars.has(result[i]) || result[i] === original[i]).toBe(true);
    }
  });
});
