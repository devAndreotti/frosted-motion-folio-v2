declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}

/**
 * Fire-and-forget click telemetry, for whichever host serves the site:
 * - Cloudflare (devandreotti.com): the Worker answers the beacon with 204 and
 *   Umami records the click, when the build loaded it (loadUmami);
 * - GitHub Pages: no such route, the beacon 404s silently.
 * sendBeacon never surfaces errors to JS, so no environment check is needed.
 */
export function track(event: string): void {
  try {
    navigator.sendBeacon?.(`./e/${event}`);
    window.umami?.track(event);
  } catch {
    // telemetry must never break the UI
  }
}

/** Adds the Umami tracker (cookieless) when the build is given both its script URL and the site's id. */
export function loadUmami(src: string | undefined, websiteId: string | undefined): void {
  if (!src || !websiteId) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = src;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
}
