import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Marquee from "./Marquee";

function readX(el: HTMLElement): number {
  return el.scrollLeft;
}

describe("Marquee", () => {
  // jsdom never lays out real boxes, so scrollWidth is always 0 — the track
  // needs a non-zero width to have anything to animate.
  let originalDescriptor: PropertyDescriptor | undefined;

  beforeAll(() => {
    originalDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth");
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 1200 });
  });

  afterAll(() => {
    if (originalDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollWidth", originalDescriptor);
  });

  it("boosts speed without jumping — position right after the click is continuous with where it already was", async () => {
    render(<Marquee />);
    const track = screen.getAllByTestId("marquee-track")[0];

    await waitFor(() => expect(readX(track)).not.toBe(0));

    const beforeBoost1 = readX(track);
    await new Promise((r) => setTimeout(r, 200));
    const beforeBoost2 = readX(track);
    const baseSpeed = Math.abs(beforeBoost2 - beforeBoost1);
    expect(baseSpeed).toBeGreaterThan(0);

    const clickTime = performance.now();
    fireEvent.click(screen.getByText("clique pra acelerar"));

    // A CSS animation-duration swap would snap the track to a different
    // position here; the JS-driven offset must instead pick up from exactly
    // where it already was. The bound is tied to real elapsed time (not a
    // fixed ms budget) because a busy test runner can make a requested 20ms
    // setTimeout fire much later — even a slow tick is fine as long as the
    // movement in that window is consistent with SOME continuous speed, capped
    // at the fastest the track can ever go (fully boosted).
    await new Promise((r) => setTimeout(r, 20));
    const justAfterClick = readX(track);
    const elapsedS = (performance.now() - clickTime) / 1000;
    const maxBoostedSpeed = 600 / 7; // half-width (scrollWidth/2 = 1200/2) / BOOST_DURATION_S
    // Generous multiplier + constant: real elapsed time already absorbs a slow
    // test runner, this only needs extra room for measurement/rounding jitter
    // around the boundary — a real jump bug overshoots this by 10x or more.
    expect(Math.abs(justAfterClick - beforeBoost2)).toBeLessThan(maxBoostedSpeed * elapsedS * 1.5 + 15);

    const boosted1 = readX(track);
    await new Promise((r) => setTimeout(r, 200));
    const boosted2 = readX(track);
    const boostedSpeed = Math.abs(boosted2 - boosted1);

    expect(boostedSpeed).toBeGreaterThan(baseSpeed * 2);
  });
});
