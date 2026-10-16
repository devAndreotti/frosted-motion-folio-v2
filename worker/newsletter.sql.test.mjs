import fs from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import { emailHash, handleNewsletter } from './newsletter.js';

// The SQL in newsletter.js against the REAL migration in a real SQLite, so a column that is not in the table
// (a statement the fake D1 in newsletter.test.mjs would happily accept) fails here. `node:sqlite` needs Node 22+;
// on older Node the suite skips (the CI test job runs Node 20), and it runs wherever Node 22 is.
let DatabaseSync;
try {
  ({ DatabaseSync } = createRequire(import.meta.url)('node:sqlite'));
} catch {
  // no node:sqlite here
}

const ORIGIN = 'https://devandreotti.com';
const post = (body, ip = '203.0.113.7') =>
  new Request(`${ORIGIN}/api/newsletter/subscribe`, { method: 'POST', headers: { 'content-type': 'application/json', origin: ORIGIN, 'cf-connecting-ip': ip }, body: JSON.stringify(body) });

describe.skipIf(!DatabaseSync)('newsletter SQL on a real SQLite', () => {
  const setup = () => {
    const db = new DatabaseSync(':memory:');
    db.exec(fs.readFileSync('worker/migrations/0002_newsletter.sql', 'utf8'));
    db.exec(fs.readFileSync('worker/migrations/0003_newsletter_sends.sql', 'utf8'));
    const DB = {
      prepare: (sql) => {
        const st = db.prepare(sql);
        return {
          bind: (...args) => ({
            first: async () => st.get(...args) ?? null,
            all: async () => ({ results: st.all(...args) }),
            run: async () => (st.run(...args), {}),
          }),
        };
      },
      // D1's batch: the statements in order, one transaction (here: in order, which is what the test needs)
      batch: async (statements) => {
        const out = [];
        for (const s of statements) out.push(await s.run());
        return out;
      },
    };
    const sendMail = vi.fn(async () => undefined);
    const env = { DB, SMTP_USER: 'u', SMTP_PASS: 'p' };
    const call = (request, now = 1_800_000_000_000) => handleNewsletter(request, env, now, { sendMail });
    return { db, sendMail, call };
  };

  it('runs the whole life of a subscription: sign up, confirm, leave, sign up again, purge', async () => {
    const { db, sendMail, call } = setup();
    expect((await call(post({ email: 'leitor@example.com', lang: 'en' }))).status).toBe(200);
    let row = db.prepare('SELECT * FROM subscribers WHERE email = ?').get('leitor@example.com');
    expect(row).toMatchObject({ status: 'pending', lang: 'en' });
    expect(sendMail).toHaveBeenCalledTimes(1);

    expect((await call(new Request(`${ORIGIN}/api/newsletter/confirm?t=${row.confirm_token}&l=en`))).status).toBe(200);
    expect(db.prepare('SELECT status FROM subscribers').get().status).toBe('active');

    const unsub = new Request(`${ORIGIN}/api/newsletter/unsubscribe?t=${row.unsub_token}`, { method: 'POST' });
    expect((await call(unsub)).status).toBe(200);
    expect(db.prepare('SELECT COUNT(*) AS n FROM subscribers').get().n).toBe(0);

    // the same address signs up again: a new pending row, a new confirmation
    expect((await call(post({ email: 'leitor@example.com' }, '198.51.100.1'))).status).toBe(200);
    row = db.prepare('SELECT * FROM subscribers').get();
    expect(row.status).toBe('pending');

    // asked again after the resend window: the ON CONFLICT path of the upsert is not used (the row exists), the UPDATE is
    await call(post({ email: 'leitor@example.com', lang: 'en' }, '198.51.100.2'), 1_800_000_000_000 + 11 * 60_000);
    expect(db.prepare('SELECT lang FROM subscribers').get().lang).toBe('en');
    expect(sendMail).toHaveBeenCalledTimes(3);

    // an unconfirmed sign-up older than a week is purged by the next request
    await call(post({ email: 'novo@example.com' }, '198.51.100.3'), 1_800_000_000_000 + 8 * 24 * 3_600_000);
    expect(db.prepare('SELECT email FROM subscribers').all().map((r) => r.email)).toEqual(['novo@example.com']);
  });

  it('upserts over a stale row without touching columns that are not in the table', async () => {
    const { db, call } = setup();
    // a row for the address already exists but the code path that overwrites it is the INSERT ... ON CONFLICT: force it
    db.prepare("INSERT INTO subscribers (email, lang, status, confirm_token, unsub_token, created_at, confirm_sent_at) VALUES ('a@b.co', 'pt', 'pending', 'c', 'u', 1, 1)").run();
    expect((await call(post({ email: 'a@b.co' }))).status).toBe(200);
    expect(db.prepare('SELECT COUNT(*) AS n FROM subscribers').get().n).toBe(1);
  });

  it('deletes the send records with their row: on unsubscribe, and when an unconfirmed sign-up is purged', async () => {
    const { db, call } = setup();
    const day = 24 * 3_600_000;
    const NOW = 1_800_000_000_000;
    const send = async (email) =>
      db.prepare("INSERT INTO newsletter_sends (issue_id, email_hash, status, attempts, updated_at) VALUES ('edicao-43', ?, 'sent', 1, 1)").run(await emailHash(email));

    await call(post({ email: 'Leitor@example.com', lang: 'pt' }), NOW);
    const { confirm_token, unsub_token } = db.prepare('SELECT confirm_token, unsub_token FROM subscribers').get();
    await call(new Request(`${ORIGIN}/api/newsletter/confirm?t=${confirm_token}&l=pt`), NOW);
    await send('leitor@example.com');
    await call(new Request(`${ORIGIN}/api/newsletter/unsubscribe?t=${unsub_token}`, { method: 'POST' }), NOW);
    expect(db.prepare('SELECT COUNT(*) AS n FROM newsletter_sends').get().n).toBe(0);
    expect(db.prepare('SELECT COUNT(*) AS n FROM subscribers').get().n).toBe(0);

    // a sign-up nobody confirmed, with a send record (not possible in the app, but the purge must still take it)
    await call(post({ email: 'velho@example.com' }, '198.51.100.4'), NOW);
    await send('velho@example.com');
    await call(post({ email: 'novo@example.com' }, '198.51.100.5'), NOW + 8 * day);
    expect(db.prepare('SELECT COUNT(*) AS n FROM newsletter_sends').get().n).toBe(0);
    expect(db.prepare('SELECT email FROM subscribers').all().map((r) => r.email)).toEqual(['novo@example.com']);
  });
});
