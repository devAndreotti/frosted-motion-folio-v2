import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { BEST_KEY } from '@/lib/dodgeBest';
import NotFoundGame from './NotFoundGame';

// requestAnimationFrame is driven by hand: each runFrames() call is one frame of `step` ms.
let queue: FrameRequestCallback[] = [];
let clock = 0;
const runFrames = (count: number, step = 50) => {
  for (let i = 0; i < count; i++) {
    const cb = queue.shift();
    if (!cb) return;
    clock += step;
    act(() => cb(clock));
  }
};

const ctx = {
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  setLineDash: vi.fn(),
  fill: vi.fn(),
  ellipse: vi.fn(),
  arc: vi.fn(),
  roundRect: vi.fn(),
};
const lastPlayerX = () => {
  const call = ctx.roundRect.mock.calls.at(-1);
  return call ? (call[0] as number) + 12 : NaN;
};

const originalMatchMedia = window.matchMedia;
const setReducedMotion = (reduced: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
};

const renderGame = () =>
  render(
    <LanguageProvider>
      <NotFoundGame />
    </LanguageProvider>
  );

const field = () => screen.getByRole('group', { name: 'Mini jogo: desvie dos bugs' });

describe('NotFoundGame', () => {
  beforeEach(() => {
    localStorage.clear();
    queue = [];
    clock = 0;
    ctx.roundRect.mockClear();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      queue.push(cb);
      return queue.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    // every bug drops straight onto the centred player
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    setReducedMotion(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  it('starts by itself with normal motion, ends on a hit and keeps the best score', () => {
    renderGame();
    expect(screen.queryByRole('button', { name: 'Começar' })).toBeNull();
    expect(screen.getByText(/recorde 0s/)).toBeTruthy();

    runFrames(200);

    expect(screen.getByRole('status').textContent).toContain('Você bateu num bug');
    expect(Number(localStorage.getItem(BEST_KEY))).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Jogar de novo' })).toBeTruthy();
  });

  it('shows the best score saved by an earlier visit', () => {
    localStorage.setItem(BEST_KEY, '42');
    renderGame();
    expect(screen.getByText(/recorde 42s/)).toBeTruthy();
  });

  it('restarts with Enter or Space once the run is over, but ignores held keys', () => {
    renderGame();
    runFrames(200);
    expect(screen.getByRole('button', { name: 'Jogar de novo' })).toBeTruthy();

    fireEvent.keyDown(field(), { key: ' ', repeat: true });
    expect(screen.queryByRole('status')).not.toBeNull();

    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Jogar de novo' })).toBeNull();
  });

  it('waits for the start button under reduced motion, and runs at half speed', () => {
    setReducedMotion(true);
    renderGame();
    const start = screen.getByRole('button', { name: 'Começar' });
    expect(screen.getByText('Aperte para começar').textContent).toBe('Aperte para começar');

    runFrames(200);
    expect(screen.getByRole('button', { name: 'Começar' })).toBeTruthy();

    fireEvent.click(start);
    expect(screen.queryByRole('button', { name: 'Começar' })).toBeNull();
  });

  it('moves the square with the arrow keys and with A / D', () => {
    vi.mocked(Math.random).mockReturnValue(0.99);
    renderGame();
    runFrames(2);
    const before = lastPlayerX();

    fireEvent.keyDown(field(), { key: 'ArrowLeft' });
    runFrames(10);
    fireEvent.keyUp(field(), { key: 'ArrowLeft' });
    const afterLeft = lastPlayerX();
    expect(afterLeft).toBeLessThan(before);

    fireEvent.keyDown(field(), { key: 'd' });
    runFrames(10);
    fireEvent.keyUp(field(), { key: 'd' });
    expect(lastPlayerX()).toBeGreaterThan(afterLeft);

    fireEvent.keyDown(field(), { key: 'a' });
    fireEvent.keyUp(field(), { key: 'a' });
    fireEvent.keyDown(field(), { key: 'A' });
    fireEvent.keyUp(field(), { key: 'A' });
    fireEvent.keyDown(field(), { key: 'D' });
    fireEvent.keyUp(field(), { key: 'D' });
    fireEvent.keyDown(field(), { key: 'x' });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('follows a drag across the field, in logical units', () => {
    vi.mocked(Math.random).mockReturnValue(0.99);
    renderGame();
    const el = field();
    el.getBoundingClientRect = () => ({ left: 0, width: 400, top: 0, height: 250, right: 400, bottom: 250, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
    // capture follows the pointer like a browser: held from pointerdown until pointerup
    let captured = false;
    el.hasPointerCapture = () => captured;
    el.setPointerCapture = () => {
      captured = true;
    };
    el.releasePointerCapture = () => {
      captured = false;
    };

    fireEvent.pointerDown(el, { clientX: 50, pointerId: 1 });
    runFrames(40);
    expect(lastPlayerX()).toBeCloseTo(50, 0);

    fireEvent.pointerMove(el, { clientX: 350, pointerId: 1 });
    runFrames(40);
    expect(lastPlayerX()).toBeCloseTo(350, 0);

    fireEvent.pointerUp(el, { pointerId: 1 });
    fireEvent.pointerMove(el, { clientX: 20, pointerId: 1 });
    runFrames(10);
    expect(lastPlayerX()).toBeCloseTo(350, 0);
  });

  it('ignores pointer moves that are not captured', () => {
    renderGame();
    const el = field();
    el.hasPointerCapture = () => false;
    fireEvent.pointerMove(el, { clientX: 10, pointerId: 1 });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('pauses while the tab is hidden and resumes when it is back', () => {
    renderGame();
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    runFrames(200);
    expect(screen.queryByRole('status')).toBeNull();

    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    runFrames(200);
    expect(screen.getByRole('status').textContent).toContain('Você bateu num bug');
  });

  it('cancels the frame loop on unmount', () => {
    const { unmount } = renderGame();
    const pending = queue.length;
    unmount();
    expect(pending).toBe(1);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it('still renders and plays when the canvas has no 2D context', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    renderGame();
    runFrames(200);
    expect(screen.getByRole('status').textContent).toContain('Você bateu num bug');
  });
});
