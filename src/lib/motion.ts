// Reusable Framer Motion timing/variant helpers shared across sections.
// Each helper matches an animation shape that was copy-pasted across
// multiple components with only a duration/delay/value tweaked — centralizing
// them keeps the timing consistent and easy to retune from one place.
// One-off animations that only appear once stay inline in their component.

export const VIEWPORT_ONCE = { once: true } as const;

/** Fade + slide-up entrance for content that animates in on scroll (section headings, cards). */
export const fadeInUp = (duration = 0.8, delay = 0) => ({
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT_ONCE,
  transition: { duration, delay },
});

/** Fade + slide-up entrance for content that animates in on mount (e.g. hero content stacked above the fold). */
export const fadeInMount = (delay = 0, y = 20) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: "easeOut" as const, delay },
});

/** Spring "pop" transition for icon buttons that scale + rotate into place. */
export const springPop = (delay = 0, stiffness = 150) => ({
  duration: 0.6,
  type: "spring" as const,
  delay,
  stiffness,
});

/** Slow, looping scale + opacity pulse for decorative glow orbs. */
export const pulseGlow = (duration: number, delay = 0) => ({
  animate: { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] },
  transition: { repeat: Infinity, ease: "easeInOut", duration, delay },
});

/** Looping horizontal drift for large background blur blobs. */
export const drift = (x: number, scaleTo: number, duration: number, delay = 0) => ({
  animate: { x: [0, x, 0], scale: [1, scaleTo, 1] },
  transition: { repeat: Infinity, ease: "easeInOut", duration, delay },
});

/** Slow, looping opacity pulse for the soft gradient wash behind glass-card content. */
export const cardGlowPulse = {
  animate: { opacity: [0.5, 0.8, 0.5] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};
