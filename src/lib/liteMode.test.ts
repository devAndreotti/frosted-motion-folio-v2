import { afterEach, describe, expect, it, vi } from 'vitest';
import { dataSaverOn, initLiteMode, isLiteMode, lowBatteryOn, reducedDataOn } from './liteMode';

const fakeNav = (extra: Record<string, unknown> = {}) => extra as unknown as Navigator;
const fakeWin = (matches = false) =>
  ({ matchMedia: vi.fn(() => ({ matches })) }) as unknown as Window;
const battery = (charging: boolean, level: number) => () => Promise.resolve({ charging, level });

afterEach(() => {
  document.documentElement.removeAttribute('data-lite');
  vi.restoreAllMocks();
});

describe('dataSaverOn', () => {
  it('is true only when navigator.connection.saveData is exactly true', () => {
    expect(dataSaverOn(fakeNav({ connection: { saveData: true } }))).toBe(true);
    expect(dataSaverOn(fakeNav({ connection: { saveData: false } }))).toBe(false);
    expect(dataSaverOn(fakeNav({ connection: {} }))).toBe(false);
    expect(dataSaverOn(fakeNav())).toBe(false);
  });

  it('never throws, even when the connection getter does', () => {
    const nav = fakeNav({});
    Object.defineProperty(nav, 'connection', {
      get() {
        throw new Error('blocked');
      },
    });
    expect(dataSaverOn(nav)).toBe(false);
  });
});

describe('reducedDataOn', () => {
  it('follows the prefers-reduced-data media query', () => {
    const win = fakeWin(true);
    expect(reducedDataOn(win)).toBe(true);
    expect(win.matchMedia).toHaveBeenCalledWith('(prefers-reduced-data: reduce)');
    expect(reducedDataOn(fakeWin(false))).toBe(false);
  });

  it('is false where matchMedia is missing or throws', () => {
    expect(reducedDataOn({} as Window)).toBe(false);
    expect(
      reducedDataOn({
        matchMedia: () => {
          throw new Error('nope');
        },
      } as unknown as Window),
    ).toBe(false);
  });
});

describe('lowBatteryOn', () => {
  it('is true when not charging and at or below 20%', async () => {
    expect(await lowBatteryOn(fakeNav({ getBattery: battery(false, 0.2) }))).toBe(true);
    expect(await lowBatteryOn(fakeNav({ getBattery: battery(false, 0.05) }))).toBe(true);
  });

  it('is false above 20%, or while charging, however low the level', async () => {
    expect(await lowBatteryOn(fakeNav({ getBattery: battery(false, 0.21) }))).toBe(false);
    expect(await lowBatteryOn(fakeNav({ getBattery: battery(true, 0.05) }))).toBe(false);
  });

  it('is false where the Battery API is missing', async () => {
    expect(await lowBatteryOn(fakeNav())).toBe(false);
  });

  it('is false, and never rejects, when getBattery throws or rejects', async () => {
    expect(
      await lowBatteryOn(
        fakeNav({
          getBattery: () => {
            throw new Error('insecure context');
          },
        }),
      ),
    ).toBe(false);
    expect(await lowBatteryOn(fakeNav({ getBattery: () => Promise.reject(new Error('denied')) }))).toBe(false);
  });
});

describe('initLiteMode', () => {
  it('sets data-lite at once when Data Saver is on, without waiting for the battery', async () => {
    const getBattery = vi.fn(battery(false, 0.9));
    const on = await initLiteMode(fakeNav({ connection: { saveData: true }, getBattery }), fakeWin(false), document.documentElement);
    expect(on).toBe(true);
    expect(isLiteMode()).toBe(true);
    expect(getBattery).not.toHaveBeenCalled();
  });

  it('sets data-lite when the reduced-data preference matches', async () => {
    await initLiteMode(fakeNav(), fakeWin(true), document.documentElement);
    expect(document.documentElement.hasAttribute('data-lite')).toBe(true);
  });

  it('turns lite mode on from a low battery, after the async check', async () => {
    const root = document.documentElement;
    const pending = initLiteMode(fakeNav({ getBattery: battery(false, 0.15) }), fakeWin(false), root);
    expect(root.hasAttribute('data-lite')).toBe(false);
    expect(await pending).toBe(true);
    expect(root.hasAttribute('data-lite')).toBe(true);
  });

  it('leaves the page alone when no signal applies', async () => {
    expect(await initLiteMode(fakeNav({ getBattery: battery(true, 0.1) }), fakeWin(false), document.documentElement)).toBe(false);
    expect(isLiteMode()).toBe(false);
  });

  it('uses the real navigator and window when no arguments are given', async () => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true });
    try {
      expect(await initLiteMode()).toBe(true);
      expect(isLiteMode()).toBe(true);
    } finally {
      Reflect.deleteProperty(navigator, 'connection');
    }
  });
});
