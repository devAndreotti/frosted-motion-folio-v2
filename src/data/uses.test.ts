import { describe, expect, it } from 'vitest';
import { USES_CATEGORIES, USES_COPY, type UsesItem } from './uses/index';

const allItems = (): UsesItem[] => USES_CATEGORIES.flatMap((category) => category.items);
const allText = () =>
  JSON.stringify({ USES_CATEGORIES, USES_COPY });

describe('uses data', () => {
  it('has the six categories, each with items', () => {
    expect(USES_CATEGORIES.map((c) => c.id)).toEqual(['hardware', 'system', 'editor', 'terminal', 'ai', 'services']);
    for (const category of USES_CATEGORIES) expect(category.items.length, category.id).toBeGreaterThan(0);
  });

  it('has PT and EN text for every label, name, detail and reason', () => {
    for (const category of USES_CATEGORIES) {
      expect(category.label.pt).toBeTruthy();
      expect(category.label.en).toBeTruthy();
      for (const item of category.items) {
        expect(item.name, item.name).toBeTruthy();
        expect(item.why.pt, item.name).toBeTruthy();
        expect(item.why.en, item.name).toBeTruthy();
        if (item.detail) {
          expect(item.detail.pt, item.name).toBeTruthy();
          expect(item.detail.en, item.name).toBeTruthy();
        }
      }
    }
    for (const lang of ['pt', 'en'] as const) for (const value of Object.values(USES_COPY[lang])) expect(value).toBeTruthy();
  });

  it('does not repeat an item name', () => {
    const names = allItems().map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('keeps hosts, addresses, accounts and internal project names out of the page', () => {
    const text = allText();
    // IPv4 addresses, the machine and tailnet names, the operator's private account and the work project
    expect(text).not.toMatch(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
    expect(text).not.toMatch(/SAPPHIRE|Emerald-Fusion|EMERALD|ostg0|hermes-(agent|ts)|ricar\\|tailad|\.ts\.net|devandreotti@/i);
    expect(text).not.toMatch(/OneMob|Mind Group/i);
    expect(text).not.toMatch(/[A-Za-z]:\\/);
  });
});
