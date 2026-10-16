// Admin API for the private Tower panel: /api/admin/newsletter/<action>
//   GET  stats               -> { active, pending, by_lang: { pt, en }, confirmed_7d, created_7d }
//   POST lookup  {"email"}   -> { found: false } or { found: true, subscriber } (never the tokens)
//   POST delete  {"email"}   -> { deleted: true | false }
//   POST resend  {"email"}   -> { sent: true, reason: null } or { sent: false, reason: "active" | "not_found" | "too_soon" }
// Without TOWER_ADMIN_TOKEN (or one shorter than 32 characters) every admin path answers 404, as if it did not
// exist. Callers send `Authorization: Bearer <token>`; the comparison goes through SHA-256 digests in constant time.
// Nothing here logs an e-mail address or a token.
import { EMAIL, RESEND_MS, configured, confirmationMail } from './newsletter.js';
import { sendMail as smtpSend } from './smtp.js';

const PREFIX = '/api/admin/newsletter/';
const MIN_TOKEN = 32;
const MAX_BODY = 2048;
const WEEK_MS = 7 * 24 * 3_600_000;
const METHODS = new Map([
  ['stats', ['GET']],
  ['lookup', ['POST']],
  ['delete', ['POST']],
  ['resend', ['POST']],
]);

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
}

const notFound = () => json({ error: 'not found' }, 404);
const iso = (ms) => (ms === null || ms === undefined ? null : new Date(ms).toISOString());

async function digest(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

/** True when the Authorization header carries the secret. Both sides are hashed, and every byte is compared (no early exit). */
async function authorized(request, secret) {
  const match = /^Bearer (.+)$/.exec(request.headers.get('authorization') ?? '');
  const given = await digest(match ? match[1] : '');
  const expected = await digest(secret);
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given[i] ^ expected[i];
  return diff === 0;
}

/** The lower-cased e-mail of a JSON body of at most MAX_BODY bytes, or null for anything else. */
async function emailFrom(request) {
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return null;
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) return null;
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY) return null;
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return null;
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return null;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  return email.length <= 254 && EMAIL.test(email) ? email : null;
}

async function stats(env, now) {
  const count = async (sql, ...args) => Number((await env.DB.prepare(sql).bind(...args).first())?.n ?? 0);
  const since = now - WEEK_MS;
  const byLang = { pt: 0, en: 0 };
  const groups = await env.DB.prepare("SELECT lang, COUNT(*) AS n FROM subscribers WHERE status = 'active' GROUP BY lang").all();
  for (const row of groups?.results ?? []) if (Object.hasOwn(byLang, row.lang)) byLang[row.lang] = Number(row.n);
  return json({
    active: await count("SELECT COUNT(*) AS n FROM subscribers WHERE status = 'active'"),
    pending: await count("SELECT COUNT(*) AS n FROM subscribers WHERE status = 'pending'"),
    by_lang: byLang,
    confirmed_7d: await count('SELECT COUNT(*) AS n FROM subscribers WHERE confirmed_at >= ?1', since),
    created_7d: await count('SELECT COUNT(*) AS n FROM subscribers WHERE created_at >= ?1', since),
  });
}

async function lookup(env, email) {
  const row = await env.DB.prepare(
    'SELECT email, lang, status, created_at, confirmed_at, confirm_sent_at FROM subscribers WHERE email = ?1'
  )
    .bind(email)
    .first();
  if (!row) return json({ found: false });
  return json({
    found: true,
    subscriber: {
      email: row.email,
      lang: row.lang,
      status: row.status,
      created_at: iso(row.created_at),
      confirmed_at: iso(row.confirmed_at),
      // 0 means the last send failed: nothing was sent at a time worth showing
      confirm_sent_at: row.confirm_sent_at ? iso(row.confirm_sent_at) : null,
    },
  });
}

async function remove(env, email) {
  const res = await env.DB.prepare('DELETE FROM subscribers WHERE email = ?1').bind(email).run();
  return json({ deleted: Number(res?.meta?.changes ?? 0) > 0 });
}

async function resend(request, env, now, deps, email) {
  const row = await env.DB.prepare('SELECT email, lang, status, confirm_token, confirm_sent_at FROM subscribers WHERE email = ?1').bind(email).first();
  if (!row) return json({ sent: false, reason: 'not_found' });
  if (row.status === 'active') return json({ sent: false, reason: 'active' });
  if (now - row.confirm_sent_at < RESEND_MS) return json({ sent: false, reason: 'too_soon' });

  await env.DB.prepare("UPDATE subscribers SET confirm_sent_at = ?2 WHERE email = ?1 AND status = 'pending'").bind(email, now).run();
  try {
    await deps.sendMail(env, await confirmationMail(new URL(request.url).origin, row));
  } catch {
    // like the public flow: the next attempt may send at once instead of waiting out RESEND_MS
    await env.DB.prepare("UPDATE subscribers SET confirm_sent_at = 0 WHERE email = ?1 AND status = 'pending'").bind(email).run();
    console.error('admin: confirmation e-mail failed');
    return json({ error: 'mail' }, 502);
  }
  return json({ sent: true, reason: null });
}

export async function handleAdmin(request, env, now = Date.now(), deps = { sendMail: smtpSend }) {
  const secret = env.TOWER_ADMIN_TOKEN;
  if (typeof secret !== 'string' || secret.length < MIN_TOKEN) return notFound();

  const path = new URL(request.url).pathname;
  const action = path.startsWith(PREFIX) ? path.slice(PREFIX.length).replace(/\/$/, '') : '';
  if (!(await authorized(request, secret))) return json({ error: 'unauthorized' }, 401, { 'www-authenticate': 'Bearer' });

  const methods = METHODS.get(action);
  if (!methods) return notFound();
  if (!methods.includes(request.method)) return json({ error: 'method not allowed' }, 405, { allow: methods.join(', ') });
  if (!env.DB) return json({ error: 'database is off on this host' }, 503);
  if (action === 'resend' && !configured(env)) return json({ error: 'mail is off on this host' }, 503);

  if (action === 'stats') return stats(env, now);
  const email = await emailFrom(request);
  if (email === null) return json({ error: 'bad request' }, 400);
  if (action === 'lookup') return lookup(env, email);
  if (action === 'delete') return remove(env, email);
  return resend(request, env, now, deps, email);
}
