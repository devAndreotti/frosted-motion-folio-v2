import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Lite mode is pure CSS on top of the existing styles, so these checks read the stylesheets: the blurs go, the
// glass gets a solid tint, and nothing that changes layout or motion sneaks in.
const lite = readFileSync(resolve(__dirname, 'lite.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function block(selector: string): string {
  const start = lite.indexOf(`${selector} {`);
  if (start === -1) return '';
  return lite.slice(start, lite.indexOf('}', start) + 1);
}

describe('lite mode stylesheet', () => {
  it('removes every backdrop blur while data-lite is on', () => {
    const rule = block('html[data-lite] *::after');
    expect(rule).toContain('backdrop-filter: none !important');
    expect(rule).toContain('-webkit-backdrop-filter: none !important');
  });

  it('gives the nav, dialog backdrop and glass panels an opaque tint instead of the blur', () => {
    expect(block('html[data-lite] .nav')).toMatch(/background: color-mix\(in oklab, var\(--solid/);
    expect(block('html[data-lite] .ov')).toMatch(/background: rgba\(0, 0, 0, 0\.6\)/);
    expect(lite).toMatch(/html\[data-lite\] \.glass-strong,\s*html\[data-lite\] \.glass-intense \{\s*background: linear-gradient\(var\(--surface-2\), var\(--surface-2\)\), var\(--solid/);
    expect(block('html[data-lite] .dlg')).toContain('background: var(--solid');
  });

  it('changes paint only, never layout, motion or the reduced-motion rules', () => {
    expect(lite).not.toMatch(/\b(display|position|width|height|max-width|padding|margin|gap|grid|flex|inset|transform|transition|animation)\s*:/);
    expect(lite).not.toContain('@media');
  });
});
