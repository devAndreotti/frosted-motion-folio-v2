import { describe, expect, it } from 'vitest';
import { b64, buildMessage, dotStuff, encodeHeader, sendMail } from './smtp.js';

const message = { from: 'ricardo@devandreotti.com', fromName: 'Ricardo A. Gonçalves', to: 'leitor@example.com', subject: 'Confirme sua inscrição', text: 'texto\n.linha com ponto', html: '<p>html é bom</p>' };

/** A scripted SMTP server: `rules` maps what the client sent to the reply the server gives. */
function fakeConnect({ auth = '235 ok', rcpt = '250 ok', failAt } = {}) {
  const log = [];
  const enc = new TextEncoder();
  let controller;
  let data = null;
  let buffer = '';
  const readable = new ReadableStream({ start: (c) => (controller = c) });
  const say = (text) => controller.enqueue(enc.encode(`${text}\r\n`));
  const reply = (line) => {
    if (failAt && line.startsWith(failAt)) return say('554 refused');
    if (line.startsWith('EHLO')) return say('250-smtp.test\r\n250-STARTTLS\r\n250 AUTH PLAIN');
    if (line === 'STARTTLS') return say('220 go ahead');
    if (line.startsWith('AUTH PLAIN ')) return say(auth);
    if (line.startsWith('AUTH')) return say('504 The requested authentication mechanism is not supported');
    if (line.startsWith('MAIL FROM')) return say('250 ok');
    if (line.startsWith('RCPT TO')) return say(rcpt);
    if (line === 'DATA') return say('354 go');
    if (line === 'QUIT') return say('221 bye');
  };
  const socket = {
    readable,
    writable: new WritableStream({
      write(chunk) {
        buffer += new TextDecoder().decode(chunk);
        while (true) {
          if (data !== null) {
            const end = buffer.indexOf('\r\n.\r\n');
            if (end < 0) return;
            data = buffer.slice(0, end);
            log.push('<data>');
            socket.data = data;
            buffer = buffer.slice(end + 5);
            data = null;
            say(failAt === '<data>' ? '554 refused' : '250 queued');
            continue;
          }
          const i = buffer.indexOf('\r\n');
          if (i < 0) return;
          const line = buffer.slice(0, i);
          buffer = buffer.slice(i + 2);
          log.push(line.startsWith('AUTH PLAIN ') ? 'AUTH PLAIN <credentials>' : line);
          reply(line);
          if (line === 'DATA' && !failAt?.startsWith('DATA')) data = '';
        }
      },
    }),
    startTls: () => socket,
    close: async () => undefined,
    log,
  };
  say('220 smtp.test ready');
  return Object.assign(() => socket, { socket });
}

const env = { SMTP_HOST: 'smtp.test', SMTP_USER: 'user@tenancy', SMTP_PASS: 's3cret' };

describe('message building', () => {
  it('encodes non-ASCII headers and text, and doubles a leading dot', () => {
    expect(encodeHeader('Simples')).toBe('Simples');
    expect(encodeHeader('Inscrição')).toBe(`=?UTF-8?B?${b64('Inscrição')}?=`);
    expect(dotStuff('a\n.b\n..c')).toBe('a\n..b\n...c');
  });

  it('builds a multipart/alternative message with CRLF line ends and both parts in base64', () => {
    const raw = buildMessage({ ...message, headers: { 'List-Unsubscribe': '<https://x.example/u>' } }, { now: new Date('2026-10-15T12:00:00Z'), boundary: 'BND' });
    expect(raw).toContain('From: =?UTF-8?B?');
    expect(raw).toContain('<ricardo@devandreotti.com>');
    expect(raw).toContain('To: leitor@example.com');
    expect(raw).toContain('Date: Thu, 15 Oct 2026 12:00:00 +0000');
    expect(raw).toContain('List-Unsubscribe: <https://x.example/u>');
    expect(raw).toContain('Content-Type: multipart/alternative; boundary="BND"');
    expect(raw).not.toMatch(/[^\r]\n/);
    const parts = raw.split('--BND').slice(1, -1);
    expect(parts).toHaveLength(2);
    expect(atob(parts[1].split('\r\n\r\n')[1].replace(/\r\n/g, ''))).toContain('html');
    expect(raw.endsWith('--BND--\r\n')).toBe(true);
  });
});

describe('sendMail', () => {
  it('runs the whole dialogue: STARTTLS, AUTH PLAIN, the envelope, the data, QUIT', async () => {
    const connect = fakeConnect();
    await sendMail(env, message, { connect });
    const sent = connect.socket.log;
    expect(sent).toEqual(['EHLO devandreotti.com', 'STARTTLS', 'EHLO devandreotti.com', 'AUTH PLAIN <credentials>', 'MAIL FROM:<ricardo@devandreotti.com>', 'RCPT TO:<leitor@example.com>', 'DATA', '<data>', 'QUIT']);
    expect(connect.socket.data).toContain('Subject: =?UTF-8?B?');
  });

  it('fails with the step that was refused, never with the credentials', async () => {
    await expect(sendMail(env, message, { connect: fakeConnect({ auth: '535 Authentication credentials invalid' }) })).rejects.toThrow(/AUTH -> 535/);
    await expect(sendMail(env, message, { connect: fakeConnect({ rcpt: '550 no such user' }) })).rejects.toThrow(/RCPT TO -> 550/);
    try {
      await sendMail(env, message, { connect: fakeConnect({ auth: '535 bad' }) });
    } catch (error) {
      expect(error.message).not.toContain('s3cret');
      expect(error.message).not.toContain(b64('\0user@tenancy\0s3cret'));
      expect(error.message).not.toContain(b64('user@tenancy'));
    }
  });
});
