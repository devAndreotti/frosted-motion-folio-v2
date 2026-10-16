import { describe, it, expect } from 'vitest';
import worker from './index.js';

const html = (body, status = 200) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
const get = (path) => new Request(`https://devandreotti.com${path}`);

// the build's case list, and the app shell for every other path (what not_found_handling does)
const assets = {
  fetch: async (req) => {
    const { pathname } = new URL(req.url);
    if (pathname === '/projetos/index.json') return new Response(JSON.stringify({ slugs: ['starbucks'] }), { headers: { 'content-type': 'application/json' } });
    if (pathname === '/projetos/starbucks/') return html('<main>caso</main><div id="root"></div>');
    return html('<div id="root"></div>');
  },
};

describe('case pages in the Worker', () => {
  it('serves the page of a published case', async () => {
    const res = await worker.fetch(get('/projetos/starbucks/'), { ASSETS: assets });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<main>caso</main>');
  });

  it('answers a case the build did not publish with the app shell and a 404', async () => {
    const res = await worker.fetch(get('/projetos/nao-existe/'), { ASSETS: assets });
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('id="root"');
  });
});
