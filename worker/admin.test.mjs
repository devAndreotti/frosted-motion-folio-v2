import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from './index.js';
import { RESEND_MS, emailHash } from './newsletter.js';
import { handleAdmin } from './admin.js';

// An in-memory stand-in for the D1 binding that answers the statements admin.js sends. It keeps
// every statement it was asked, so a test can check that the database was never touched.
function d1(seed = [], sendSeed = []) {
  const subscribers = new Map(seed.map((r) => [r.email, { ...r }]));
  const sends = sendSeed.map((s) => ({ ...s }));
  const statements = [];
  const exec = (sql, a) => {
    statements.push(sql);
    const all = [...subscribers.values()];
    // the send records (newsletter_sends): these branches come first, before the generic subscriber counts
    if (sql.startsWith("SELECT email, lang, unsub_token FROM subscribers WHERE status = 'active' ORDER BY")) {
      const rows = all.filter((r) => r.status === 'active').sort((x, y) => x.confirmed_at - y.confirmed_at || x.email.localeCompare(y.email));
      return { rows: rows.map((r) => ({ email: r.email, lang: r.lang, unsub_token: r.unsub_token })) };
    }
    if (sql.startsWith('SELECT email_hash, status, attempts FROM newsletter_sends WHERE issue_id')) {
      return { rows: sends.filter((s) => s.issue_id === a[0]).map(({ email_hash, status, attempts }) => ({ email_hash, status, attempts })) };
    }
    if (sql.startsWith('INSERT INTO newsletter_sends')) {
      const found = sends.find((s) => s.issue_id === a[0] && s.email_hash === a[1]);
      if (found) Object.assign(found, { status: 'sending', attempts: found.attempts + 1, updated_at: a[2] });
      else sends.push({ issue_id: a[0], email_hash: a[1], status: 'sending', attempts: 1, updated_at: a[2] });
      return { rows: [] };
    }
    if (sql.startsWith('UPDATE newsletter_sends SET status = ?3')) {
      const found = sends.find((s) => s.issue_id === a[0] && s.email_hash === a[1]);
      if (found) Object.assign(found, { status: a[2], updated_at: a[3] });
      return { rows: [] };
    }
    if (sql.startsWith('DELETE FROM newsletter_sends WHERE email_hash')) {
      for (let i = sends.length - 1; i >= 0; i--) if (sends[i].email_hash === a[0]) sends.splice(i, 1);
      return { rows: [], changes: 0 };
    }
    if (sql.includes("WHERE status = 'active' GROUP BY lang")) {
      const rows = all.filter((r) => r.status === 'active');
      return { rows: ['pt', 'en'].map((lang) => ({ lang, n: rows.filter((r) => r.lang === lang).length })).filter((g) => g.n > 0) };
    }
    if (sql.includes("WHERE status = 'active'")) return { rows: [{ n: all.filter((r) => r.status === 'active').length }] };
    if (sql.includes("WHERE status = 'pending'")) return { rows: [{ n: all.filter((r) => r.status === 'pending').length }] };
    if (sql.includes('WHERE confirmed_at >= ?1')) return { rows: [{ n: all.filter((r) => r.confirmed_at !== null && r.confirmed_at >= a[0]).length }] };
    if (sql.includes('WHERE created_at >= ?1')) return { rows: [{ n: all.filter((r) => r.created_at >= a[0]).length }] };
    if (sql.startsWith('SELECT email, lang, status, created_at')) return { rows: subscribers.has(a[0]) ? [subscribers.get(a[0])] : [] };
    if (sql.startsWith('SELECT email, lang, status, confirm_token')) return { rows: subscribers.has(a[0]) ? [subscribers.get(a[0])] : [] };
    if (sql.startsWith('DELETE FROM subscribers WHERE email = ?1')) return { rows: [], changes: subscribers.delete(a[0]) ? 1 : 0 };
    if (sql === "UPDATE subscribers SET confirm_sent_at = ?2 WHERE email = ?1 AND status = 'pending'") {
      const r = subscribers.get(a[0]);
      if (r?.status === 'pending') r.confirm_sent_at = a[1];
      return { rows: [] };
    }
    if (sql === "UPDATE subscribers SET confirm_sent_at = 0 WHERE email = ?1 AND status = 'pending'") {
      const r = subscribers.get(a[0]);
      if (r?.status === 'pending') r.confirm_sent_at = 0;
      return { rows: [] };
    }
    throw new Error(`the fake D1 does not know: ${sql}`);
  };
  return {
    subscribers,
    sends,
    statements,
    // D1's batch: the statements in order, one transaction (here: in order)
    batch: async (list) => {
      const out = [];
      for (const s of list) out.push(await s.run());
      return out;
    },
    prepare: (sql) => {
      // a statement can run with no binds (D1 allows it) or after bind(...)
      const statement = (args) => ({
        first: async () => exec(sql, args).rows[0] ?? null,
        all: async () => ({ results: exec(sql, args).rows }),
        run: async () => ({ success: true, meta: { changes: exec(sql, args).changes ?? 0 } }),
      });
      return { ...statement([]), bind: (...args) => statement(args) };
    },
  };
}

