import { useEffect, useRef, useState } from 'react';

export interface ScrollEdges {
  /** Content hidden past the left edge (the row was scrolled). */
  start: boolean;
  /** Content hidden past the right edge (the row overflows and isn't at its end). */
  end: boolean;
}

/**
 * Which ends of a horizontal scroller still hide content, so a fade is drawn only where there
 * is more to scroll to -- a row that fits the screen shows every item at full strength.
 */
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState<ScrollEdges>({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // A row that wraps instead of scrolling (wide screens) still reports a few px of overflow
      // from the chips' enlarged tap areas -- that's not hidden content.
      const scrolls = /auto|scroll/.test(getComputedStyle(el).overflowX);
      const max = el.scrollWidth - el.clientWidth;
      const start = scrolls && el.scrollLeft > 1;
      const end = scrolls && el.scrollLeft < max - 1;
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    // The children too: labels change width without the row resizing (fonts loading, PT <-> EN).
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(el);
    for (const child of el.children) ro?.observe(child);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, []);

  return { ref, edges };
}

/** The data attributes the `.edge-fade` CSS reads. */
export const edgeFadeProps = ({ start, end }: ScrollEdges) => ({
  'data-fade-start': start || undefined,
  'data-fade-end': end || undefined,
});
