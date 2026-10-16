import { describe, expect, it } from 'vitest';
import { hauntedActive, isHauntedForced, isHauntedMinute } from './haunted';

describe('isHauntedMinute', () => {
  it('is true for every second of 03:17 local time', () => {
    expect(isHauntedMinute(new Date(2026, 9, 16, 3, 17, 0))).toBe(true);
    expect(isHauntedMinute(new Date(2026, 9, 16, 3, 17, 59))).toBe(true);
  });

  it('is false just before and just after the window, and at 15:17', () => {
    expect(isHauntedMinute(new Date(2026, 9, 16, 3, 16, 59))).toBe(false);
    expect(isHauntedMinute(new Date(2026, 9, 16, 3, 18, 0))).toBe(false);
    expect(isHauntedMinute(new Date(2026, 9, 16, 15, 17, 0))).toBe(false);
  });
});

describe('isHauntedForced', () => {
  it('only the exact value 1 forces the mode on', () => {
    expect(isHauntedForced('?haunted=1')).toBe(true);
    expect(isHauntedForced('?lang=pt&haunted=1')).toBe(true);
    expect(isHauntedForced('?haunted=0')).toBe(false);
    expect(isHauntedForced('?haunted=true')).toBe(false);
    expect(isHauntedForced('')).toBe(false);
  });
});

describe('hauntedActive', () => {
  it('follows the injected clock when the query does not force it', () => {
    expect(hauntedActive('', () => new Date(2026, 9, 16, 3, 17, 30))).toBe(true);
    expect(hauntedActive('', () => new Date(2026, 9, 16, 12, 0, 0))).toBe(false);
  });

  it('is on at any time when forced by the query', () => {
    expect(hauntedActive('?haunted=1', () => new Date(2026, 9, 16, 12, 0, 0))).toBe(true);
  });
});
