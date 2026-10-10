import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGithubApi, UPSTREAMS } from './github.js';

function fakeCache() {
  const store = new Map();
  return {
    store,
    match: vi.fn(async (req) => (store.has(req.url) ? store.get(req.url).clone() : undefined)),
    put: vi.fn(async (req, res) => {
      store.set(req.url, res);
    }),
  };
}

const get = (path, init) => new Request(`https://devandreotti.com${path}`, init);

describe('handleGithubApi', () => {
  let cache;
  let upstream;

  beforeEach(() => {
    cache = fakeCache();
    globalThis.caches = { default: cache };
    upstream = vi.fn(async () => new Response(JSON.stringify({ public_repos: 69 }), { status: 200 }));
    vi.stubGlobal('fetch', upstream);
  });

  it('only proxies the allow-listed GitHub URLs', async () => {
    expect(Object.keys(UPSTREAMS).sort()).toEqual(['/api/gh/contributions', '/api/gh/events', '/api/gh/user']);
    const res = await handleGithubApi(get('/api/gh/anything-else'), {});
    expect(res.status).toBe(404);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(upstream).not.toHaveBeenCalled();
  });

  it('rejects methods other than GET and HEAD', async () => {
    const res = await handleGithubApi(get('/api/gh/user', { method: 'POST' }), {});
    expect(res.status).toBe(405);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('fetches upstream once, sends a user agent, and caches for an hour', async () => {
    const first = await handleGithubApi(get('/api/gh/user'), {});
    expect(first.status).toBe(200);
    expect(first.headers.get('cache-control')).toBe('public, max-age=3600');
    expect(first.headers.get('x-gh-cache')).toBe('miss');
    expect(await first.json()).toEqual({ public_repos: 69 });
    expect(upstream).toHaveBeenCalledWith(UPSTREAMS['/api/gh/user'], expect.objectContaining({ headers: expect.objectContaining({ 'user-agent': expect.any(String) }) }));
    expect(cache.put).toHaveBeenCalledTimes(1);

    const second = await handleGithubApi(get('/api/gh/user?cachebust=1'), {});
    expect(second.headers.get('x-gh-cache')).toBe('hit');
    expect(second.headers.get('cache-control')).toBe('public, max-age=3600');
    expect(await second.json()).toEqual({ public_repos: 69 });
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it('sends the bearer token only when GITHUB_TOKEN is set', async () => {
    await handleGithubApi(get('/api/gh/events'), { GITHUB_TOKEN: 'secret' });
    const headers = upstream.mock.calls[0][1].headers;
    expect(headers.authorization).toBe('Bearer secret');
  });

  it('passes upstream errors through uncached', async () => {
    upstream.mockResolvedValueOnce(new Response('{}', { status: 403 }));
    const res = await handleGithubApi(get('/api/gh/events'), {});
    expect(res.status).toBe(403);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('answers 502 when the upstream is unreachable', async () => {
    upstream.mockRejectedValueOnce(new TypeError('network down'));
    const res = await handleGithubApi(get('/api/gh/contributions'), {});
    expect(res.status).toBe(502);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});
