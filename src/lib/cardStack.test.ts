import { describe, expect, it } from "vitest";
import { reorderStack } from "./cardStack";

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
