import { describe, expect, it } from 'vitest';
import { CHANGELOG, LATEST_CHANGE } from './changelog';

describe('changelog entries', () => {
  it('are ordered newest first, by date', () => {
    const dates = CHANGELOG.map((entry) => entry.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  it('use real ISO dates and unique ids', () => {
    for (const entry of CHANGELOG) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${entry.date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(entry.date);
    }
    const ids = CHANGELOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('have a title and a text in both Portuguese and English', () => {
    for (const entry of CHANGELOG) {
      for (const lang of ['pt', 'en'] as const) {
        expect(entry.title[lang].trim()).not.toBe('');
        expect(entry.text[lang].trim()).not.toBe('');
      }
    }
  });

  it('point LATEST_CHANGE at the newest date', () => {
    expect(LATEST_CHANGE).toBe(CHANGELOG[0].date);
  });
});
