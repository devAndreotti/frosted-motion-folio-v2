import { describe, it, expect } from 'vitest';
import worker from './index.js';

const html = (body, status = 200) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });

// Stands in for the static-assets binding: the app shell for any unknown path, like not_found_handling does.
function assets({ fail = false, down = false } = {}) {
  return {
    fetch: async (req) => {
      if (fail) throw new Error('assets unavailable');
      const { pathname } = new URL(req.url);
      if (pathname === '/offline') return html('<h1>offline page</h1>');
      if (down) return html('upstream error', 502);
      if (pathname === '/profile/blue.webp') return new Response('img', { headers: { 'content-type': 'image/webp' } });
      return html('<div id="root"></div>');
    },
  };
}

const get = (path) => new Request(`https://devandreotti.com${path}`);

describe('worker', () => {
  it('serves the home page as is', async () => {
    const res = await worker.fetch(get('/'), { ASSETS: assets() });
    expect(res.status).toBe(200);
  });

  it('answers unknown routes with the app shell and a real 404', async () => {
    const res = await worker.fetch(get('/projetos/antigo'), { ASSETS: assets() });
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('id="root"');
  });

  it('answers /agora/ as a page with the app shell and a 200', async () => {
    const res = await worker.fetch(get('/agora/'), { ASSETS: assets() });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('id="root"');
  });

  it('leaves files that are not pages alone', async () => {
    const res = await worker.fetch(get('/profile/blue.webp'), { ASSETS: assets() });
    expect(res.status).toBe(200);
  });

  it('serves the offline page with a 503 in maintenance mode', async () => {
    const res = await worker.fetch(get('/'), { ASSETS: assets(), MAINTENANCE: '1' });
    expect(res.status).toBe(503);
    expect(res.headers.get('retry-after')).toBe('120');
    expect(await res.text()).toContain('offline page');
  });

  it('falls back to the offline page when the assets fail', async () => {
    expect((await worker.fetch(get('/'), { ASSETS: assets({ down: true }) })).status).toBe(503);
    const res = await worker.fetch(get('/'), { ASSETS: assets({ fail: true }) });
    expect(res.status).toBe(503);
    expect(await res.text()).toContain('saiu do ar');
  });
});

describe('worker security headers', () => {
  const BASELINE = ['x-content-type-options', 'referrer-policy', 'permissions-policy', 'x-frame-options', 'strict-transport-security', 'cross-origin-opener-policy'];
  const expectBaseline = (res) => {
    for (const name of BASELINE) expect(res.headers.get(name), name).toBeTruthy();
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('strict-transport-security')).toMatch(/max-age=\d{7,}/);
  };

  it('puts them on what the Worker answers itself: beacons, redirects and the offline page', async () => {
    expectBaseline(await worker.fetch(get('/e/click'), { ASSETS: assets() }));
    expectBaseline(await worker.fetch(new Request('http://devandreotti.com/'), { ASSETS: assets() }));
    expectBaseline(await worker.fetch(get('/'), { ASSETS: assets(), MAINTENANCE: '1' }));
    expectBaseline(await worker.fetch(get('/'), { ASSETS: assets({ fail: true }) }));
  });

  it('adds them to pages and files from the assets too, without overriding what is already set', async () => {
    const page = await worker.fetch(get('/'), { ASSETS: assets() });
    expectBaseline(page);
    const custom = { fetch: async () => new Response('x', { headers: { 'x-frame-options': 'DENY' } }) };
    expect((await worker.fetch(get('/profile/blue.webp'), { ASSETS: custom })).headers.get('x-frame-options')).toBe('DENY');
  });
});
