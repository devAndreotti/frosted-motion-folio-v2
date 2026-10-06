import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FLY_MS, useCardStack } from './useCardStack';
import { stackTransform } from '@/lib/cardStack';

const IDS = ['photo', 'a', 'b', 'c'];

describe('useCardStack', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('autoplays the front card to the back with a flight from its slot', () => {
    const { result } = renderHook(() => useCardStack(IDS, 5000));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.order).toEqual(['a', 'b', 'c', 'photo']);
    expect(result.current.flight).toMatchObject({ id: 'photo', kind: 'back', from: stackTransform(0) });

    act(() => vi.advanceTimersByTime(FLY_MS));
    expect(result.current.flight).toBeNull();
  });

  it('picking a back card brings it forward and stops the autoplay', () => {
    const { result } = renderHook(() => useCardStack(IDS, 1000));
    act(() => result.current.pick('c'));
    expect(result.current.order).toEqual(['c', 'photo', 'a', 'b']);
    expect(result.current.flight).toMatchObject({ id: 'c', kind: 'front', from: stackTransform(3) });

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.order).toEqual(['c', 'photo', 'a', 'b']);
  });

  it('next/prev walk the pile in both directions with distinct flight counters', () => {
    const { result } = renderHook(() => useCardStack(IDS, 1000));
    act(() => result.current.next());
    const first = result.current.flight!.n;
    expect(result.current.order[0]).toBe('a');

    act(() => result.current.prev());
    expect(result.current.order[0]).toBe('photo');
    expect(result.current.flight).toMatchObject({ id: 'photo', kind: 'front' });
    expect(result.current.flight!.n).toBe(first + 1);
  });

  it('holds the shuffle while paused (off screen) and resumes after', () => {
    const { result, rerender } = renderHook(({ paused }) => useCardStack(IDS, 1000, paused), { initialProps: { paused: true } });
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.order).toEqual(IDS);

    rerender({ paused: false });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.order[0]).toBe('a');
  });

  it('does not autoplay under browser automation', () => {
    vi.stubGlobal('navigator', { webdriver: true });
    const { result } = renderHook(() => useCardStack(IDS, 1000));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.order).toEqual(IDS);
  });
});
