import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useInView } from "./useInView";

const Probe = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return <div ref={ref}>{inView ? "visible" : "hidden"}</div>;
};

describe("useInView", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("assumes visible where IntersectionObserver is missing", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Probe />);
    expect(screen.getByText("visible")).toBeTruthy();
  });

  it("follows the observer as the element leaves and re-enters the screen", () => {
    let callback: (entries: { isIntersecting: boolean }[]) => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: typeof callback) {
          callback = cb;
        }
        observe() {}
        disconnect = disconnect;
      }
    );
    const { unmount } = render(<Probe />);
    act(() => callback([{ isIntersecting: false }]));
    expect(screen.getByText("hidden")).toBeTruthy();
    act(() => callback([{ isIntersecting: true }]));
    expect(screen.getByText("visible")).toBeTruthy();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
