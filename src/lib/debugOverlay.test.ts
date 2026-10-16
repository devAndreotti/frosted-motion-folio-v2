import { afterEach, describe, expect, it, vi } from "vitest";
import { DEBUG_CLASS, DEBUG_EVENT, isDebugOn, pageLoadMs, setDebugOn, toggleDebug } from "./debugOverlay";

describe("debug mode state", () => {
  afterEach(() => {
    document.documentElement.classList.remove(DEBUG_CLASS);
    vi.restoreAllMocks();
  });

  it("sets and clears the html class and announces the change", () => {
    const listener = vi.fn();
    window.addEventListener(DEBUG_EVENT, listener);
    setDebugOn(true);
    expect(isDebugOn()).toBe(true);
    expect(document.documentElement.classList.contains(DEBUG_CLASS)).toBe(true);
    setDebugOn(false);
    expect(isDebugOn()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener(DEBUG_EVENT, listener);
  });

  it("toggles", () => {
    toggleDebug();
    expect(isDebugOn()).toBe(true);
    toggleDebug();
    expect(isDebugOn()).toBe(false);
  });
});

describe("pageLoadMs", () => {
  it("returns the navigation load time when the page has finished loading", () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([{ loadEventEnd: 412.6 } as PerformanceNavigationTiming]);
    expect(pageLoadMs()).toBe(413);
  });

  it("returns null while loading or when there is no navigation entry", () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValueOnce([{ loadEventEnd: 0 } as PerformanceNavigationTiming]);
    expect(pageLoadMs()).toBeNull();
    vi.spyOn(performance, "getEntriesByType").mockReturnValueOnce([]);
    expect(pageLoadMs()).toBeNull();
  });

  it("returns null when the Performance API throws", () => {
    vi.spyOn(performance, "getEntriesByType").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(pageLoadMs()).toBeNull();
  });
});
