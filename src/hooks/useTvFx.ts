import { useEffect, type RefObject } from 'react';

export type TvFxMode = 'snow' | 'grain';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/**
 * Draws a tube TV's noise on a small canvas stretched over the screen: real static on the error channel, a fine grain
 * with an occasional tearing line on the picture channels. Only runs while `active` and the tab is open; with reduced
 * motion the static is slow and the grain is a single frame.
 */
export function useTvFx(canvas: RefObject<HTMLCanvasElement>, mode: TvFxMode, active: boolean) {
  useEffect(() => {
    const cv = canvas.current;
    const ctx = active ? cv?.getContext('2d') : null;
    if (!cv || !ctx) return;
    const { width: w, height: h } = cv;
    const img = ctx.createImageData(w, h);
    const slow = prefersReducedMotion();
    let tear = -1;
    let tearUntil = 0;
    let nextTear = performance.now() + 3000;
    let last = 0;
    let raf = 0;

    const snow = (now: number) => {
      const d = img.data;
      const band = (now / 18) % h;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const y = (p / w) | 0;
        let v = Math.random() * 185; // darker than white, so the text on the screen stays readable
        if (Math.abs(y - band) < 5) v = 70 + v * 0.75;
        if (y & 1) v *= 0.82;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };

    const grain = (now: number) => {
      if (now > nextTear) {
        tear = (Math.random() * h) | 0;
        tearUntil = now + 160;
        nextTear = now + 2500 + Math.random() * 5000;
      }
      const d = img.data;
      const torn = now < tearUntil;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const y = (p / w) | 0;
        d[i] = d[i + 1] = d[i + 2] = Math.random() < 0.5 ? 0 : 255;
        d[i + 3] = torn && Math.abs(y - tear) < 2 ? 70 + Math.random() * 90 : Math.random() * 26;
      }
      ctx.putImageData(img, 0, 0);
    };

    const draw = mode === 'snow' ? snow : grain;
    const every = mode === 'snow' ? (slow ? 400 : 45) : 80;
    const frame = (now: number) => {
      raf = 0;
      if (!document.hidden && now - last >= every) {
        last = now;
        draw(now);
      }
      if (!(slow && mode === 'grain' && last > 0)) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
    };
  }, [canvas, mode, active]);
}
