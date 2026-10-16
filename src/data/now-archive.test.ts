import { describe, expect, it } from 'vitest';
import { NOW_ARCHIVE, AGORA_COPY } from './now-archive';
import { NOW_UPDATED } from './now';

describe('arquivo do Agora', () => {
  it('começa pela versão atual, com a mesma data de NOW_UPDATED', () => {
    expect(NOW_ARCHIVE[0].date).toBe(NOW_UPDATED);
  });

  it('tem datas únicas e em ordem decrescente', () => {
    const dates = NOW_ARCHIVE.map((v) => v.date);
    expect(new Set(dates).size).toBe(dates.length);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('tem resumo em PT e EN e pelo menos um item em cada versão', () => {
    for (const v of NOW_ARCHIVE) {
      expect(v.summary.pt.trim().length).toBeGreaterThan(0);
      expect(v.summary.en.trim().length).toBeGreaterThan(0);
      expect(v.items.length).toBeGreaterThan(0);
    }
  });

  it('tem textos da página nos dois idiomas', () => {
    expect(AGORA_COPY.pt.h1).not.toBe(AGORA_COPY.en.h1);
    expect(AGORA_COPY.pt.updated('x')).toContain('x');
    expect(AGORA_COPY.en.updated('x')).toContain('x');
  });
});
