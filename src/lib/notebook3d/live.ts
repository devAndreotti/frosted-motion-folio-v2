import {
  Matrix4, MeshBasicMaterial, NoBlending, Raycaster, Scene, Vector2, Vector3,
  type BufferGeometry, type Camera, type Material, type Mesh, type Object3D,
} from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

// The page is laid out at a desktop width and scaled down onto the 15.6" panel.
const PAGE_W = 1280;
const PAGE_H = 720;
const LOAD_TIMEOUT = 15000;

export interface LiveTarget {
  url: string;
  host: string;
  title: string;
}

export interface LiveScreen {
  /** Loads the project's real page on the screen (only on request: it is the heavy part). */
  open(target: LiveTarget): void;
  /** Unloads it and puts the screenshot back. */
  close(): void;
  isOpen(): boolean;
  /** Follows the screen mesh (the lid moves) and hides the page when it faces away or the laptop is asleep. */
  sync(camera: Camera, shown: boolean): void;
  setSize(w: number, h: number): void;
  dispose(): void;
}

export interface LiveOptions {
  /** The model, to tell whether the pointer is on the visible screen or on something in front of it. */
  root: Object3D;
  canvas: HTMLCanvasElement;
  getCamera: () => Camera;
  closeLabel: string;
  onBusy: (busy: boolean) => void;
  onChange: (open: boolean) => void;
}

/** Corners of the screen quad in its own space, found by their UVs (top-left 0,0; top-right 1,0; bottom-left 0,1). */
function corners(geo: BufferGeometry) {
  const pos = geo.getAttribute('position');
  const uv = geo.getAttribute('uv');
  const out = { tl: new Vector3(), tr: new Vector3(), bl: new Vector3() };
  for (let i = 0; i < uv.count; i += 1) {
    const u = Math.round(uv.getX(i));
    const v = Math.round(uv.getY(i));
    const p = new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    if (u === 0 && v === 0) out.tl.copy(p);
    else if (u === 1 && v === 0) out.tr.copy(p);
    else if (u === 0 && v === 1) out.bl.copy(p);
  }
  return out;
}

/**
 * The real page of a project inside the laptop's screen. The iframe sits in a CSS3D layer *behind* the WebGL canvas, and
 * the screen mesh is drawn as a transparent hole, so the page shows only where the screen itself is visible: the base,
 * the lid or anything else in front hides it pixel by pixel. The canvas lets the pointer through only over that hole.
 */
export function createLiveScreen(host: HTMLElement, screen: Mesh, o: LiveOptions): LiveScreen {
  const renderer = new CSS3DRenderer();
  renderer.domElement.className = 'nb3d-live';
  host.insertBefore(renderer.domElement, o.canvas);
  const scene = new Scene();
  const win = document.createElement('div');
  win.className = 'nb3d-live-win';
  Object.assign(win.style, { width: `${PAGE_W}px`, height: `${PAGE_H}px` });
  const bar = document.createElement('div');
  bar.className = 'nb3d-live-bar';
  bar.innerHTML = '<i></i><i></i><i></i><span></span><button type="button">×</button>';
  const addr = bar.querySelector('span') as HTMLSpanElement;
  const x = bar.querySelector('button') as HTMLButtonElement;
  x.setAttribute('aria-label', o.closeLabel);
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  frame.referrerPolicy = 'no-referrer';
  win.append(bar, frame);
  // inert until the pointer is on the screen: a page loading must not take the keyboard focus from the site
  win.inert = true;
  const obj = new CSS3DObject(win);
  scene.add(obj);
  const shot = screen.material as Material;
  const hole = new MeshBasicMaterial({ name: 'tela-furo', color: 0x000000, transparent: true, opacity: 0, blending: NoBlending });
  const c = corners(screen.geometry);
  const [tl, tr, bl, right, up, normal, toCam] = Array.from({ length: 7 }, () => new Vector3());
  const basis = new Matrix4();
  const ray = new Raycaster();
  const ndc = new Vector2();
  let target: LiveTarget | null = null;
  let loaded = false;
  let timer = 0;

  // the pointer goes to the page only while it is over the visible part of the screen
  const passThrough = (on: boolean) => {
    o.canvas.style.pointerEvents = on ? 'none' : '';
    win.inert = !on;
  };
  const onMove = (ev: PointerEvent) => {
    if (!loaded) return;
    const r = o.canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, o.getCamera());
    passThrough(ray.intersectObject(o.root, true)[0]?.object === screen);
  };
  const onLeave = () => passThrough(false);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);

  const done = () => {
    window.clearTimeout(timer);
    if (!target) return;
    loaded = true;
    win.classList.add('is-loaded');
    screen.material = hole;
    o.onBusy(false);
  };
  frame.addEventListener('load', () => target && done());
  const close = () => {
    if (!target) return;
    target = null;
    loaded = false;
    window.clearTimeout(timer);
    frame.removeAttribute('src');
    win.classList.remove('is-loaded');
    screen.material = shot;
    passThrough(false);
    o.onBusy(false);
    o.onChange(false);
  };
  x.addEventListener('click', close);

  return {
    open(t) {
      if (target?.url === t.url) return;
      target = t;
      loaded = false;
      addr.textContent = t.host;
      frame.title = t.title;
      o.onBusy(true);
      o.onChange(true);
      timer = window.setTimeout(done, LOAD_TIMEOUT);
      frame.src = t.url;
    },
    close,
    isOpen: () => target !== null,
    sync(camera, shown) {
      screen.updateWorldMatrix(true, false);
      tl.copy(c.tl).applyMatrix4(screen.matrixWorld);
      tr.copy(c.tr).applyMatrix4(screen.matrixWorld);
      bl.copy(c.bl).applyMatrix4(screen.matrixWorld);
      right.subVectors(tr, tl);
      up.subVectors(tl, bl);
      const w = right.length();
      const h = up.length();
      normal.crossVectors(right, up).normalize();
      obj.position.copy(bl).addScaledVector(right, 0.5).addScaledVector(up, 0.5);
      basis.makeBasis(right.normalize(), up.normalize(), normal);
      obj.quaternion.setFromRotationMatrix(basis);
      obj.scale.set(w / PAGE_W, h / PAGE_H, 1);
      const facing = toCam.subVectors(camera.position, obj.position).normalize().dot(normal) > 0.05;
      // CSS3DRenderer sets the element's display from `visible` on every render, so hiding goes through the object
      obj.visible = loaded && shown && facing;
      screen.material = obj.visible ? hole : shot;
      renderer.render(scene, camera);
    },
    setSize(w, h) {
      renderer.setSize(w, h);
    },
    dispose() {
      window.clearTimeout(timer);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      frame.removeAttribute('src');
      screen.material = shot;
      hole.dispose();
      renderer.domElement.remove();
    },
  };
}
