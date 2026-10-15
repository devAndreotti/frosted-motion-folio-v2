import { beforeEach, describe, expect, it } from 'vitest';
import worker from './index.js';
import { POST_HOURLY_CAP, RATE_LIMIT, network, publishedSlugs, resetPublishedCache, voterId } from './likes.js';

// An in-memory stand-in for the D1 binding that answers the queries likes.js sends.
function fakeD1() {
  const rows = [];
  const run = (sql, args) => {
    if (sql.startsWith('INSERT OR IGNORE')) {
      const [slug, voter, at] = args;
      if (!rows.some((r) => r.slug === slug && r.voter === voter)) rows.push({ slug, voter, at });
      return null;
    }
    if (sql.startsWith('DELETE')) {
      const [slug, voter] = args;
      const i = rows.findIndex((r) => r.slug === slug && r.voter === voter);
      if (i >= 0) rows.splice(i, 1);
      return null;
    }
    if (sql.includes('AS n')) {
      const [key, since] = args;
      const field = sql.includes('WHERE slug') ? 'slug' : 'voter';
      return { n: rows.filter((r) => r[field] === key && r.at > since).length };
    }
    const [voter, slug] = args;
    const mine = rows.filter((r) => r.slug === slug);
    return { count: mine.length, mine: mine.filter((r) => r.voter === voter).length };
  };
  return {
    rows,
    prepare: (sql) => ({
      bind: (...args) => ({ first: async () => run(sql, args), run: async () => run(sql, args) }),
    }),
  };
}

const assets = (slugs = ['meu-post']) => ({
  fetch: async (req) => {
    const { pathname } = new URL(req.url);
    if (pathname === '/blog/index.json') return new Response(JSON.stringify({ slugs }), { headers: { 'content-type': 'application/json' } });
    return new Response('<div id="root"></div>', { headers: { 'content-type': 'text/html' } });
  },
});

const ORIGIN = 'https://devandreotti.com';
const call = (method, path = '/api/likes/meu-post', headers = {}) =>
  new Request(`${ORIGIN}${path}`, {
    method,
    headers: { 'cf-connecting-ip': '203.0.113.7', 'user-agent': 'test', ...(method === 'GET' ? {} : { origin: ORIGIN }), ...headers },
  });

