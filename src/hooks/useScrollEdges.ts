import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ScrollEdges {
  /** Content hidden before the visible part (the row or column was scrolled). */
  start: boolean;
  /** Content hidden after it (it overflows and isn't at its end). */
  end: boolean;
}

const scrolls = (overflow: string) => /auto|scroll/.test(overflow);

/**
 * Which ends of a scroller still hide content, so a fade is drawn only where there is more to
 * scroll to -- a row that fits the screen shows every item at full strength. Follows whichever
 * axis the element scrolls on (sideways when overflow-x scrolls, else down), so one list can
 * scroll down on desktop and sideways on a phone. Pass `external` to share a ref another hook owns.
 */
export function useScrollEdges<T extends HTMLElement>(external?: RefObject<T | null>) {
  const own = useRef<T>(null);
  const ref = external ?? own;
  const [edges, setEdges] = useState<ScrollEdges>({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // A row that wraps instead of scrolling (wide screens) still reports a few px of overflow
      // from the chips' enlarged tap areas -- that's not hidden content.
      const style = getComputedStyle(el);
      let pos = 0;
      let max = 0;
      if (scrolls(style.overflowX)) {
        pos = el.scrollLeft;
        max = el.scrollWidth - el.clientWidth;
      } else if (scrolls(style.overflowY)) {
        pos = el.scrollTop;
        max = el.scrollHeight - el.clientHeight;
      }
      const start = pos > 1;
      const end = pos < max - 1;
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    // The children too: labels change size without the scroller resizing (fonts loading, PT <-> EN).
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(el);
    for (const child of el.children) ro?.observe(child);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [ref]);

  return { ref, edges };
}

/** The data attributes the `.edge-fade` CSS reads. */
export const edgeFadeProps = ({ start, end }: ScrollEdges) => ({
  'data-fade-start': start || undefined,
  'data-fade-end': end || undefined,
});
