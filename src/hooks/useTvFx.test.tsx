import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { useTvFx, type TvFxMode } from "./useTvFx";

const Probe = ({ mode, active }: { mode: TvFxMode; active: boolean }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useTvFx(ref, mode, active);
  return <canvas ref={ref} width={8} height={6} />;
};

const fakeContext = () => ({
  createImageData: vi.fn((w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })),
  putImageData: vi.fn(),
  clearRect: vi.fn(),
});

describe("useTvFx", () => {
  let ctx: ReturnType<typeof fakeContext>;
  beforeEach(() => {
    vi.useFakeTimers();
    ctx = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16) as unknown as number);
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  });
  afterEach(() => {
    cleanup(); // unmount while the fake frame timers are still the ones installed
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("draws opaque static on the snow channel and clears the canvas when it stops", () => {
    const { unmount } = render(<Probe mode="snow" active />);
    vi.advanceTimersByTime(200);
    expect(ctx.putImageData).toHaveBeenCalled();
    const frame = ctx.putImageData.mock.calls[0][0] as { data: Uint8ClampedArray };
    expect(frame.data[3]).toBe(255);
    unmount();
    expect(ctx.clearRect).toHaveBeenCalled();
  });

  it("draws a nearly transparent grain on the picture channels", () => {
    render(<Probe mode="grain" active />);
    vi.advanceTimersByTime(300);
    const frame = ctx.putImageData.mock.calls[0][0] as { data: Uint8ClampedArray };
    expect(frame.data[3]).toBeLessThan(30);
  });

  it("does nothing while the TV is off", () => {
    render(<Probe mode="snow" active={false} />);
    vi.advanceTimersByTime(500);
    expect(ctx.putImageData).not.toHaveBeenCalled();
  });
});
