// Visualizador de QA: usa o mesmo módulo do site (src/lib/notebook3d/scene.ts) com câmera fixa por parâmetros na URL.
import { createNotebook } from '../../src/lib/notebook3d/scene';
const q = new URLSearchParams(location.search);
const num = (k: string, d: number) => (q.has(k) ? Number(q.get(k)) : d);
const w = window as unknown as Record<string, unknown>;
const nb = createNotebook(document.getElementById('stage') as HTMLElement, {
  glb: q.get('glb') || 'notebook.glb',
  color: q.get('color') || '#ffffff',
  backlight: num('light', 0) as 0 | 1 | 2,
  reducedMotion: true,
  still: { az: num('az', 0), polar: num('polar', 68), dist: num('dist', 0.95), lid: num('lid', 108) },
  onReady() {
    const img = new Image();
    img.onload = () => {
      nb.show({ image: img, host: q.get('host') || 'devandreotti.com' });
      setTimeout(() => (w.__ready = true), 400);
    };
    img.onerror = () => (w.__ready = true);
    img.src = q.get('shot') || 'shot.webp';
  },
  onError() {
    w.__error = true;
  },
});
