import {
  ACESFilmicToneMapping, CanvasTexture, MeshBasicMaterial, PerspectiveCamera, PMREMGenerator, Raycaster, Scene, Spherical, SRGBColorSpace,
  Vector2, Vector3, WebGLRenderer, type Material, type Mesh, type MeshStandardMaterial, type Object3D, type Texture,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { holoMaterial, setupBacklight, type Backlight, type HoloState } from './materials';
import { ROOM_LIGHT, type BacklightLevel } from './logic';
import { createScreen, type ScreenSlide } from './screen';

const OPEN = (108 * Math.PI) / 180;
const VIEW_MS = 900;
const TARGET = new Vector3(0, 0.1, -0.15);
const deg = (d: number) => (d * Math.PI) / 180;

/** Camera presets: azimuth and polar angle (degrees, polar measured from straight up). */
export const VIEWS = { frente: [0, 68], tampa: [180, 74], base: [20, 150] } as const;
export type ViewName = keyof typeof VIEWS;

export interface NotebookOptions {
  glb: string;
  color: string;
  backlight: BacklightLevel;
  reducedMotion: boolean;
  /** Fixed camera and lid angle for screenshots (degrees and meters). */
  still?: { az: number; polar: number; dist: number; lid: number };
  onReady?: () => void;
  /** The model failed to load or the GL context was lost. */
  onError?: () => void;
  /** The space bar was clicked: on the real laptop Fn+Space cycles the backlight. */
  onSpace?: () => void;
}

export interface NotebookHandle {
  show(slide: ScreenSlide): void;
  setBacklight(level: BacklightLevel, color: string): void;
  view(name: ViewName): void;
  dispose(): void;
}

/** Mounts the Lenovo LOQ model in `host`: renders only while something moves and the stage is on screen. */
export function createNotebook(host: HTMLElement, opts: NotebookOptions): NotebookHandle {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const coarse = window.matchMedia?.('(pointer: coarse)').matches === true;
  const renderer = new WebGLRenderer({ antialias: dpr <= 1, alpha: true, powerPreference: coarse ? 'low-power' : 'high-performance', preserveDrawingBuffer: !!opts.still });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  // the room is bright; at full strength the near-black bezel and keys read as mid grey
  scene.environmentIntensity = ROOM_LIGHT[opts.backlight];
  const camera = new PerspectiveCamera(26, 1, 0.01, 10);
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, enablePan: false, minDistance: 0.5, maxDistance: 1.6, rotateSpeed: 0.7 });
  controls.minPolarAngle = deg(8);
  controls.maxPolarAngle = deg(172);
  controls.target.copy(TARGET);
  const holo: HoloState = { shift: { value: 0 } };
  const screen = createScreen();
  const screenTex = new CanvasTexture(screen.canvas);
  screenTex.colorSpace = SRGBColorSpace;
  screenTex.flipY = false;
  let backlight: Backlight | null = null;
  let level = opts.backlight;
  let color = opts.color;
  let pivot: Object3D | null = null;
  let space: Mesh | null = null;
  let raf = 0;
  let visible = false;
  let fading = false;
  let tween: { from: Spherical; to: Spherical; start: number } | null = null;
  let disposed = false;
  let fitDist = 1;

  const frame = (now: number) => {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    let busy = controls.update();
    if (tween) {
      const p = Math.min(1, (now - tween.start) / VIEW_MS);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const s = new Spherical(tween.from.radius, tween.from.phi + (tween.to.phi - tween.from.phi) * e, tween.from.theta + (tween.to.theta - tween.from.theta) * e);
      camera.position.setFromSpherical(s).add(controls.target);
      camera.lookAt(controls.target);
      if (p >= 1) tween = null;
      busy = true;
    }
    if (fading) {
      fading = screen.draw(now);
      screenTex.needsUpdate = true;
      busy = busy || fading;
    }
    holo.shift.value = controls.getAzimuthalAngle() * 0.8 + controls.getPolarAngle() * 0.5;
    renderer.render(scene, camera);
    if (busy) schedule();
  };
  const schedule = () => {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  };
  controls.addEventListener('change', schedule);
  // a lost GL context (low memory, GPU reset) leaves a blank canvas: hand the stage back to the still picture
  const onLost = (e: Event) => {
    e.preventDefault();
    opts.onError?.();
  };
  renderer.domElement.addEventListener('webglcontextlost', onLost);

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // distance that fits ~0.5 m across and ~0.4 m up, whichever is tighter (the laptop is 0.36 m wide, 0.25 m tall open)
    const vf = Math.tan(deg(camera.fov / 2));
    fitDist = Math.max(0.25 / (vf * camera.aspect), 0.2 / vf);
    controls.maxDistance = fitDist * 1.6;
    schedule();
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(host);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    schedule();
  });
  io.observe(host);
  const onVis = () => schedule();
  document.addEventListener('visibilitychange', onVis);

  const unbindSpace = bindSpaceClick(renderer.domElement, camera, () => space, schedule, () => opts.onSpace?.());

  const setView = (az: number, polar: number, dist: number, instant: boolean) => {
    const to = new Spherical(dist, deg(polar), deg(az));
    if (instant) {
      camera.position.setFromSpherical(to).add(controls.target);
      camera.lookAt(controls.target);
      schedule();
      return;
    }
    const from = new Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    // shortest way around
    let d = to.theta - from.theta;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    to.theta = from.theta + d;
    tween = { from, to, start: performance.now() };
    schedule();
  };

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    opts.glb,
    (gltf) => {
      if (disposed) return;
      const root = gltf.scene;
      prepareModel(root, holo, screenTex, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
      pivot = root.getObjectByName('dobradica') ?? null;
      space = (root.getObjectByName('tecla_espaco') as Mesh) ?? null;
      backlight = setupBacklight(root);
      backlight.set(level, color);
      scene.add(root);
      resize();
      const s = opts.still;
      if (s) {
        if (pivot) pivot.rotation.x = -deg(s.lid);
        setView(s.az, s.polar, s.dist, true);
      } else {
        // starts exactly like the still picture it replaces: lid open, from the front
        if (pivot) pivot.rotation.x = -OPEN;
        setView(VIEWS.frente[0], VIEWS.frente[1], fitDist, true);
      }
      fading = true;
      schedule();
      opts.onReady?.();
    },
    undefined,
    () => opts.onError?.(),
  );

  return {
    show(slide) {
      screen.show(slide, performance.now(), opts.reducedMotion);
      fading = true;
      schedule();
    },
    setBacklight(l, c) {
      level = l;
      color = c;
      backlight?.set(l, c);
      scene.environmentIntensity = ROOM_LIGHT[l];
      schedule();
    },
    view(name) {
      const [az, polar] = VIEWS[name];
      setView(az, polar, Math.max(fitDist, camera.position.distanceTo(controls.target)), opts.reducedMotion);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      unbindSpace();
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      controls.dispose();
      scene.traverse((o) => {
        const mesh = o as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const m of [mesh.material].flat() as MeshStandardMaterial[]) {
          for (const t of [m.map, m.emissiveMap, m.metalnessMap, m.roughnessMap, m.alphaMap] as (Texture | null)[]) t?.dispose();
          m.dispose();
        }
      });
      screenTex.dispose();
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      // frees the GL context now instead of whenever the browser collects it (browsers cap live contexts)
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

/** Swaps in the holographic sticker material and the live screen; sharper textures at grazing angles. */
function prepareModel(root: Object3D, holo: HoloState, screenTex: Texture, aniso: number) {
  let stickers: Material | null = null;
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial;
    if (mat.map && (mat.name === 'adesivos' || mat.name === 'teclas')) mat.map.anisotropy = aniso;
    if (mat.name === 'adesivos') {
      stickers ??= holoMaterial(mat, holo);
      mesh.material = stickers;
    }
    if (mat.name === 'tela') mesh.material = new MeshBasicMaterial({ name: 'tela', map: screenTex, toneMapped: false });
  });
}

/** A click (not a drag) on the space bar toggles the backlight, like Fn+Space on the real laptop; the key dips a little. */
function bindSpaceClick(el: HTMLElement, camera: PerspectiveCamera, getSpace: () => Mesh | null, redraw: () => void, onPress: () => void) {
  const ray = new Raycaster();
  const ndc = new Vector2();
  const down = new Vector2();
  const hit = (ev: PointerEvent) => {
    const space = getSpace();
    if (!space) return null;
    const r = el.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(space, false).length > 0 ? space : null;
  };
  const onDown = (ev: PointerEvent) => down.set(ev.clientX, ev.clientY);
  const onUp = (ev: PointerEvent) => {
    if (ev.button !== 0 || down.distanceTo(new Vector2(ev.clientX, ev.clientY)) > 6) return;
    const key = hit(ev);
    if (!key) return;
    key.position.y -= 0.0007;
    redraw();
    setTimeout(() => {
      key.position.y += 0.0007;
      redraw();
    }, 140);
    onPress();
  };
  const onMove = (ev: PointerEvent) => {
    if (ev.buttons === 0) el.style.cursor = hit(ev) ? 'pointer' : 'grab';
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
