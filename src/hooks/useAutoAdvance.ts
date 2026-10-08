import { useEffect, useRef } from 'react';

export function isAutomated(): boolean {
  try {
    return navigator.webdriver === true;
  } catch {
    return false;
  }
}

/**
 * Calls `step` every `ms` while `enabled`, skipping the ticks that land in a
 * background tab or while `paused` (the hero is off screen). Never runs under
 * browser automation: it would race E2E clicks.
 */
export function useAutoAdvance(step: () => void, ms: number, enabled: boolean, paused: boolean) {
  const stepRef = useRef(step);
  stepRef.current = step;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    if (!enabled || isAutomated()) return;
    const timer = setInterval(() => {
      if (!document.hidden && !pausedRef.current) stepRef.current();
    }, ms);
    return () => clearInterval(timer);
  }, [enabled, ms]);

  return enabled && !paused && !isAutomated();
}
