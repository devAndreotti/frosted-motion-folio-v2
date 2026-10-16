import { describe, expect, it } from 'vitest';
import { DELETE_AFTER_DAYS, phaseFor } from './simulation';

describe('phaseFor', () => {
  it('follows the subscription steps', () => {
    expect(phaseFor(0, 0)).toBe('waiting');
    expect(phaseFor(0, DELETE_AFTER_DAYS - 1)).toBe('waiting');
    expect(phaseFor(1, 0)).toBe('active');
    expect(phaseFor(1, DELETE_AFTER_DAYS)).toBe('active');
    expect(phaseFor(2, 0)).toBe('left');
  });

  it('deletes a pending address on the seventh day, matching the worker', () => {
    expect(DELETE_AFTER_DAYS).toBe(7);
    expect(phaseFor(0, 7)).toBe('deleted');
  });
});
