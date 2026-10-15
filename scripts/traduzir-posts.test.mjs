import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildEnglish, compareShapes, englishName, hashOf, pending, stripComments } from './traduzir-posts.mjs';

const PT = `---
title: Meu post
date: 2026-10-15
description: Uma frase.
tags: [Blog, vite]
draft: false
---
Texto com \`codigo\` e um [link](https://example.com).

## Seção

- um
- dois

\`\`\`bash
npm run dev   # sobe o site
\`\`\`

![Capa](/blog/meu-post/capa.jpg)
`;

const EN = `---
title: "My post: a test"
description: One sentence.
---
Text with \`code\` and a [link](https://example.com).

## Section

- one
- two

\`\`\`bash
npm run dev   # starts the site
\`\`\`

![Cover](/blog/meu-post/capa.jpg)
`;

const body = (text) => text.replace(/^---[\s\S]*?---\n/, '');

describe('compareShapes', () => {
  it('accepts a faithful translation, comments inside code included', () => {
    expect(compareShapes(body(PT), body(EN))).toEqual([]);
    expect(stripComments('a   # x\nb // y\nc')).toBe('a\nb\nc');
  });

  it.each([
    ['a changed code block', (t) => t.replace('npm run dev', 'npm start')],
    ['a changed link', (t) => t.replace('https://example.com', 'https://evil.example')],
    ['a changed image path', (t) => t.replace('capa.jpg', 'other.jpg')],
    ['a dropped heading', (t) => t.replace('## Section', 'Section')],
    ['a dropped list item', (t) => t.replace('- two\n', '')],
    ['a text far too short', (t) => `${t.split('\n')[0]}\n\n## Section\n\n- one\n- two\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n\n![C](/blog/meu-post/capa.jpg)\n`.slice(0, 80)],
  ])('rejects %s', (_name, mutate) => {
    expect(compareShapes(body(PT), mutate(body(EN))).length).toBeGreaterThan(0);
  });
});

describe('buildEnglish', () => {
  it('takes title and description from the translation and the rest from the original', () => {
    const { problems, content } = buildEnglish(PT, EN);
    expect(problems).toEqual([]);
    expect(content).toContain('title: "My post: a test"');
    expect(content).toContain('date: 2026-10-15');
    expect(content).toContain('description: One sentence.');
    expect(content).toContain('tags: [Blog, vite]');
    expect(content).toContain('draft: false');
    expect(content).toContain(`source: ${hashOf(PT)}`);
    expect(content).toContain('Text with `code`');
  });

  it('refuses a translation without title or text', () => {
    expect(buildEnglish(PT, '---\ndescription: x\n---\nbody').problems.join()).toMatch(/title/);
    expect(buildEnglish(PT, '---\ntitle: x\ndescription: y\n---\n').problems.join()).toMatch(/sem texto/);
  });
});

describe('pending', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-'));
  const write = (name, text) => fs.writeFileSync(path.join(dir, name), text);

  it('lists posts with no English version or a stale one, and skips drafts', () => {
    write('2026-10-15-novo.md', PT);
    write('2026-10-15-rascunho.md', PT.replace('draft: false', 'draft: true'));
    write('2026-10-15-feito.md', PT);
    write('2026-10-15-feito.en.md', `---\ntitle: x\nsource: ${hashOf(PT)}\n---\nbody`);
    write('2026-10-15-velho.md', PT);
    write('2026-10-15-velho.en.md', '---\ntitle: x\nsource: 000000000000\n---\nbody');
    const slugs = pending(dir).map((p) => p.slug);
    expect(slugs).toEqual(['novo', 'velho']);
    expect(pending(dir)[1].reason).toMatch(/mudou/);
  });

  it('names the English file next to the original', () => {
    expect(englishName('2026-10-15-x.md')).toBe('2026-10-15-x.en.md');
  });
});
