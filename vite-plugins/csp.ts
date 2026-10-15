import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

// The Content-Security-Policy in public/_headers lets the page run its own scripts only. The one
// inline script (the boot loader in index.html, whose palette is filled in at build time) is allowed
// by its SHA-256, so a build puts the right hashes into dist/_headers: nothing is allowed because
// it "looks like" ours, and a script injected into a page doesn't run.
export const PLACEHOLDER = '__CSP_SCRIPT_HASHES__';

/** `'sha256-...'` for every inline <script> (not the ones with a src, not the JSON-LD data block). */
export function inlineScriptHashes(html: string): string[] {
  const hashes = new Set<string>();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = match[1];
    if (/\bsrc\s*=/.test(attrs) || /type\s*=\s*["']application\/ld\+json["']/.test(attrs)) continue;
    hashes.add(`'sha256-${crypto.createHash('sha256').update(match[2]).digest('base64')}'`);
  }
  return [...hashes];
}

export function applyHashes(headers: string, html: string): string {
  return headers.replace(PLACEHOLDER, inlineScriptHashes(html).join(' '));
}

export function cspPlugin(): Plugin {
  let outDir = '';
  return {
    name: 'csp-hashes',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle: {
      order: 'post',
      handler() {
        const headers = path.join(outDir, '_headers');
        const index = path.join(outDir, 'index.html');
        if (!fs.existsSync(headers) || !fs.existsSync(index)) return;
        const text = fs.readFileSync(headers, 'utf8');
        if (!text.includes(PLACEHOLDER)) return;
        fs.writeFileSync(headers, applyHashes(text, fs.readFileSync(index, 'utf8')));
      },
    },
  };
}
