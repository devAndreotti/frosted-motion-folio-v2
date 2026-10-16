import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// The print view is CSS, so the test checks the rules that make the CV work.
// The rendered page is checked with Playwright screenshots.
const css = readFileSync(resolve(__dirname, './print.css'), 'utf8');
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
const printBlock = code.slice(code.indexOf('@media print'));

describe('print stylesheet', () => {
  it('is scoped to @media print, with the screen-only helpers hidden outside it', () => {
    expect(code).toContain('@media print');
    expect(code.slice(0, code.indexOf('@media print'))).toMatch(/\.print-url,\s*\.print-foot\s*\{\s*display: none;/);
  });

  it('hides the nav, the page wash, dialogs, buttons and the TV-like overlays', () => {
    for (const selector of ['header.nav', '[role=\'dialog\']', 'button:not(.row)', '.fixed']) {
      expect(printBlock).toContain(selector);
    }
    expect(printBlock).toMatch(/\.haunted-line,[\s\S]*display: none !important/);
  });

  it('prints external links with their address, only inside the main content', () => {
    expect(printBlock).toMatch(/main a\[href\^="http"\]::after \{\s*content: " \(" attr\(href\) "\)";/);
    // a bare a[...]::after rule (outside main) would start a selector after a brace, a comma or the file start
    expect(printBlock).not.toMatch(/(^|[},])\s*a\[href\^="http"\]::after/);
  });

  it('steps aside when Recruiter Mode prints its own summary', () => {
    expect(printBlock).toContain(":root:not(:has([data-print-target='recruiter-summary']))");
    expect(printBlock).toMatch(/:root:not\(:has\(\[data-print-target='recruiter-summary'\]\)\) body \* \{\s*visibility: visible !important;/);
  });

  it('uses a white page with black text', () => {
    expect(printBlock).toMatch(/html,\s*body \{\s*background: #fff !important;\s*color: #000 !important;/);
  });

  it('is imported with the other styles in main.tsx', () => {
    const main = readFileSync(resolve(__dirname, '../main.tsx'), 'utf8');
    expect(main).toContain("import './styles/print.css'");
    expect(main).toContain("import './styles/haunted.css'");
  });
});
