import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHaunted } from './useHaunted';

describe('useHaunted', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState({}, '', '/');
  });

  it('turns on at 03:17 and back off at 03:18 while the page stays open', () => {
    let current = new Date(2026, 9, 16, 3, 16, 45);
    const now = () => current;
    const { result } = renderHook(() => useHaunted(now));
    expect(result.current).toBe(false);

    current = new Date(2026, 9, 16, 3, 17, 5);
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(result.current).toBe(true);

    current = new Date(2026, 9, 16, 3, 18, 0);
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(result.current).toBe(false);
  });

  it('is on from the first render when the query forces it', () => {
    window.history.replaceState({}, '', '/?haunted=1');
    const { result } = renderHook(() => useHaunted(() => new Date(2026, 9, 16, 12, 0, 0)));
    expect(result.current).toBe(true);
  });
});
