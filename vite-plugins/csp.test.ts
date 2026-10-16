import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { applyHashes, inlineScriptHashes, PLACEHOLDER, umamiOrigin } from './csp';

const sha = (text: string) => `'sha256-${crypto.createHash('sha256').update(text).digest('base64')}'`;

describe('CSP script hashes', () => {
  const html = `<html><head>
    <script type="application/ld+json">{"@type":"Person"}</script>
    <script>var boot = 1;</script>
    <script type="module" src="/assets/index.js"></script>
  </head></html>`;

  it('hashes the inline script and leaves out the data block and the scripts with a src', () => {
    expect(inlineScriptHashes(html)).toEqual([sha('var boot = 1;')]);
  });

  it('hashes what is there byte for byte, so a changed script gets a new hash', () => {
    expect(inlineScriptHashes(html.replace('boot = 1', 'boot = 2'))[0]).not.toBe(sha('var boot = 1;'));
    expect(inlineScriptHashes('<script>a</script><script>a</script>')).toHaveLength(1);
  });

  it('fills the placeholder in the headers, and only there', () => {
    const headers = `/*\n  Content-Security-Policy: script-src 'self' ${PLACEHOLDER} https://challenges.cloudflare.com\n`;
    const out = applyHashes(headers, html);
    expect(out).toContain(`script-src 'self' ${sha('var boot = 1;')} https://challenges.cloudflare.com`);
    expect(out).not.toContain(PLACEHOLDER);
    expect(applyHashes('no placeholder here', html)).toBe('no placeholder here');
  });

  it('names the analytics host from VITE_UMAMI_SRC, and only an https one', () => {
    expect(umamiOrigin('https://stats.example.com/fita.js')).toBe('https://stats.example.com');
    expect(umamiOrigin('http://stats.example.com/x.js')).toBe('');
    expect(umamiOrigin('not a url')).toBe('');
    expect(umamiOrigin(undefined)).toBe('');
    const headers = `script-src 'self' ${PLACEHOLDER} __CSP_UMAMI__; connect-src 'self' __CSP_UMAMI__`;
    const out = applyHashes(headers, html, 'https://stats.example.com/fita.js');
    expect(out).toContain('https://stats.example.com;');
    expect(out.endsWith("connect-src 'self' https://stats.example.com")).toBe(true);
    expect(applyHashes(headers, html)).not.toContain('__CSP_UMAMI__');
  });
});
