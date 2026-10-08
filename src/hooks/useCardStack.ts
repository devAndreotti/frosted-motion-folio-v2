import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { moveKind, reorderStack, stackTransform, type StackMove } from '@/lib/cardStack';
import { useAutoAdvance } from './useAutoAdvance';

/** Matches the flight keyframes in hero-cards.css (plus a small buffer). */
export const FLY_MS = 1100;
/** One turn of the deck; the progress bar under it fills over the same time. */
export const DECK_STEP_MS = 3600;

export interface StackFlight {
  id: string;
  kind: StackMove;
  /** Transform the card flies from -- its slot before the reorder. */
  from: string;
  /** Bumped on every move so the same card can fly twice in a row (alternating keyframe names restart the animation). */
  n: number;
}

/**
 * Order + flight state for the hero card deck (narrow screens). The pile
 * shuffles itself every `autoplayMs` until the visitor touches it (a card or
 * the arrows), then it's theirs. No autoplay under reduced motion, in a
 * background tab, while `paused` (the deck is off screen), or under browser
 * automation (it would race E2E clicks).
 */
export function useCardStack(ids: string[], autoplayMs = DECK_STEP_MS, paused = false) {
  const reduceMotion = useReducedMotion();
  const [order, setOrder] = useState(ids);
  const [flight, setFlight] = useState<StackFlight | null>(null);
  const [moves, setMoves] = useState(0);
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
      setMoves(flightCount.current);
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

  const playing = useAutoAdvance(() => move(orderRef.current[0]), autoplayMs, auto && !reduceMotion, paused);

  useEffect(() => () => clearTimeout(flightTimer.current), []);

  return { order, flight, moves, playing, pick, next, prev };
}
