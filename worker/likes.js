// Likes without accounts: /api/likes/<slug>
//   GET    -> { count, liked }      liked = this visitor already liked it
//   POST   -> like    (idempotent: the (slug, voter) primary key takes one row, ever)
//   DELETE -> unlike  (only the visitor's own row)
// A visitor is SHA-256(network + User-Agent + LIKES_SALT): no IP is stored and no cookie is set.
// The network is the IPv4 address, or the IPv6 /64 -- one connection gets a whole /64, so
// counting single IPv6 addresses would hand out free likes to anyone rotating inside it.
// Guards: only slugs the build published (blog/index.json), writes only from this
// site's own pages (Origin), at most RATE_LIMIT new likes per visitor a minute, and at most
// POST_HOURLY_CAP new likes per post an hour from everyone together -- what bounds someone
// switching IPs (VPN, proxies): each switch is a new visitor, but the post's hour still fills.
// Without the D1 binding (DB) every call answers 503 and the page hides the button.

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
export const POST_HOURLY_CAP = 100;
const HOUR_MS = 3_600_000;
const SLUGS_TTL_MS = 60_000;

let published = { at: 0, slugs: new Set() };

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });
}

/** The slugs of the published posts, from the build's blog/index.json (kept a minute per isolate). */
export async function publishedSlugs(request, env, now = Date.now()) {
  if (now - published.at < SLUGS_TTL_MS) return published.slugs;
  let slugs = new Set();
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/blog/index.json', request.url)));
    if (res.ok) slugs = new Set((await res.json()).slugs ?? []);
  } catch {
    // no list = no post accepts likes and every /blog/<slug>/ is a 404, until the next try
  }
  published = { at: now, slugs };
  return slugs;
}

export function resetPublishedCache() {
  published = { at: 0, slugs: new Set() };
}

/** 203.0.113.7 -> itself; 2001:db8:1:2:aaaa::1 -> 2001:db8:1:2::/64 (expanding a :: first). */
export function network(ip) {
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.toLowerCase().split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const groups = ip.includes('::') ? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right] : left;
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}

export async function voterId(request, env) {
  const ip = network(request.headers.get('cf-connecting-ip') ?? '');
  const ua = request.headers.get('user-agent') ?? '';
  const data = new TextEncoder().encode(`${ip}\n${ua}\n${env.LIKES_SALT ?? 'devandreotti-likes'}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function tally(db, slug, voter) {
  const row = await db
    .prepare('SELECT COUNT(*) AS count, COALESCE(SUM(voter = ?1), 0) AS mine FROM likes WHERE slug = ?2')
    .bind(voter, slug)
    .first();
  return { count: Number(row?.count ?? 0), liked: Number(row?.mine ?? 0) > 0 };
}

export async function handleLikes(request, env, now = Date.now()) {
  const url = new URL(request.url);
  let slug = '';
  try {
    slug = decodeURIComponent(url.pathname.slice('/api/likes/'.length).replace(/\/$/, ''));
  } catch {
    // a malformed %-escape is just an unknown post
  }
  if (!['GET', 'POST', 'DELETE'].includes(request.method)) {
    return new Response(null, { status: 405, headers: { allow: 'GET, POST, DELETE', 'cache-control': 'no-store' } });
  }
  if (!env.DB) return json({ error: 'likes are off on this host' }, 503);
  if (!SLUG.test(slug) || !(await publishedSlugs(request, env, now)).has(slug)) return json({ error: 'no such post' }, 404);

  const writing = request.method !== 'GET';
  // a form or script on another site can't spend this visitor's like
  if (writing && request.headers.get('origin') !== url.origin) return json({ error: 'forbidden' }, 403);

  const voter = await voterId(request, env);
  if (request.method === 'POST') {
    const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM likes WHERE voter = ?1 AND at > ?2')
      .bind(voter, now - RATE_WINDOW_MS)
      .first();
    if (Number(recent?.n ?? 0) >= RATE_LIMIT) return json({ error: 'too many likes, slow down' }, 429, { 'retry-after': '60' });
    const hour = await env.DB.prepare('SELECT COUNT(*) AS n FROM likes WHERE slug = ?1 AND at > ?2')
      .bind(slug, now - HOUR_MS)
      .first();
    if (Number(hour?.n ?? 0) >= POST_HOURLY_CAP) return json({ error: 'this post is taking a break from likes' }, 429, { 'retry-after': '3600' });
    await env.DB.prepare('INSERT OR IGNORE INTO likes (slug, voter, at) VALUES (?1, ?2, ?3)').bind(slug, voter, now).run();
  } else if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM likes WHERE slug = ?1 AND voter = ?2').bind(slug, voter).run();
  }
  return json(await tally(env.DB, slug, voter));
}
