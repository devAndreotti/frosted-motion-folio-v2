import { describe, expect, it } from "vitest";
import { MAX_VISIBLE_DEPTH, moveKind, reorderStack, stackTransform } from "./cardStack";

describe("reorderStack", () => {
  it("sends the front card to the back when it's clicked", () => {
    expect(reorderStack(["a", "b", "c"], "a")).toEqual(["b", "c", "a"]);
  });

  it("brings a clicked non-front card to the front", () => {
    expect(reorderStack(["a", "b", "c"], "c")).toEqual(["c", "a", "b"]);
  });

  it("is a no-op for an id that isn't in the stack", () => {
    expect(reorderStack(["a", "b", "c"], "z")).toEqual(["a", "b", "c"]);
  });

  it("doesn't mutate the input array", () => {
    const original = ["a", "b", "c"];
    reorderStack(original, "a");
    expect(original).toEqual(["a", "b", "c"]);
  });
});

describe("stackTransform", () => {
  it("puts the front card in place, untilted", () => {
    expect(stackTransform(0)).toBe("translate(calc(var(--fan-x) * 0), calc(var(--fan-y) * 0)) rotate(0deg)");
  });

  it("alternates the tilt side to side as cards go deeper", () => {
    expect(stackTransform(1)).toContain("rotate(-1.5deg)");
    expect(stackTransform(2)).toContain("rotate(3deg)");
  });

  it("collapses everything past the last visible slot onto it", () => {
    expect(stackTransform(MAX_VISIBLE_DEPTH + 2)).toBe(stackTransform(MAX_VISIBLE_DEPTH));
  });
});

describe("moveKind", () => {
  it("sends the front card back and brings any other forward", () => {
    expect(moveKind(["a", "b", "c"], "a")).toBe("back");
    expect(moveKind(["a", "b", "c"], "c")).toBe("front");
  });
});
