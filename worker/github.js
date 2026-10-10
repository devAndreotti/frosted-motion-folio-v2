// Read-only GitHub lookups for the browser, served from the Worker so visitors
// stop spending their own 60/hour unauthenticated GitHub quota.
//   - /api/gh/user, /api/gh/events, /api/gh/contributions: allow-listed, nothing else
//   - successful answers are cached in the Cache API for an hour
//   - optional env.GITHUB_TOKEN (a Worker secret) is sent as a bearer token
//   - upstream errors pass their status through, uncached

export const GITHUB_USER = 'devAndreotti';
const CACHE_SECONDS = 3600;
const USER_AGENT = 'devandreotti.com portfolio worker';

export const UPSTREAMS = {
  '/api/gh/user': `https://api.github.com/users/${GITHUB_USER}`,
  '/api/gh/events': `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=100`,
  '/api/gh/contributions': `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=all`,
};

function json(body, status, cacheControl) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl },
  });
}

function withCacheStatus(response, status) {
  const headers = new Headers(response.headers);
  headers.set('x-gh-cache', status);
  return new Response(response.body, { status: response.status, headers });
}

export async function handleGithubApi(request, env, ctx) {
  const url = new URL(request.url);
  const upstream = UPSTREAMS[url.pathname];
  if (!upstream) return json({ error: 'not found' }, 404, 'no-store');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { allow: 'GET, HEAD', 'cache-control': 'no-store' } });
  }

  // Key on the path only: query strings from callers never change the upstream answer.
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}${url.pathname}`, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return withCacheStatus(cached, 'hit');

  const headers = { 'user-agent': USER_AGENT, accept: 'application/json' };
  if (env?.GITHUB_TOKEN) headers.authorization = `Bearer ${env.GITHUB_TOKEN}`;

  let res;
  try {
    res = await fetch(upstream, { headers });
  } catch {
    return json({ error: 'upstream unreachable' }, 502, 'no-store');
  }
  if (!res.ok) return json({ error: 'upstream error' }, res.status, 'no-store');

  const response = new Response(await res.text(), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${CACHE_SECONDS}` },
  });
  const stored = cache.put(cacheKey, response.clone());
  if (ctx?.waitUntil) ctx.waitUntil(stored);
  else await stored;
  return withCacheStatus(response, 'miss');
}
