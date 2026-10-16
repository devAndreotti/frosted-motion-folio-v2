// Admin API for the private Tower panel: /api/admin/newsletter/<action>
//   GET  stats               -> { active, pending, by_lang: { pt, en }, confirmed_7d, created_7d }
//   POST lookup  {"email"}   -> { found: false } or { found: true, subscriber } (never the tokens)
//   POST delete  {"email"}   -> { deleted: true | false } (the subscriber's send records go with it)
//   POST resend  {"email"}   -> { sent: true, reason: null } or { sent: false, reason: "active" | "not_found" | "too_soon" }
//   POST preview {"issue"}   -> { pt: { subject, html, text }, en: { ... } } for the languages present; nothing sent or written
//   POST send    {"issue_id", "issue", "test_to"?, "limit"?}
//        with test_to: one copy of the issue to that address, subject prefixed "[TESTE] ", nothing recorded
//        without:      one batch of at most `limit` (1..20, default 10) active readers who have no `sent` row for issue_id
//        -> { sent, failed, remaining, total } (remaining and total are null for a test)
// The two issue actions take a body of up to 64 KB, the others 2 KB. The issue shape is the devandreotti one
// (scripts/newsletter/template.mjs), with https links only.
// Without TOWER_ADMIN_TOKEN (or one shorter than 32 characters) every admin path answers 404, as if it did not
// exist. Callers send `Authorization: Bearer <token>`; the comparison goes through SHA-256 digests in constant time.
// Nothing here logs an e-mail address or a token.
import { EMAIL, FROM, RESEND_MS, SENDER_NAME, configured, confirmationMail, emailHash, forgetSendsStatement } from './newsletter.js';
import { REPLY_TO, SITE_URL, renderNewsletter } from '../scripts/newsletter/template.mjs';
import { sendMail as smtpSend } from './smtp.js';

const PREFIX = '/api/admin/newsletter/';
const MIN_TOKEN = 32;
const MAX_BODY = 2048;
const MAX_ISSUE_BODY = 65536;
const MAX_ATTEMPTS = 3;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const ISSUE_ID = /^[A-Za-z0-9-]{8,64}$/;
const LANGS = ['pt', 'en'];
// the unsubscribe link of a preview or a test: a token that is on no list
const EXAMPLE_TOKEN = 'exemplo-de-previa';
const WEEK_MS = 7 * 24 * 3_600_000;
const METHODS = new Map([
  ['stats', ['GET']],
  ['lookup', ['POST']],
  ['delete', ['POST']],
  ['resend', ['POST']],
  ['preview', ['POST']],
  ['send', ['POST']],
]);
const ISSUE_ACTIONS = new Set(['preview', 'send']);

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
}

const notFound = () => json({ error: 'not found' }, 404);
const badRequest = () => json({ error: 'bad request' }, 400);
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

/** The JSON object of a request body of at most `max` bytes, or null for anything else. */
async function jsonBody(request, max) {
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return null;
  if (Number(request.headers.get('content-length') ?? 0) > max) return null;
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > max) return null;
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return null;
  }
  return body === null || typeof body !== 'object' || Array.isArray(body) ? null : body;
}

