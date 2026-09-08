import { useEffect } from 'react';

/**
 * Lets a plain vertical mouse-wheel pan a horizontally-scrollable container —
 * consumed only while the rail can still move in that direction, handed back
 * to normal vertical page scroll once it hits the relevant edge. Split out of
 * useHorizontalDragScroll so that hook stays focused on pointer drag/inertia.
 */
export function useWheelRedirect(containerRef: React.RefObject<HTMLDivElement | null>, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleNativeWheel = (event: globalThis.WheelEvent): void => {
      if (container.scrollWidth <= container.clientWidth) {
        return;
      }

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (maxScrollLeft <= 1) {
        return;
      }

      const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

      if (dominantDelta === 0) {
        return;
      }

      const edgeThreshold = 1;
      const atStart = container.scrollLeft <= edgeThreshold;
      const atEnd = container.scrollLeft >= maxScrollLeft - edgeThreshold;
      const canConsumeHorizontally = (dominantDelta < 0 && !atStart) || (dominantDelta > 0 && !atEnd);

      if (!canConsumeHorizontally) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      container.scrollLeft = Math.max(0, Math.min(maxScrollLeft, container.scrollLeft + dominantDelta));
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [containerRef, enabled]);
}
