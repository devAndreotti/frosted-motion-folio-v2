import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blogPlugin } from './blog';
import { writeShareImages } from './og-image';

// the build's output for the share images: a post gets og/<slug>.png, a translated one also og/<slug>-en.png,
// and its HTML names them in og:image (with the size), so a crawler finds a file that exists
const repo = path.resolve(__dirname, '..');
const pngSize = (file: string) => {
  const png = fs.readFileSync(file);
  return { magic: png.subarray(1, 4).toString('ascii'), width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
};

describe('blog build: imagens de compartilhamento', () => {
  let root: string;
  let postsDir: string;
  let outDir: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-og-'));
    postsDir = path.join(root, 'posts');
    outDir = path.join(root, 'dist');
    fs.mkdirSync(postsDir);
    fs.mkdirSync(outDir);
    fs.writeFileSync(path.join(outDir, 'index.html'), fs.readFileSync(path.join(repo, 'index.html'), 'utf8'));
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), fs.readFileSync(path.join(repo, 'public/sitemap.xml'), 'utf8'));
    fs.writeFileSync(
      path.join(postsDir, '2026-10-15-teste.md'),
      '---\ntitle: Post de teste\ndate: 2026-10-15\ndescription: Descrição do post.\ntags: [css]\n---\n\ncorpo\n'
    );
    fs.writeFileSync(
      path.join(postsDir, '2026-10-15-teste.en.md'),
      '---\ntitle: Test post\ndate: 2026-10-15\ndescription: The post description.\ntags: [css]\n---\n\nbody\n'
    );
    fs.writeFileSync(path.join(postsDir, '2026-10-15-rascunho.md'), '---\ntitle: Rascunho\ndate: 2026-10-15\ndescription: x\ntags: [css]\ndraft: true\n---\n\nx\n');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('gera PNG 1200x630 por post e pelo inglês, e aponta og:image para eles', async () => {
    const plugin = blogPlugin(postsDir);
    (plugin.configResolved as (c: object) => void)({ command: 'build', root, build: { outDir: 'dist' }, base: '/' });
    await (plugin.closeBundle as () => Promise<void>)();

    expect(pngSize(path.join(outDir, 'og/teste.png'))).toEqual({ magic: 'PNG', width: 1200, height: 630 });
    expect(pngSize(path.join(outDir, 'og/teste-en.png'))).toEqual({ magic: 'PNG', width: 1200, height: 630 });
    expect(fs.existsSync(path.join(outDir, 'og/rascunho.png'))).toBe(false);

    const html = fs.readFileSync(path.join(outDir, 'blog/teste/index.html'), 'utf8');
    expect(html).toContain('<meta property="og:image" content="https://devandreotti.com/og/teste.png" />');
    expect(html).toContain('<meta property="og:image:width" content="1200" />');
    expect(html).toContain('<meta property="og:image:height" content="630" />');
    expect(html).toContain('<meta name="twitter:image" content="https://devandreotti.com/og/teste.png" />');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
  }, 60_000);

  it('uma imagem que falha não derruba o build: a página fica com a imagem do site', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const written = await writeShareImages(outDir, [{ name: 'x', card: { kicker: 'k', title: 't', subtitle: 's' } }], []);
    expect(written.size).toBe(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('x falhou'));
  });
});
