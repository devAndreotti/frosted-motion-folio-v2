import { describe, expect, it } from "vitest";
import { MAX_VISIBLE_DEPTH, moveKind, reorderStack, stackDim, stackTransform } from "./cardStack";

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
  it("puts the front card in place, untilted and full size", () => {
    expect(stackTransform(0)).toBe("translate(0px, 0px) rotate(0.0deg) scale(1.00)");
  });

  it("shifts, tilts and shrinks each card further back the same way", () => {
    expect(stackTransform(1)).toBe("translate(14px, 10px) rotate(2.5deg) scale(0.96)");
    expect(stackTransform(2)).toBe("translate(28px, 20px) rotate(5.0deg) scale(0.92)");
  });

  it("collapses everything past the last visible slot onto it", () => {
    expect(stackTransform(MAX_VISIBLE_DEPTH + 2)).toBe(stackTransform(MAX_VISIBLE_DEPTH));
  });
});

describe("stackDim", () => {
  it("darkens deeper cards and stops at the last visible slot", () => {
    expect(stackDim(0)).toBe("brightness(1.00)");
    expect(stackDim(1)).toBe("brightness(0.88)");
    expect(stackDim(MAX_VISIBLE_DEPTH + 1)).toBe(stackDim(MAX_VISIBLE_DEPTH));
  });
});

describe("moveKind", () => {
  it("sends the front card back and brings any other forward", () => {
    expect(moveKind(["a", "b", "c"], "a")).toBe("back");
    expect(moveKind(["a", "b", "c"], "c")).toBe("front");
  });
});
