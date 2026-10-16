import { describe, expect, it } from 'vitest';
import {
  BUG_SIZE,
  COFFEE_BONUS,
  FIELD,
  LIVES,
  NO_INPUT,
  SLOW_SCALE,
  catches,
  coffeeGapOf,
  createGame,
  fallSpeedAt,
  hits,
  isInvulnerable,
  reducedScale,
  scoreOf,
  spawnBug,
  spawnCoffee,
  spawnIntervalAt,
  startGame,
  stepGame,
  type Bug,
  type DodgeGame,
} from './dodgeGame';

const fixedRng = (value: number) => () => value;
// a bug far from the player's start, so movement tests never collide
const FAR_RNG = fixedRng(1);
const PLAYER_Y = FIELD.height - 28 / 2 - 12;
const CENTRE = FIELD.width / 2;
const bugAt = (x: number, y: number): Bug => ({ x, y });
const withBugs = (game: DodgeGame, bugs: Bug[]): DodgeGame => ({ ...game, status: 'playing', bugs });

describe('dodgeGame: states', () => {
  it('createGame waits centred with no bugs, three lives and no coffee', () => {
    const game = createGame();
    expect(game).toMatchObject({ status: 'ready', elapsed: 0, playerX: CENTRE, bugs: [], coffees: [], lives: LIVES, bonus: 0 });
    expect(LIVES).toBe(3);
  });

  it('startGame begins a fresh run from the same centred start', () => {
    expect(startGame()).toMatchObject({ status: 'playing', elapsed: 0, playerX: CENTRE, bugs: [], lives: LIVES });
  });

  it('scoreOf counts whole seconds survived plus coffee bonuses', () => {
    expect(scoreOf({ ...startGame(), elapsed: 12.9 })).toBe(12);
    expect(scoreOf({ ...startGame(), elapsed: 12.9, bonus: 10 })).toBe(22);
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
    expect(fallSpeedAt(0)).toBe(90);
    expect(fallSpeedAt(10)).toBe(160);
    expect(fallSpeedAt(1000)).toBe(430);
    expect(fallSpeedAt(10, reducedScale)).toBe(80);
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

  it('a coffee drops now and then, much rarer than bugs, with a random gap', () => {
    expect(spawnCoffee(fixedRng(0))).toEqual({ x: 10, y: -10 });
    expect(coffeeGapOf(fixedRng(0))).toBe(8);
    expect(coffeeGapOf(fixedRng(1))).toBeGreaterThan(13.9);
    const game = { ...withBugs(startGame(), []), spawnIn: 5, coffeeIn: 0.05 };
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.coffees).toHaveLength(1);
    expect(next.coffeeIn).toBeCloseTo(coffeeGapOf(FAR_RNG));
  });

  it('a missed coffee leaves the bottom of the field', () => {
    const game = { ...withBugs(startGame(), []), spawnIn: 5, coffeeIn: 5, coffees: [bugAt(50, FIELD.height + 20)] };
    expect(stepGame(game, 0.05, NO_INPUT, FAR_RNG).coffees).toEqual([]);
  });
});

describe('dodgeGame: waves and patterns', () => {
  it('wave 1 keeps to plain rain and does not burst', () => {
    const game = { ...withBugs(startGame(), []), spawnIn: 5, elapsed: 7.48, nextBurst: 7.5 };
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.bugs).toEqual([]);
    expect(next.drops).toEqual([]);
    expect(next.nextBurst).toBeCloseTo(15);
  });

  it('wave 2 sends a diagonal line of bugs, one of them dropping at once', () => {
    const game = { ...withBugs(startGame(), []), spawnIn: 5, elapsed: 14.98, nextBurst: 15 };
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.bugs).toHaveLength(1);
    expect(next.drops).toHaveLength(5);
    expect(next.drops[0].at).toBeCloseTo(15.03 + 0.22);
    expect(next.nextBurst).toBeCloseTo(22.5);
  });

  it('wave 3 drops a full row with one gap at the same moment', () => {
    const game = { ...withBugs(startGame(), []), spawnIn: 5, elapsed: 29.98, nextBurst: 30 };
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.bugs).toHaveLength(9);
    expect(next.drops).toEqual([]);
  });

  it('the pending pattern drops wait for their time and are kept until then', () => {
    const game = { ...withBugs(startGame(), []), spawnIn: 5, drops: [{ at: 50, x: 100 }], nextBurst: 99 };
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.bugs).toEqual([]);
    expect(next.drops).toEqual([{ at: 50, x: 100 }]);
  });
});

