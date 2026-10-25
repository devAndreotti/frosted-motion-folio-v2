import { Raycaster, Vector2, type Camera, type Mesh, type Object3D } from 'three';

const DIP = 0.0009; // how far a key goes down when pressed (m)
const HOLD_MS = 110;

/** The parts of the model that react to a click. */
export interface Parts {
  keys: Map<string, Mesh>;
  lid: Object3D[];
  power: Object3D[];
  /** The sliding cover stuck over the webcam (and its track). */
  shutter: Object3D[];
  /** The camera switch on the right side. */
  camSwitch: Object3D[];
}

/** Finds the keys (tk_<id>), the lid shell and its pieces, and the power button in the loaded model. */
export function findParts(root: Object3D): Parts {
  const keys = new Map<string, Mesh>();
  const lid: Object3D[] = [];
  const power: Object3D[] = [];
  const shutter: Object3D[] = [];
  const camSwitch: Object3D[] = [];
  root.traverse((o) => {
    if (o.name.startsWith('tk_')) keys.set(o.name.slice(3), o as Mesh);
    else if (o.name === 'tampa_casca' || o.name.startsWith('grupo_tampa')) lid.push(o);
    else if (o.name === 'botao_power' || o.name === 'led_power') power.push(o);
    else if (o.name === 'camera_capa' || o.name === 'camera_trilho') shutter.push(o);
    else if (o.name === 'chave_camera_botao') camSwitch.push(o);
  });
  return { keys, lid, power, shutter, camSwitch };
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

/** Slides an object by `delta` (meters, along one axis of its parent) over a short eased move. */
export function makeSlider(redraw: () => void) {
  return (o: Object3D, axis: 'x' | 'z', delta: number, ms = 220) => {
    const from = o.position[axis];
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      o.position[axis] = from + delta * (1 - Math.pow(1 - p, 3));
      redraw();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
}

/** The webcam cover and the side camera switch; they start as in the photos: cover closed, switch off (red showing). */
export function cameraToggles(getParts: () => Parts | null, redraw: () => void, click: () => void) {
  const slide = makeSlider(redraw);
  let shutterOpen = false;
  let camOn = false;
  return {
    shutter() {
      // the cover slides 11.5 mm along the bezel and uncovers the lens
      shutterOpen = !shutterOpen;
      const knob = getParts()?.shutter.find((o) => o.name === 'camera_capa');
      if (knob) slide(knob, 'x', shutterOpen ? 0.0115 : -0.0115);
      click();
    },
    camSwitch() {
      // the knob slides 2.8 mm toward the back and hides the red: camera on
      camOn = !camOn;
      const knob = getParts()?.camSwitch[0];
      if (knob) slide(knob, 'z', camOn ? -0.0028 : 0.0028, 140);
      click();
    },
  };
}

export interface PointerHandlers {
  key(id: string, mesh: Mesh): void;
  lid(): void;
  power(): void;
  shutter(): void;
  camSwitch(): void;
}

/**
 * A click (not a drag) on a key, the lid, the power button or the camera parts calls its handler; the cursor shows what can be
 * clicked.
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
    const hit = ray.intersectObjects([...parts.keys.values(), ...parts.lid, ...parts.power, ...parts.shutter, ...parts.camSwitch], false)[0];
    if (!hit) return null;
    const o = hit.object;
    if (parts.power.includes(o)) return { kind: 'power' as const };
    if (parts.shutter.includes(o)) return { kind: 'shutter' as const };
    if (parts.camSwitch.includes(o)) return { kind: 'camSwitch' as const };
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
    else if (hit?.kind === 'shutter') on.shutter();
    else if (hit?.kind === 'camSwitch') on.camSwitch();
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