/** The lower-cased e-mail of a small JSON body, or null for anything else. */
async function emailFrom(request) {
  const body = await jsonBody(request, MAX_BODY);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
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
  // one transaction: the address and every send record under its hash go together
  const [, deletion] = await env.DB.batch([await forgetSendsStatement(env, email), env.DB.prepare('DELETE FROM subscribers WHERE email = ?1').bind(email)]);
  return json({ deleted: Number(deletion?.meta?.changes ?? 0) > 0 });
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

// ---- issues: preview and send ----

const str = (value, max = 2000) => typeof value === 'string' && value.length <= max;
const nonEmpty = (value, max) => str(value, max) && value.trim() !== '';
const int = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function httpsUrl(value) {
  if (!str(value)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

const validPost = (p) =>
  isObject(p) &&
  nonEmpty(p.title, 300) &&
  str(p.description) &&
  int(p.minutes, 0, 999) &&
  Array.isArray(p.tags) &&
  p.tags.length <= 10 &&
  p.tags.every((t) => str(t, 50)) &&
  httpsUrl(p.url);

const validLink = (l) => isObject(l) && str(l.title, 300) && str(l.note) && httpsUrl(l.url);

/** One language of an issue, as the devandreotti newsletter takes it (scripts/newsletter/template.mjs, plus the subject). */
const validLang = (v) =>
  isObject(v) &&
  nonEmpty(v.subject, 150) &&
  int(v.week, 0, 9999) &&
  str(v.range, 100) &&
  str(v.intro) &&
  Array.isArray(v.posts) &&
  v.posts.length >= 1 &&
  v.posts.length <= 20 &&
  v.posts.every(validPost) &&
  (v.behind === undefined || str(v.behind)) &&
  (v.links === undefined || (Array.isArray(v.links) && v.links.length <= 20 && v.links.every(validLink)));

/** The languages present in an issue (at least one), or null when the issue is malformed. */
function issueLangs(issue) {
  if (!isObject(issue)) return null;
  const present = LANGS.filter((lang) => issue[lang] !== undefined);
  return present.length > 0 && present.every((lang) => validLang(issue[lang])) ? present : null;
}

const unsubscribeUrl = (origin, token, lang) => `${origin}/api/newsletter/unsubscribe?t=${token}&l=${lang}`;
const otherLangUrl = (lang) => `${SITE_URL}/?lang=${lang === 'pt' ? 'en' : 'pt'}`;

/** One language of an issue as one reader gets it: subject, html, text, and the link out of that reader's list. */
function compose(issue, lang, origin, token) {
  const { subject, ...body } = issue[lang];
  const link = unsubscribeUrl(origin, token, lang);
  const { html, text } = renderNewsletter({ ...body, lang, unsubscribeUrl: link, otherLangUrl: otherLangUrl(lang), siteUrl: SITE_URL });
  return { subject, html, text, unsubscribeUrl: link };
}

/** The message: From and Reply-To like the confirmation mail, and the one-click unsubscribe headers (RFC 8058). */
function outgoing(to, subject, mail) {
  return {
    from: FROM,
    fromName: SENDER_NAME,
    to,
    subject,
    text: mail.text,
    html: mail.html,
    headers: { 'Reply-To': REPLY_TO, 'List-Unsubscribe': `<${mail.unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}

function preview(request, issue, langs) {
  const origin = new URL(request.url).origin;
  return json(
    Object.fromEntries(
      langs.map((lang) => {
        const { subject, html, text } = compose(issue, lang, origin, EXAMPLE_TOKEN);
        return [lang, { subject, html, text }];
      })
    )
  );
}

async function sendTest(request, env, issue, langs, to, deps) {
  const origin = new URL(request.url).origin;
  let sent = 0;
  let failed = 0;
  for (const lang of langs) {
    try {
      const mail = compose(issue, lang, origin, EXAMPLE_TOKEN);
      await deps.sendMail(env, outgoing(to, `[TESTE] ${mail.subject}`, mail));
      sent++;
    } catch {
      failed++;
      console.error('admin: test newsletter mail failed');
    }
  }
  return json({ sent, failed, remaining: null, total: null });
}

async function sendBatch(request, env, now, deps, issue, langs, issueId, limit) {
  if (langs.length !== LANGS.length) return badRequest();
  const origin = new URL(request.url).origin;
  const active = (await env.DB.prepare("SELECT email, lang, unsub_token FROM subscribers WHERE status = 'active' ORDER BY confirmed_at, email").all())?.results ?? [];
  // the sends are keyed by the hash of the address, which only the worker can compute: so the readers are hashed here
  const readers = await Promise.all(active.map(async (row) => ({ ...row, hash: await emailHash(row.email) })));
  const rows = (await env.DB.prepare('SELECT email_hash, status, attempts FROM newsletter_sends WHERE issue_id = ?1').bind(issueId).all())?.results ?? [];
  const state = new Map(rows.map((r) => [r.email_hash, { status: r.status, attempts: Number(r.attempts) }]));
  // a reader can still be tried when nothing was tried yet, or when the server refused the mail and fewer than
  // MAX_ATTEMPTS went out. A `sending` row (the send died mid-way, outcome unknown) is never tried again: a lost
  // mail is better than a doubled one. Such readers, and `sent` ones, and exhausted ones, are not "remaining".
  const tryable = (reader) => {
    const s = state.get(reader.hash);
    return !s || (s.status === 'failed' && s.attempts < MAX_ATTEMPTS);
  };
  const due = readers.filter(tryable).slice(0, limit);

  let sent = 0;
  let failed = 0;
  for (const reader of due) {
    const attempts = (state.get(reader.hash)?.attempts ?? 0) + 1;
    await env.DB.prepare(
      "INSERT INTO newsletter_sends (issue_id, email_hash, status, attempts, updated_at) VALUES (?1, ?2, 'sending', 1, ?3) ON CONFLICT (issue_id, email_hash) DO UPDATE SET status = 'sending', attempts = attempts + 1, updated_at = ?3"
    )
      .bind(issueId, reader.hash, now)
      .run();
    let status = 'sent';
    try {
      const mail = compose(issue, reader.lang === 'en' ? 'en' : 'pt', origin, reader.unsub_token);
      await deps.sendMail(env, outgoing(reader.email, mail.subject, mail));
    } catch {
      status = 'failed';
      console.error('admin: newsletter mail failed');
    }
    await env.DB.prepare('UPDATE newsletter_sends SET status = ?3, updated_at = ?4 WHERE issue_id = ?1 AND email_hash = ?2').bind(issueId, reader.hash, status, now).run();
    state.set(reader.hash, { status, attempts });
    if (status === 'sent') sent++;
    else failed++;
  }
  return json({ sent, failed, remaining: readers.filter(tryable).length, total: readers.length });
}

async function issueAction(request, env, now, deps, action) {
  const body = await jsonBody(request, MAX_ISSUE_BODY);
  const langs = body ? issueLangs(body.issue) : null;
  if (!langs) return badRequest();
  if (action === 'preview') return preview(request, body.issue, langs);

  const limit = body.limit === undefined ? DEFAULT_LIMIT : body.limit;
  if (typeof body.issue_id !== 'string' || !ISSUE_ID.test(body.issue_id) || !int(limit, 1, MAX_LIMIT)) return badRequest();
  if (body.test_to !== undefined) {
    const to = typeof body.test_to === 'string' ? body.test_to.trim().toLowerCase() : '';
    if (to.length > 254 || !EMAIL.test(to)) return badRequest();
    return sendTest(request, env, body.issue, langs, to, deps);
  }
  return sendBatch(request, env, now, deps, body.issue, langs, body.issue_id, limit);
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
  if ((action === 'resend' || ISSUE_ACTIONS.has(action)) && !configured(env)) return json({ error: 'mail is off on this host' }, 503);

  if (action === 'stats') return stats(env, now);
  if (ISSUE_ACTIONS.has(action)) return issueAction(request, env, now, deps, action);
  const email = await emailFrom(request);
  if (email === null) return badRequest();
  if (action === 'lookup') return lookup(env, email);
  if (action === 'delete') return remove(env, email);
  return resend(request, env, now, deps, email);
}
