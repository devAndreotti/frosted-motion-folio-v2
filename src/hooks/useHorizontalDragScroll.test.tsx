import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useHorizontalDragScroll } from "./useHorizontalDragScroll";

function Harness({ options }: { options?: Parameters<typeof useHorizontalDragScroll>[0] }) {
  const { containerRef, handlers } = useHorizontalDragScroll(options);
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

  it("with dragFactor 1 and no inertia, the rail follows the pointer and stops on release", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    render(<Harness options={{ dragFactor: 1, inertia: false }} />);
    const rail = screen.getByTestId("rail");

    fireEvent.pointerDown(rail, { pointerId: 6, clientX: 300, clientY: 100, button: 0 });
    fireEvent.pointerMove(rail, { pointerId: 6, clientX: 260, clientY: 100 });
    fireEvent.pointerMove(rail, { pointerId: 6, clientX: 220, clientY: 100 });
    fireEvent.pointerUp(rail, { pointerId: 6, clientX: 220, clientY: 100 });

    expect(rail.scrollLeft).toBe(80);
    expect(raf).not.toHaveBeenCalled();
    raf.mockRestore();
  });
  it("with inertia, releasing a fast drag keeps the rail moving on the next frames, then stops", () => {
    const frames: Array<(time: number) => void> = [];
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    const caf = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    render(<Harness options={{ dragFactor: 1 }} />);
    const rail = screen.getByTestId("rail");

    fireEvent.pointerDown(rail, { pointerId: 7, clientX: 300, clientY: 100, button: 0 });
    fireEvent.pointerMove(rail, { pointerId: 7, clientX: 250, clientY: 100 });
    fireEvent.pointerMove(rail, { pointerId: 7, clientX: 200, clientY: 100 });
    fireEvent.pointerUp(rail, { pointerId: 7, clientX: 200, clientY: 100 });
    const atRelease = rail.scrollLeft;
    expect(atRelease).toBe(100);
    expect(frames).toHaveLength(1);

    // Each frame moves the rail further in the drag direction, and the speed drops.
    let now = performance.now();
    const steps: number[] = [];
    for (let i = 0; i < 3 && frames.length; i++) {
      const next = frames.shift() as (time: number) => void;
      now += 16;
      next(now);
      steps.push(rail.scrollLeft);
    }
    expect(steps[0]).toBeGreaterThan(atRelease);
    expect(steps[1] - steps[0]).toBeLessThan(steps[0] - atRelease);
    expect(steps[2]).toBeGreaterThan(steps[1]);

    raf.mockRestore();
    caf.mockRestore();
  });
  it("a pointer that stopped well before release gives no inertia", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    let clock = 1000;
    const now = vi.spyOn(performance, "now").mockImplementation(() => clock);
    render(<Harness options={{ dragFactor: 1 }} />);
    const rail = screen.getByTestId("rail");

    fireEvent.pointerDown(rail, { pointerId: 8, clientX: 300, clientY: 100, button: 0 });
    clock += 16;
    fireEvent.pointerMove(rail, { pointerId: 8, clientX: 250, clientY: 100 });
    clock += 16;
    fireEvent.pointerMove(rail, { pointerId: 8, clientX: 200, clientY: 100 });
    clock += 500;
    fireEvent.pointerUp(rail, { pointerId: 8, clientX: 200, clientY: 100 });

    expect(raf).not.toHaveBeenCalled();
    expect(rail.scrollLeft).toBe(100);
    now.mockRestore();
    raf.mockRestore();
  });
});
