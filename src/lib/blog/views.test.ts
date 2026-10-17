import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recordView } from './views';

describe('recordView', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends one beacon per post per tab', () => {
    const sendBeacon = vi.fn((_url: string) => true);
    vi.stubGlobal('navigator', { sendBeacon });
    recordView('meu-post');
    recordView('meu-post');
    recordView('outro');
    expect(sendBeacon.mock.calls.map((call) => (call as unknown as [string])[0])).toEqual(['/api/blog/view/meu-post', '/api/blog/view/outro']);
  });

  it('falls back to fetch when the beacon is refused, and still counts without storage', () => {
    vi.stubGlobal('navigator', { sendBeacon: () => false });
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal('fetch', fetchMock);
    const storage = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    recordView('meu-post');
    expect(fetchMock).toHaveBeenCalledWith('/api/blog/view/meu-post', { method: 'POST', keepalive: true });
    storage.mockRestore();
  });
});
