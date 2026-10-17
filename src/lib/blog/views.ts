// One read per post per tab: the post page calls recordView(slug) once it opens. The tab remembers the
// slug in sessionStorage (a private window or blocked storage just means it may count again), and the
// request goes out with sendBeacon (fetch with keepalive when the beacon is refused). No cookie, no IP.
const KEY = 'blog-read:';

export const viewUrl = (slug: string) => `${import.meta.env.BASE_URL}api/blog/view/${encodeURIComponent(slug)}`;

function seenInThisTab(slug: string): boolean {
  try {
    return sessionStorage.getItem(KEY + slug) === '1';
  } catch {
    return false;
  }
}

function remember(slug: string): void {
  try {
    sessionStorage.setItem(KEY + slug, '1');
  } catch {
    // no storage: the next open of this post in the tab counts again
  }
}

export function recordView(slug: string): void {
  if (seenInThisTab(slug)) return;
  remember(slug);
  const url = viewUrl(slug);
  try {
    if (navigator.sendBeacon?.(url)) return;
  } catch {
    // no beacon here: the fetch below does it
  }
  fetch(url, { method: 'POST', keepalive: true }).catch(() => undefined);
}