describe('dodgeGame: player movement', () => {
  it('moves right and left with the keys, at a fixed speed', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, []);
    expect(stepGame(game, 0.05, { ...NO_INPUT, right: true }, FAR_RNG).playerX).toBeCloseTo(CENTRE + 21);
    expect(stepGame(game, 0.05, { ...NO_INPUT, left: true }, FAR_RNG).playerX).toBeCloseTo(CENTRE - 21);
  });

  it('keeps the player inside the field', () => {
    let game = withBugs({ ...startGame(), spawnIn: 5 }, []);
    for (let i = 0; i < 100; i++) game = stepGame(game, 0.05, { ...NO_INPUT, left: true }, FAR_RNG);
    expect(game.playerX).toBe(14);
    for (let i = 0; i < 100; i++) game = stepGame(game, 0.05, { ...NO_INPUT, right: true }, FAR_RNG);
    expect(game.playerX).toBe(FIELD.width - 14);
  });

  it('chases a pointer or finger, and stops when the target is reached', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, []);
    const near = stepGame(game, 0.01, { ...NO_INPUT, targetX: 300 }, FAR_RNG);
    expect(near.playerX).toBeCloseTo(CENTRE - 10);
    let reached = game;
    for (let i = 0; i < 10; i++) reached = stepGame(reached, 0.05, { ...NO_INPUT, targetX: 230 }, FAR_RNG);
    expect(reached.playerX).toBe(230);
    let back = game;
    for (let i = 0; i < 20; i++) back = stepGame(back, 0.05, { ...NO_INPUT, targetX: 10 }, FAR_RNG);
    expect(back.playerX).toBe(14);
  });

  it('keys win over a held pointer, and a pointer without keys leaves the player still', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, []);
    expect(stepGame(game, 0.05, { left: false, right: true, targetX: 0 }, FAR_RNG).playerX).toBeCloseTo(CENTRE + 21);
    expect(stepGame(game, 0.05, NO_INPUT, FAR_RNG).playerX).toBe(CENTRE);
  });

  it('a long pause moves the bugs by at most one capped step', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, [bugAt(50, 10)]);
    const next = stepGame(game, 30, NO_INPUT, FAR_RNG);
    expect(next.elapsed).toBeCloseTo(0.05);
    expect(next.bugs[0].y).toBeCloseTo(10 + fallSpeedAt(0.05) * 0.05);
  });
});

