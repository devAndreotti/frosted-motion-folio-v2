import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { EGG_EVENTS, KONAMI_SEQUENCE } from "@/lib/eggs";
import { useSecretKeys } from "./useSecretKeys";

const press = (key: string, target: EventTarget = window, init: KeyboardEventInit = {}) => {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));
};

const typeText = (text: string, target?: EventTarget) => [...text].forEach((ch) => press(ch, target));

const konami = (target?: EventTarget) => KONAMI_SEQUENCE.forEach((key) => press(key, target));

describe("useSecretKeys", () => {
  const onTerminal = vi.fn();
  const onTv = vi.fn();

  afterEach(() => {
    window.removeEventListener(EGG_EVENTS.openTerminal, onTerminal);
    window.removeEventListener(EGG_EVENTS.openTv, onTv);
    onTerminal.mockReset();
    onTv.mockReset();
    document.body.innerHTML = "";
  });

  const mount = () => {
    window.addEventListener(EGG_EVENTS.openTerminal, onTerminal);
    window.addEventListener(EGG_EVENTS.openTv, onTv);
    return renderHook(() => useSecretKeys());
  };

  it("opens the terminal when the Konami code is typed on the page", () => {
    mount();
    konami();
    expect(onTerminal).toHaveBeenCalledTimes(1);
  });

  it("opens the TV when tv or memory is typed as a word on the page", () => {
    mount();
    typeText("tv");
    expect(onTv).toHaveBeenCalledTimes(1);
    typeText(" memory");
    expect(onTv).toHaveBeenCalledTimes(2);
  });

  it("ignores tv or memory inside a longer run of letters", () => {
    mount();
    typeText("xtv mytv nomemory");
    expect(onTv).not.toHaveBeenCalled();
  });

  it("never fires while typing in an input, textarea or contenteditable", () => {
    mount();
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    document.body.append(input, textarea, editable);

    for (const field of [input, textarea, editable]) {
      konami(field);
      typeText("tv memory", field);
    }
    expect(onTerminal).not.toHaveBeenCalled();
    expect(onTv).not.toHaveBeenCalled();
  });

  it("does not fire while an input is focused, even if the key event targets the page", () => {
    mount();
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    konami();
    typeText("tv");
    expect(onTerminal).not.toHaveBeenCalled();
    expect(onTv).not.toHaveBeenCalled();
  });

  it("ignores keys with a modifier, auto-repeat, or during IME composition", () => {
    mount();
    typeText("t");
    press("v", window, { ctrlKey: true });
    press("v", window, { metaKey: true });
    press("v", window, { altKey: true });
    press("v", window, { repeat: true });
    press("v", window, { isComposing: true });
    expect(onTv).not.toHaveBeenCalled();
  });

  it("starts the Konami count over after the input is typed into, so a half-typed code does not carry over", () => {
    mount();
    KONAMI_SEQUENCE.slice(0, 9).forEach((key) => press(key));
    const input = document.createElement("input");
    document.body.appendChild(input);
    press("a", input);
    press("a");
    expect(onTerminal).not.toHaveBeenCalled();
  });

  it("removes its listener on unmount", () => {
    const { unmount } = mount();
    unmount();
    konami();
    typeText("tv");
    expect(onTerminal).not.toHaveBeenCalled();
    expect(onTv).not.toHaveBeenCalled();
  });
});
