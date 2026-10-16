import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const FILES = ['v2.css', 'blog.css', 'more.css'];

/** Selectors of the rules that sit at the top level of the sheet (not inside @media or @keyframes). */
function topLevelSelectors(css: string): string[] {
  const found: string[] = [];
  let depth = 0;
  let buffer = '';
  for (const ch of css) {
    if (ch === '{') {
      if (depth === 0) found.push(buffer.trim());
      depth += 1;
      buffer = '';
    } else if (ch === '}') {
      depth -= 1;
      buffer = '';
    } else if (depth === 0) {
      buffer += ch;
    }
  }
  return found;
}

describe('hover on cards and rows', () => {
  it.each(FILES)('%s only styles :hover inside @media (hover: hover)', (file) => {
    const css = readFileSync(resolve(__dirname, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const loose = topLevelSelectors(css).filter((selector) => selector.includes(':hover'));
    // a touch screen keeps :hover after a tap, so a card would stay lifted until the next tap elsewhere
    expect(loose).toEqual([]);
  });

  it('keeps the keyboard states outside the media query', () => {
    const css = readFileSync(resolve(__dirname, 'v2.css'), 'utf8');
    expect(css).toMatch(/\.nf-s:focus-visible \{/);
    expect(css).toMatch(/\.row:focus-visible::before \{/);
  });
});
