import {
  Color, HalfFloatType, MeshBasicMaterial, ShaderMaterial, Vector2,
  type Camera, type Material, type Mesh, type MeshStandardMaterial, type Object3D, type Scene, type Texture, type WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/** Bloom strength per backlight level: off, low, high. */
export const GLOW = [0, 0.3, 0.55] as const;
// the lit well is wide: in the bloom pass it counts for a fraction, so the glow stays close to the keys
const WELL_IN_BLOOM = 0.2;
const LIGHTS = new Set(['brilho_teclas', 'brilho_legendas']);

/**
 * Selective bloom for the keyboard light, as in three.js' "unreal bloom selective" example: a first pass renders only what
 * glows (the lit legends and the lit well; everything else black but still hiding what is behind it), blurs it, and the
 * final pass adds that glow over the normal render. Only the backlight blooms: not the screen, not the shiny stickers.
 * With the light off nothing extra runs.
 */
export function createGlow(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  let bloomComposer: EffectComposer | null = null;
  let finalComposer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  let level: 0 | 1 | 2 = 0;
  const tint = new Color();
  const black = new MeshBasicMaterial({ color: 0x000000 });
  const legendCache = new Map<Texture, MeshBasicMaterial>();
  const saved = new Map<Mesh, Material | Material[]>();
  const dimmed: [MeshStandardMaterial, number][] = [];

  const build = () => {
    const size = renderer.getSize(new Vector2());
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(size, GLOW[level], 0.22, 0);
    bloomComposer.addPass(bloom);
    finalComposer = new EffectComposer(renderer);
    finalComposer.renderTarget1.texture.type = HalfFloatType;
    finalComposer.renderTarget2.texture.type = HalfFloatType;
    finalComposer.addPass(new RenderPass(scene, camera));
    const mix = new ShaderPass(
      new ShaderMaterial({
        uniforms: { baseTexture: { value: null }, bloomTexture: { value: bloomComposer.renderTarget2.texture } },
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        // the glow also spills past the laptop's edge, where the canvas is transparent: it carries its own alpha
        fragmentShader: `uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv;
          void main() { vec4 b = texture2D(baseTexture, vUv); vec3 g = texture2D(bloomTexture, vUv).rgb;
            gl_FragColor = vec4(b.rgb + g, clamp(b.a + max(g.r, max(g.g, g.b)), 0.0, 1.0)); }`,
      }),
      'baseTexture',
    );
    mix.needsSwap = true;
    finalComposer.addPass(mix);
    finalComposer.addPass(new OutputPass());
  };

  // first pass: the lights as they are, the keys as their legend mask in the light color, everything else black
  const darken = (o: Object3D) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial;
    if (LIGHTS.has(mat.name)) {
      if (mat.name === 'brilho_teclas') {
        dimmed.push([mat, mat.opacity]);
        mat.opacity *= WELL_IN_BLOOM;
      }
      return;
    }
    saved.set(mesh, mesh.material);
    if (mat.name === 'teclas' && mat.emissiveMap) {
      let lit = legendCache.get(mat.emissiveMap);
      if (!lit) {
        lit = new MeshBasicMaterial({ map: mat.emissiveMap, toneMapped: false });
        legendCache.set(mat.emissiveMap, lit);
      }
      lit.color.copy(tint).multiplyScalar(mat.emissiveIntensity);
      mesh.material = lit;
    } else {
      mesh.material = black;
    }
  };
  const restore = () => {
    for (const [mesh, mat] of saved) mesh.material = mat;
    saved.clear();
    for (const [mat, opacity] of dimmed) mat.opacity = opacity;
    dimmed.length = 0;
  };

  return {
    setLevel(l: 0 | 1 | 2, color: string) {
      level = l;
      tint.set(color);
      if (l > 0 && !bloomComposer) build();
      if (bloom) bloom.strength = GLOW[l];
    },
    setSize(w: number, h: number) {
      for (const c of [bloomComposer, finalComposer]) {
        c?.setPixelRatio(renderer.getPixelRatio());
        c?.setSize(w, h);
      }
    },
    render() {
      if (!bloomComposer || !finalComposer || level === 0) {
        renderer.render(scene, camera);
        return;
      }
      const env = scene.environment;
      scene.environment = null;
      scene.traverse(darken);
      bloomComposer.render();
      restore();
      scene.environment = env;
      finalComposer.render();
    },
    dispose() {
      bloomComposer?.dispose();
      finalComposer?.dispose();
      bloom?.dispose();
      black.dispose();
      for (const m of legendCache.values()) m.dispose();
    },
  };
}
