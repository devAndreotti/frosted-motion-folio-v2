import { useEffect } from 'react';

/**
 * Locks page scroll while `active` is true — used by full-screen dialogs/modals so the background can't scroll behind them.
 * Only <html> gets the lock. Setting `overflow: hidden` on <body> makes the body its own scroll container, so `position: sticky`
 * elements (the "sobre mim" card) stick to the body instead of the viewport and jump back to their start position while the
 * dialog is open. Locking the root alone stops the viewport from scrolling and keeps sticky working.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const prevRoot = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prevRoot;
    };
  }, [active]);
}
