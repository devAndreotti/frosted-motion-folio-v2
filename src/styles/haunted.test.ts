import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, './haunted.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('haunted stylesheet', () => {
  it('keys everything on the data-haunted attribute, never on a stored theme', () => {
    expect(css).toContain('html[data-haunted] {');
    expect(css).not.toMatch(/localStorage|data-theme/);
  });

  it('flickers only the opacity of the wash overlay, and stops under reduced motion', () => {
    expect(css).toMatch(/animation: haunted-flicker 9s/);
    const keyframes = css.slice(css.indexOf('@keyframes haunted-flicker'), css.indexOf('@media (prefers-reduced-motion'));
    expect(keyframes).toContain('opacity');
    expect(keyframes).not.toMatch(/(width|height|top|left|margin|padding|transform)\s*:/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none/);
  });
});
