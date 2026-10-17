import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Keyboard and touch rules that live in the stylesheets: a focus ring on every other control, invisible hit
// areas that bring the small icon and language buttons to 44 px, and no motion under reduced motion.
const read = (file: string) => readFileSync(resolve(__dirname, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const shared = read('interactive.css');
const v2 = read('v2.css');
const blog = read('blog.css');
const more = read('more.css');

/** The text of the @media (prefers-reduced-motion: reduce) block(s), braces balanced. */
function reducedBlocks(css: string): string {
  const out: string[] = [];
  const re = /@media \(prefers-reduced-motion: reduce\)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    for (; i < css.length && depth > 0; i += 1) {
      if (css[i] === '{') depth += 1;
      if (css[i] === '}') depth -= 1;
    }
    out.push(css.slice(re.lastIndex, i - 1));
  }
  return out.join('\n');
}

describe('keyboard focus', () => {
  it('gives every link, button and role-button a 2px accent ring with a 2px offset', () => {
    expect(shared).toMatch(/:is\(a, button, summary, \[role='button'\][^{]*\):focus-visible\s*\{\s*outline: 2px solid var\(--accent\);\s*outline-offset: 2px;\s*\}/);
  });

  it('keeps the swatches focusable with a visible ring, not only on hover', () => {
    expect(v2).not.toMatch(/\.sw:focus-visible\s*\{\s*outline: none/);
  });

  it('has no positive tabindex anywhere in src (tab order follows the DOM)', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = resolve(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(tsx|ts|jsx|js)$/.test(entry.name) && !/\.test\./.test(entry.name)) files.push(full);
      }
    };
    walk(resolve(__dirname, '..'));
    const offenders = files.filter((f) => /tabIndex=\{\s*[1-9]|tabindex=["'][1-9]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

describe('touch targets', () => {
  it('gives the PT | EN switch a 44 px hit area (26 px tall, 30 px wide before)', () => {
    expect(shared).toMatch(/\.lg::before \{\s*content: '';\s*position: absolute;\s*inset: -9px -7px;\s*\}/);
  });

  it('gives the accent swatches and the heading anchors a 44 px hit area', () => {
    expect(v2).toMatch(/\.sw::before \{ content: ''; position: absolute; inset: -10px; \}/);
    expect(shared).toMatch(/\.h-anchor::before \{\s*content: '';\s*position: absolute;\s*inset: -8px;\s*\}/);
  });

  it('keeps the 34 px pills and icon buttons at 44 px through their ::before hit area', () => {
    expect(v2).toMatch(/\.np::before \{ content: ''; position: absolute; inset: -5px; \}/);
    expect(v2).toMatch(/\.np\.sq \{ width: 34px;/);
    expect(v2).toMatch(/\.ibtn \{ width: 48px; height: 48px;/);
  });
});

describe('reduced motion', () => {
  it('stops the card lifts and the popover animations', () => {
    const reduced = reducedBlocks(v2);
    expect(reduced).toMatch(/\.nc:hover \{ transform: none; \}/);
    expect(reduced).toMatch(/:is\(a, button\)\.also-i:hover, :is\(a, button\)\.also-i:focus-visible \{ transform: none; \}/);
    expect(reduced).toMatch(/\.pop, \.sheet \{ animation: none; \}/);
    expect(reduced).toMatch(/\.nf-s:focus-visible \{ transform: none; \}/);
  });

  it('keeps the blog and project card lifts off under reduced motion', () => {
    expect(reducedBlocks(blog)).toMatch(/\.teaser-c:hover \{ transform: none; \}/);
    expect(reducedBlocks(more)).toMatch(/\.mp-card:hover \{ transform: none; \}/);
  });
});
