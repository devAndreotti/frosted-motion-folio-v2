// Newsletter sign-up: /api/newsletter/*
//   GET  /status        -> { enabled: true }         (404/503 where there is no database or no mail: the form hides)
//   POST /subscribe     -> { ok: true }              body { email, lang, website } (website = honeypot)
//   GET  /confirm?t=&l= -> page                      the link in the confirmation e-mail (double opt-in)
//   GET  /unsubscribe?t=&l= -> page with a button    (a mail scanner opening the link must not unsubscribe anyone)
//   POST /unsubscribe?t=&l= -> page, or 200 for the one-click header (RFC 8058: List-Unsubscribe-Post)
// The answer to /subscribe is the same for a new, a pending, an active and a removed address, so the
// form can't be used to find out who is on the list. A confirmation goes out only once every
// RESEND_MS per address and RATE_LIMIT attempts an hour per visitor, so it can't be used to flood
// someone's inbox either. Without the DB binding or the SMTP secrets everything answers 503.
import { renderConfirmation } from '../scripts/newsletter/template.mjs';
import { sendMail as smtpSend } from './smtp.js';

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const TOKEN = /^[A-Za-z0-9_-]{20,64}$/;
export const RATE_LIMIT = 5;
export const GLOBAL_HOURLY_CAP = 300;
export const RESEND_MS = 10 * 60_000;
const HOUR_MS = 3_600_000;
const FROM = 'ricardo@devandreotti.com';

const lang = (value) => (value === 'en' ? 'en' : 'pt');

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
}

