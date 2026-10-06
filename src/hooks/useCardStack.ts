import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { moveKind, reorderStack, stackTransform, type StackMove } from '@/lib/cardStack';

/** Matches the flight keyframes in index.css (plus a small buffer). */
export const FLY_MS = 1100;

export interface StackFlight {
  id: string;
  kind: StackMove;
  /** Transform the card flies from -- its slot before the reorder. */
  from: string;
  /** Bumped on every move so the same card can fly twice in a row (alternating keyframe names restart the animation). */
  n: number;
}

function isAutomated(): boolean {
  try {
    return navigator.webdriver === true;
  } catch {
    return false;
  }
}

/**
 * Order + flight state for the hero card stack. The pile shuffles itself
 * every `autoplayMs` until the visitor touches it (a card or the arrows),
 * then it's theirs. No autoplay under reduced motion, in a background tab,
 * or under browser automation (it would race E2E clicks).
 */
export function useCardStack(ids: string[], autoplayMs = 4200) {
  const reduceMotion = useReducedMotion();
  const [order, setOrder] = useState(ids);
  const [flight, setFlight] = useState<StackFlight | null>(null);
  const [auto, setAuto] = useState(true);
  const orderRef = useRef(order);
  const flightCount = useRef(0);
  const flightTimer = useRef<ReturnType<typeof setTimeout>>();

  useLayoutEffect(() => {
    orderRef.current = order;
  }, [order]);

  const move = useCallback(
    (id: string) => {
      const current = orderRef.current;
      const depth = current.indexOf(id);
      if (depth === -1) return;
      flightCount.current += 1;
      setFlight(reduceMotion ? null : { id, kind: moveKind(current, id), from: stackTransform(depth), n: flightCount.current });
      const next = reorderStack(current, id);
      orderRef.current = next;
      setOrder(next);
      clearTimeout(flightTimer.current);
      flightTimer.current = setTimeout(() => setFlight(null), FLY_MS);
    },
    [reduceMotion]
  );

  const pick = (id: string) => {
    setAuto(false);
    move(id);
  };
  const next = () => {
    setAuto(false);
    move(orderRef.current[0]);
  };
  const prev = () => {
    setAuto(false);
    move(orderRef.current[orderRef.current.length - 1]);
  };

  useEffect(() => {
    if (!auto || reduceMotion || isAutomated()) return;
    const timer = setInterval(() => {
      if (!document.hidden) move(orderRef.current[0]);
    }, autoplayMs);
    return () => clearInterval(timer);
  }, [auto, reduceMotion, autoplayMs, move]);

  useEffect(() => () => clearTimeout(flightTimer.current), []);

  return { order, flight, pick, next, prev };
}
