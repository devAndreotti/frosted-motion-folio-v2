// Cloudflare Worker for devandreotti.com: serves the static build (dist-vps) and
// only steps in for what a static host can't do.
//   - http:// and www. -> 301 to https://devandreotti.com (same path and query)
//   - /e/<event>       -> 204: the click beacons from src/lib/track.ts. On the
//     ostg01 copy nginx logs them for goaccess; here Umami records the clicks
//     (when configured), so the beacon only needs a quiet answer.
// Static files (assets/, images, robots, sitemap) never reach this code: see
// run_worker_first in wrangler.jsonc.

const APEX = 'devandreotti.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const onPreview = url.hostname.endsWith('.workers.dev');
    if (!onPreview && (url.protocol === 'http:' || url.hostname !== APEX)) {
      url.protocol = 'https:';
      url.hostname = APEX;
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.startsWith('/e/')) {
      return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    }
    return env.ASSETS.fetch(request);
  }
};
