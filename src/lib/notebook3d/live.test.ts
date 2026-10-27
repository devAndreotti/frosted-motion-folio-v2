import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { screenClip } from './live';

describe('screenClip', () => {
  it('outlines the screen in px of the page layer, corner by corner', () => {
    const camera = new PerspectiveCamera(90, 2, 0.01, 10);
    camera.position.set(0, 0, 1);
    camera.updateMatrixWorld(true);
    // a quad that fills the view: at 1 m, a 90° field spans ±1 m up and ±2 m across (aspect 2)
    const quad = [new Vector3(-2, 1, 0), new Vector3(2, 1, 0), new Vector3(2, -1, 0), new Vector3(-2, -1, 0)];
    expect(screenClip(quad, camera, 800, 400)).toBe('polygon(0px 0px, 800px 0px, 800px 400px, 0px 400px)');
    const small = quad.map((v) => v.clone().multiplyScalar(0.5));
    expect(screenClip(small, camera, 800, 400)).toBe('polygon(200px 100px, 600px 100px, 600px 300px, 200px 300px)');
  });
});
