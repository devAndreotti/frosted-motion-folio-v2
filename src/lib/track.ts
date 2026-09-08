/**
 * Fire-and-forget click telemetry. No backend, no database: the VPS nginx
 * config logs whatever path this hits and returns 204, so goaccess reads it
 * straight from the access log alongside real page views. On GitHub Pages
 * (served under a sub-path, no such route) the beacon just 404s silently --
 * sendBeacon never surfaces errors to JS, so this is safe on both deploys
 * without an environment check.
 */
export function track(event: string): void {
  try {
    navigator.sendBeacon?.(`./e/${event}`);
  } catch {
    // telemetry must never break the UI
  }
}
