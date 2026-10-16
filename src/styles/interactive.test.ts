import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// The shared hover, focus and press states are CSS only, so these checks read the stylesheets: the hover
// sits behind (hover: hover), the ring is the same everywhere, nothing moves under reduced motion, and the
// privacy page's buttons and tabs are in the shared lists instead of their own rules.
const read = (file: string) => readFileSync(resolve(__dirname, file), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const shared = strip(read('interactive.css'));
const privacy = strip(read('privacy.css'));
const main = read('../main.tsx');

/** Start and end offsets of every block whose header matches `header` (the text before its "{"). */
function blockRanges(css: string, header: RegExp): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const re = new RegExp(header.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const open = css.indexOf('{', m.index);
    let depth = 0;
    for (let i = open; i < css.length; i += 1) {
      if (css[i] === '{') depth += 1;
      if (css[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          ranges.push([open, i]);
          break;
        }
      }
    }
  }
  return ranges;
}

const insideAny = (index: number, ranges: Array<[number, number]>) => ranges.some(([a, b]) => index > a && index < b);

/** Every class of a shared group must have a rule for each state (the group lists live in interactive.css). */
const GROUPS = {
  primary: ['btn-pri', 'pv-btn-pri'],
  ghost: ['btn-gh', 'pv-btn', 'like', 'ibtn'],
  pill: ['np', 'pv-tab', 'pv-seg', 'blog-tags', 'seg', 'lg'],
  textLink: ['nl', 'prose', 'toc', 'post-back', 'nws-fine', 'ft'],
};
const ALL_CONTROLS = Object.values(GROUPS).flat();

/** The selector text of each rule whose selector list contains `.cls` and the given pseudo-state. */
function stateRuleExists(css: string, cls: string, state: string): boolean {
  const re = new RegExp(`\\.${cls}\\b[^{}]*${state}[^{}]*\\{`);
  return re.test(css);
}

describe('shared interactive states', () => {
  it('puts hover only behind (hover: hover), so a touch tap leaves no stuck state', () => {
    const hoverRanges = blockRanges(shared, /@media \(hover: hover\)/);
    expect(hoverRanges.length).toBeGreaterThan(0);
    let index = shared.indexOf(':hover');
    while (index !== -1) {
      expect(insideAny(index, hoverRanges), `:hover at ${index} is outside @media (hover: hover)`).toBe(true);
      index = shared.indexOf(':hover', index + 1);
    }
  });

  it('draws one focus ring for every control: 2px accent outline, 2px offset', () => {
    const ring = /:focus-visible\s*\{\s*outline: 2px solid var\(--accent\);\s*outline-offset: 2px;\s*\}/;
    expect(shared).toMatch(ring);
    for (const cls of ALL_CONTROLS) {
      expect(stateRuleExists(shared, cls, ':focus-visible'), `${cls} has no :focus-visible rule`).toBe(true);
    }
  });

  it('gives every control a press state', () => {
    for (const cls of ALL_CONTROLS) {
      expect(stateRuleExists(shared, cls, ':active'), `${cls} has no :active rule`).toBe(true);
    }
  });

  it('gives every control a hover state, for each group', () => {
    for (const cls of ALL_CONTROLS) {
      expect(stateRuleExists(shared, cls, ':hover'), `${cls} has no :hover rule`).toBe(true);
    }
  });

  it('moves only inside the motion-allowed block, never under reduced motion', () => {
    const motion = blockRanges(shared, /@media \(prefers-reduced-motion: no-preference\)/);
    expect(motion.length).toBeGreaterThan(0);
    for (const m of shared.matchAll(/\b(?:translate|scale): [^;]+;/g)) {
      expect(insideAny(m.index ?? 0, motion), `${m[0]} moves outside the no-preference block`).toBe(true);
    }
    expect(shared).not.toMatch(/\btransform\s*:/);
    expect(shared).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it('keeps the lift at 1px at most, and the press at 98%', () => {
    expect(shared).toMatch(/translate: 0 -1px;/);
    expect(shared).toMatch(/scale: 0\.98;/);
    expect(shared).not.toMatch(/translate: 0 -[2-9]px|translate: 0 -\d{2,}px/);
  });

  it('uses theme tokens only, and no !important', () => {
    expect(shared).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(shared).not.toContain('!important');
  });

  it('is imported last in main.tsx, after every other stylesheet', () => {
    const imports = [...main.matchAll(/import '(\.\/(?:index\.css|styles\/[\w-]+\.css))'/g)].map(m => m[1]);
    expect(imports[imports.length - 1]).toBe('./styles/interactive.css');
  });
});

describe('privacy page controls', () => {
  it('leaves hover, focus and press for .pv-tab, .pv-seg, .pv-btn and .pv-btn-pri to interactive.css', () => {
    for (const cls of ['pv-tab', 'pv-seg', 'pv-btn', 'pv-btn-pri']) {
      expect(stateRuleExists(shared, cls, ':hover'), `${cls} has no shared :hover`).toBe(true);
      expect(stateRuleExists(shared, cls, ':focus-visible'), `${cls} has no shared :focus-visible`).toBe(true);
      expect(stateRuleExists(shared, cls, ':active'), `${cls} has no shared :active`).toBe(true);
    }
    expect(privacy).not.toMatch(/:hover|:focus|:active/);
    expect(privacy).not.toMatch(/\btransition\s*:/);
  });

  it('keeps the light-mode ink outline for unpicked tabs through the tokens', () => {
    expect(privacy).toMatch(/:root:not\(\.dark\) \.pv \{[^}]*--pv-tab-line: var\(--fg-2\)/);
    expect(privacy).toMatch(/\.pv-tab \{[^}]*border: 1px solid var\(--pv-tab-line\)/);
  });
});
