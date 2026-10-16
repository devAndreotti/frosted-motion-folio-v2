import { BUG_SIZE, COFFEE_SIZE, FIELD, PLAYER_SIZE } from './dodgeConfig';
import { isInvulnerable, type Bug, type DodgeGame } from './dodgeGame';
import { PARTICLE_LIFE, shakeOffset, type Effects, type Particle } from './dodgeEffects';

export interface DodgePalette {
  accent: string;
  bug: string;
  coffee: string;
  line: string;
  text: string;
  font: string;
}

/** Draws one frame in logical field units; `dpr` maps them onto the backing store. */
export function drawDodge(ctx: CanvasRenderingContext2D, game: DodgeGame, effects: Effects, palette: DodgePalette, dpr: number): void {
  const shake = shakeOffset(effects);
  ctx.setTransform(dpr, 0, 0, dpr, shake.x * dpr, shake.y * dpr);
  // a margin around the field, so the shake never shows a stale edge
  ctx.clearRect(-12, -12, FIELD.width + 24, FIELD.height + 24);

  // faint lanes so the falling speed is easier to read
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  for (let x = FIELD.width / 4; x < FIELD.width; x += FIELD.width / 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, FIELD.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  game.bugs.forEach((bug) => drawBug(ctx, bug, palette.bug));
  game.coffees.forEach((cup) => drawCoffee(ctx, cup, palette.coffee));
  drawPlayer(ctx, game, effects, palette.accent);
  effects.particles.forEach((p) => drawParticle(ctx, p, palette));

  ctx.font = `600 13px ${palette.font}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.text;
  effects.popups.forEach((popup) => ctx.fillText(popup.text, popup.x, popup.y));
}

/** The square blinks while invulnerable (a steady dim square under reduced motion). */
function drawPlayer(ctx: CanvasRenderingContext2D, game: DodgeGame, effects: Effects, color: string): void {
  let alpha = 1;
  if (isInvulnerable(game)) {
    alpha = effects.motion ? (Math.floor(game.elapsed * 10) % 2 === 0 ? 0.25 : 1) : 0.45;
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(game.playerX - PLAYER_SIZE / 2, FIELD.height - PLAYER_SIZE - 12, PLAYER_SIZE, PLAYER_SIZE, 7);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, palette: DodgePalette): void {
  ctx.globalAlpha = Math.min(1, p.life / PARTICLE_LIFE);
  ctx.fillStyle = p.color === 'bug' ? palette.bug : palette.coffee;
  ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
  ctx.globalAlpha = 1;
}

/** A bug: oval body, head, and three legs a side. */
function drawBug(ctx: CanvasRenderingContext2D, bug: Bug, color: string): void {
  const r = BUG_SIZE / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    for (const offset of [-5, 0, 5]) {
      const bend = Math.sign(offset) * 2; // outer legs angle away from the body
      ctx.moveTo(bug.x + side * 3, bug.y + offset);
      ctx.lineTo(bug.x + side * (r + 3), bug.y + offset + bend);
    }
  }
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(bug.x, bug.y + 2, r * 0.62, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(bug.x, bug.y - r * 0.7, r * 0.42, 0, Math.PI * 2);
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
