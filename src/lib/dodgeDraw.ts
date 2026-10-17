import { BUG_SIZE, COFFEE_SIZE, FIELD, PLAYER_SIZE } from './dodgeConfig';
import { isInvulnerable, type Bug, type DodgeGame } from './dodgeGame';
import { FLASH_SECONDS, GHOST_LIFE, PARTICLE_LIFE, shakeOffset, type Effects, type Ghost, type Particle } from './dodgeEffects';

export interface DodgePalette {
  accent: string;
  bug: string;
  coffee: string;
  line: string;
  text: string;
  font: string;
}

const GRID = 40; // grid cell, in field units
const GRID_SCROLL = 24; // units per second the grid runs downwards (motion only)
const GRID_PARALLAX = 0.05; // the grid shifts this fraction of the ship's offset from the centre, the other way

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Draws one frame in logical field units; `dpr` maps them onto the backing store. */
export function drawDodge(ctx: CanvasRenderingContext2D, game: DodgeGame, effects: Effects, palette: DodgePalette, dpr: number): void {
  const shake = shakeOffset(effects);
  ctx.setTransform(dpr, 0, 0, dpr, shake.x * dpr, shake.y * dpr);
  // a margin around the field, so the shake never shows a stale edge
  ctx.clearRect(-12, -12, FIELD.width + 24, FIELD.height + 24);

  drawGrid(ctx, game, effects.motion, palette.line);
  effects.ghosts.forEach((ghost) => drawGhost(ctx, ghost, palette.bug));
  game.bugs.forEach((bug) => drawBug(ctx, bug, palette.bug, game.elapsed, effects.motion));
  game.coffees.forEach((cup) => drawCoffee(ctx, cup, palette.coffee));
  drawPlayer(ctx, game, effects, palette.accent);
  effects.particles.forEach((p) => drawParticle(ctx, p, palette));

  ctx.font = `600 13px ${palette.font}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.text;
  effects.popups.forEach((popup) => ctx.fillText(popup.text, popup.x, popup.y));

  drawFlash(ctx, effects, palette.bug);
}

/** A grid that scrolls down and drifts a little against the ship, so the field feels like it has depth. */
function drawGrid(ctx: CanvasRenderingContext2D, game: DodgeGame, motion: boolean, color: string): void {
  const driftX = motion ? -(game.playerX - FIELD.width / 2) * GRID_PARALLAX : 0;
  const driftY = motion ? (game.elapsed * GRID_SCROLL) % GRID : 0;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = (driftX % GRID) - GRID; x <= FIELD.width + GRID; x += GRID) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, FIELD.height);
  }
  for (let y = driftY - GRID; y <= FIELD.height + GRID; y += GRID) {
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
  }
  ctx.stroke();
}

/** The square blinks while invulnerable (a steady dim square under reduced motion), with a flame under it. */
function drawPlayer(ctx: CanvasRenderingContext2D, game: DodgeGame, effects: Effects, color: string): void {
  let alpha = 1;
  if (isInvulnerable(game)) {
    alpha = effects.motion ? (Math.floor(game.elapsed * 10) % 2 === 0 ? 0.25 : 1) : 0.45;
  }
  const left = game.playerX - PLAYER_SIZE / 2;
  const top = FIELD.height - PLAYER_SIZE - 12;
  const bottom = top + PLAYER_SIZE;

  // thruster: flickers while moving, steady under reduced motion
  const flame = effects.motion ? 3 + 3 * Math.abs(Math.sin(game.elapsed * 30)) : 4;
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(game.playerX - 5, bottom - 2);
  ctx.lineTo(game.playerX, bottom + flame);
  ctx.lineTo(game.playerX + 5, bottom - 2);
  ctx.fill();

  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.roundRect(left, top, PLAYER_SIZE, PLAYER_SIZE, 7);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, palette: DodgePalette): void {
  ctx.globalAlpha = Math.min(1, p.life / PARTICLE_LIFE);
  ctx.fillStyle = p.color === 'bug' ? palette.bug : palette.coffee;
  ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
  ctx.globalAlpha = 1;
}

/** A hit bug: it grows a little and fades out where it was hit. */
function drawGhost(ctx: CanvasRenderingContext2D, ghost: Ghost, color: string): void {
  const t = clamp(ghost.life / GHOST_LIFE, 0, 1);
  ctx.save();
  ctx.globalAlpha = t * 0.7;
  ctx.translate(ghost.x, ghost.y);
  ctx.scale(1 + (1 - t) * 0.6, 1 + (1 - t) * 0.6);
  bugShape(ctx, color);
  ctx.restore();
}

/** A bug: oval body, head, and three legs a side. It fades and grows in as it crosses the top edge, sways with its own tilt and pulses. */
function drawBug(ctx: CanvasRenderingContext2D, bug: Bug, color: string, elapsed: number, motion: boolean): void {
  const enter = clamp((bug.y + BUG_SIZE / 2) / BUG_SIZE, 0, 1);
  if (enter <= 0) return;
  const pulse = motion ? 1 + 0.06 * Math.sin(elapsed * 5 + bug.x * 0.1) : 1;
  const tilt = motion ? 0.18 * Math.sin(elapsed * 1.1 + bug.x * 0.05) : 0;
  const scale = (0.4 + 0.6 * enter) * pulse;

  if (motion) drawTrail(ctx, bug, color, enter, scale);

  ctx.save();
  ctx.globalAlpha = enter;
  ctx.translate(bug.x, bug.y);
  ctx.rotate(tilt);
  ctx.scale(scale, scale);
  bugShape(ctx, color);
  ctx.restore();
}

/** Two faint bodies above the bug, where it has just been: a light trail, as it falls. */
function drawTrail(ctx: CanvasRenderingContext2D, bug: Bug, color: string, enter: number, scale: number): void {
  const r = BUG_SIZE / 2;
  ctx.fillStyle = color;
  for (const [back, alpha] of [
    [8, 0.22],
    [16, 0.1],
  ] as const) {
    ctx.globalAlpha = enter * alpha;
    ctx.beginPath();
    ctx.ellipse(bug.x, bug.y - back, r * 0.62 * scale, r * 0.85 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** The bug's shape around the origin; the caller moves, tilts and scales it. */
function bugShape(ctx: CanvasRenderingContext2D, color: string): void {
  const r = BUG_SIZE / 2;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    for (const offset of [-5, 0, 5]) {
      const bend = Math.sign(offset) * 2; // outer legs angle away from the body
      ctx.moveTo(side * 3, offset);
      ctx.lineTo(side * (r + 3), offset + bend);
    }
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 2, r * 0.62, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -r * 0.7, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

/** A coffee cup with a handle and steam, drawn as an outline so it reads apart from the bugs. */
function drawCoffee(ctx: CanvasRenderingContext2D, cup: Bug, color: string): void {
  const half = COFFEE_SIZE / 2;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cup.x + 6, cup.y, 3.5, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(cup.x - 7, cup.y - 5, 14, 13, [2, 2, 6, 6]);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cup.x - 3, cup.y - half - 1);
  ctx.lineTo(cup.x - 1, cup.y - half - 4);
  ctx.lineTo(cup.x + 1, cup.y - half - 1);
  ctx.lineTo(cup.x + 3, cup.y - half - 4);
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

/** A short flash over the whole field when a bug hits. */
function drawFlash(ctx: CanvasRenderingContext2D, effects: Effects, color: string): void {
  if (effects.flash <= 0) return;
  ctx.globalAlpha = (effects.flash / FLASH_SECONDS) * 0.3;
  ctx.fillStyle = color;
  ctx.fillRect(-12, -12, FIELD.width + 24, FIELD.height + 24);
  ctx.globalAlpha = 1;
}
