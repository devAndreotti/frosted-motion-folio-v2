import { DragEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { useWheelRedirect } from './useWheelRedirect';

const DEFAULT_DRAG_SCROLL_FACTOR = 0.5;
const INERTIA_MULTIPLIER = 2;
const INERTIA_DECAY = 0.94;
const MAX_INERTIA_VELOCITY = 1.1;

interface DragScrollHandlers {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onClickCapture: (event: ReactMouseEvent<HTMLDivElement>) => void;
}

/**
 * Click-and-drag horizontal scroll (with release inertia) for a container
 * whose content overflows its width. Ported from Scriply's card-carousel
 * interaction (see the horizontal-momentum-scroller skill) so this project's
 * horizontal rails (stack marquee, activity feed) get the same drag physics.
 *
 * `redirectWheel` (default true) also lets a plain vertical mouse-wheel pan
 * the container horizontally — right for a rail with no vertical content of
 * its own. Pass false when something else needs the wheel (an infinite
 * ticker that should keep letting the page scroll normally under the mouse).
 *
 * `isInteracting()` lets a caller that ALSO writes to `scrollLeft` on its own
 * (e.g. an auto-scrolling ticker) check whether a drag or its release
 * inertia is currently in control, so the two don't fight over the same
 * property.
 */
export function useHorizontalDragScroll(options?: { redirectWheel?: boolean; dragFactor?: number }): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  handlers: DragScrollHandlers;
  isInteracting: () => boolean;
} {
  const redirectWheel = options?.redirectWheel ?? true;
  const dragScrollFactor = options?.dragFactor ?? DEFAULT_DRAG_SCROLL_FACTOR;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const dragStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    startScrollLeft: number;
    dragging: boolean;
    moved: boolean;
    /** Undecided until the pointer has moved enough to tell a horizontal drag
     * apart from a vertical scroll gesture (e.g. touch/trackpad panning). */
    intent: 'pending' | 'horizontal' | 'vertical';
    lastX: number;
    lastTimestamp: number;
    velocity: number;
    samples: Array<{ x: number; time: number }>;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    dragging: false,
    moved: false,
    intent: 'pending',
    lastX: 0,
    lastTimestamp: 0,
    velocity: 0,
    samples: [],
  });
  const [isDragging, setIsDragging] = useState(false);

  const stopInertia = (): void => {
    if (inertiaFrameRef.current !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  };

  const startInertia = (): void => {
    const container = containerRef.current;
    const initialVelocity = Math.max(-MAX_INERTIA_VELOCITY, Math.min(MAX_INERTIA_VELOCITY, dragStateRef.current.velocity));

    if (!container || typeof window === 'undefined' || Math.abs(initialVelocity) < 0.08) {
      return;
    }

    stopInertia();

    let velocity = initialVelocity * INERTIA_MULTIPLIER;
    let previousTime = performance.now();

    const tick = (now: number): void => {
      if (!containerRef.current) {
        inertiaFrameRef.current = null;
        return;
      }

      const deltaTime = Math.max(1, now - previousTime);
      previousTime = now;
      containerRef.current.scrollLeft += velocity * deltaTime;
      velocity *= INERTIA_DECAY;

      if (Math.abs(velocity) < 0.015) {
        inertiaFrameRef.current = null;
        return;
      }

      inertiaFrameRef.current = window.requestAnimationFrame(tick);
    };

    inertiaFrameRef.current = window.requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      stopInertia();
    };
  }, []);

  useWheelRedirect(containerRef, redirectWheel);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const target = event.target;
    if (target instanceof Element && target.closest('button, [role="button"], input, textarea, select, a, label')) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    stopInertia();
    suppressClickRef.current = false;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: container.scrollLeft,
      dragging: true,
      moved: false,
      intent: 'pending',
      lastX: event.clientX,
      lastTimestamp: performance.now(),
      velocity: 0,
      samples: [{ x: event.clientX, time: performance.now() }],
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const container = containerRef.current;
    const dragState = dragStateRef.current;

    if (!container || !dragState.dragging) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    // Defer claiming the gesture until direction is clear — an eager
    // preventDefault()/setPointerCapture() here would swallow vertical
    // touch/trackpad scroll attempts before we know they aren't horizontal.
    if (dragState.intent === 'pending') {
      if (Math.abs(deltaX) < 4 && Math.abs(deltaY) < 4) {
        return;
      }

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        dragState.intent = 'vertical';
        dragState.dragging = false;
        return;
      }

      dragState.intent = 'horizontal';
      container.setPointerCapture(event.pointerId);
      document.body.style.userSelect = 'none';
      setIsDragging(true);
    }

    if (dragState.intent !== 'horizontal') {
      return;
    }

    const now = performance.now();
    const deltaSinceLast = event.clientX - dragState.lastX;
    const deltaTime = Math.max(1, now - dragState.lastTimestamp);

    dragState.samples.push({ x: event.clientX, time: now });
    dragState.samples = dragState.samples.filter((sample) => now - sample.time <= 120);
    if (dragState.samples.length >= 2) {
      const first = dragState.samples[0];
      const last = dragState.samples[dragState.samples.length - 1];
      const sampleDeltaTime = Math.max(1, last.time - first.time);
      dragState.velocity = -(last.x - first.x) / sampleDeltaTime;
    } else {
      dragState.velocity = -deltaSinceLast / deltaTime;
    }
    dragState.velocity = Math.max(-MAX_INERTIA_VELOCITY, Math.min(MAX_INERTIA_VELOCITY, dragState.velocity));
    dragState.lastX = event.clientX;
    dragState.lastTimestamp = now;
    dragState.moved = true;
    suppressClickRef.current = true;
    event.preventDefault();

    container.scrollLeft = dragState.startScrollLeft - deltaX * dragScrollFactor;
  };

  const finishDrag = (): void => {
    if (dragStateRef.current.dragging && dragStateRef.current.moved) {
      startInertia();
    }

    dragStateRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      startScrollLeft: 0,
      dragging: false,
      moved: false,
      intent: 'pending',
      lastX: 0,
      lastTimestamp: 0,
      velocity: 0,
      samples: [],
    };
    setIsDragging(false);
    document.body.style.userSelect = '';

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    } else {
      suppressClickRef.current = false;
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const container = containerRef.current;
    if (container && dragStateRef.current.pointerId !== null) {
      try {
        container.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore release failures in intermediate browser/DOM states.
      }
    }
    finishDrag();
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return {
    containerRef,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: finishDrag,
      onDragStart: (event: DragEvent<HTMLDivElement>) => event.preventDefault(),
      onClickCapture: handleClickCapture,
    },
    isInteracting: () => dragStateRef.current.dragging || inertiaFrameRef.current !== null,
  };
}
