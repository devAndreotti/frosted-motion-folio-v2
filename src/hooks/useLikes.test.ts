import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { likesUrl, useLikes } from './useLikes';

const answer = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('useLikes', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('builds the API path under the app base (/ in tests)', () => {
    expect(likesUrl('meu post')).toBe('/api/likes/meu%20post');
  });

  it('reads the count, then likes and unlikes with the server answer', async () => {
    const fetch = vi.fn((_url: string, init: RequestInit) => {
      if (init.method === 'GET') return answer({ count: 4, liked: false });
      if (init.method === 'POST') return answer({ count: 5, liked: true });
      return answer({ count: 4, liked: false });
    });
    vi.stubGlobal('fetch', fetch);
    const { result } = renderHook(() => useLikes('post'));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.count).toBe(4);

    act(() => result.current.toggle());
    // optimistic, before the server answers
    expect(result.current).toMatchObject({ liked: true, count: 5, busy: true });
    await waitFor(() => expect(result.current.busy).toBe(false));
    expect(result.current).toMatchObject({ liked: true, count: 5, error: false });

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.busy).toBe(false));
    expect(result.current).toMatchObject({ liked: false, count: 4 });
    expect(fetch.mock.calls.map(([, init]) => init.method)).toEqual(['GET', 'POST', 'DELETE']);
  });

  it('turns off where the host has no likes', async () => {
    vi.stubGlobal('fetch', vi.fn(() => answer({ error: 'off' }, 503)));
    const { result } = renderHook(() => useLikes('post'));
    await waitFor(() => expect(result.current.status).toBe('off'));
    act(() => result.current.toggle());
    expect(result.current.busy).toBe(false);
  });

  it('treats an answer that is not a like count as no likes (an SPA fallback page)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => answer({ hello: 'world' })));
    const { result } = renderHook(() => useLikes('post'));
    await waitFor(() => expect(result.current.status).toBe('off'));
  });

  it('rolls the click back and flags the error when the write fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => (init.method === 'GET' ? answer({ count: 2, liked: false }) : answer({ error: 'slow down' }, 429)))
    );
    const { result } = renderHook(() => useLikes('post'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current).toMatchObject({ liked: false, count: 2, busy: false });
  });
});
