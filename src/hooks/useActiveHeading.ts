import { useEffect, useState } from 'react';

/**
 * The id of the section being read: the first of `ids` (in page order) that is in the top
 * part of the screen. `key` is `ids.join('|')`, so the observer restarts only when the list changes.
 */
export function useActiveHeading(key: string): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = key ? key.split('|') : [];
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const headings = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;
    const inView = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inView.set(entry.target.id, entry.isIntersecting);
        const first = headings.find((el) => inView.get(el.id));
        if (first) setActive(first.id);
      },
      { rootMargin: '0px 0px -70% 0px' }
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
