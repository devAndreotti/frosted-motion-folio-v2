import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// The page scrollbar is pure CSS, so the test checks the rules that make it
// thin and theme-aware in the stylesheet itself. Visual result is checked
// with Playwright screenshots, not here.
const css = readFileSync(resolve(__dirname, '../index.css'), 'utf8');
// Comments can contain braces, so rules are matched on the closing brace at
// the start of a line, and comments are removed before checking values.
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');

function block(selector: string): string {
  const start = code.indexOf(`${selector} {`);
  if (start === -1) return '';
  return code.slice(start, code.indexOf('\n}', start) + 2);
}

describe('page scrollbar', () => {
  it('uses thin standard scrollbar properties on html, colored by the theme accent', () => {
    const html = block('html');
    expect(html).toContain('scrollbar-width: thin');
    expect(html).toMatch(/scrollbar-color: rgb\(var\(--accent-rgb[^)]*\) \/ 0\.\d+\) transparent/);
  });

  it('hides arrows and gives the webkit thumb a rounded, accent-tinted fill', () => {
    expect(block('html::-webkit-scrollbar-button')).toContain('display: none');
    expect(block('html::-webkit-scrollbar-track')).toContain('background: transparent');
    const thumb = block('html::-webkit-scrollbar-thumb');
    expect(thumb).toContain('border-radius: 999px');
    expect(thumb).toContain('var(--accent-rgb');
    expect(block('html::-webkit-scrollbar-thumb:hover')).toContain('var(--accent-rgb');
  });

  it('keeps scrollbar colors out of hardcoded hex values', () => {
    const scrollRules = ['html', 'html::-webkit-scrollbar-thumb', 'html::-webkit-scrollbar-thumb:hover', 'html::-webkit-scrollbar-thumb:active']
      .map(block)
      .join('\n');
    expect(scrollRules).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('sets color-scheme per theme class', () => {
    expect(code).toMatch(/:root \{\s*color-scheme: light;/);
    expect(code).toMatch(/\.dark \{\s*color-scheme: dark;/);
  });

  it('turns off the thumb transition under reduced motion', () => {
    expect(code).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*html::-webkit-scrollbar-thumb \{\s*transition: none;/);
  });
});
