import { Matrix4, Scene, Vector3, type BufferGeometry, type Camera, type Mesh } from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

// The page is laid out at a desktop width and scaled down onto the 15.6" panel.
const PAGE_W = 1280;
const PAGE_H = 720;
const LOAD_TIMEOUT = 15000;

export interface LiveScreen {
  /** Loads `url` on the screen (null puts the screenshot back). */
  open(url: string | null, host: string, title: string): void;
  /** Follows the screen mesh (the lid moves) and hides the page when it faces away or the lid is not open. */
  sync(camera: Camera, shown: boolean): void;
  setSize(w: number, h: number): void;
  dispose(): void;
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
 * The real page of a project inside the laptop's screen: an iframe under a fake browser bar, placed in 3D over the screen
 * mesh by a CSS3DRenderer layered on top of the WebGL canvas. It can be scrolled and clicked like any page.
 */
export function createLiveScreen(host: HTMLElement, screen: Mesh, onBusy: (busy: boolean) => void): LiveScreen {
  const renderer = new CSS3DRenderer();
  renderer.domElement.className = 'nb3d-live';
  host.appendChild(renderer.domElement);
  const scene = new Scene();
  const win = document.createElement('div');
  win.className = 'nb3d-live-win';
  Object.assign(win.style, { width: `${PAGE_W}px`, height: `${PAGE_H}px` });
  const bar = document.createElement('div');
  bar.className = 'nb3d-live-bar';
  bar.innerHTML = '<i></i><i></i><i></i><span></span>';
  const addr = bar.querySelector('span') as HTMLSpanElement;
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  frame.referrerPolicy = 'no-referrer';
  win.append(bar, frame);
  const obj = new CSS3DObject(win);
  scene.add(obj);
  const c = corners(screen.geometry);
  const tl = new Vector3();
  const tr = new Vector3();
  const bl = new Vector3();
  const right = new Vector3();
  const up = new Vector3();
  const normal = new Vector3();
  const toCam = new Vector3();
  const basis = new Matrix4();
  let url: string | null = null;
  let timer = 0;

  const done = () => {
    window.clearTimeout(timer);
    win.classList.add('is-loaded');
    onBusy(false);
  };
  frame.addEventListener('load', () => url && done());

  return {
    open(next, hostName, title) {
      if (next === url) return;
      url = next;
      win.classList.remove('is-loaded');
      window.clearTimeout(timer);
      if (!next) {
        frame.removeAttribute('src');
        onBusy(false);
        return;
      }
      addr.textContent = hostName;
      frame.title = title;
      onBusy(true);
      timer = window.setTimeout(done, LOAD_TIMEOUT);
      frame.src = next;
    },
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
      obj.position.copy(bl).addScaledVector(right, 0.5).addScaledVector(up, 0.5).addScaledVector(normal, 0.0004);
      basis.makeBasis(right.normalize(), up.normalize(), normal);
      obj.quaternion.setFromRotationMatrix(basis);
      obj.scale.set(w / PAGE_W, h / PAGE_H, 1);
      const facing = toCam.subVectors(camera.position, obj.position).normalize().dot(normal) > 0.08;
      // CSS3DRenderer sets the element's display from `visible` on every render, so hiding goes through the object
      obj.visible = !!url && shown && facing;
      renderer.render(scene, camera);
    },
    setSize(w, h) {
      renderer.setSize(w, h);
    },
    dispose() {
      window.clearTimeout(timer);
      frame.removeAttribute('src');
      renderer.domElement.remove();
    },
  };
}
