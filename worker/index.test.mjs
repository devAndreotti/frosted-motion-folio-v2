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