describe('likes', () => {
  let env;
  beforeEach(() => {
    resetPublishedCache();
    env = { ASSETS: assets(), DB: fakeD1(), LIKES_SALT: 'salt' };
  });

  it('counts one like per visitor, however many times it is sent, and lets them take it back', async () => {
    expect(await (await worker.fetch(call('GET'), env)).json()).toEqual({ count: 0, liked: false });
    await worker.fetch(call('POST'), env);
    const twice = await worker.fetch(call('POST'), env);
    expect(await twice.json()).toEqual({ count: 1, liked: true });
    expect(twice.headers.get('cache-control')).toBe('no-store');

    const other = await worker.fetch(call('POST', undefined, { 'cf-connecting-ip': '198.51.100.9' }), env);
    expect(await other.json()).toEqual({ count: 2, liked: true });

    expect(await (await worker.fetch(call('DELETE'), env)).json()).toEqual({ count: 1, liked: false });
    expect(env.DB.rows).toHaveLength(1);
  });

  it('stores a hash of the visitor, never the IP', async () => {
    await worker.fetch(call('POST'), env);
    expect(env.DB.rows[0].voter).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(env.DB.rows)).not.toContain('203.0.113.7');
    const a = await voterId(call('GET'), { LIKES_SALT: 'one' });
    const b = await voterId(call('GET'), { LIKES_SALT: 'two' });
    expect(a).not.toBe(b);
  });

  it('only takes posts the build published', async () => {
    expect((await worker.fetch(call('POST', '/api/likes/inventado'), env)).status).toBe(404);
    expect((await worker.fetch(call('GET', '/api/likes/..%2Fx'), env)).status).toBe(404);
    expect((await worker.fetch(call('GET', '/api/likes/%E0%A4%A'), env)).status).toBe(404);
    expect(env.DB.rows).toHaveLength(0);
  });

  it('refuses writes from other sites and other methods', async () => {
    expect((await worker.fetch(call('POST', undefined, { origin: 'https://evil.example' }), env)).status).toBe(403);
    const noOrigin = new Request(`${ORIGIN}/api/likes/meu-post`, { method: 'POST' });
    expect((await worker.fetch(noOrigin, env)).status).toBe(403);
    expect((await worker.fetch(call('PUT'), env)).status).toBe(405);
    expect(env.DB.rows).toHaveLength(0);
  });

  it('slows down a visitor liking too much in a minute', async () => {
    env.ASSETS = assets(Array.from({ length: RATE_LIMIT + 1 }, (_, i) => `p${i}`));
    for (let i = 0; i < RATE_LIMIT; i++) expect((await worker.fetch(call('POST', `/api/likes/p${i}`), env)).status).toBe(200);
    const res = await worker.fetch(call('POST', `/api/likes/p${RATE_LIMIT}`), env);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
  });

  it('counts a whole IPv6 /64 as one visitor, so rotating addresses inside it gives nothing', async () => {
    expect(network('203.0.113.7')).toBe('203.0.113.7');
    expect(network('2001:db8:1:2:aaaa:bbbb:cccc:dddd')).toBe('2001:db8:1:2::/64');
    expect(network('2001:DB8:0001::1')).toBe('2001:db8:1:0::/64');
    expect(network('::1')).toBe('0:0:0:0::/64');
    await worker.fetch(call('POST', undefined, { 'cf-connecting-ip': '2001:db8:1:2::a' }), env);
    const again = await worker.fetch(call('POST', undefined, { 'cf-connecting-ip': '2001:db8:1:2:ffff::b' }), env);
    expect(await again.json()).toEqual({ count: 1, liked: true });
  });

  it('caps a post at POST_HOURLY_CAP new likes an hour, whatever IPs they come from', async () => {
    const t0 = 5_000_000_000;
    for (let i = 0; i < POST_HOURLY_CAP; i++) env.DB.rows.push({ slug: 'meu-post', voter: `v${i}`, at: t0 - 1000 });
    const { handleLikes } = await import('./likes.js');
    const res = await handleLikes(call('POST', undefined, { 'cf-connecting-ip': '198.51.100.200' }), env, t0);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('3600');
    // an hour later the post takes likes again
    expect((await handleLikes(call('POST', undefined, { 'cf-connecting-ip': '198.51.100.200' }), env, t0 + 3_600_000)).status).toBe(200);
  });

  it('answers 503 where no database is bound', async () => {
    expect((await worker.fetch(call('GET'), { ASSETS: assets() })).status).toBe(503);
  });

  it('keeps the published list a minute, and treats a missing list as no posts', async () => {
    const req = call('GET');
    expect((await publishedSlugs(req, env, 1_000_000)).has('meu-post')).toBe(true);
    expect((await publishedSlugs(req, { ASSETS: assets([]) }, 1_030_000)).has('meu-post')).toBe(true);
    expect((await publishedSlugs(req, { ASSETS: assets([]) }, 1_070_000)).has('meu-post')).toBe(false);
    resetPublishedCache();
    const broken = { ASSETS: { fetch: async () => { throw new Error('down'); } } };
    expect((await publishedSlugs(req, broken)).size).toBe(0);
  });
});

describe('blog pages in the worker', () => {
  beforeEach(() => resetPublishedCache());
  const get = (path) => new Request(`${ORIGIN}${path}`);

  it('serves /blog/ and published posts with 200, anything else under /blog/ with 404', async () => {
    const env = { ASSETS: assets() };
    expect((await worker.fetch(get('/blog/'), env)).status).toBe(200);
    expect((await worker.fetch(get('/blog/meu-post/'), env)).status).toBe(200);
    expect((await worker.fetch(get('/blog/inventado/'), env)).status).toBe(404);
  });
});
