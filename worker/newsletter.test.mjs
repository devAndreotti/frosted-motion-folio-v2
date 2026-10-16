import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from './index.js';
import { GLOBAL_HOURLY_CAP, PENDING_TTL_MS, RATE_LIMIT, RESEND_MS, emailHash, handleNewsletter } from './newsletter.js';

// An in-memory stand-in for the D1 binding that answers the statements newsletter.js sends
// (the real SQL runs against D1's own engine in the local end-to-end check, not here).
function d1() {
  const subscribers = new Map();
  const sends = [];
  let hits = [];
  const run = (sql, a) => {
    if (sql.startsWith('SELECT COUNT(*) AS n FROM subscribe_hits WHERE voter')) return { n: hits.filter((h) => h.voter === a[0] && h.at > a[1]).length };
    if (sql.startsWith('SELECT COUNT(*) AS n FROM subscribe_hits')) return { n: hits.filter((h) => h.at > a[0]).length };
    if (sql.startsWith('INSERT INTO subscribe_hits')) return void hits.push({ voter: a[0], at: a[1] });
    if (sql.startsWith('DELETE FROM subscribe_hits')) return void (hits = hits.filter((h) => h.at >= a[0]));
    if (sql.startsWith('SELECT * FROM subscribers')) return subscribers.get(a[0]) ?? null;
    if (sql.startsWith('INSERT INTO subscribers')) {
      const [email, lang, confirm_token, unsub_token, now] = a;
      return void subscribers.set(email, { email, lang, status: 'pending', confirm_token, unsub_token, created_at: now, confirm_sent_at: now, confirmed_at: null });
    }
    if (sql.startsWith('UPDATE subscribers SET lang')) return void Object.assign(subscribers.get(a[0]), { lang: a[1], confirm_sent_at: a[2] });
    if (sql.startsWith('UPDATE subscribers SET confirm_sent_at = 0')) {
      const r = subscribers.get(a[0]);
      if (r?.status === 'pending') r.confirm_sent_at = 0;
      return;
    }
    if (sql.startsWith('SELECT status FROM subscribers WHERE confirm_token')) return [...subscribers.values()].find((r) => r.confirm_token === a[0]) ?? null;
    if (sql.startsWith('SELECT status FROM subscribers WHERE unsub_token')) return [...subscribers.values()].find((r) => r.unsub_token === a[0]) ?? null;
    if (sql.startsWith("UPDATE subscribers SET status = 'active'")) {
      const r = [...subscribers.values()].find((x) => x.confirm_token === a[0] && x.status === 'pending');
      if (r) Object.assign(r, { status: 'active', confirmed_at: a[1] });
      return;
    }
    if (sql.startsWith('SELECT email FROM subscribers WHERE unsub_token')) return [...subscribers.values()].find((r) => r.unsub_token === a[0]) ?? null;
    if (sql.startsWith("SELECT email FROM subscribers WHERE status = 'pending'")) return [...subscribers.values()].filter((r) => r.status === 'pending' && r.created_at < a[0]);
    if (sql.startsWith('DELETE FROM subscribers WHERE unsub_token')) {
      for (const [email, r] of subscribers) if (r.unsub_token === a[0]) subscribers.delete(email);
      return;
    }
    if (sql.startsWith("DELETE FROM subscribers WHERE status = 'pending'")) {
      for (const [email, r] of subscribers) if (r.status === 'pending' && r.created_at < a[0]) subscribers.delete(email);
      return;
    }
    if (sql.startsWith('DELETE FROM newsletter_sends WHERE email_hash')) {
      for (let i = sends.length - 1; i >= 0; i--) if (sends[i].email_hash === a[0]) sends.splice(i, 1);
      return;
    }
    throw new Error(`the fake D1 does not know: ${sql}`);
  };
  return {
    subscribers,
    sends,
    // D1's batch runs the statements in order, as one transaction
    batch: async (statements) => {
      const out = [];
      for (const s of statements) out.push(await s.run());
      return out;
    },
    addHits: (n, at) => Array.from({ length: n }, (_, i) => hits.push({ voter: `v${i}`, at })),
    prepare: (sql) => ({
      bind: (...args) => ({
        sql,
        first: async () => run(sql, args),
        all: async () => ({ results: run(sql, args) ?? [] }),
        run: async () => {
          run(sql, args);
          return { success: true, meta: { changes: 0 } };
        },
      }),
    }),
  };
}

