// Reads of blog posts, without accounts, cookies or IPs: /api/blog/view/<slug> and /api/blog/top
//   POST /api/blog/view/<slug> -> 204, adds one read to the post (the page's beacon, once per tab: src/lib/blog/views.ts)
//   GET  /api/blog/top         -> { enabled, total, posts: [{ slug, views }] }
// The list "Mais lidos" stays hidden until the blog has MOST_READ_MIN_VIEWS reads in all:
// enabled is false below that, and posts is only filled once enabled is true (the 5 most read).
// Only slugs the build published count (publishedSlugs in likes.js), and writes come only from this
// site's own pages (Origin), the same guard as the likes. Without the D1 binding (DB) the answers are
// 503 for a view and { enabled: false } for the top.
import { publishedSlugs } from './likes.js';

export const MOST_READ_MIN_VIEWS = 200;
export const MOST_READ_SIZE = 5;
const TOP_CACHE = 'public, max-age=300';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });
}

async function recordView(request, env, slug) {
  if (!env.DB) return json({ error: 'reads are off on this host' }, 503);
  if (!SLUG.test(slug) || !(await publishedSlugs(request, env)).has(slug)) return json({ error: 'no such post' }, 404);
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'forbidden' }, 403);
  await env.DB.prepare('INSERT INTO post_views (slug, views) VALUES (?1, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1')
    .bind(slug)
    .run();
  return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
}

async function top(request, env) {
  const headers = { 'cache-control': TOP_CACHE };
  if (!env.DB) return json({ enabled: false, total: 0 }, 200, headers);
  const sum = await env.DB.prepare('SELECT COALESCE(SUM(views), 0) AS total FROM post_views').first();
  const total = Number(sum?.total ?? 0);
  if (total < MOST_READ_MIN_VIEWS) return json({ enabled: false, total }, 200, headers);
  // a few more rows than shown, so the posts that were unpublished since don't leave the list short
  const rows = await env.DB.prepare('SELECT slug, views FROM post_views ORDER BY views DESC, slug ASC LIMIT ?1')
    .bind(MOST_READ_SIZE * 4)
    .all();
  const published = await publishedSlugs(request, env);
  const posts = (rows?.results ?? [])
    .filter((row) => published.has(row.slug))
    .slice(0, MOST_READ_SIZE)
    .map((row) => ({ slug: row.slug, views: Number(row.views) }));
  return json({ enabled: true, total, posts }, 200, headers);
}

/** Everything under /api/blog/. */
export async function handleBlog(request, env) {
  const { pathname } = new URL(request.url);
  if (pathname === '/api/blog/top') {
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { allow: 'GET', 'cache-control': 'no-store' } });
    return top(request, env);
  }
  if (pathname.startsWith('/api/blog/view/')) {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST', 'cache-control': 'no-store' } });
    let slug = '';
    try {
      slug = decodeURIComponent(pathname.slice('/api/blog/view/'.length).replace(/\/$/, ''));
    } catch {
      // a malformed %-escape is just an unknown post
    }
    return recordView(request, env, slug);
  }
  return json({ error: 'no such endpoint' }, 404);
}
