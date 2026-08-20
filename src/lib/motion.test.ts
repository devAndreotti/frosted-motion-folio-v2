import { describe, expect, it } from "vitest";
import { fadeInUp, fadeInMount, springPop, pulseGlow, drift, cardGlowPulse } from "./motion";

describe("motion helpers", () => {
  it("fadeInUp applies defaults and overrides", () => {
    expect(fadeInUp().transition).toEqual({ duration: 0.8, delay: 0 });
    expect(fadeInUp(0.5, 0.2).transition).toEqual({ duration: 0.5, delay: 0.2 });
  });

  it("fadeInMount applies defaults and overrides", () => {
    expect(fadeInMount().initial).toEqual({ opacity: 0, y: 20 });
    expect(fadeInMount(0.3, 40).initial).toEqual({ opacity: 0, y: 40 });
  });

  it("springPop applies defaults and overrides", () => {
    expect(springPop()).toMatchObject({ delay: 0, stiffness: 150 });
    expect(springPop(0.1, 300)).toMatchObject({ delay: 0.1, stiffness: 300 });
  });

  it("pulseGlow carries duration and delay into the transition", () => {
    expect(pulseGlow(6, 2).transition).toMatchObject({ duration: 6, delay: 2 });
  });

  it("drift carries x/scale into the animate keyframes", () => {
    expect(drift(100, 1.2, 30, 5).animate).toEqual({ x: [0, 100, 0], scale: [1, 1.2, 1] });
  });

  it("cardGlowPulse is a fixed pulse shape", () => {
    expect(cardGlowPulse.transition.duration).toBe(4);
  });
});
