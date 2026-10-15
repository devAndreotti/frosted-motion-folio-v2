import { describe, expect, it } from 'vitest';
import { isTranslationFile, parsePost, readingMinutes, slugFromPath, splitFrontmatter } from './parse';

const post = (front: string, body = 'Texto do post.') => `---\n${front}\n---\n${body}`;

describe('splitFrontmatter', () => {
  it('reads strings, quoted strings, lists and booleans', () => {
    const { data, body } = splitFrontmatter(post('title: "Olá: mundo"\ntags: [react, \'css\']\ndraft: true\n# comment: ignored'));
    expect(data).toEqual({ title: 'Olá: mundo', tags: ['react', 'css'], draft: true });
    expect(body).toBe('Texto do post.');
  });

  it('treats a file without front matter as all body', () => {
    expect(splitFrontmatter('# Só texto')).toEqual({ data: {}, body: '# Só texto' });
  });
});

describe('slugFromPath', () => {
  it('drops the folder, the extension and the date prefix', () => {
    expect(slugFromPath('src/content/posts/2026-10-15-meu-post.md')).toBe('meu-post');
    expect(slugFromPath('C:\\posts\\sem-data.md')).toBe('sem-data');
  });

  it('gives an English version the slug of its original', () => {
    expect(slugFromPath('2026-10-15-meu-post.en.md')).toBe('meu-post');
    expect(isTranslationFile('2026-10-15-meu-post.en.md')).toBe(true);
    expect(isTranslationFile('2026-10-15-meu-post.md')).toBe(false);
  });
});

describe('readingMinutes', () => {
  it('counts 200 words a minute, at least 1, ignoring code blocks', () => {
    expect(readingMinutes('uma palavra')).toBe(1);
    expect(readingMinutes(Array(600).fill('palavra').join(' '))).toBe(3);
    expect(readingMinutes(`curto\n\`\`\`\n${Array(900).fill('code').join(' ')}\n\`\`\``)).toBe(1);
  });
});

describe('parsePost', () => {
  it('builds the meta a post needs', () => {
    const { meta, body } = parsePost('2026-10-15-ola.md', post('title: Olá\ndate: 2026-10-15\ndescription: Um teste\ntags: [React, CSS]'));
    expect(meta).toEqual({ slug: 'ola', title: 'Olá', date: '2026-10-15', description: 'Um teste', tags: ['react', 'css'], minutes: 1, draft: false });
    expect(body).toBe('Texto do post.');
  });

  it('takes an explicit slug and a single tag', () => {
    const { meta } = parsePost('x.md', post('title: T\ndate: 2026-01-02\nslug: outro-nome\ntags: css'));
    expect(meta.slug).toBe('outro-nome');
    expect(meta.tags).toEqual(['css']);
  });

  it('fails the build, naming the file, for a post it cannot publish', () => {
    expect(() => parsePost('a.md', post('date: 2026-01-02'))).toThrow(/a\.md: missing "title"/);
    expect(() => parsePost('a.md', post('title: T\ndate: 2026-02-30'))).toThrow(/YYYY-MM-DD/);
    expect(() => parsePost('a.md', post('title: T\ndate: ontem'))).toThrow(/YYYY-MM-DD/);
    expect(() => parsePost('Meu Post.md', post('title: T\ndate: 2026-01-02'))).toThrow(/slug/);
  });
});
