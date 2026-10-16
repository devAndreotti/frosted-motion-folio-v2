import { describe, expect, it } from 'vitest';
import { FICHA_IDS, PRIVACY, type PrivacyLang } from './privacy';

const LANGS: PrivacyLang[] = ['pt', 'en'];

describe('privacy copy', () => {
  it('has text in Portuguese and English for every tab (ficha) item', () => {
    for (const lang of LANGS) {
      for (const id of FICHA_IDS) {
        const ficha = PRIVACY[lang].fichas[id];
        expect(ficha.label, `${lang}/${id} label`).toBeTruthy();
        expect(ficha.title, `${lang}/${id} title`).toBeTruthy();
        expect(ficha.sum, `${lang}/${id} sum`).toBeTruthy();
        expect(ficha.keep.length, `${lang}/${id} keep`).toBeGreaterThan(0);
        expect(ficha.not.length, `${lang}/${id} not`).toBeGreaterThan(0);
        for (const item of [...ficha.keep, ...ficha.not]) expect(item.trim(), `${lang}/${id} chip`).not.toBe('');
        for (const row of ficha.rows) expect(row.k && row.v, `${lang}/${id} row`).toBeTruthy();
      }
    }
  });

  it('has the same shape in both languages', () => {
    expect(FICHA_IDS).toHaveLength(4);
    expect(PRIVACY.pt.promises).toHaveLength(PRIVACY.en.promises.length);
    expect(PRIVACY.pt.numbers).toHaveLength(4);
    expect(PRIVACY.en.numbers).toHaveLength(4);
    expect(PRIVACY.pt.sim.steps).toHaveLength(3);
    expect(PRIVACY.en.sim.steps).toHaveLength(3);
  });

  it('pluralizes the days left in both languages', () => {
    expect(PRIVACY.pt.sim.faltam(1)).toBe('Falta 1 dia.');
    expect(PRIVACY.pt.sim.faltam(3)).toBe('Faltam 3 dias.');
    expect(PRIVACY.en.sim.faltam(1)).toBe('1 day left.');
    expect(PRIVACY.en.sim.faltam(3)).toBe('3 days left.');
  });
});
