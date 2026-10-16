import { useEffect, useState } from 'react';
import { HAUNTED_POLL_MS, hauntedActive, systemNow, type TimeSource } from '@/lib/haunted';

function currentSearch(): string {
  try {
    return window.location.search;
  } catch {
    return '';
  }
}

/** True while the haunted mode is on. Checked on mount and every 15 s, so 03:17 is caught while the page is open. */
export function useHaunted(now: TimeSource = systemNow): boolean {
  const [active, setActive] = useState(() => hauntedActive(currentSearch(), now));

  useEffect(() => {
    const check = () => setActive(hauntedActive(currentSearch(), now));
    check();
    const timer = setInterval(check, HAUNTED_POLL_MS);
    return () => clearInterval(timer);
  }, [now]);

  return active;
}