const COPY = {
  pt: {
    confirmed: ['Inscrição confirmada', 'Pronto. A newsletter chega toda segunda-feira, neste e-mail.'],
    already: ['Você já está na lista', 'Esta inscrição já estava confirmada.'],
    invalid: ['Link inválido', 'Este link não funciona mais ou já foi usado. Tente se inscrever de novo.'],
    unsubAsk: ['Sair da lista?', 'Você deixa de receber a newsletter de devandreotti.com.'],
    unsubButton: 'Sim, sair da lista',
    unsubDone: ['Você saiu da lista', 'Não vou mais enviar a newsletter para este e-mail. Volte quando quiser.'],
    home: 'Voltar ao site',
  },
  en: {
    confirmed: ['Subscription confirmed', 'Done. The newsletter arrives every Monday, at this address.'],
    already: ['You are already on the list', 'This subscription was already confirmed.'],
    invalid: ['Invalid link', 'This link no longer works or was already used. Try signing up again.'],
    unsubAsk: ['Leave the list?', 'You stop receiving the devandreotti.com newsletter.'],
    unsubButton: 'Yes, unsubscribe',
    unsubDone: ['You left the list', 'I will not send the newsletter to this address anymore. Come back anytime.'],
    home: 'Back to the site',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A small page in the site's look (glass card, light/dark by the visitor's system) for the links that come from e-mails. */
export function notice(l, [title, text], { form, status = 200 } = {}) {
  const c = COPY[l];
  const html = `<!doctype html><html lang="${l === 'en' ? 'en' : 'pt-BR'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><meta name="color-scheme" content="light dark"><title>${esc(title)} — Ricardo A. Gonçalves</title>
<style>
:root{--bg:#f5f5f6;--fg:#131316;--fg2:rgba(19,19,22,.7);--card:rgba(255,255,255,.7);--line:rgba(19,19,22,.12);--btn:#18181b;--btnfg:#fafafa}
@media (prefers-color-scheme:dark){:root{--bg:#0a0a0a;--fg:#f5f5f5;--fg2:rgba(255,255,255,.7);--card:rgba(255,255,255,.07);--line:rgba(255,255,255,.18);--btn:#e4e4e7;--btnfg:#0a0a0a}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--bg);color:var(--fg);font:16px/1.6 'Geist',system-ui,-apple-system,'Segoe UI',sans-serif}
main{width:min(460px,100%);padding:32px;border-radius:24px;border:1px solid var(--line);background:var(--card);backdrop-filter:blur(18px)}
h1{margin:0 0 8px;font-size:24px;letter-spacing:-.02em}p{margin:0 0 22px;color:var(--fg2)}
a.btn,button{display:inline-block;padding:11px 22px;border:0;border-radius:999px;background:var(--btn);color:var(--btnfg);font:600 14px/1 inherit;text-decoration:none;cursor:pointer}
a.link{margin-left:14px;color:var(--fg2);font-size:14px}
</style></head><body><main><h1>${esc(title)}</h1><p>${esc(text)}</p>
${form ? `<form method="post" action="${esc(form)}"><button type="submit">${esc(c.unsubButton)}</button><a class="link" href="/">${esc(c.home)}</a></form>` : `<a class="btn" href="/">${esc(c.home)}</a>`}
</main></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}

const token = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** The visitor for the rate limit: SHA-256 of the network (IPv4, or IPv6 /64) and a salt -- no IP is stored. */
async function visitor(request, env) {
  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const net = ip.includes(':') ? ip.split(':').slice(0, 4).join(':') : ip;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${net}\n${env.LIKES_SALT ?? 'devandreotti-newsletter'}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const configured = (env) => Boolean(env.DB && env.SMTP_USER && env.SMTP_PASS);

async function confirmationMail(origin, row) {
  const confirmUrl = `${origin}/api/newsletter/confirm?t=${row.confirm_token}&l=${row.lang}`;
  const { html, text, subject } = renderConfirmation({ lang: row.lang, confirmUrl });
  return { from: FROM, fromName: 'Ricardo A. Gonçalves', to: row.email, subject, text, html };
}

async function subscribe(request, env, now, deps) {
  const url = new URL(request.url);
  if (request.headers.get('origin') !== url.origin) return json({ error: 'forbidden' }, 403);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }
  // a hidden field no person fills: a bot that does gets the same "ok" and nothing happens
  if (typeof body?.website === 'string' && body.website !== '') return json({ ok: true });
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL.test(email)) return json({ error: 'email' }, 400);
  const l = lang(body.lang);

  const who = await visitor(request, env);
  const mine = await env.DB.prepare('SELECT COUNT(*) AS n FROM subscribe_hits WHERE voter = ?1 AND at > ?2').bind(who, now - HOUR_MS).first();
  if (Number(mine?.n ?? 0) >= RATE_LIMIT) return json({ error: 'too many' }, 429, { 'retry-after': '3600' });
  const all = await env.DB.prepare('SELECT COUNT(*) AS n FROM subscribe_hits WHERE at > ?1').bind(now - HOUR_MS).first();
  if (Number(all?.n ?? 0) >= GLOBAL_HOURLY_CAP) return json({ error: 'busy' }, 429, { 'retry-after': '3600' });
  await env.DB.prepare('INSERT INTO subscribe_hits (voter, at) VALUES (?1, ?2)').bind(who, now).run();
  // old attempts are only needed for the last hour
  await env.DB.prepare('DELETE FROM subscribe_hits WHERE at < ?1').bind(now - 2 * HOUR_MS).run();

  const row = await env.DB.prepare('SELECT * FROM subscribers WHERE email = ?1').bind(email).first();
  let send = null;
  if (!row || row.status === 'unsubscribed') {
    send = { email, lang: l, confirm_token: token(), unsub_token: token() };
    await env.DB.prepare(
      `INSERT INTO subscribers (email, lang, status, confirm_token, unsub_token, created_at, confirm_sent_at)
       VALUES (?1, ?2, 'pending', ?3, ?4, ?5, ?5)
       ON CONFLICT(email) DO UPDATE SET lang = ?2, status = 'pending', confirm_token = ?3, unsub_token = ?4, created_at = ?5, confirm_sent_at = ?5, confirmed_at = NULL, unsubscribed_at = NULL`
    )
      .bind(send.email, send.lang, send.confirm_token, send.unsub_token, now)
      .run();
  } else if (row.status === 'pending' && now - row.confirm_sent_at >= RESEND_MS) {
    send = { ...row, lang: l };
    await env.DB.prepare('UPDATE subscribers SET lang = ?2, confirm_sent_at = ?3 WHERE email = ?1').bind(email, l, now).run();
  }
  // an active address (or a pending one asked again too soon): same answer, no e-mail
  if (!send) return json({ ok: true });

  try {
    await deps.sendMail(env, await confirmationMail(url.origin, send));
  } catch (error) {
    console.error('newsletter: confirmation e-mail failed', String(error?.message ?? error).slice(0, 200));
    // let the next attempt send at once instead of waiting out RESEND_MS
    await env.DB.prepare("UPDATE subscribers SET confirm_sent_at = 0 WHERE email = ?1 AND status = 'pending'").bind(email).run();
    return json({ error: 'mail' }, 502);
  }
  return json({ ok: true });
}

async function confirm(url, env, now) {
  const l = lang(url.searchParams.get('l'));
  const t = url.searchParams.get('t') ?? '';
  if (!TOKEN.test(t)) return notice(l, COPY[l].invalid, { status: 404 });
  const row = await env.DB.prepare('SELECT status FROM subscribers WHERE confirm_token = ?1').bind(t).first();
  if (!row || row.status === 'unsubscribed') return notice(l, COPY[l].invalid, { status: 404 });
  if (row.status === 'active') return notice(l, COPY[l].already);
  await env.DB.prepare("UPDATE subscribers SET status = 'active', confirmed_at = ?2 WHERE confirm_token = ?1 AND status = 'pending'").bind(t, now).run();
  return notice(l, COPY[l].confirmed);
}

async function unsubscribe(request, url, env, now) {
  const l = lang(url.searchParams.get('l'));
  const t = url.searchParams.get('t') ?? '';
  if (!TOKEN.test(t)) return notice(l, COPY[l].invalid, { status: 404 });
  const row = await env.DB.prepare('SELECT status FROM subscribers WHERE unsub_token = ?1').bind(t).first();
  if (!row) return notice(l, COPY[l].invalid, { status: 404 });
  if (request.method === 'GET') return notice(l, COPY[l].unsubAsk, { form: `${url.pathname}${url.search}` });
  await env.DB.prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ?2 WHERE unsub_token = ?1 AND status != 'unsubscribed'").bind(t, now).run();
  // the one-click request of a mail client (List-Unsubscribe-Post) only needs a 2xx
  if ((request.headers.get('content-type') ?? '').includes('x-www-form-urlencoded') && (await request.clone().text()).includes('List-Unsubscribe=One-Click')) {
    return new Response('ok', { status: 200, headers: { 'cache-control': 'no-store' } });
  }
  return notice(l, COPY[l].unsubDone);
}

export async function handleNewsletter(request, env, now = Date.now(), deps = { sendMail: smtpSend }) {
  const url = new URL(request.url);
  const action = url.pathname.slice('/api/newsletter/'.length).replace(/\/$/, '');
  const methods = { status: ['GET'], subscribe: ['POST'], confirm: ['GET'], unsubscribe: ['GET', 'POST'] }[action];
  if (!methods) return json({ error: 'not found' }, 404);
  if (!methods.includes(request.method)) return new Response(null, { status: 405, headers: { allow: methods.join(', '), 'cache-control': 'no-store' } });
  if (!configured(env)) return json({ error: 'newsletter is off on this host' }, 503);
  if (action === 'status') return json({ enabled: true });
  if (action === 'subscribe') return subscribe(request, env, now, deps);
  if (action === 'confirm') return confirm(url, env, now);
  return unsubscribe(request, url, env, now);
}
