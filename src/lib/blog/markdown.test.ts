import { describe, expect, it } from 'vitest';
import { headingId, renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('slugs headings without accents', () => {
    expect(headingId('Modo manutenção numa variável')).toBe('modo-manutencao-numa-variavel');
    expect(headingId('???')).toBe('secao');
  });

  it('ids every heading, numbers repeats and lists the h2s as the table of contents', () => {
    const { html, toc } = renderMarkdown('## Por que\n\ntexto\n\n### Detalhe\n\n## Por que\n');
    expect(html).toContain('<h2 id="por-que">Por que</h2>');
    expect(html).toContain('<h3 id="detalhe">Detalhe</h3>');
    expect(html).toContain('<h2 id="por-que-2">Por que</h2>');
    expect(toc).toEqual([
      { id: 'por-que', text: 'Por que' },
      { id: 'por-que-2', text: 'Por que' },
    ]);
  });

  it('opens other sites in a new tab and keeps own links in place', () => {
    const { html } = renderMarkdown('[a](https://example.com "t") [b](/blog/) [c](https://devandreotti.com/x)');
    expect(html).toContain('<a href="https://example.com" title="t" rel="noopener" target="_blank">a</a>');
    expect(html).toContain('<a href="/blog/">b</a>');
    expect(html).toContain('<a href="https://devandreotti.com/x">c</a>');
  });

  it('renders GitHub-flavored code blocks escaped', () => {
    expect(renderMarkdown('```js\nconst a = "<b>";\n```').html).toContain('&lt;b&gt;');
  });
});
