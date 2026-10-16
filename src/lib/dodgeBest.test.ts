import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BEST_KEY, readBest, saveBest } from './dodgeBest';

const brokenStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('full');
  },
} as unknown as Storage;

describe('dodge best score', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('reads 0 when nothing valid is stored', () => {
    expect(readBest(null)).toBe(0);
    expect(readBest()).toBe(0);
    localStorage.setItem(BEST_KEY, '-3');
    expect(readBest()).toBe(0);
    localStorage.setItem(BEST_KEY, 'abc');
    expect(readBest()).toBe(0);
  });

  it('reads the stored whole seconds', () => {
    localStorage.setItem(BEST_KEY, '7.9');
    expect(readBest()).toBe(7);
  });

  it('keeps only a score that beats the stored best', () => {
    expect(saveBest(5)).toBe(5);
    expect(saveBest(3)).toBe(5);
    expect(readBest()).toBe(5);
    expect(saveBest(9.7)).toBe(9);
    expect(localStorage.getItem(BEST_KEY)).toBe('9');
  });

  it('still reports the score when storage throws', () => {
    expect(readBest(brokenStorage)).toBe(0);
    expect(saveBest(4, brokenStorage)).toBe(4);
  });

  it('falls back to 0 when window.localStorage itself is blocked', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readBest()).toBe(0);
    expect(saveBest(2)).toBe(2);
  });
});
