import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { READING_KEY, useReadingMode } from './useReadingMode';

describe('useReadingMode', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('starts off, turns on and off with toggle, and remembers the choice', () => {
    const first = renderHook(() => useReadingMode());
    expect(first.result.current.on).toBe(false);

    act(() => first.result.current.toggle());
    expect(first.result.current.on).toBe(true);
    expect(localStorage.getItem(READING_KEY)).toBe('1');
    first.unmount();

    // a later visit starts in reading mode
    const again = renderHook(() => useReadingMode());
    expect(again.result.current.on).toBe(true);
    act(() => again.result.current.toggle());
    expect(again.result.current.on).toBe(false);
    expect(localStorage.getItem(READING_KEY)).toBe('0');
  });

  it('leaves reading mode with Escape, and ignores Escape while it is off', () => {
    const { result } = renderHook(() => useReadingMode());
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(result.current.on).toBe(false);

    act(() => result.current.toggle());
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(result.current.on).toBe(true);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(result.current.on).toBe(false);
    expect(localStorage.getItem(READING_KEY)).toBe('0');
  });

  it('works without storage: reads as off and still toggles for the page', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useReadingMode());
    expect(result.current.on).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.on).toBe(true);
  });
});
