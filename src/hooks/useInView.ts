import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether `ref` is on (or within `margin` of) the screen. Used to stop
 * decorative motion -- the stack ticker, the card shuffle -- while it's
 * scrolled away, so it doesn't keep the main thread busy for nothing.
 * Assumes visible where IntersectionObserver doesn't exist (tests, old browsers).
 */
export function useInView(ref: RefObject<Element>, margin = '100px'): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);

  return inView;
}
