// Cloudflare Worker for devandreotti.com: serves the static build (dist-vps) and
// only steps in for what a static host can't do.
//   - http:// and www. -> 301 to https://devandreotti.com (same path and query)
//   - /api/gh/*        -> cached GitHub lookups for the browser (see github.js)
//   - /e/<event>       -> 204: the click beacons from src/lib/track.ts. Umami
//     records the clicks (when configured), so the beacon only needs a quiet answer.
//   - MAINTENANCE=1, or the static files failing -> 503 with public/offline.html
//   - unknown paths     -> the app shell (its React 404 page) with a real 404 status
// Static files (assets/, images, robots, sitemap) never reach this code: see
// run_worker_first in wrangler.jsonc.

import { handleGithubApi } from './github.js';

const APEX = 'devandreotti.com';
// The only paths that are pages; any other HTML is the one-page app's fallback for an unknown route.
// (Assets serve offline.html at /offline: html_handling drops the extension.)
const PAGES = new Set(['/', '/offline']);

/** The "back soon" page with a 503, so crawlers and caches know it is temporary. */
async function offlinePage(request, env) {
  let body = 'devandreotti.com is down for a moment. / devandreotti.com saiu do ar por um instante.';
  let type = 'text/plain; charset=utf-8';
  try {
    const page = await env.ASSETS.fetch(new Request(new URL('/offline', request.url)));
    if (page.ok) {
      body = page.body;
      type = 'text/html; charset=utf-8';
    }
  } catch {
    // the assets themselves are down: the plain line above still answers
  }
  return new Response(body, { status: 503, headers: { 'content-type': type, 'retry-after': '120', 'cache-control': 'no-store' } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const onPreview = url.hostname.endsWith('.workers.dev');
    if (!onPreview && (url.protocol === 'http:' || url.hostname !== APEX)) {
      url.protocol = 'https:';
      url.hostname = APEX;
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.startsWith('/api/')) return handleGithubApi(request, env, ctx);
    if (url.pathname.startsWith('/e/')) {
      return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    }
    if (env.MAINTENANCE === '1') return offlinePage(request, env);

    let res;
    try {
      res = await env.ASSETS.fetch(request);
    } catch {
      return offlinePage(request, env);
    }
    if (res.status >= 500) return offlinePage(request, env);
    const html = (res.headers.get('content-type') || '').includes('text/html');
    if (res.status === 200 && html && !PAGES.has(url.pathname)) {
      return new Response(res.body, { status: 404, headers: res.headers });
    }
    return res;
  }
};