describe('dodgeGame: collisions and lives', () => {
  it('hits only when the bug overlaps the player square', () => {
    const playerX = 200;
    expect(hits(playerX, bugAt(200, PLAYER_Y))).toBe(true);
    expect(hits(playerX, bugAt(200 + 21.9, PLAYER_Y))).toBe(true);
    expect(hits(playerX, bugAt(200 + 22, PLAYER_Y))).toBe(false);
    expect(hits(playerX, bugAt(200, PLAYER_Y - 22))).toBe(false);
    expect(hits(playerX, bugAt(200, -9))).toBe(false);
  });

  it('catches a coffee with its own, slightly smaller hitbox', () => {
    expect(catches(200, bugAt(200 + 20.9, PLAYER_Y))).toBe(true);
    expect(catches(200, bugAt(200 + 21, PLAYER_Y))).toBe(false);
  });

  it('a hit costs one life, removes that bug and grants a short invulnerability', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, [bugAt(CENTRE, PLAYER_Y), bugAt(50, 10)]);
    const next = stepGame(game, 0.01, NO_INPUT, FAR_RNG);
    expect(next.status).toBe('playing');
    expect(next.lives).toBe(LIVES - 1);
    expect(next.bugs).toEqual([expect.objectContaining({ x: 50 })]);
    expect(next.invulnUntil).toBeCloseTo(next.elapsed + 1.2);
    expect(next.events).toEqual([expect.objectContaining({ kind: 'hit', x: CENTRE })]);
    expect(isInvulnerable(next)).toBe(true);
  });

  it('bugs pass through the player while invulnerable', () => {
    const game = { ...withBugs({ ...startGame(), spawnIn: 5, lives: 2 }, [bugAt(CENTRE, PLAYER_Y)]), invulnUntil: 5 };
    const next = stepGame(game, 0.01, NO_INPUT, FAR_RNG);
    expect(next.lives).toBe(2);
    expect(next.bugs).toHaveLength(1);
    expect(next.events).toEqual([]);
  });

  it('hits count again once the invulnerability is over', () => {
    const game = { ...withBugs({ ...startGame(), spawnIn: 5, lives: 2, elapsed: 4 }, [bugAt(CENTRE, PLAYER_Y)]), invulnUntil: 3 };
    const next = stepGame(game, 0.01, NO_INPUT, FAR_RNG);
    expect(next.lives).toBe(1);
    expect(isInvulnerable(next)).toBe(true);
  });

  it('the last life ends the run and freezes it', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5, lives: 1 }, [bugAt(CENTRE, PLAYER_Y)]);
    const over = stepGame(game, 0.01, NO_INPUT, FAR_RNG);
    expect(over.status).toBe('over');
    expect(over.lives).toBe(0);
    expect(stepGame(over, 1, NO_INPUT, FAR_RNG)).toBe(over);
  });

  it('two bugs at once still cost only one life', () => {
    const game = withBugs({ ...startGame(), spawnIn: 5 }, [bugAt(CENTRE, PLAYER_Y), bugAt(CENTRE + 5, PLAYER_Y)]);
    const next = stepGame(game, 0.01, NO_INPUT, FAR_RNG);
    expect(next.lives).toBe(LIVES - 1);
    expect(next.bugs).toEqual([]);
  });
});

describe('dodgeGame: coffee', () => {
  it('catching a coffee adds the bonus, slows the bugs for 3 seconds and emits an event', () => {
    const game = { ...withBugs({ ...startGame(), spawnIn: 5, coffeeIn: 5 }, []), coffees: [bugAt(CENTRE, PLAYER_Y)] };
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.coffees).toEqual([]);
    expect(next.bonus).toBe(COFFEE_BONUS);
    expect(next.slowUntil).toBeCloseTo(next.elapsed + 3);
    expect(next.events).toEqual([expect.objectContaining({ kind: 'collect', x: CENTRE, points: COFFEE_BONUS })]);
    expect(scoreOf(next)).toBe(COFFEE_BONUS);
  });

  it('the slow-motion lasts 3 seconds and then the bugs go back to full speed', () => {
    const slow = { ...withBugs({ ...startGame(), spawnIn: 5, slowUntil: 3 }, [bugAt(50, 10)]) };
    const during = stepGame(slow, 0.05, NO_INPUT, FAR_RNG);
    expect(during.bugs[0].y).toBeCloseTo(10 + fallSpeedAt(0.05) * 0.05 * SLOW_SCALE);

    const after = { ...slow, elapsed: 3 };
    const normal = stepGame(after, 0.05, NO_INPUT, FAR_RNG);
    expect(normal.bugs[0].y).toBeCloseTo(10 + fallSpeedAt(3.05) * 0.05);
  });

  it('coffee falls at the normal speed, not slowed', () => {
    const game = { ...withBugs({ ...startGame(), spawnIn: 5, coffeeIn: 5, slowUntil: 99 }, []), coffees: [bugAt(50, 10)] };
    const next = stepGame(game, 0.05, NO_INPUT, FAR_RNG);
    expect(next.coffees[0].y).toBeCloseTo(10 + fallSpeedAt(0.05) * 0.05);
  });

  it('two coffees caught in the same step both count', () => {
    const game = { ...withBugs({ ...startGame(), spawnIn: 5, coffeeIn: 5 }, []), coffees: [bugAt(CENTRE, PLAYER_Y), bugAt(CENTRE + 2, PLAYER_Y)] };
    expect(stepGame(game, 0.01, NO_INPUT, FAR_RNG).bonus).toBe(2 * COFFEE_BONUS);
  });
});
