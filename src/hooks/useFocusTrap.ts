import { useEffect, type RefObject } from 'react';
import { useEscapeKey } from './useEscapeKey';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Standard modal focus behavior: moves focus into the dialog on open, keeps
 * Tab/Shift+Tab cycling within it, closes on Escape, and restores focus to
 * whatever triggered it on close -- without this, Tab silently escapes to
 * the page content sitting behind the overlay.
 */
export function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement>, onClose: () => void) {
  useEscapeKey(active, onClose);

  useEffect(() => {
    if (!active) return;
    const trigger = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const focusables = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusables?.[0] ?? container)?.focus();

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      // focus that has left the dialog (e.g. a click on the backdrop) comes back in at the nearest end
      if (!container.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('keydown', onKeydown);
      trigger?.focus();
    };
  }, [active, containerRef]);
}
