import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useActiveHeading } from './useActiveHeading';

type Cb = (entries: { target: Element; isIntersecting: boolean }[]) => void;

describe('useActiveHeading', () => {
  const observers: { cb: Cb; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];

  afterEach(() => {
    vi.unstubAllGlobals();
    observers.length = 0;
    document.body.innerHTML = '';
  });

  const stub = () => {
    class FakeObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(cb: Cb) {
        observers.push({ cb, observe: this.observe, disconnect: this.disconnect });
      }
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver);
  };

  it('follows the first section in view, and keeps the last one when none is', () => {
    stub();
    document.body.innerHTML = '<h2 id="um">Um</h2><h2 id="dois">Dois</h2>';
    const { result } = renderHook(() => useActiveHeading('um|dois'));
    expect(result.current).toBeNull();
    const um = document.getElementById('um')!;
    const dois = document.getElementById('dois')!;
    act(() => observers[0].cb([{ target: dois, isIntersecting: true }]));
    expect(result.current).toBe('dois');
    act(() => observers[0].cb([{ target: um, isIntersecting: true }, { target: dois, isIntersecting: false }]));
    expect(result.current).toBe('um');
    act(() => observers[0].cb([{ target: um, isIntersecting: false }]));
    expect(result.current).toBe('um');
  });

  it('does nothing without headings or without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { result } = renderHook(() => useActiveHeading('x'));
    expect(result.current).toBeNull();
    expect(observers).toHaveLength(0);
  });

  it('disconnects on unmount', () => {
    stub();
    document.body.innerHTML = '<h2 id="um">Um</h2>';
    const { unmount } = renderHook(() => useActiveHeading('um'));
    unmount();
    expect(observers[0].disconnect).toHaveBeenCalled();
  });
});
