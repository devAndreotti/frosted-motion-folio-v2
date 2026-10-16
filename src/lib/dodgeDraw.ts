import { BUG_SIZE, FIELD, PLAYER_SIZE, type Bug, type DodgeGame } from './dodgeGame';

export interface DodgePalette {
  accent: string;
  bug: string;
  line: string;
}

/** Draws one frame in logical field units; `dpr` maps them onto the backing store. */
export function drawDodge(ctx: CanvasRenderingContext2D, game: DodgeGame, palette: DodgePalette, dpr: number): void {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);

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

  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.roundRect(game.playerX - PLAYER_SIZE / 2, FIELD.height - PLAYER_SIZE - 10, PLAYER_SIZE, PLAYER_SIZE, 6);
  ctx.fill();
}

/** A bug: oval body, head, and three legs a side. */
function drawBug(ctx: CanvasRenderingContext2D, bug: Bug, color: string): void {
  const r = BUG_SIZE / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    for (const offset of [-4, 0, 4]) {
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
