import { ACESFilmicToneMapping, PerspectiveCamera, PMREMGenerator, Scene, Spherical, SRGBColorSpace, Vector3, WebGLRenderer } from 'three';
import { disposeScene } from './materials';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const VIEW_MS = 900;
const deg = (d: number) => (d * Math.PI) / 180;

/** Camera presets: azimuth and polar angle (degrees, polar measured from straight up). */
export const VIEWS = { frente: [0, 68], tampa: [180, 74], base: [20, 150], fechada: [180, 40] } as const;
export type ViewName = keyof typeof VIEWS;

/** Moves the orbit camera to a preset the short way around, eased; `step` advances the move and says if it is still running. */
export function createRig(camera: PerspectiveCamera, controls: OrbitControls, redraw: () => void) {
  let tween: { from: Spherical; to: Spherical; start: number } | null = null;
  return {
    go(az: number, polar: number, dist: number, instant: boolean) {
      const to = new Spherical(dist, deg(polar), deg(az));
      if (instant) {
        tween = null;
        camera.position.setFromSpherical(to).add(controls.target);
        camera.lookAt(controls.target);
        redraw();
        return;
      }
      const from = new Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      let d = to.theta - from.theta;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      to.theta = from.theta + d;
      tween = { from, to, start: performance.now() };
      redraw();
    },
    step(now: number) {
      if (!tween) return false;
      const p = Math.min(1, (now - tween.start) / VIEW_MS);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const { from, to } = tween;
      camera.position.setFromSpherical(new Spherical(from.radius, from.phi + (to.phi - from.phi) * e, from.theta + (to.theta - from.theta) * e)).add(controls.target);
      camera.lookAt(controls.target);
      if (p >= 1) tween = null;
      return true;
    },
  };
}

/** The renderer (transparent, DPR up to 1.5), a room-lit scene, the camera and its orbit controls. */
export function createStage(host: HTMLElement, still: boolean) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const coarse = window.matchMedia?.('(pointer: coarse)').matches === true;
  const renderer = new WebGLRenderer({ antialias: dpr <= 1, alpha: true, powerPreference: coarse ? 'low-power' : 'high-performance', preserveDrawingBuffer: still });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new PerspectiveCamera(26, 1, 0.01, 10);
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, enablePan: false, minDistance: 0.5, maxDistance: 1.6, rotateSpeed: 0.7 });
  controls.minPolarAngle = deg(8);
  controls.maxPolarAngle = deg(172);
  controls.target.copy(new Vector3(0, 0.1, -0.15));
  return { renderer, scene, pmrem, camera, controls };
}

/** Frees the scene, the environment map and the GL context (now, instead of whenever the browser collects it: browsers cap live contexts). */
export function disposeStage(renderer: WebGLRenderer, scene: Scene, pmrem: PMREMGenerator) {
  disposeScene(scene);
  scene.environment?.dispose();
  pmrem.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
}
