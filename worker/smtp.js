// A small SMTP client for the Worker: sends the newsletter's confirmation e-mail through
// Oracle Email Delivery (port 587, STARTTLS, AUTH PLAIN) with cloudflare:sockets, so the reader
// gets it at once and nothing else has to be running. The only secrets are SMTP_USER/SMTP_PASS,
// a credential that can do nothing but send mail.
import { connect as cloudflareConnect } from 'cloudflare:sockets';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** base64 of a UTF-8 string, safe for long text (no spread of a huge array). */
export function b64(text) {
  const bytes = typeof text === 'string' ? encoder.encode(text) : text;
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

const wrap = (base64) => base64.replace(/.{1,76}/g, '$&\r\n').trimEnd();

/** RFC 2047 encoded-word for a header value with non-ASCII text. */
export const encodeHeader = (text) => (/^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${b64(text)}?=`);

/** A line that starts with "." would end the DATA early: SMTP doubles it. */
export const dotStuff = (body) => body.replace(/^\./gm, '..');

/**
 * message = { from, fromName?, to, subject, text, html, headers? }
 * Returns the whole RFC 5322 message with CRLF line ends: multipart/alternative, both parts in base64.
 */
export function buildMessage(message, { now = new Date(), boundary = `b_${crypto.randomUUID().replace(/-/g, '')}` } = {}) {
  const domain = message.from.split('@')[1];
  const from = message.fromName ? `${encodeHeader(message.fromName)} <${message.from}>` : message.from;
  const head = [
    `From: ${from}`,
    `To: ${message.to}`,
    `Subject: ${encodeHeader(message.subject)}`,
    `Date: ${now.toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    ...Object.entries(message.headers ?? {}).map(([k, v]) => `${k}: ${v}`),
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const part = (type, content) => [`--${boundary}`, `Content-Type: ${type}; charset=UTF-8`, 'Content-Transfer-Encoding: base64', '', wrap(b64(content))];
  return [...head, '', ...part('text/plain', message.text), ...part('text/html', message.html), `--${boundary}--`, ''].join('\r\n');
}

/** Reads one reply (it may span lines "250-..." until "250 ..."); returns { code, text }. */
async function readReply(session) {
  for (;;) {
    const lines = session.buffer.split('\r\n');
    // a reply is complete once a line "ddd text" (no dash) is followed by the line end
    const end = lines.findIndex((line, i) => i < lines.length - 1 && /^\d{3} /.test(line));
    if (end >= 0) {
      const used = lines.slice(0, end + 1);
      session.buffer = lines.slice(end + 1).join('\r\n');
      return { code: Number(used[end].slice(0, 3)), text: used.map((l) => l.slice(4)).join('\n') };
    }
    const { value, done } = await session.reader.read();
    if (done) throw new Error('smtp: connection closed');
    session.buffer += decoder.decode(value, { stream: true });
  }
}

/** `label` is what an error names: never the line itself, which can carry the credentials or the whole message. */
async function command(session, line, expect, label) {
  if (line !== null) await session.writer.write(encoder.encode(`${line}\r\n`));
  const reply = await readReply(session);
  if (!expect.includes(reply.code)) throw new Error(`smtp: ${label} -> ${reply.code} ${reply.text.slice(0, 120)}`);
  return reply;
}

function attach(session, socket) {
  session.socket = socket;
  session.reader = socket.readable.getReader();
  session.writer = socket.writable.getWriter();
}

function detach(session) {
  session.reader.releaseLock();
  session.writer.releaseLock();
}

/** Sends one message. `connect` can be replaced in tests. Throws on any SMTP error. */
export async function sendMail(env, message, { connect = cloudflareConnect, now } = {}) {
  const host = env.SMTP_HOST || 'smtp.email.eu-amsterdam-1.oci.oraclecloud.com';
  const port = Number(env.SMTP_PORT || 587);
  const session = { buffer: '' };
  attach(session, connect({ hostname: host, port }, { secureTransport: 'starttls', allowHalfOpen: false }));
  try {
    await command(session, null, [220], 'greeting');
    await command(session, 'EHLO devandreotti.com', [250], 'EHLO');
    await command(session, 'STARTTLS', [220], 'STARTTLS');
    detach(session);
    attach(session, session.socket.startTls());
    await command(session, 'EHLO devandreotti.com', [250], 'EHLO');
    // Oracle Email Delivery takes AUTH PLAIN (it answers "504 mechanism not supported" to AUTH LOGIN)
    await command(session, `AUTH PLAIN ${b64(`\0${env.SMTP_USER}\0${env.SMTP_PASS}`)}`, [235], 'AUTH');
    await command(session, `MAIL FROM:<${message.from}>`, [250], 'MAIL FROM');
    await command(session, `RCPT TO:<${message.to}>`, [250, 251], 'RCPT TO');
    await command(session, 'DATA', [354], 'DATA');
    await command(session, `${dotStuff(buildMessage(message, { now }))}\r\n.`, [250], 'message body');
    await command(session, 'QUIT', [221], 'QUIT').catch(() => undefined);
  } finally {
    try {
      detach(session);
      await session.socket.close();
    } catch {
      // the connection is already gone
    }
  }
}
