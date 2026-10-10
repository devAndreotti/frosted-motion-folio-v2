import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { edgeFadeProps, useScrollEdges } from "./useScrollEdges";

const Probe = () => {
  const { ref, edges } = useScrollEdges<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="row" style={{ overflowX: "auto" }} {...edgeFadeProps(edges)}>
      <span>a</span>
      <span>b</span>
    </div>
  );
};

/** jsdom has no layout: give the row the sizes a browser would measure. */
const size = (el: HTMLElement, scrollWidth: number, clientWidth: number) => {
  Object.defineProperty(el, "scrollWidth", { value: scrollWidth, configurable: true });
  Object.defineProperty(el, "clientWidth", { value: clientWidth, configurable: true });
};

describe("useScrollEdges", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("fades nothing when the row fits", () => {
    const row = render(<Probe />).getByTestId("row");
    expect(row.hasAttribute("data-fade-start")).toBe(false);
    expect(row.hasAttribute("data-fade-end")).toBe(false);
  });

  it("fades the end while more is hidden there, and the start once scrolled to the end", () => {
    let resize: () => void = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: () => void) {
          resize = cb;
        }
        observe = observe;
        disconnect = disconnect;
      }
    );
    const { unmount } = render(<Probe />);
    const row = screen.getByTestId("row");
    // the row and each of its children are watched
    expect(observe).toHaveBeenCalledTimes(3);

    size(row, 500, 300);
    act(() => resize());
    expect(row.getAttribute("data-fade-end")).toBe("true");
    expect(row.hasAttribute("data-fade-start")).toBe(false);

    row.scrollLeft = 200;
    fireEvent.scroll(row);
    expect(row.getAttribute("data-fade-start")).toBe("true");
    expect(row.hasAttribute("data-fade-end")).toBe(false);

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it("ignores overflow on a row that wraps instead of scrolling", () => {
    const Wrapping = () => {
      const { ref, edges } = useScrollEdges<HTMLDivElement>();
      return <div ref={ref} data-testid="wrap" {...edgeFadeProps(edges)} />;
    };
    const row = render(<Wrapping />).getByTestId("wrap");
    size(row, 812, 808);
    fireEvent.scroll(row);
    expect(row.hasAttribute("data-fade-end")).toBe(false);
  });
});
