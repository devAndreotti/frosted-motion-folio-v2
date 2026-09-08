import { useEffect } from 'react';

/** Locks page scroll while `active` is true — used by full-screen dialogs/modals so the background can't scroll behind them. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}
