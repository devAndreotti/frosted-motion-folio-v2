import { describe, expect, it } from 'vitest';
import { loadOgFonts, OG_HEIGHT, OG_WIDTH, ogTree, renderOgPng } from './og-image';

// the PNG header: 8 magic bytes, then IHDR with width and height as big-endian 32-bit numbers
const size = (png: Buffer) => ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) });

describe('imagem de compartilhamento (og-image)', () => {
  it('gera um PNG 1200x630 com o título e a descrição', async () => {
    const png = await renderOgPng({ kicker: 'Escritos', title: 'Um post de teste com um título comprido para quebrar linha', subtitle: 'Descrição curta' });
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(size(png)).toEqual({ width: OG_WIDTH, height: OG_HEIGHT });
  }, 30_000);

  it('o texto do post aparece na árvore que vai para o satori', () => {
    const json = JSON.stringify(ogTree({ kicker: 'Escritos', title: 'Título & <tag>', subtitle: 'Sub' }));
    expect(json).toContain('Título & <tag>');
    expect(json).toContain('Sub');
  });

  it('carrega as duas fontes Geist em WOFF (satori não lê WOFF2)', () => {
    const fonts = loadOgFonts();
    expect(fonts.map((f) => f.weight)).toEqual([400, 700]);
    for (const font of fonts) expect(font.data.subarray(0, 4).toString('ascii')).toBe('wOFF');
  });
});
