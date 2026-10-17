import fs from 'node:fs';
import { createRequire } from 'node:module';
import { beforeEach, describe, expect, it } from 'vitest';
import worker from './index.js';
import { MOST_READ_MIN_VIEWS } from './views.js';
import { resetPublishedCache } from './likes.js';

// An in-memory stand-in for the D1 binding that answers the statements views.js sends.
function fakeD1(initial = []) {
  const rows = new Map(initial.map(([slug, views]) => [slug, views]));
  const run = (sql, args) => {
    if (sql.startsWith('INSERT INTO post_views')) {
      const [slug] = args;
      rows.set(slug, (rows.get(slug) ?? 0) + 1);
      return {};
    }
    if (sql.includes('SUM(views)')) return { total: [...rows.values()].reduce((a, b) => a + b, 0) };
    const [limit] = args;
    const results = [...rows].map(([slug, views]) => ({ slug, views })).sort((a, b) => b.views - a.views || a.slug.localeCompare(b.slug));
    return { results: results.slice(0, limit) };
  };
  return {
    rows,
    prepare: (sql) => {
      const statement = (args) => ({
        bind: (...more) => statement(more),
        first: async () => run(sql, args),
        run: async () => run(sql, args),
        all: async () => run(sql, args),
      });
      return statement([]);
    },
  };
}

const POSTS = ['meu-post', 'outro', 'terceiro', 'quarto', 'quinto', 'sexto'];
const assets = (slugs = POSTS) => ({
  fetch: async (req) => {
    const { pathname } = new URL(req.url);
    if (pathname === '/blog/index.json') return new Response(JSON.stringify({ slugs }), { headers: { 'content-type': 'application/json' } });
    return new Response('<div id="root"></div>', { headers: { 'content-type': 'text/html' } });
  },
});

const ORIGIN = 'https://devandreotti.com';
const view = (slug, headers = {}) =>
  new Request(`${ORIGIN}/api/blog/view/${slug}`, { method: 'POST', headers: { origin: ORIGIN, ...headers } });
const top = () => new Request(`${ORIGIN}/api/blog/top`);
const json = async (res) => res.json();

describe('blog reads', () => {
  let env;
  beforeEach(() => {
    resetPublishedCache();
    env = { ASSETS: assets(), DB: fakeD1() };
  });

  it('counts a read of a published post, and each read adds one', async () => {
    expect((await worker.fetch(view('meu-post'), env)).status).toBe(204);
    await worker.fetch(view('meu-post'), env);
    expect(env.DB.rows.get('meu-post')).toBe(2);
  });

  it('does not count a slug the build did not publish', async () => {
    expect((await worker.fetch(view('inventado'), env)).status).toBe(404);
    expect((await worker.fetch(view('..%2Fx'), env)).status).toBe(404);
    expect(env.DB.rows.size).toBe(0);
  });

  it('refuses reads from other sites and other methods', async () => {
    expect((await worker.fetch(view('meu-post', { origin: 'https://evil.example' }), env)).status).toBe(403);
    expect((await worker.fetch(new Request(`${ORIGIN}/api/blog/view/meu-post`, { method: 'POST' }), env)).status).toBe(403);
    expect((await worker.fetch(new Request(`${ORIGIN}/api/blog/view/meu-post`, { method: 'GET' }), env)).status).toBe(405);
    expect((await worker.fetch(new Request(`${ORIGIN}/api/blog/top`, { method: 'POST', headers: { origin: ORIGIN } }), env)).status).toBe(405);
    expect(env.DB.rows.size).toBe(0);
  });

  it('stays disabled below the threshold and turns on at it', async () => {
    env.DB = fakeD1([['meu-post', MOST_READ_MIN_VIEWS - 1]]);
    const below = await json(await worker.fetch(top(), env));
    expect(below).toEqual({ enabled: false, total: MOST_READ_MIN_VIEWS - 1 });

    await worker.fetch(view('outro'), env);
    const at = await json(await worker.fetch(top(), env));
    expect(at.enabled).toBe(true);
    expect(at.total).toBe(MOST_READ_MIN_VIEWS);
    expect(at.posts[0]).toEqual({ slug: 'meu-post', views: MOST_READ_MIN_VIEWS - 1 });
  });

  it('lists the five most read published posts, most read first', async () => {
    env.DB = fakeD1([
      ['meu-post', 50],
      ['outro', 60],
      ['terceiro', 70],
      ['quarto', 80],
      ['quinto', 90],
      ['sexto', 100],
      ['apagado', 500],
    ]);
    const body = await json(await worker.fetch(top(), env));
    expect(body.enabled).toBe(true);
    // 'apagado' has the most reads but was never published, so it is not listed
    expect(body.posts.map((p) => p.slug)).toEqual(['sexto', 'quinto', 'quarto', 'terceiro', 'outro']);
  });

  it('answers the top list cached for five minutes, and disabled without a database', async () => {
    const res = await worker.fetch(top(), env);
    expect(res.headers.get('cache-control')).toBe('public, max-age=300');
    expect(await json(await worker.fetch(top(), { ASSETS: assets() }))).toEqual({ enabled: false, total: 0 });
  });

  it('answers 503 for a read where no database is bound', async () => {
    expect((await worker.fetch(view('meu-post'), { ASSETS: assets() })).status).toBe(503);
  });
});

// The migration and the upsert against a real SQLite, when this Node has node:sqlite (Node 22+).
let DatabaseSync;
try {
  ({ DatabaseSync } = createRequire(import.meta.url)('node:sqlite'));
} catch {
  // no node:sqlite here
}

describe.skipIf(!DatabaseSync)('post_views on a real SQLite', () => {
  it('the migration creates the table and the upsert counts each read', async () => {
    const db = new DatabaseSync(':memory:');
    db.exec(fs.readFileSync('worker/migrations/0004_post_views.sql', 'utf8'));
    const DB = {
      prepare: (sql) => {
        const st = db.prepare(sql);
        const statement = (args) => ({
          bind: (...more) => statement(more),
          first: async () => st.get(...args) ?? null,
          all: async () => ({ results: st.all(...args) }),
          run: async () => (st.run(...args), {}),
        });
        return statement([]);
      },
    };
    resetPublishedCache();
    const env = { ASSETS: assets(), DB };
    for (let i = 0; i < 3; i++) await worker.fetch(view('meu-post'), env);
    expect(db.prepare('SELECT views FROM post_views WHERE slug = ?').get('meu-post').views).toBe(3);
    const body = await json(await worker.fetch(top(), env));
    expect(body).toEqual({ enabled: false, total: 3 });
  });
});
