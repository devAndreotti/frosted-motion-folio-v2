import { useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { arcOffset } from '@/lib/cardFan';
import { useAutoAdvance } from './useAutoAdvance';

/** One turn of the fan. */
export const FAN_STEP_MS = 3200;

export interface FanTurn {
  /** Card in the centre. */
  active: number;
  /** Card that was in the centre before the last turn. */
  from: number;
  /** Which way the fan last turned (the arriving card's image pans the same way). */
  dir: 1 | -1;
  /** Bumped on every turn; its parity alternates the keyframe names so back-to-back turns restart. */
  n: number;
}

/**
 * Turn state for the hero card fan (wide screens). Turns itself every
 * `autoplayMs` until the visitor touches it, then it's theirs: a side card
 * comes to the centre, the centre card (or the right arrow) moves on to the
 * next one. Same autoplay rules as the deck (see useAutoAdvance).
 */
export function useCardFan(count: number, autoplayMs = FAN_STEP_MS, paused = false) {
  const reduceMotion = useReducedMotion();
  const [turn, setTurn] = useState<FanTurn>({ active: 0, from: 0, dir: 1, n: 0 });
  const [auto, setAuto] = useState(true);

  const goTo = useCallback((target: (cur: FanTurn) => number, dir: 1 | -1) => {
    setTurn((cur) => {
      const active = target(cur);
      return active === cur.active ? cur : { active, from: cur.active, dir, n: cur.n + 1 };
    });
  }, []);
  const step = useCallback((delta: 1 | -1) => goTo((cur) => (cur.active + delta + count) % count, delta), [goTo, count]);

  const playing = useAutoAdvance(() => step(1), autoplayMs, auto && !reduceMotion, paused);

  const pick = (i: number) => {
    setAuto(false);
    const off = arcOffset(i, turn.active, count);
    if (off === 0) step(1);
    else goTo(() => i, off > 0 ? 1 : -1);
  };
  const next = () => {
    setAuto(false);
    step(1);
  };
  const prev = () => {
    setAuto(false);
    step(-1);
  };

  return { ...turn, playing, pick, next, prev };
}
