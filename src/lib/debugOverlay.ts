/**
 * Debug mode state. It lives on <html> as a class so the CSS can outline every section
 * without React re-rendering the page; DEBUG_EVENT tells the panel when it flips.
 */
export const DEBUG_CLASS = 'egg-debug';
export const DEBUG_EVENT = 'egg:debug-change';

export function isDebugOn(): boolean {
  return document.documentElement.classList.contains(DEBUG_CLASS);
}

export function setDebugOn(on: boolean): void {
  document.documentElement.classList.toggle(DEBUG_CLASS, on);
  window.dispatchEvent(new Event(DEBUG_EVENT));
}

export function toggleDebug(): void {
  setDebugOn(!isDebugOn());
}

/** Milliseconds from navigation start to the load event, from the Navigation Timing API; null while the page is still loading or unsupported. */
export function pageLoadMs(): number | null {
  try {
    const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entry && entry.loadEventEnd > 0) return Math.round(entry.loadEventEnd);
  } catch {
    // performance blocked or missing: show "n/a"
  }
  return null;
}
