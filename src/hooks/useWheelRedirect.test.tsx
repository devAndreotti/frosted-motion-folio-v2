import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useWheelRedirect } from "./useWheelRedirect";

function Harness({ enabled = true }: { enabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useWheelRedirect(containerRef, enabled);
  return <div ref={containerRef} data-testid="rail" style={{ overflowX: "auto" }} />;
}

function mockScrollDims(el: HTMLElement, { scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number }) {
  Object.defineProperty(el, "scrollWidth", { value: scrollWidth, configurable: true });
  Object.defineProperty(el, "clientWidth", { value: clientWidth, configurable: true });
}

describe("useWheelRedirect", () => {
  it("consumes a vertical wheel as horizontal scroll while there is still room", () => {
    render(<Harness />);
    const rail = screen.getByTestId("rail") as HTMLDivElement;
    mockScrollDims(rail, { scrollWidth: 1000, clientWidth: 300 });
    rail.scrollLeft = 100;

    const event = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    rail.dispatchEvent(event);

    expect(rail.scrollLeft).toBe(150);
    expect(event.defaultPrevented).toBe(true);
  });

  it("hands the wheel back to vertical page scroll once the end edge is reached", () => {
    render(<Harness />);
    const rail = screen.getByTestId("rail") as HTMLDivElement;
    mockScrollDims(rail, { scrollWidth: 1000, clientWidth: 300 });
    rail.scrollLeft = 700; // maxScrollLeft = 700 — already at the end

    const event = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    rail.dispatchEvent(event);

    expect(rail.scrollLeft).toBe(700);
    expect(event.defaultPrevented).toBe(false);
  });

  it("hands the wheel back at the start edge too, for the opposite direction", () => {
    render(<Harness />);
    const rail = screen.getByTestId("rail") as HTMLDivElement;
    mockScrollDims(rail, { scrollWidth: 1000, clientWidth: 300 });
    rail.scrollLeft = 0;

    const event = new WheelEvent("wheel", { deltaY: -50, bubbles: true, cancelable: true });
    rail.dispatchEvent(event);

    expect(rail.scrollLeft).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does nothing when there is no horizontal overflow to scroll into", () => {
    render(<Harness />);
    const rail = screen.getByTestId("rail") as HTMLDivElement;
    mockScrollDims(rail, { scrollWidth: 300, clientWidth: 300 });

    const event = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    rail.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("does nothing when disabled", () => {
    render(<Harness enabled={false} />);
    const rail = screen.getByTestId("rail") as HTMLDivElement;
    mockScrollDims(rail, { scrollWidth: 1000, clientWidth: 300 });
    rail.scrollLeft = 100;

    const event = new WheelEvent("wheel", { deltaY: 50, bubbles: true, cancelable: true });
    rail.dispatchEvent(event);

    expect(rail.scrollLeft).toBe(100);
  });
});
