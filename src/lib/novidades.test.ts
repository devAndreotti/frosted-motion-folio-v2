import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEEN_KEY, hasUnseen, markSeen, readSeen } from './novidades';

describe('novidades seen state', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('remembers the newest date seen and clears the badge', () => {
    expect(hasUnseen(readSeen(), '2026-10-16')).toBe(true);
    markSeen('2026-10-16');
    expect(localStorage.getItem(SEEN_KEY)).toBe('2026-10-16');
    expect(hasUnseen(readSeen(), '2026-10-16')).toBe(false);
  });

  it('shows the badge again only for a newer change', () => {
    expect(hasUnseen('2026-10-16', '2026-10-17')).toBe(true);
    expect(hasUnseen('2026-10-17', '2026-10-16')).toBe(false);
  });

  it('keeps working when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readSeen()).toBe('');
    expect(() => markSeen('2026-10-16')).not.toThrow();
  });
});
