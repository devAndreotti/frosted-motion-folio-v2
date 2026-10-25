import { Spherical, type PerspectiveCamera } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
