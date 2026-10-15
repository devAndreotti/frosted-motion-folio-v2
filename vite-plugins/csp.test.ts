import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { applyHashes, inlineScriptHashes, PLACEHOLDER } from './csp';

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
});