const ORIGIN = 'https://devandreotti.com';
const TOKEN = 'tower-test-token-0123456789abcdefghij';

// A request to the admin API: POST carries JSON unless the test overrides it.
const req = (action, { method = 'POST', body = {}, token = TOKEN, headers = {}, raw } = {}) =>
  new Request(`${ORIGIN}/api/admin/newsletter/${action}`, {
    method,
    headers: {
      ...(token === null ? {} : { authorization: `Bearer ${token}` }),
      ...(method === 'POST' ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    body: method === 'GET' ? undefined : (raw ?? JSON.stringify(body)),
  });

describe('admin', () => {
  let env;
  let sendMail;
  let NOW;
  const run = (request) => handleAdmin(request, env, NOW, { sendMail });
  const json = async (res) => res.json();

  beforeEach(() => {
    NOW = 1_800_000_000_000;
    env = { TOWER_ADMIN_TOKEN: TOKEN, DB: d1(), SMTP_USER: 'u', SMTP_PASS: 'p' };
    sendMail = vi.fn(async () => undefined);
  });

  describe('switched off and locked', () => {
    it('answers 404 for every admin request when the token is unset or shorter than 32 characters', async () => {
      for (const secret of [undefined, '', 'short', 'x'.repeat(31)]) {
        const db = d1();
        const res = await handleAdmin(req('stats', { method: 'GET' }), { ...env, TOWER_ADMIN_TOKEN: secret, DB: db }, NOW, { sendMail });
        expect(res.status).toBe(404);
        expect(await json(res)).toEqual({ error: 'not found' });
        expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
        expect(db.statements).toEqual([]);
      }
      // even with the right-looking header, and even for an unknown action
      const short = await handleAdmin(req('stats', { method: 'GET', token: 'x'.repeat(31) }), { ...env, TOWER_ADMIN_TOKEN: 'x'.repeat(31) }, NOW, { sendMail });
      expect(short.status).toBe(404);
      expect((await handleAdmin(req('nope'), { ...env, TOWER_ADMIN_TOKEN: undefined }, NOW, { sendMail })).status).toBe(404);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('answers 401 with www-authenticate when the bearer token is missing or wrong, without reading the body or the database', async () => {
      const cases = [
        req('stats', { method: 'GET', token: null }),
        req('lookup', { token: null, raw: 'not json' }),
        req('stats', { method: 'GET', token: 'x'.repeat(36) }),
        req('stats', { method: 'GET', token: TOKEN.slice(0, -1) }),
        req('stats', { method: 'GET', token: `${TOKEN}x` }),
        req('stats', { method: 'GET', headers: { authorization: `Basic ${TOKEN}` }, token: null }),
        req('stats', { method: 'GET', headers: { authorization: TOKEN }, token: null }),
      ];
      for (const request of cases) {
        const res = await run(request);
        expect(res.status).toBe(401);
        expect(res.headers.get('www-authenticate')).toBe('Bearer');
        expect(await json(res)).toEqual({ error: 'unauthorized' });
        expect(res.headers.get('cache-control')).toBe('no-store');
      }
      expect(env.DB.statements).toEqual([]);
    });

    it('answers 405 with an allow header for the wrong method, after the token is checked', async () => {
      const get = await run(req('lookup', { method: 'GET' }));
      expect(get.status).toBe(405);
      expect(get.headers.get('allow')).toBe('POST');
      const post = await run(req('stats', { method: 'POST' }));
      expect(post.status).toBe(405);
      expect(post.headers.get('allow')).toBe('GET');
      expect(env.DB.statements).toEqual([]);
    });

    it('answers 404 for an unknown action, but only once the token is right', async () => {
      const res = await run(req('drop-everything'));
      expect(res.status).toBe(404);
      expect(await json(res)).toEqual({ error: 'not found' });
      expect((await run(req('drop-everything', { token: null }))).status).toBe(401);
    });
  });

  describe('bodies', () => {
    it('answers 400 for a bad e-mail, a non-JSON body, a list, a body that is not JSON and an oversize body', async () => {
      for (const email of ['', 'sem-arroba', 'a@b', 'a b@c.com', 42, `${'a'.repeat(250)}@b.com`]) {
        const res = await run(req('lookup', { body: { email } }));
        expect(res.status).toBe(400);
        expect(await json(res)).toEqual({ error: 'bad request' });
      }
      expect((await run(req('lookup', { raw: 'not json' }))).status).toBe(400);
      expect((await run(req('lookup', { raw: 'null' }))).status).toBe(400);
      expect((await run(req('lookup', { raw: '[1]' }))).status).toBe(400);
      expect((await run(req('lookup', { headers: { 'content-type': 'text/plain' }, body: { email: 'a@b.co' } }))).status).toBe(400);
      const big = await run(req('lookup', { body: { email: 'a@b.co', pad: 'x'.repeat(2048) } }));
      expect(big.status).toBe(400);
      expect(await json(big)).toEqual({ error: 'bad request' });
      expect(env.DB.statements).toEqual([]);
    });

    it('answers 503 when the database binding is missing, and for resend also when SMTP is not configured', async () => {
      const noDb = await handleAdmin(req('stats', { method: 'GET' }), { TOWER_ADMIN_TOKEN: TOKEN }, NOW, { sendMail });
      expect(noDb.status).toBe(503);
      expect(await json(noDb)).toEqual({ error: 'database is off on this host' });
      const noMail = await handleAdmin(req('resend', { body: { email: 'a@b.co' } }), { ...env, SMTP_PASS: undefined }, NOW, { sendMail });
      expect(noMail.status).toBe(503);
      expect(await json(noMail)).toEqual({ error: 'mail is off on this host' });
      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  describe('stats', () => {
    it('counts active and pending rows, by language for the active ones only, and the last 7 days', async () => {
      const day = 24 * 3_600_000;
      env.DB = d1([
        { email: 'a@x.com', lang: 'pt', status: 'active', created_at: NOW - 30 * day, confirmed_at: NOW - 2 * day, confirm_sent_at: NOW - 30 * day, confirm_token: 't1', unsub_token: 'u1' },
        { email: 'b@x.com', lang: 'pt', status: 'active', created_at: NOW - 30 * day, confirmed_at: NOW - 10 * day, confirm_sent_at: NOW - 30 * day, confirm_token: 't2', unsub_token: 'u2' },
        { email: 'c@x.com', lang: 'en', status: 'active', created_at: NOW - day, confirmed_at: NOW - 3_600_000, confirm_sent_at: NOW - day, confirm_token: 't3', unsub_token: 'u3' },
        { email: 'd@x.com', lang: 'pt', status: 'pending', created_at: NOW - 3 * day, confirmed_at: null, confirm_sent_at: NOW - 3 * day, confirm_token: 't4', unsub_token: 'u4' },
        { email: 'e@x.com', lang: 'en', status: 'pending', created_at: NOW - 20 * day, confirmed_at: null, confirm_sent_at: 0, confirm_token: 't5', unsub_token: 'u5' },
      ]);
      const res = await run(req('stats', { method: 'GET' }));
      expect(res.status).toBe(200);
      expect(res.headers.get('cache-control')).toBe('no-store');
      expect(await json(res)).toEqual({ active: 3, pending: 2, by_lang: { pt: 2, en: 1 }, confirmed_7d: 2, created_7d: 2 });
    });

    it('always has both language keys, even with nobody active', async () => {
      expect(await json(await run(req('stats', { method: 'GET' })))).toEqual({ active: 0, pending: 0, by_lang: { pt: 0, en: 0 }, confirmed_7d: 0, created_7d: 0 });
    });
  });

  describe('lookup', () => {
    it('finds a subscriber with ISO dates, a null for a failed send, and never returns a token', async () => {
      env.DB = d1([
        { email: 'leitor@example.com', lang: 'en', status: 'active', created_at: NOW - 1000, confirmed_at: NOW, confirm_sent_at: NOW - 1000, confirm_token: 'SECRET-CONFIRM-TOKEN-XYZ', unsub_token: 'SECRET-UNSUB-TOKEN-XYZ' },
        { email: 'falhou@example.com', lang: 'pt', status: 'pending', created_at: NOW - 5000, confirmed_at: null, confirm_sent_at: 0, confirm_token: 'tok-falhou-aaaaaaaaaaaaaaaa', unsub_token: 'uns-falhou-aaaaaaaaaaaaaaa' },
      ]);
      const res = await run(req('lookup', { body: { email: '  Leitor@Example.COM ' } }));
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).not.toContain('SECRET-CONFIRM-TOKEN-XYZ');
      expect(text).not.toContain('SECRET-UNSUB-TOKEN-XYZ');
      expect(JSON.parse(text)).toEqual({
        found: true,
        subscriber: {
          email: 'leitor@example.com',
          lang: 'en',
          status: 'active',
          created_at: new Date(NOW - 1000).toISOString(),
          confirmed_at: new Date(NOW).toISOString(),
          confirm_sent_at: new Date(NOW - 1000).toISOString(),
        },
      });
      const failed = await json(await run(req('lookup', { body: { email: 'falhou@example.com' } })));
      expect(failed.subscriber).toMatchObject({ status: 'pending', confirmed_at: null, confirm_sent_at: null });
    });

    it('answers found: false for an address that is not on the list', async () => {
      const res = await run(req('lookup', { body: { email: 'ninguem@example.com' } }));
      expect(res.status).toBe(200);
      expect(await json(res)).toEqual({ found: false });
    });
  });

  describe('delete', () => {
    it('deletes the row and answers true, then false when there is nothing to delete', async () => {
      env.DB = d1([{ email: 'saindo@example.com', lang: 'pt', status: 'active', created_at: NOW, confirmed_at: NOW, confirm_sent_at: NOW, confirm_token: 'tok-saindo-aaaaaaaaaaaaaaa', unsub_token: 'uns-saindo-aaaaaaaaaaaaaaa' }]);
      expect(await json(await run(req('delete', { body: { email: 'Saindo@example.com' } })))).toEqual({ deleted: true });
      expect(env.DB.subscribers.has('saindo@example.com')).toBe(false);
      expect(await json(await run(req('delete', { body: { email: 'saindo@example.com' } })))).toEqual({ deleted: false });
    });
  });

  describe('resend', () => {
    const pending = (confirm_sent_at) => ({
      email: 'espera@example.com',
      lang: 'en',
      status: 'pending',
      created_at: NOW - 3 * RESEND_MS,
      confirmed_at: null,
      confirm_sent_at,
      confirm_token: 'tok-espera-aaaaaaaaaaaaaaaaa',
      unsub_token: 'uns-espera-aaaaaaaaaaaaaaaaa',
    });

    it('sends the confirmation again to a pending address once RESEND_MS has passed, and stamps confirm_sent_at', async () => {
      env.DB = d1([pending(NOW - RESEND_MS)]);
      const res = await run(req('resend', { body: { email: 'espera@example.com' } }));
      expect(res.status).toBe(200);
      expect(await json(res)).toEqual({ sent: true, reason: null });
      expect(sendMail).toHaveBeenCalledTimes(1);
      const mail = sendMail.mock.calls[0][1];
      expect(mail).toMatchObject({ to: 'espera@example.com', from: 'ricardo@devandreotti.com' });
      expect(mail.text).toContain(`${ORIGIN}/api/newsletter/confirm?t=tok-espera-aaaaaaaaaaaaaaaaa&l=en`);
      expect(env.DB.subscribers.get('espera@example.com').confirm_sent_at).toBe(NOW);
    });

    it('answers active for a confirmed address, not_found for an unknown one, and too_soon before RESEND_MS', async () => {
      env.DB = d1([
        { ...pending(NOW - 3 * RESEND_MS), email: 'ativo@example.com', status: 'active', confirmed_at: NOW - 1 },
        pending(NOW - RESEND_MS + 1000),
      ]);
      expect(await json(await run(req('resend', { body: { email: 'ativo@example.com' } })))).toEqual({ sent: false, reason: 'active' });
      expect(await json(await run(req('resend', { body: { email: 'ninguem@example.com' } })))).toEqual({ sent: false, reason: 'not_found' });
      expect(await json(await run(req('resend', { body: { email: 'espera@example.com' } })))).toEqual({ sent: false, reason: 'too_soon' });
      expect(sendMail).not.toHaveBeenCalled();
      expect(env.DB.subscribers.get('espera@example.com').confirm_sent_at).toBe(NOW - RESEND_MS + 1000);
    });

    it('answers 502 mail and sets confirm_sent_at to 0 when the send fails, so the next try goes at once', async () => {
      env.DB = d1([pending(NOW - 3 * RESEND_MS)]);
      sendMail = vi.fn(async () => {
        throw new Error('smtp down');
      });
      const res = await run(req('resend', { body: { email: 'espera@example.com' } }));
      expect(res.status).toBe(502);
      expect(await json(res)).toEqual({ error: 'mail' });
      expect(env.DB.subscribers.get('espera@example.com').confirm_sent_at).toBe(0);
    });
  });

  it('is reached through the worker before the /api/ catch-all, and only answers with the token', async () => {
    const assets = { fetch: async () => new Response('<div id="root"></div>', { headers: { 'content-type': 'text/html' } }) };
    const off = await worker.fetch(req('stats', { method: 'GET', token: null }), { ASSETS: assets, TOWER_ADMIN_TOKEN: TOKEN, DB: env.DB });
    expect(off.status).toBe(401);
    const on = await worker.fetch(req('stats', { method: 'GET' }), { ASSETS: assets, TOWER_ADMIN_TOKEN: TOKEN, DB: env.DB });
    expect(on.status).toBe(200);
    expect(await json(on)).toMatchObject({ active: 0, by_lang: { pt: 0, en: 0 } });
    const unset = await worker.fetch(req('stats', { method: 'GET' }), { ASSETS: assets });
    expect(unset.status).toBe(404);
    expect(await json(unset)).toEqual({ error: 'not found' });
  });

  describe('issues: preview and send', () => {
    const issue = (over = {}) => ({
      pt: { subject: 'Edição 43', week: 43, range: '19–25 out', intro: 'Olá, leitor.', posts: [{ title: 'Um post', description: 'Descrição.', minutes: 2, tags: ['ia'], url: 'https://devandreotti.com/blog/um/' }] },
      en: { subject: 'Issue 43', week: 43, range: 'Oct 19–25', intro: 'Hi there.', posts: [{ title: 'A post', description: 'Description.', minutes: 2, tags: ['ai'], url: 'https://devandreotti.com/blog/um/' }] },
      ...over,
    });
    const reader = (email, lang, n, over = {}) => ({
      email,
      lang,
      status: 'active',
      created_at: NOW - 10 * RESEND_MS,
      confirmed_at: NOW - 1000 * (10 - n),
      confirm_sent_at: 0,
      confirm_token: `ctk-${email}-aaaaaaaaaaaaaaaa`,
      unsub_token: `utk-${n}-${email.split('@')[0]}-aaaaaaaaaaaa`,
      ...over,
    });
    const hashOf = async (email) => emailHash(email);
    const batch = (body) => req('send', { body });

    beforeEach(() => {
      env.DB = d1();
    });

    it('preview renders both languages with an example unsubscribe link, the other-language link, and writes nothing', async () => {
      const res = await run(req('preview', { body: { issue: issue() } }));
      expect(res.status).toBe(200);
      expect(res.headers.get('cache-control')).toBe('no-store');
      const body = await json(res);
      expect(Object.keys(body).sort()).toEqual(['en', 'pt']);
      expect(body.pt.subject).toBe('Edição 43');
      expect(body.pt.html).toContain('https://devandreotti.com/api/newsletter/unsubscribe?t=exemplo-de-previa&amp;l=pt');
      expect(body.pt.html).toContain('https://devandreotti.com/?lang=en');
      expect(body.en.html).toContain('https://devandreotti.com/?lang=pt');
      expect(body.pt.text).toContain('Um post');
      expect(env.DB.statements).toEqual([]);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('preview works without SMTP: it only renders', async () => {
      const res = await handleAdmin(req('preview', { body: { issue: issue() } }), { ...env, SMTP_PASS: undefined }, NOW, { sendMail });
      expect(res.status).toBe(200);
      expect(Object.keys(await json(res)).sort()).toEqual(['en', 'pt']);
    });

    it('preview answers only the languages present', async () => {
      const body = await json(await run(req('preview', { body: { issue: { pt: issue().pt } } })));
      expect(Object.keys(body)).toEqual(['pt']);
    });

    it('answers 400 for a malformed issue: no language, a bad subject, a non-https link, a missing post field', async () => {
      const bad = [
        {},
        { pt: 'texto' },
        { pt: { ...issue().pt, subject: '' } },
        { pt: { ...issue().pt, subject: 'x'.repeat(151) } },
        { pt: { ...issue().pt, week: 1.5 } },
        { pt: { ...issue().pt, posts: [{ ...issue().pt.posts[0], url: 'http://devandreotti.com/blog/um/' }] } },
        { pt: { ...issue().pt, posts: [{ title: 'sem minutos', description: 'x', tags: [], url: 'https://devandreotti.com/' }] } },
        { pt: { ...issue().pt, posts: [] } },
        { pt: { ...issue().pt, links: [{ title: 'l', url: 'javascript:alert(1)', note: 'n' }] } },
      ];
      for (const i of bad) {
        const res = await run(req('preview', { body: { issue: i } }));
        expect(res.status, JSON.stringify(i).slice(0, 80)).toBe(400);
        expect(await json(res)).toEqual({ error: 'bad request' });
      }
      expect(env.DB.statements).toEqual([]);
    });

    it('a body over 64 KB is refused, and the issue actions take up to 64 KB', async () => {
      const big = await run(req('preview', { body: { issue: issue(), pad: 'x'.repeat(65536) } }));
      expect(big.status).toBe(400);
      const ok = await run(req('preview', { body: { issue: issue(), pad: 'x'.repeat(4096) } }));
      expect(ok.status).toBe(200);
      // the other actions still stop at 2 KB
      expect((await run(req('lookup', { body: { email: 'a@b.co', pad: 'x'.repeat(4096) } }))).status).toBe(400);
    });

    it('a test send mails each language to the address with [TESTE] in the subject, and records nothing', async () => {
      const res = await run(batch({ issue_id: 'edicao-43', issue: issue(), test_to: ' Ricardo@Example.com ' }));
      expect(res.status).toBe(200);
      expect(await json(res)).toEqual({ sent: 2, failed: 0, remaining: null, total: null });
      expect(sendMail).toHaveBeenCalledTimes(2);
      const subjects = sendMail.mock.calls.map(([, m]) => m.subject).sort();
      expect(subjects).toEqual(['[TESTE] Edição 43', '[TESTE] Issue 43']);
      for (const [, m] of sendMail.mock.calls) expect(m.to).toBe('ricardo@example.com');
      expect(env.DB.sends).toEqual([]);
      expect(env.DB.statements.some((s) => s.includes('newsletter_sends'))).toBe(false);
    });

    it('a test send to one language only sends that one, and counts a failed mail', async () => {
      sendMail.mockImplementationOnce(async () => {
        throw new Error('smtp down');
      });
      const res = await run(batch({ issue_id: 'edicao-43', issue: issue(), test_to: 'ricardo@example.com' }));
      expect(await json(res)).toEqual({ sent: 1, failed: 1, remaining: null, total: null });
    });

    it('a batch send answers 400 when one language is missing, and sends nothing', async () => {
      env.DB = d1([reader('a@x.com', 'pt', 1)]);
      const res = await run(batch({ issue_id: 'edicao-43', issue: { pt: issue().pt } }));
      expect(res.status).toBe(400);
      expect(await json(res)).toEqual({ error: 'bad request' });
      expect(sendMail).not.toHaveBeenCalled();
      expect(env.DB.sends).toEqual([]);
    });

    it('a batch send validates issue_id and limit', async () => {
      for (const body of [
        { issue_id: 'curto', issue: issue() },
        { issue_id: 'com espaço!', issue: issue() },
        { issue_id: 'edicao-43', issue: issue(), limit: 0 },
        { issue_id: 'edicao-43', issue: issue(), limit: 21 },
        { issue_id: 'edicao-43', issue: issue(), limit: 2.5 },
        { issue: issue() },
      ]) {
        expect((await run(batch(body))).status, JSON.stringify(body).slice(0, 60)).toBe(400);
      }
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('a batch takes at most limit readers (default 10), marks them sent, and counts remaining and total', async () => {
      env.DB = d1([reader('a@x.com', 'pt', 1), reader('b@x.com', 'en', 2), reader('c@x.com', 'pt', 3)]);
      const first = await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 2 }));
      expect(await json(first)).toEqual({ sent: 2, failed: 0, remaining: 1, total: 3 });
      expect(sendMail).toHaveBeenCalledTimes(2);
      expect(env.DB.sends.map((s) => s.status)).toEqual(['sent', 'sent']);
      const second = await run(batch({ issue_id: 'edicao-43', issue: issue() }));
      expect(await json(second)).toEqual({ sent: 1, failed: 0, remaining: 0, total: 3 });
      expect(await json(await run(batch({ issue_id: 'edicao-43', issue: issue() })))).toEqual({ sent: 0, failed: 0, remaining: 0, total: 3 });
      expect(sendMail).toHaveBeenCalledTimes(3);
    });

    it('never mails a reader again for the same issue once it is sent, and each reader gets exactly one copy', async () => {
      env.DB = d1([reader('a@x.com', 'pt', 1), reader('b@x.com', 'en', 2)]);
      for (let i = 0; i < 3; i++) await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 }));
      const mailed = sendMail.mock.calls.map(([, m]) => m.to).sort();
      expect(mailed).toEqual(['a@x.com', 'b@x.com']);
      // another issue goes to both again
      await run(batch({ issue_id: 'edicao-44', issue: issue(), limit: 20 }));
      expect(sendMail).toHaveBeenCalledTimes(4);
    });

    it('sends each reader in their own language, with their own unsubscribe link in the body and the List-Unsubscribe headers', async () => {
      env.DB = d1([reader('pt@x.com', 'pt', 1), reader('en@x.com', 'en', 2)]);
      await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 }));
      const byTo = Object.fromEntries(sendMail.mock.calls.map(([, m]) => [m.to, m]));
      expect(byTo['pt@x.com'].subject).toBe('Edição 43');
      expect(byTo['en@x.com'].subject).toBe('Issue 43');
      expect(byTo['pt@x.com'].html).toContain('Um post');
      expect(byTo['en@x.com'].html).toContain('A post');
      const ptToken = 'utk-1-pt-aaaaaaaaaaaa';
      const enToken = 'utk-2-en-aaaaaaaaaaaa';
      expect(byTo['pt@x.com'].headers['List-Unsubscribe']).toBe(`<https://devandreotti.com/api/newsletter/unsubscribe?t=${ptToken}&l=pt>`);
      expect(byTo['en@x.com'].headers['List-Unsubscribe']).toBe(`<https://devandreotti.com/api/newsletter/unsubscribe?t=${enToken}&l=en>`);
      expect(byTo['pt@x.com'].headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
      expect(byTo['pt@x.com'].text).toContain(`t=${ptToken}`);
      expect(byTo['pt@x.com'].text).not.toContain(enToken);
      expect(byTo['pt@x.com'].from).toBe('ricardo@devandreotti.com');
      expect(byTo['pt@x.com'].headers['Reply-To']).toBe('devandreotti@gmail.com');
    });

    it('takes only active readers in confirmation order, and stores a hash of the address, never the address', async () => {
      env.DB = d1([
        reader('tarde@x.com', 'pt', 5),
        reader('cedo@x.com', 'pt', 1),
        reader('pendente@x.com', 'pt', 0, { status: 'pending', confirmed_at: null }),
      ]);
      await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 1 }));
      expect(sendMail.mock.calls[0][1].to).toBe('cedo@x.com');
      const [sent] = env.DB.sends;
      expect(sent).toMatchObject({ issue_id: 'edicao-43', email_hash: await hashOf('cedo@x.com'), status: 'sent', attempts: 1 });
      expect(JSON.stringify(env.DB.sends)).not.toContain('@');
      expect(await json(await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 })))).toEqual({ sent: 1, failed: 0, remaining: 0, total: 2 });
    });

    it('a failed mail is marked failed and tried again on the next call, at most three attempts in all', async () => {
      env.DB = d1([reader('b@x.com', 'pt', 1)]);
      sendMail.mockImplementation(async () => {
        throw new Error('smtp: 554 refused');
      });
      expect(await json(await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 })))).toEqual({ sent: 0, failed: 1, remaining: 1, total: 1 });
      expect(env.DB.sends[0]).toMatchObject({ status: 'failed', attempts: 1 });
      // the second try goes through and marks it sent: the reader is not mailed again after that
      sendMail.mockImplementation(async () => undefined);
      expect(await json(await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 })))).toEqual({ sent: 1, failed: 0, remaining: 0, total: 1 });
      expect(env.DB.sends[0]).toMatchObject({ status: 'sent', attempts: 2 });
      expect(sendMail).toHaveBeenCalledTimes(2);
    });

    it('stops retrying a reader after three failed attempts', async () => {
      env.DB = d1([reader('b@x.com', 'pt', 1)]);
      sendMail.mockImplementation(async () => {
        throw new Error('smtp: 554 refused');
      });
      for (let i = 0; i < 4; i++) await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 }));
      expect(sendMail).toHaveBeenCalledTimes(3);
      expect(env.DB.sends[0]).toMatchObject({ status: 'failed', attempts: 3 });
    });

    it('a reader left in sending (the send died mid-way) is never mailed again and is not counted as remaining', async () => {
      env.DB = d1([reader('travado@x.com', 'pt', 1), reader('novo@x.com', 'pt', 2)], [
        { issue_id: 'edicao-43', email_hash: await hashOf('travado@x.com'), status: 'sending', attempts: 1, updated_at: NOW - 5 * RESEND_MS },
      ]);
      expect(await json(await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 })))).toEqual({ sent: 1, failed: 0, remaining: 0, total: 2 });
      expect(sendMail.mock.calls.map(([, m]) => m.to)).toEqual(['novo@x.com']);
      // later calls, however much time has passed, still leave it alone
      expect(await json(await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 })))).toEqual({ sent: 0, failed: 0, remaining: 0, total: 2 });
      expect(sendMail).toHaveBeenCalledTimes(1);
      const stuck = await hashOf('travado@x.com');
      expect(env.DB.sends.find((s) => s.email_hash === stuck)?.status).toBe('sending');
    });

    it('a reader with three failed attempts is not mailed again and is not counted as remaining, so remaining reaches 0', async () => {
      env.DB = d1([reader('esgotado@x.com', 'pt', 1), reader('novo@x.com', 'pt', 2)], [
        { issue_id: 'edicao-43', email_hash: await hashOf('esgotado@x.com'), status: 'failed', attempts: 3, updated_at: NOW },
      ]);
      expect(await json(await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 })))).toEqual({ sent: 1, failed: 0, remaining: 0, total: 2 });
      expect(sendMail.mock.calls.map(([, m]) => m.to)).toEqual(['novo@x.com']);
      expect(await json(await run(batch({ issue_id: 'edicao-43', issue: issue(), limit: 20 })))).toEqual({ sent: 0, failed: 0, remaining: 0, total: 2 });
    });

    it('answers 503 for a batch send when SMTP is not configured', async () => {
      const res = await handleAdmin(batch({ issue_id: 'edicao-43', issue: issue() }), { ...env, SMTP_PASS: undefined }, NOW, { sendMail });
      expect(res.status).toBe(503);
      expect(await json(res)).toEqual({ error: 'mail is off on this host' });
    });

    it('the admin delete takes the subscriber send records with the row', async () => {
      env.DB = d1([reader('saindo@x.com', 'pt', 1)], [
        { issue_id: 'edicao-43', email_hash: await hashOf('saindo@x.com'), status: 'sent', attempts: 1, updated_at: NOW },
        { issue_id: 'edicao-43', email_hash: await hashOf('outro@x.com'), status: 'sent', attempts: 1, updated_at: NOW },
      ]);
      expect(await json(await run(req('delete', { body: { email: 'saindo@x.com' } })))).toEqual({ deleted: true });
      expect(env.DB.sends.map((s) => s.email_hash)).toEqual([await hashOf('outro@x.com')]);
    });
  });
});
