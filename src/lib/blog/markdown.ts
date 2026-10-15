import { Marked, type Tokens } from 'marked';

// Build-time only (the Vite plugin): posts reach the browser as finished HTML, so
// the Markdown parser never ships in the bundle. The posts are the site owner's own
// files in the repository, which is why their HTML is trusted as is.

type RendererThis = { parser: { parseInline: (tokens: Tokens.Generic[]) => string } };

export interface TocEntry {
  id: string;
  text: string;
}

/** `Modo manutenção numa variável` -> `modo-manutencao-numa-variavel` */
export function headingId(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'secao'
  );
}

/** Markdown -> HTML, with an id on every heading and the h2s collected as the post's table of contents. */
export function renderMarkdown(body: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const used = new Map<string, number>();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(this: RendererThis, { tokens, depth, text }: Tokens.Heading) {
        const base = headingId(text);
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n + 1}`;
        if (depth === 2) toc.push({ id, text: text.replace(/[`*_]/g, '') });
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
      link(this: RendererThis, { href, title, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith('https://devandreotti.com');
        const t = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
        return external ? `<a href="${href}"${t} rel="noopener" target="_blank">${inner}</a>` : `<a href="${href}"${t}>${inner}</a>`;
      },
    },
  });
  const html = marked.parse(body, { async: false }) as string;
  return { html, toc };
}
