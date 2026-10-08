import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCardFan } from './useCardFan';

describe('useCardFan', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('turns itself to the next card, remembering where it came from', () => {
    const { result } = renderHook(() => useCardFan(5, 1000));
    expect(result.current).toMatchObject({ active: 0, n: 0, playing: true });

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toMatchObject({ active: 1, from: 0, dir: 1, n: 1 });

    act(() => vi.advanceTimersByTime(4000));
    expect(result.current).toMatchObject({ active: 0, from: 4, n: 5 });
  });

  it('brings a picked side card to the centre, turning towards it, and stops the autoplay', () => {
    const { result } = renderHook(() => useCardFan(5, 1000));
    act(() => result.current.pick(3)); // offset -2: on the left
    expect(result.current).toMatchObject({ active: 3, from: 0, dir: -1, playing: false });

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.active).toBe(3);
  });

  it('moves on when the centre card itself is picked, so a click always does something', () => {
    const { result } = renderHook(() => useCardFan(5, 1000));
    act(() => result.current.pick(0));
    expect(result.current).toMatchObject({ active: 1, dir: 1, n: 1 });
  });

  it('walks both ways with the arrows, wrapping around the ends', () => {
    const { result } = renderHook(() => useCardFan(5, 1000));
    act(() => result.current.prev());
    expect(result.current).toMatchObject({ active: 4, from: 0, dir: -1 });
    act(() => result.current.next());
    expect(result.current).toMatchObject({ active: 0, from: 4, dir: 1, n: 2 });
  });

  it('holds still while paused (off screen) and under browser automation', () => {
    const { result, rerender } = renderHook(({ paused }) => useCardFan(5, 1000, paused), { initialProps: { paused: true } });
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current).toMatchObject({ active: 0, playing: false });
    rerender({ paused: false });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.active).toBe(1);

    vi.stubGlobal('navigator', { webdriver: true });
    const automated = renderHook(() => useCardFan(5, 1000));
    act(() => vi.advanceTimersByTime(3000));
    expect(automated.result.current).toMatchObject({ active: 0, playing: false });
  });
});
