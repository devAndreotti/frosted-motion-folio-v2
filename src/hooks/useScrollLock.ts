import { useEffect } from 'react';

/**
 * Locks page scroll while `active` is true — used by full-screen dialogs/modals so the background can't scroll behind them.
 * The lock goes on <html> as well as <body>: `html { overflow-x: hidden }` stops the body's overflow from propagating to the
 * viewport, so locking the body alone left the page scrolling under the dialog (two scrollbars side by side).
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement: root } = document;
    const prevBody = body.style.overflow;
    const prevRoot = root.style.overflow;
    body.style.overflow = 'hidden';
    root.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prevBody;
      root.style.overflow = prevRoot;
    };
  }, [active]);
}
