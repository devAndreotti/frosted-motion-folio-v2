import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
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

  it("follows a column that scrolls down instead of sideways", () => {
    const Column = () => {
      const { ref, edges } = useScrollEdges<HTMLDivElement>();
      return <div ref={ref} data-testid="col" style={{ overflowX: "hidden", overflowY: "auto" }} {...edgeFadeProps(edges)} />;
    };
    const col = render(<Column />).getByTestId("col");
    Object.defineProperty(col, "scrollHeight", { value: 700, configurable: true });
    Object.defineProperty(col, "clientHeight", { value: 460, configurable: true });
    fireEvent.scroll(col);
    expect(col.getAttribute("data-fade-end")).toBe("true");
    col.scrollTop = 240;
    fireEvent.scroll(col);
    expect(col.getAttribute("data-fade-start")).toBe("true");
    expect(col.hasAttribute("data-fade-end")).toBe(false);
  });

  it("uses a ref another hook owns", () => {
    const Shared = () => {
      const own = useRef<HTMLDivElement>(null);
      const { ref, edges } = useScrollEdges(own);
      return <div ref={own} data-testid="shared" data-same={String(ref === own)} style={{ overflowX: "auto" }} {...edgeFadeProps(edges)} />;
    };
    const row = render(<Shared />).getByTestId("shared");
    expect(row.dataset.same).toBe("true");
    size(row, 500, 300);
    fireEvent.scroll(row);
    expect(row.getAttribute("data-fade-end")).toBe("true");
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
