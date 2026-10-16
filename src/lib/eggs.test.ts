import { describe, expect, it } from "vitest";
import { KONAMI_SEQUENCE, advanceKonami, advanceWord, createTripleClickDetector, isEditableTarget, isTvWord } from "./eggs";

const feed = (keys: string[]) => keys.reduce(({ index }, key) => advanceKonami(index, key), { index: 0, matched: false } as { index: number; matched: boolean });

describe("advanceKonami", () => {
  it("matches the full Konami sequence exactly once, on its last key", () => {
    let index = 0;
    const results = KONAMI_SEQUENCE.map((key) => {
      const next = advanceKonami(index, key);
      index = next.index;
      return next.matched;
    });
    expect(results.slice(0, -1).every((matched) => !matched)).toBe(true);
    expect(results.at(-1)).toBe(true);
    expect(index).toBe(0);
  });

  it("accepts letters in any case", () => {
    expect(feed([...KONAMI_SEQUENCE.slice(0, -2), "B", "A"]).matched).toBe(true);
  });

  it("restarts after a wrong key, and a wrong key that starts the code counts as its first key", () => {
    expect(feed(["ArrowUp", "ArrowUp", "x", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]).matched).toBe(true);
    // ArrowUp typed as the wrong step still leaves one step matched
    expect(advanceKonami(2, "ArrowUp")).toEqual({ index: 1, matched: false });
  });

  it("does not match a partial sequence", () => {
    expect(feed(KONAMI_SEQUENCE.slice(0, 9) as unknown as string[]).matched).toBe(false);
  });
});

describe("advanceWord", () => {
  it("builds a word from letters and resets on anything else", () => {
    let word = "";
    for (const key of ["t", "V"]) word = advanceWord(word, key);
    expect(word).toBe("tv");
    expect(advanceWord(word, " ")).toBe("");
    expect(advanceWord(word, "1")).toBe("");
    expect(advanceWord(word, "Enter")).toBe("");
  });

  it("recognises the TV words only as whole words", () => {
    expect(isTvWord("tv")).toBe(true);
    expect(isTvWord("memory")).toBe(true);
    expect(isTvWord("tvs")).toBe(false);
    expect(isTvWord("active")).toBe(false);
  });
});

describe("createTripleClickDetector", () => {
  it("fires on the third click inside the window and starts over", () => {
    const click = createTripleClickDetector(600);
    expect(click(1000)).toBe(false);
    expect(click(1200)).toBe(false);
    expect(click(1400)).toBe(true);
    expect(click(1500)).toBe(false);
  });

  it("forgets clicks that are too far apart", () => {
    const click = createTripleClickDetector(600);
    expect(click(0)).toBe(false);
    expect(click(500)).toBe(false);
    expect(click(1200)).toBe(false);
    expect(click(1300)).toBe(false);
    expect(click(1400)).toBe(true);
  });
});

describe("isEditableTarget", () => {
  it("is true for inputs, textareas, selects and contenteditable content", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    const inner = document.createElement("span");
    editable.appendChild(inner);
    for (const el of [input, textarea, select, editable, inner]) expect(isEditableTarget(el)).toBe(true);
  });

  it("is false for the page, buttons and non-editable elements, and for missing targets", () => {
    const button = document.createElement("button");
    const locked = document.createElement("div");
    locked.setAttribute("contenteditable", "false");
    expect(isEditableTarget(document.body)).toBe(false);
    expect(isEditableTarget(button)).toBe(false);
    expect(isEditableTarget(locked)).toBe(false);
    expect(isEditableTarget(window)).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});