const ORIGIN = 'https://devandreotti.com';
const post = (body, headers = {}) =>
  new Request(`${ORIGIN}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, 'cf-connecting-ip': '203.0.113.7', ...headers },
    body: JSON.stringify(body),
  });
const get = (path) => new Request(`${ORIGIN}/api/newsletter/${path}`);

describe('newsletter', () => {
  let env;
  let sendMail;
  let NOW;
  const run = (request) => handleNewsletter(request, env, NOW, { sendMail });
  const row = (email) => env.DB.subscribers.get(email);
  const confirmUrl = () => new URL(sendMail.mock.calls.at(-1)[1].text.split('\n').find((l) => l.startsWith('https://')));

  beforeEach(() => {
    NOW = 1_800_000_000_000;
    env = { DB: d1(), SMTP_USER: 'u', SMTP_PASS: 'p' };
    sendMail = vi.fn(async () => undefined);
  });

  it('is off (503) without the database or the SMTP secrets, and says so on /status when on', async () => {
    expect((await handleNewsletter(get('status'), { DB: env.DB }, NOW)).status).toBe(503);
    expect((await handleNewsletter(get('status'), { SMTP_USER: 'u', SMTP_PASS: 'p' }, NOW)).status).toBe(503);
    const res = await run(get('status'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ enabled: true, turnstileSiteKey: null });
  });

  it('is reachable through the worker', async () => {
    const res = await worker.fetch(new Request(`${ORIGIN}/api/newsletter/status`, { headers: {} }), { ...env, ASSETS: { fetch: async () => new Response('') } });
    expect(res.status).toBe(200);
  });

  it('subscribes a new address: a pending row, one confirmation e-mail with the confirm link', async () => {
    const res = await run(post({ email: '  Leitor@Example.COM ', lang: 'en' }));
    expect(await res.json()).toEqual({ ok: true });
    expect(row('leitor@example.com')).toMatchObject({ status: 'pending', lang: 'en', confirmed_at: null });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0][1];
    expect(mail).toMatchObject({ from: 'ricardo@devandreotti.com', to: 'leitor@example.com', subject: 'Confirm your newsletter subscription' });
    expect(mail.html).toContain('Confirm subscription');
    expect(mail.headers).toEqual({ 'Reply-To': 'devandreotti@gmail.com' });
    expect(mail.html).toContain('/privacidade/');
    expect(confirmUrl().pathname).toBe('/api/newsletter/confirm');
    expect(confirmUrl().searchParams.get('l')).toBe('en');
  });

  it('refuses a form from another site, bad e-mails and bad bodies; a filled honeypot gets "ok" and nothing happens', async () => {
    expect((await run(post({ email: 'a@b.co' }, { origin: 'https://evil.example' }))).status).toBe(403);
    for (const email of ['', 'sem-arroba', 'a@b', 'a b@c.com', 'x@y.z', `${'a'.repeat(250)}@b.com`, 42]) {
      expect((await run(post({ email }))).status).toBe(400);
    }
    expect((await run(new Request(`${ORIGIN}/api/newsletter/subscribe`, { method: 'POST', headers: { origin: ORIGIN }, body: 'not json' }))).status).toBe(400);
    expect((await run(new Request(`${ORIGIN}/api/newsletter/subscribe`, { method: 'POST', headers: { origin: ORIGIN }, body: 'null' }))).status).toBe(400);
    expect((await run(new Request(`${ORIGIN}/api/newsletter/subscribe`, { method: 'POST', headers: { origin: ORIGIN }, body: '[1]' }))).status).toBe(400);
    expect((await run(post({ email: 'a@b.co', pad: 'x'.repeat(5000) }))).status).toBe(413);
    const bot = await run(post({ email: 'bot@example.com', website: 'http://spam.example' }));
    expect(await bot.json()).toEqual({ ok: true });
    expect(row('bot@example.com')).toBeUndefined();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('does not send a second confirmation within ten minutes, and sends another after that', async () => {
    await run(post({ email: 'leitor@example.com' }));
    await run(post({ email: 'leitor@example.com' }));
    expect(sendMail).toHaveBeenCalledTimes(1);
    NOW += RESEND_MS;
    await run(post({ email: 'leitor@example.com', lang: 'en' }));
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(row('leitor@example.com').lang).toBe('en');
  });

  it('answers the same for an address that is already active, so the form tells nothing about the list', async () => {
    await run(post({ email: 'leitor@example.com' }));
    await run(get(`confirm?t=${confirmUrl().searchParams.get('t')}&l=pt`));
    sendMail.mockClear();
    const res = await run(post({ email: 'leitor@example.com' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMail).not.toHaveBeenCalled();
    expect(row('leitor@example.com').status).toBe('active');
  });

  it('limits sign-ups per visitor and in total each hour', async () => {
    for (let i = 0; i < RATE_LIMIT; i++) expect((await run(post({ email: `a${i}@example.com` }))).status).toBe(200);
    const blocked = await run(post({ email: 'one-more@example.com' }));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBe('3600');
    // someone else is fine, until the whole site has had its share
    expect((await run(post({ email: 'other@example.com' }, { 'cf-connecting-ip': '198.51.100.9' }))).status).toBe(200);
    env.DB.addHits(GLOBAL_HOURLY_CAP, NOW);
    expect((await run(post({ email: 'late@example.com' }, { 'cf-connecting-ip': '198.51.100.10' }))).status).toBe(429);
  });

  it('keeps a pending row that could not be mailed ready for an immediate retry', async () => {
    sendMail.mockRejectedValueOnce(new Error('smtp: AUTH -> 535'));
    const res = await run(post({ email: 'leitor@example.com' }));
    expect(res.status).toBe(502);
    expect(row('leitor@example.com').confirm_sent_at).toBe(0);
    expect((await run(post({ email: 'leitor@example.com' }))).status).toBe(200);
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it('confirms with the link, once, and rejects tokens that are not real', async () => {
    await run(post({ email: 'leitor@example.com' }));
    const t = confirmUrl().searchParams.get('t');
    const ok = await run(get(`confirm?t=${t}&l=pt`));
    expect(ok.status).toBe(200);
    // the page that carries a token in its URL is not indexed, not cached, not framed, and does not leak that URL
    expect(ok.headers.get('content-security-policy')).toContain("default-src 'none'");
    expect(ok.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(ok.headers.get('referrer-policy')).toBe('no-referrer');
    expect(ok.headers.get('cache-control')).toBe('no-store');
    expect(ok.headers.get('x-robots-tag')).toBe('noindex');
    expect(await ok.text()).toContain('Inscrição confirmada');
    expect(row('leitor@example.com')).toMatchObject({ status: 'active', confirmed_at: NOW });
    expect(await (await run(get(`confirm?t=${t}&l=en`))).text()).toContain('already on the list');
    for (const bad of ['', 'curto', 'x'.repeat(30), '../../etc/passwd']) expect((await run(get(`confirm?t=${bad}`))).status).toBe(404);
  });

  it('unsubscribes only on POST (a GET just asks), deletes the address, and understands the one-click header', async () => {
    await run(post({ email: 'leitor@example.com' }));
    await run(get(`confirm?t=${confirmUrl().searchParams.get('t')}`));
    const unsub = row('leitor@example.com').unsub_token;
    const ask = await run(get(`unsubscribe?t=${unsub}&l=pt`));
    expect(await ask.text()).toContain('Sim, sair da lista');
    expect(row('leitor@example.com').status).toBe('active');

    const oneClick = await run(new Request(`${ORIGIN}/api/newsletter/unsubscribe?t=${unsub}&l=pt`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' }));
    expect(oneClick.status).toBe(200);
    expect(await oneClick.text()).toBe('ok');
    expect(row('leitor@example.com')).toBeUndefined(); // nothing is kept about who left

    // a mail client that asks again still gets a 2xx; a person gets the "you left" page
    const again = await run(new Request(`${ORIGIN}/api/newsletter/unsubscribe?t=${unsub}&l=en`, { method: 'POST' }));
    expect(await again.text()).toContain('You left the list');
    expect((await run(get(`unsubscribe?t=${unsub}`))).status).toBe(404);
    expect((await run(get('unsubscribe?t=nao-existe-nao-existe-1'))).status).toBe(404);
  });

  it('lets someone who left sign up again, with new tokens and a new confirmation', async () => {
    await run(post({ email: 'leitor@example.com' }));
    const before = row('leitor@example.com');
    await run(new Request(`${ORIGIN}/api/newsletter/unsubscribe?t=${before.unsub_token}`, { method: 'POST' }));
    await run(post({ email: 'leitor@example.com' }));
    const after = row('leitor@example.com');
    expect(after.status).toBe('pending');
    expect(after.confirm_token).not.toBe(before.confirm_token);
    expect(after.unsub_token).not.toBe(before.unsub_token);
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it('deletes a sign-up nobody confirmed after a week, and keeps the confirmed ones', async () => {
    await run(post({ email: 'nunca@example.com' }));
    await run(post({ email: 'confirmou@example.com' }));
    await run(get(`confirm?t=${confirmUrl().searchParams.get('t')}`));
    NOW += PENDING_TTL_MS + 1;
    await run(post({ email: 'outro@example.com' }, { 'cf-connecting-ip': '198.51.100.9' }));
    expect(row('nunca@example.com')).toBeUndefined();
    expect(row('confirmou@example.com').status).toBe('active');
  });

  it('deletes the send records of an address with its row: on unsubscribe, and when an unconfirmed sign-up is purged', async () => {
    await run(post({ email: 'leitor@example.com' }));
    await run(get(`confirm?t=${confirmUrl().searchParams.get('t')}`));
    await run(post({ email: 'nunca@example.com' }, { 'cf-connecting-ip': '198.51.100.9' }));
    const leitor = await emailHash('leitor@example.com');
    const nunca = await emailHash('nunca@example.com');
    env.DB.sends.push(
      { issue_id: 'edicao-43', email_hash: leitor, status: 'sent', attempts: 1, updated_at: NOW },
      { issue_id: 'edicao-43', email_hash: nunca, status: 'sent', attempts: 1, updated_at: NOW }
    );

    await run(new Request(`${ORIGIN}/api/newsletter/unsubscribe?t=${row('leitor@example.com').unsub_token}`, { method: 'POST' }));
    expect(env.DB.sends.map((s) => s.email_hash)).toEqual([nunca]);

    NOW += PENDING_TTL_MS + 1;
    await run(post({ email: 'outro@example.com' }, { 'cf-connecting-ip': '198.51.100.10' }));
    expect(row('nunca@example.com')).toBeUndefined();
    expect(env.DB.sends).toEqual([]);
    // the record names no address, only its hash
    expect(JSON.stringify(env.DB.sends)).not.toContain('example.com');
  });

  describe('Turnstile', () => {
    const withTurnstile = () => {
      env.TURNSTILE_SECRET = 'ts-secret';
      env.TURNSTILE_SITEKEY = '0xKEY';
    };
    const verify = (success) => vi.fn(async () => new Response(JSON.stringify({ success }), { status: 200 }));
    const runWith = (request, fetchFn) => handleNewsletter(request, env, NOW, { sendMail, fetch: fetchFn });

    it('offers its public key only when the secret to check it is here too', async () => {
      env.TURNSTILE_SITEKEY = '0xKEY';
      expect(await (await run(get('status'))).json()).toMatchObject({ turnstileSiteKey: null });
      env.TURNSTILE_SECRET = 'ts-secret';
      expect(await (await run(get('status'))).json()).toMatchObject({ turnstileSiteKey: '0xKEY' });
    });

    it('requires a valid token once the secret is set, and sends nothing without it', async () => {
      withTurnstile();
      const no = verify(true);
      expect((await runWith(post({ email: 'a@b.co' }), no)).status).toBe(403);
      expect(no).not.toHaveBeenCalled();
      expect((await runWith(post({ email: 'a@b.co', turnstile: 'bad' }), verify(false))).status).toBe(403);
      expect(sendMail).not.toHaveBeenCalled();

      const good = verify(true);
      expect((await runWith(post({ email: 'a@b.co', turnstile: 'tok' }), good)).status).toBe(200);
      const [, init] = good.mock.calls[0];
      expect(init.body.get('secret')).toBe('ts-secret');
      expect(init.body.get('response')).toBe('tok');
      expect(init.body.get('remoteip')).toBe('203.0.113.7');
      expect(sendMail).toHaveBeenCalledTimes(1);
    });

    it('fails closed when the check itself breaks', async () => {
      withTurnstile();
      const broken = vi.fn(async () => {
        throw new Error('network');
      });
      expect((await runWith(post({ email: 'a@b.co', turnstile: 'tok' }), broken)).status).toBe(403);
      expect((await runWith(post({ email: 'a@b.co', turnstile: 'tok' }), vi.fn(async () => new Response('oops', { status: 500 })))).status).toBe(403);
      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  it('knows its own routes and methods', async () => {
    expect((await run(get('nada'))).status).toBe(404);
    expect((await run(get('subscribe'))).status).toBe(405);
    expect((await run(new Request(`${ORIGIN}/api/newsletter/status`, { method: 'POST' }))).status).toBe(405);
  });
});
