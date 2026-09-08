import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useHorizontalDragScroll } from "./useHorizontalDragScroll";

function Harness() {
  const { containerRef, handlers } = useHorizontalDragScroll();
  return (
    <div ref={containerRef} data-testid="rail" {...handlers} style={{ overflowX: "auto", width: 300 }}>
      <button type="button" data-testid="card-btn" onClick={() => window.dispatchEvent(new CustomEvent("card-clicked"))}>
        Card
      </button>
      <div style={{ width: 2000 }} />
    </div>
  );
}

describe("useHorizontalDragScroll", () => {
  beforeEach(() => {
    // jsdom doesn't implement pointer capture at all.
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { value: vi.fn(), configurable: true });
    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { value: vi.fn(), configurable: true });
  });

  it("dragging horizontally moves the rail's own scrollLeft", () => {
    render(<Harness />);
    const rail = screen.getByTestId("rail");

    fireEvent.pointerDown(rail, { pointerId: 1, clientX: 300, clientY: 100, button: 0 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 260, clientY: 100 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 220, clientY: 100 });
    fireEvent.pointerUp(rail, { pointerId: 1, clientX: 220, clientY: 100 });

    // Dragged left (pointer moved to smaller clientX) — the rail scrolls forward.
    expect(rail.scrollLeft).toBeGreaterThan(0);
  });

  it("a plain click without dragging still activates a child button", () => {
    const onClicked = vi.fn();
    window.addEventListener("card-clicked", onClicked);
    render(<Harness />);

    fireEvent.click(screen.getByTestId("card-btn"));

    expect(onClicked).toHaveBeenCalledTimes(1);
    window.removeEventListener("card-clicked", onClicked);
  });

  it("dragging across a child button suppresses its click on release", () => {
    const onClicked = vi.fn();
    window.addEventListener("card-clicked", onClicked);
    render(<Harness />);
    const rail = screen.getByTestId("rail");

    fireEvent.pointerDown(rail, { pointerId: 2, clientX: 300, clientY: 100, button: 0 });
    fireEvent.pointerMove(rail, { pointerId: 2, clientX: 260, clientY: 100 });
    fireEvent.pointerMove(rail, { pointerId: 2, clientX: 200, clientY: 100 });
    fireEvent.pointerUp(rail, { pointerId: 2, clientX: 200, clientY: 100 });
    // The browser fires a follow-up click on whatever is under the pointer after a drag release.
    fireEvent.click(screen.getByTestId("card-btn"));

    expect(onClicked).not.toHaveBeenCalled();
    window.removeEventListener("card-clicked", onClicked);
  });

  it("does not start a drag when the press starts on an interactive child", () => {
    render(<Harness />);
    const rail = screen.getByTestId("rail");
    const btn = screen.getByTestId("card-btn");

    fireEvent.pointerDown(btn, { pointerId: 3, clientX: 300, clientY: 100, button: 0 });
    fireEvent.pointerMove(rail, { pointerId: 3, clientX: 200, clientY: 100 });
    fireEvent.pointerUp(rail, { pointerId: 3, clientX: 200, clientY: 100 });

    expect(rail.scrollLeft).toBe(0);
  });

  it("ignores a non-primary mouse button (e.g. right-click)", () => {
    render(<Harness />);
    const rail = screen.getByTestId("rail");

    fireEvent.pointerDown(rail, { pointerId: 4, clientX: 300, clientY: 100, button: 2, pointerType: "mouse" });
    fireEvent.pointerMove(rail, { pointerId: 4, clientX: 200, clientY: 100 });
    fireEvent.pointerUp(rail, { pointerId: 4, clientX: 200, clientY: 100 });

    expect(rail.scrollLeft).toBe(0);
  });

  it("treats a predominantly vertical gesture as a scroll, not a drag", () => {
    render(<Harness />);
    const rail = screen.getByTestId("rail");

    fireEvent.pointerDown(rail, { pointerId: 5, clientX: 300, clientY: 100, button: 0 });
    // Mostly vertical movement — should be released back to normal page scroll, not panned.
    fireEvent.pointerMove(rail, { pointerId: 5, clientX: 290, clientY: 160 });
    fireEvent.pointerMove(rail, { pointerId: 5, clientX: 280, clientY: 220 });
    fireEvent.pointerUp(rail, { pointerId: 5, clientX: 280, clientY: 220 });

    expect(rail.scrollLeft).toBe(0);
  });
});
