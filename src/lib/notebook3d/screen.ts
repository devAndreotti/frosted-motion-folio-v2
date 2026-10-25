import { fitTop } from './logic';

const W = 1024;
const H = 576;
const BAR = 34;

export interface ScreenSlide {
  image: HTMLImageElement | null;
  host: string;
}

/**
 * The laptop's screen: a browser window drawn on a canvas (address bar with the project's host, the screenshot below
 * it, top-aligned). Switching slides crossfades; `draw` is called by the scene's frame loop while a fade runs.
 */
export function createScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  let cur: ScreenSlide = { image: null, host: '' };
  let prev: ScreenSlide | null = null;
  let fadeStart = 0;
  const FADE = 380;

  function paint(s: ScreenSlide, alpha: number) {
    if (!ctx) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#0d0e11';
    ctx.fillRect(0, 0, W, H);
    if (s.image && s.image.naturalWidth > 0) {
      const r = fitTop(s.image.naturalWidth, s.image.naturalHeight, W, H - BAR);
      ctx.drawImage(s.image, r.sx, r.sy, r.sw, r.sh, 0, BAR, W, r.sh * (W / s.image.naturalWidth));
    }
    // address bar
    ctx.fillStyle = '#1b1d22';
    ctx.fillRect(0, 0, W, BAR);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(20 + i * 20, BAR / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#2a2d34';
    ctx.beginPath();
    ctx.roundRect(96, 7, W - 192, BAR - 14, 10);
    ctx.fill();
    ctx.fillStyle = '#b9bdc6';
    ctx.font = '500 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.host, W / 2, BAR / 2 + 1);
    ctx.globalAlpha = 1;
  }

  return {
    canvas,
    /** Starts showing a new slide (crossfading from the current one). */
    show(next: ScreenSlide, now: number, instant = false) {
      prev = instant || !cur.image ? null : cur;
      cur = next;
      fadeStart = now;
    },
    /** Paints the current frame; returns true while a fade is still running. */
    draw(now: number) {
      const t = prev ? Math.min(1, (now - fadeStart) / FADE) : 1;
      if (prev && t < 1) {
        paint(prev, 1);
        paint(cur, t);
        return true;
      }
      prev = null;
      paint(cur, 1);
      return false;
    },
  };
}
