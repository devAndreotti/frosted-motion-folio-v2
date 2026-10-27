import { Box3, Raycaster, Vector2, Vector3, type Camera, type Mesh, type Object3D } from 'three';

const DIP = 0.0009; // how far a key goes down when pressed (m)
const HOLD_MS = 110;
/**
 * How far (CSS px) from the webcam cover and the camera switch a click still reaches them: they are a few pixels
 * across, and on a phone smaller than a fingertip.
 */
export const CAMERA_REACH = { mouse: 18, touch: 36 } as const;
const reachOf = (ev: PointerEvent) => (ev.pointerType === 'touch' || ev.pointerType === 'pen' ? CAMERA_REACH.touch : CAMERA_REACH.mouse);

/** The parts of the model that react to a click. */
export interface Parts {
  keys: Map<string, Mesh>;
  lid: Object3D[];
  power: Object3D[];
  /** The sliding cover stuck over the webcam (and its track). */
  shutter: Object3D[];
  /** The camera switch on the right side. */
  camSwitch: Object3D[];
  /** The screen: a click opens the project's real page. */
  screen: Object3D[];
}

/** Finds the keys (tk_<id>), the lid shell and its pieces, and the power button in the loaded model. */
export function findParts(root: Object3D): Parts {
  const keys = new Map<string, Mesh>();
  const lid: Object3D[] = [];
  const power: Object3D[] = [];
  const shutter: Object3D[] = [];
  const camSwitch: Object3D[] = [];
  const screen: Object3D[] = [];
  root.traverse((o) => {
    if (o.name.startsWith('tk_')) keys.set(o.name.slice(3), o as Mesh);
    else if (o.name === 'tampa_casca' || o.name.startsWith('grupo_tampa')) lid.push(o);
    else if (o.name === 'botao_power' || o.name === 'led_power') power.push(o);
    else if (o.name === 'camera_capa' || o.name === 'camera_trilho') shutter.push(o);
    else if (o.name === 'chave_camera_botao') camSwitch.push(o);
    else if (o.name === 'tela') screen.push(o);
  });
  return { keys, lid, power, shutter, camSwitch, screen };
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

/**
 * Slides an object to `to` (meters, along one axis of its parent) over a short eased move. A new move on the same
 * object takes over from where the running one is, so quick clicks never leave it off its two stops.
 */
export function makeSlider(redraw: () => void) {
  const running = new WeakMap<Object3D, number>();
  return (o: Object3D, axis: 'x' | 'z', to: number, ms = 220) => {
    const from = o.position[axis];
    const start = performance.now();
    const id = (running.get(o) ?? 0) + 1;
    running.set(o, id);
    const step = () => {
      if (running.get(o) !== id) return;
      const p = Math.min(1, Math.max(0, (performance.now() - start) / ms));
      o.position[axis] = from + (to - from) * (1 - Math.pow(1 - p, 3));
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
  // where each part rests in the model (closed, off): the moves go to fixed stops from there, never relative
  const rest = new WeakMap<Object3D, number>();
  const restOf = (o: Object3D, axis: 'x' | 'z') => {
    if (!rest.has(o)) rest.set(o, o.position[axis]);
    return rest.get(o) as number;
  };
  return {
    shutter() {
      // the cover slides 11.5 mm along the bezel and uncovers the lens
      shutterOpen = !shutterOpen;
      const knob = getParts()?.shutter.find((o) => o.name === 'camera_capa');
      if (knob) slide(knob, 'x', restOf(knob, 'x') + (shutterOpen ? 0.0115 : 0));
      click();
    },
    camSwitch() {
      // the knob slides 2.8 mm toward the back and hides the red: camera on
      camOn = !camOn;
      const knob = getParts()?.camSwitch[0];
      if (knob) slide(knob, 'z', restOf(knob, 'z') + (camOn ? -0.0028 : 0), 140);
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
  screen(): void;
}

/**
 * A click (not a drag) on a key, the lid, the power button or the camera parts calls its handler; the cursor shows what can be
 * clicked. The camera parts also answer a click a few pixels around them (more on touch), as long as they are in sight.
 * Returns the cleanup.
 */
export function bindPointer(el: HTMLElement, camera: Camera, getParts: () => Parts | null, on: PointerHandlers) {
  const ray = new Raycaster();
  const sight = new Raycaster();
  const ndc = new Vector2();
  const start = new Vector2();
  const [center, eye, onScreen, toPart] = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
  const box = new Box3();
  /** Distance (CSS px) between the pointer and `center` as drawn; infinite when it is behind the camera. */
  const screenDistance = (ev: PointerEvent, r: DOMRect) => {
    onScreen.copy(center).project(camera);
    if (onScreen.z > 1) return Infinity;
    return Math.hypot(ev.clientX - (r.left + ((onScreen.x + 1) / 2) * r.width), ev.clientY - (r.top + ((1 - onScreen.y) / 2) * r.height));
  };
  /** Nothing of the model stands between the camera and `center` (with the lid closed, or seen from behind, the lid does). */
  const inSight = (all: Object3D[], group: readonly Object3D[]) => {
    eye.setFromMatrixPosition(camera.matrixWorld);
    const far = toPart.subVectors(center, eye).length();
    sight.set(eye, toPart.normalize());
    const first = sight.intersectObjects(all, false)[0];
    return !first || first.distance >= far - 0.003 || group.includes(first.object);
  };
  /** The camera part whose center is within reach of the pointer on the screen and in plain sight; the closest wins. */
  const nearCamera = (ev: PointerEvent, parts: Parts, all: Object3D[], r: DOMRect) => {
    const reach = reachOf(ev);
    let best: { kind: 'shutter' | 'camSwitch'; d: number } | null = null;
    const candidates = [
      ['shutter', parts.shutter.find((o) => o.name === 'camera_capa') ?? parts.shutter[0], parts.shutter],
      ['camSwitch', parts.camSwitch[0], parts.camSwitch],
    ] as const;
    for (const [kind, part, group] of candidates) {
      if (!part) continue;
      box.setFromObject(part).getCenter(center);
      const d = screenDistance(ev, r);
      if (d <= reach && (!best || d < best.d) && inSight(all, group)) best = { kind, d };
    }
    return best ? { kind: best.kind } : null;
  };
  /** A hit right on the power button or a camera part. */
  const direct = (o: Object3D | undefined, parts: Parts) => {
    if (!o) return null;
    if (parts.power.includes(o)) return { kind: 'power' as const };
    if (parts.shutter.includes(o)) return { kind: 'shutter' as const };
    return parts.camSwitch.includes(o) ? { kind: 'camSwitch' as const } : null;
  };
  const pick = (ev: PointerEvent) => {
    const parts = getParts();
    if (!parts) return null;
    const r = el.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const all = [...parts.keys.values(), ...parts.lid, ...parts.power, ...parts.shutter, ...parts.camSwitch, ...parts.screen];
    const o = ray.intersectObjects(all, false)[0]?.object;
    // the camera parts are tiny: a click near them (on the bezel, the screen, a key or the air) still reaches them
    const hit = direct(o, parts) ?? nearCamera(ev, parts, all, r);
    if (hit || !o) return hit;
    if (parts.screen.includes(o)) return { kind: 'screen' as const };
    if (parts.lid.includes(o)) return { kind: 'lid' as const };
    return { kind: 'key' as const, id: o.name.slice(3), mesh: o as Mesh };
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
    else if (hit?.kind === 'screen') on.screen();
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
