import { Raycaster, Vector2, type Camera, type Mesh, type Object3D } from 'three';

const DIP = 0.0009; // how far a key goes down when pressed (m)
const HOLD_MS = 110;

/** The parts of the model that react to a click. */
export interface Parts {
  keys: Map<string, Mesh>;
  lid: Object3D[];
  power: Object3D[];
}

/** Finds the keys (tk_<id>), the lid shell and its pieces, and the power button in the loaded model. */
export function findParts(root: Object3D): Parts {
  const keys = new Map<string, Mesh>();
  const lid: Object3D[] = [];
  const power: Object3D[] = [];
  root.traverse((o) => {
    if (o.name.startsWith('tk_')) keys.set(o.name.slice(3), o as Mesh);
    else if (o.name === 'tampa_casca' || o.name.startsWith('grupo_tampa')) lid.push(o);
    else if (o.name === 'botao_power' || o.name === 'led_power') power.push(o);
  });
  return { keys, lid, power };
}

/** Pushes a key down for a moment; a key already down is left alone. */
export function makePresser(redraw: () => void) {
  const down = new Set<Mesh>();
  return (key: Mesh) => {
    if (down.has(key)) return;
    down.add(key);
    key.position.y -= DIP;
    redraw();
    setTimeout(() => {
      key.position.y += DIP;
      down.delete(key);
      redraw();
    }, HOLD_MS);
  };
}

export interface PointerHandlers {
  key(id: string, mesh: Mesh): void;
  lid(): void;
  power(): void;
}

/**
 * A click (not a drag) on a key, the lid or the power button calls its handler; the cursor shows what can be clicked.
 * Returns the cleanup.
 */
export function bindPointer(el: HTMLElement, camera: Camera, getParts: () => Parts | null, on: PointerHandlers) {
  const ray = new Raycaster();
  const ndc = new Vector2();
  const start = new Vector2();
  const pick = (ev: PointerEvent) => {
    const parts = getParts();
    if (!parts) return null;
    const r = el.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects([...parts.keys.values(), ...parts.lid, ...parts.power], false)[0];
    if (!hit) return null;
    const o = hit.object;
    if (parts.power.includes(o)) return { kind: 'power' as const };
    if (parts.lid.includes(o)) return { kind: 'lid' as const };
    const id = o.name.slice(3);
    return { kind: 'key' as const, id, mesh: o as Mesh };
  };
  const onDown = (ev: PointerEvent) => start.set(ev.clientX, ev.clientY);
  const onUp = (ev: PointerEvent) => {
    if (ev.button !== 0 || start.distanceTo(new Vector2(ev.clientX, ev.clientY)) > 6) return;
    const hit = pick(ev);
    if (hit?.kind === 'key') on.key(hit.id, hit.mesh);
    else if (hit?.kind === 'lid') on.lid();
    else if (hit?.kind === 'power') on.power();
  };
  const onMove = (ev: PointerEvent) => {
    if (ev.buttons === 0) el.style.cursor = pick(ev) ? 'pointer' : 'grab';
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointermove', onMove);
  return () => {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointermove', onMove);
  };
}
