import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { readBest, saveBest } from '@/lib/dodgeBest';
import { drawDodge, type DodgePalette } from '@/lib/dodgeDraw';
import { applyEvent, createEffects, stepEffects, type Effects } from '@/lib/dodgeEffects';
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
import { bannerVisible, waveOf } from '@/lib/dodgeWaves';

export interface DodgeView {
  status: DodgeStatus;
  score: number;
  best: number;
  lives: number;
  /** 1-based wave the run is in. */
  wave: number;
  /** The "Onda N!" banner is on screen. */
  banner: boolean;
  /** This run has passed the best that was stored when it started. */
  record: boolean;
}

const FALLBACK_PALETTE: DodgePalette = {
  accent: '#3b82f6',
  bug: '#888888',
  coffee: '#15803d',
  line: 'rgba(128,128,128,0.25)',
  text: '#888888',
  font: 'monospace',
};

/** Colours come from the theme tokens, so the field follows light/dark and the chosen hue. */
function readPalette(el: HTMLElement): DodgePalette {
  const style = getComputedStyle(el);
  const token = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    accent: token('--accent', FALLBACK_PALETTE.accent),
    bug: token('--fg-2', FALLBACK_PALETTE.bug),
    coffee: token('--ok', FALLBACK_PALETTE.coffee),
    line: token('--border-1', FALLBACK_PALETTE.line),
    text: token('--fg-1', FALLBACK_PALETTE.text),
    font: token('--font-mono', FALLBACK_PALETTE.font),
  };
}

const viewOf = (game: DodgeGame, best: number, runBest: number): DodgeView => {
  const score = scoreOf(game);
  return {
    status: game.status,
    score,
    best,
    lives: game.lives,
    wave: waveOf(game.elapsed),
    banner: game.status === 'playing' && bannerVisible(game.elapsed),
    record: score > 0 && score > runBest,
  };
};

const sameView = (a: DodgeView, b: DodgeView) => (Object.keys(a) as (keyof DodgeView)[]).every((key) => a[key] === b[key]);

const isHidden = () => typeof document !== 'undefined' && document.hidden;

/**
 * Runs the dodge game on a canvas: a requestAnimationFrame loop, drag/touch and keyboard input,
 * and a pause while the tab is hidden. Reduced motion starts paused at half speed, without particles or shake.
 */
export function useDodgeGame(fieldRef: RefObject<HTMLDivElement>, canvasRef: RefObject<HTMLCanvasElement>, reduced: boolean) {
  const gameRef = useRef<DodgeGame>(reduced ? createGame() : startGame());
  const effectsRef = useRef<Effects>(createEffects(!reduced));
  const inputRef = useRef<DodgeInput>({ ...NO_INPUT });
  const [initialBest] = useState(readBest);
  const bestRef = useRef(initialBest); // best shown; updated once per run when it ends
  const runBestRef = useRef(initialBest); // best that was stored when the current run started
  const savedRef = useRef(false);
  const [view, setView] = useState<DodgeView>(() => viewOf(gameRef.current, initialBest, initialBest));
  const latestRef = useRef<DodgeView | null>(null);

  const publish = useCallback(() => {
    const game = gameRef.current;
    if (game.status === 'over' && !savedRef.current) {
      savedRef.current = true;
      bestRef.current = saveBest(scoreOf(game));
    }
    const next = viewOf(game, bestRef.current, runBestRef.current);
    if (latestRef.current && sameView(latestRef.current, next)) return;
    latestRef.current = next;
    setView(next);
  }, []);

  const begin = useCallback(() => {
    if (gameRef.current.status === 'playing') return;
    gameRef.current = startGame();
    effectsRef.current = createEffects(!reduced);
    runBestRef.current = bestRef.current;
    savedRef.current = false;
    publish();
  }, [publish, reduced]);

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

      const prev = gameRef.current;
      const game = stepGame(prev, dt, inputRef.current, Math.random, scale);
      gameRef.current = game;
      let effects = effectsRef.current;
      if (game !== prev) {
        for (const event of game.events) effects = applyEvent(effects, event, Math.random);
      }
      effectsRef.current = stepEffects(effects, dt);
      publish();

      if (ctx && canvas) drawDodge(ctx, game, effectsRef.current, readPalette(canvas), dpr);
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
