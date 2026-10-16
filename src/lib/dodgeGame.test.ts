import { describe, expect, it } from 'vitest';
import {
  BUG_SIZE,
  FIELD,
  NO_INPUT,
  createGame,
  fallSpeedAt,
  hits,
  reducedScale,
  scoreOf,
  spawnBug,
  spawnIntervalAt,
  startGame,
  stepGame,
  type Bug,
  type DodgeGame,
} from './dodgeGame';

const fixedRng = (value: number) => () => value;
// a bug far from the player's start, so movement tests never collide
const FAR_RNG = fixedRng(1);
const bugAt = (x: number, y: number): Bug => ({ x, y });
const withBugs = (game: DodgeGame, bugs: Bug[]): DodgeGame => ({ ...game, status: 'playing', bugs });

describe('dodgeGame: states', () => {
  it('createGame waits centred with no bugs', () => {
    const game = createGame();
    expect(game).toMatchObject({ status: 'ready', elapsed: 0, playerX: FIELD.width / 2, bugs: [] });
  });

  it('startGame begins a fresh run from the same centred start', () => {
    expect(startGame()).toMatchObject({ status: 'playing', elapsed: 0, playerX: FIELD.width / 2, bugs: [] });
  });

  it('scoreOf counts whole seconds survived', () => {
    expect(scoreOf({ ...startGame(), elapsed: 12.9 })).toBe(12);
    expect(scoreOf(createGame())).toBe(0);
  });

  it('a game that is not playing is returned unchanged', () => {
    const ready = createGame();
    const over = { ...startGame(), status: 'over' as const };
    expect(stepGame(ready, 1, NO_INPUT, FAR_RNG)).toBe(ready);
    expect(stepGame(over, 1, NO_INPUT, FAR_RNG)).toBe(over);
  });
});

describe('dodgeGame: spawning and difficulty', () => {
  it('spawnBug drops from above the field, anywhere across its width', () => {
    expect(spawnBug(fixedRng(0))).toEqual({ x: BUG_SIZE / 2, y: -BUG_SIZE / 2 });
    const right = spawnBug(fixedRng(1));
    expect(right.x).toBeGreaterThan(FIELD.width - BUG_SIZE);
    expect(right.x).toBeLessThan(FIELD.width);
  });

  it('fall speed starts slow, ramps with time and is capped', () => {
    expect(fallSpeedAt(0)).toBe(70);
    expect(fallSpeedAt(10)).toBe(130);
    expect(fallSpeedAt(1000)).toBe(340);
    expect(fallSpeedAt(10, reducedScale)).toBe(65);
  });

  it('spawn interval shrinks with time down to a floor, and grows in reduced motion', () => {
    expect(spawnIntervalAt(0)).toBe(1);
    expect(spawnIntervalAt(10)).toBeCloseTo(0.8);
    expect(spawnIntervalAt(1000)).toBe(0.35);
    expect(spawnIntervalAt(0, reducedScale)).toBe(2);
  });

  it('spawns a bug when the timer runs out and re-arms it', () => {
    const game = { ...startGame(), spawnIn: 0.05 };
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.bugs).toHaveLength(1);
    expect(next.spawnIn).toBeCloseTo(spawnIntervalAt(0.05));
  });

  it('drops bugs and removes the ones that left the bottom of the field', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, [bugAt(50, 10), bugAt(60, FIELD.height + BUG_SIZE / 2 + 0.5)]);
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.bugs).toHaveLength(1);
    expect(next.bugs[0]).toMatchObject({ x: 50 });
    expect(next.bugs[0].y).toBeCloseTo(10 + fallSpeedAt(0.05) * 0.05);
  });
});

describe('dodgeGame: player movement', () => {
  it('moves right and left with the keys, at a fixed speed', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, []);
    expect(stepGame(game, 0.05, { ...NO_INPUT, right: true }, FAR_RNG).playerX).toBeCloseTo(FIELD.width / 2 + 13);
    expect(stepGame(game, 0.05, { ...NO_INPUT, left: true }, FAR_RNG).playerX).toBeCloseTo(FIELD.width / 2 - 13);
  });

  it('keeps the player inside the field', () => {
    let game = withBugs({ ...startGame(), spawnIn: 5 }, []);
    for (let i = 0; i < 100; i++) game = stepGame(game, 0.05, { ...NO_INPUT, left: true }, FAR_RNG);
    expect(game.playerX).toBe(12);
    for (let i = 0; i < 100; i++) game = stepGame(game, 0.05, { ...NO_INPUT, right: true }, FAR_RNG);
    expect(game.playerX).toBe(FIELD.width - 12);
  });

  it('chases a pointer or finger, and stops when the target is reached', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, []);
    const near = stepGame(game, 0.01, { ...NO_INPUT, targetX: 300 }, FAR_RNG);
    expect(near.playerX).toBeCloseTo(FIELD.width / 2 + 9);
    const reached = stepGame(game, 1, { ...NO_INPUT, targetX: 230 }, FAR_RNG);
    expect(reached.playerX).toBe(230);
    let back = game;
    for (let i = 0; i < 20; i++) back = stepGame(back, 0.05, { ...NO_INPUT, targetX: 10 }, FAR_RNG);
    expect(back.playerX).toBe(12);
  });

  it('keys win over a held pointer, and a pointer without keys leaves the player still', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, []);
    expect(stepGame(game, 0.05, { left: false, right: true, targetX: 0 }, FAR_RNG).playerX).toBeCloseTo(FIELD.width / 2 + 13);
    expect(stepGame(game, 0.05, NO_INPUT, FAR_RNG).playerX).toBe(FIELD.width / 2);
  });

  it('a long pause moves the bugs by at most one capped step', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, [bugAt(50, 10)]);
    const next = stepGame(game, 30, NO_INPUT, FAR_RNG);
    expect(next.elapsed).toBeCloseTo(0.05);
    expect(next.bugs[0].y).toBeCloseTo(10 + fallSpeedAt(0.05) * 0.05);
  });
});

describe('dodgeGame: collisions', () => {
  it('hits only when the bug overlaps the player square', () => {
    const playerX = 200;
    expect(hits(playerX, bugAt(200, 220))).toBe(true);
    expect(hits(playerX, bugAt(200 + 17.9, 220))).toBe(true);
    expect(hits(playerX, bugAt(200 + 18, 220))).toBe(false);
    expect(hits(playerX, bugAt(200, 200 - 18))).toBe(false);
    expect(hits(playerX, bugAt(200, -9))).toBe(false);
  });

  it('a bug landing on the player ends the run and freezes it', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, [bugAt(FIELD.width / 2, 220)]);
    const over = stepGame(game, 0.01, NO_INPUT, FAR_RNG);
    expect(over.status).toBe('over');
    expect(stepGame(over, 1, NO_INPUT, FAR_RNG)).toBe(over);
  });
});
