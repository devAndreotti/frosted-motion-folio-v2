import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { readBest, saveBest } from '@/lib/dodgeBest';
import { drawDodge, type DodgePalette } from '@/lib/dodgeDraw';
import {
  FIELD,
  NO_INPUT,
  createGame,
  reducedScale,
  scoreOf,
  startGame,
  stepGame,
  type DodgeGame,
  type DodgeInput,
  type DodgeStatus,
} from '@/lib/dodgeGame';

export interface DodgeView {
  status: DodgeStatus;
  score: number;
  best: number;
}

const FALLBACK_PALETTE: DodgePalette = { accent: '#3b82f6', bug: '#888888', line: 'rgba(128,128,128,0.25)' };

/** Colours come from the theme tokens, so the field follows light/dark and the chosen hue. */
function readPalette(el: HTMLElement): DodgePalette {
  const style = getComputedStyle(el);
  const token = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    accent: token('--accent', FALLBACK_PALETTE.accent),
    bug: token('--fg-2', FALLBACK_PALETTE.bug),
    line: token('--border-1', FALLBACK_PALETTE.line),
  };
}

const isHidden = () => typeof document !== 'undefined' && document.hidden;

/**
 * Runs the dodge game on a canvas: a requestAnimationFrame loop, drag/touch and keyboard input,
 * and a pause while the tab is hidden. Reduced motion starts paused at half speed.
 */
export function useDodgeGame(fieldRef: RefObject<HTMLDivElement>, canvasRef: RefObject<HTMLCanvasElement>, reduced: boolean) {
  const gameRef = useRef<DodgeGame>(reduced ? createGame() : startGame());
  const inputRef = useRef<DodgeInput>({ ...NO_INPUT });
  const [view, setView] = useState<DodgeView>(() => ({
    status: gameRef.current.status,
    score: 0,
    best: readBest(),
  }));

  // what the React state last showed; the loop publishes only when status or score moves
  const shownRef = useRef({ status: gameRef.current.status, score: 0 });

  const publish = useCallback(() => {
    const game = gameRef.current;
    const score = scoreOf(game);
    shownRef.current = { status: game.status, score };
    const best = game.status === 'over' ? saveBest(score) : null;
    setView((prev) => {
      const next = { score, status: game.status, best: best ?? prev.best };
      return prev.status === next.status && prev.score === next.score && prev.best === next.best ? prev : next;
    });
  }, []);

  const begin = useCallback(() => {
    if (gameRef.current.status === 'playing') return;
    gameRef.current = startGame();
    publish();
  }, [publish]);

  // loop: step while visible, always draw; cancelled on unmount
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') ?? null;
    const scale = reduced ? reducedScale : 1;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas) {
      canvas.width = FIELD.width * dpr;
      canvas.height = FIELD.height * dpr;
    }

    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last === null ? 0 : (now - last) / 1000;
      last = now;
      if (isHidden()) return;

      const game = stepGame(gameRef.current, dt, inputRef.current, Math.random, scale);
      gameRef.current = game;
      const shown = shownRef.current;
      if (game.status !== shown.status || scoreOf(game) !== shown.score) publish();

      if (ctx && canvas) drawDodge(ctx, gameRef.current, readPalette(canvas), dpr);
    };

    const onVisibility = () => {
      last = null;
    };

    frame = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef, reduced, publish]);

  const toField = useCallback(
    (clientX: number) => {
      const rect = (fieldRef.current ?? canvasRef.current)?.getBoundingClientRect();
      if (!rect || rect.width === 0) return null;
      return ((clientX - rect.left) / rect.width) * FIELD.width;
    },
    [canvasRef, fieldRef]
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    begin();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    inputRef.current = { ...inputRef.current, targetX: toField(e.clientX) };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    inputRef.current = { ...inputRef.current, targetX: toField(e.clientX) };
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    inputRef.current = { ...inputRef.current, targetX: null };
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        inputRef.current = { ...input, left: true };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        inputRef.current = { ...input, right: true };
        break;
      case ' ':
      case 'Enter':
        if (!e.repeat) begin();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inputRef.current = { ...input, left: false };
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inputRef.current = { ...input, right: false };
  };

  return { view, begin, onPointerDown, onPointerMove, onPointerUp, onKeyDown, onKeyUp };
}
