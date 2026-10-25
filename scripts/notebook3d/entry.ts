// Visualizador de QA: usa o mesmo módulo do site (src/lib/notebook3d/scene.ts) com câmera fixa.
// Por URL (az, polar, dist, lid, light, color, shot, host) ou, para várias fotos sem recarregar, window.__shoot(params).
import { createNotebook, type NotebookHandle } from '../../src/lib/notebook3d/scene';
const w = window as unknown as Record<string, unknown>;
type P = Record<string, string>;
let nb: NotebookHandle | null = null;
function mount(q: P, done: () => void) {
  nb?.dispose();
  const num = (k: string, d: number) => (q[k] != null ? Number(q[k]) : d);
  document.documentElement.style.setProperty('--bg', q.bg || '#e9eaee');
  const h = createNotebook(document.getElementById('stage') as HTMLElement, {
    glb: q.glb || 'notebook.glb',
    color: q.color || '#ffffff',
    backlight: num('light', 0) as 0 | 1 | 2,
    reducedMotion: true,
  sound: false,
  live: false,
    still: { az: num('az', 0), polar: num('polar', 68), dist: num('dist', 0.95), lid: num('lid', 108), target: q.tx != null ? [num('tx', 0), num('ty', 0), num('tz', 0)] : undefined },
    onReady() {
      const img = new Image();
      img.onload = () => {
        h.show({ image: img, host: q.host || 'devandreotti.com' });
        setTimeout(done, 500);
      };
      img.onerror = done;
      img.src = q.shot || 'shot.webp';
    },
    onError() {
      w.__error = true;
      done();
    },
  });
  nb = h;
}
w.__shoot = (q: P) => new Promise<void>((res) => mount(q, res));
const url = Object.fromEntries(new URLSearchParams(location.search)) as P;
if (url.az != null) mount(url, () => (w.__ready = true));
else w.__ready = true;
