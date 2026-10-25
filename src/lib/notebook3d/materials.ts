import { AdditiveBlending, Color, MeshBasicMaterial, MeshPhysicalMaterial, type IUniform, type Material, type Mesh, type MeshStandardMaterial, type Object3D, type Texture } from 'three';
import { BACKLIGHT_HALO, BACKLIGHT_LEGEND, type BacklightLevel } from './logic';

/** Shared uniform: the rainbow band of the holographic stickers moves with the camera, not with time. */
export interface HoloState {
  shift: IUniform<number>;
}

/**
 * The stickers are holographic film: the atlas keeps the clean art in the base color, the die-cut shape in its alpha
 * and how much film shows through in the metal/roughness map (blue = film, red = the same mask for the thin-film
 * iridescence; factory badges have none). Where there is film, a faint view-dependent rainbow is added at grazing angles.
 */
export function holoMaterial(src: MeshStandardMaterial, state: HoloState) {
  const m = new MeshPhysicalMaterial({
    name: src.name,
    map: src.map,
    alphaTest: 0.5,
    metalnessMap: src.metalnessMap,
    roughnessMap: src.roughnessMap,
    metalness: 0.65,
    roughness: 1,
    iridescence: 1,
    iridescenceMap: src.metalnessMap,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [180, 640],
    envMapIntensity: 1.15,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uHoloShift = state.shift;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uHoloShift;\nfloat holoFoil = 0.0;')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nholoFoil = metalnessFactor / 0.65;')
      .replace(
        '#include <opaque_fragment>',
        `float holoNdv = dot(normal, normalize(vViewPosition));
        float holoBand = holoNdv * 2.4 + dot(vMapUv, vec2(7.0, 4.0)) + uHoloShift;
        vec3 holoRainbow = 0.5 + 0.5 * cos(6.28318 * (holoBand + vec3(0.0, 0.33, 0.67)));
        outgoingLight += holoRainbow * holoFoil * (0.04 + 0.3 * pow(1.0 - abs(holoNdv), 3.0));
        #include <opaque_fragment>`,
      );
  };
  return m;
}

/** Key legends and the glow between the keys, tinted with the site's accent color. */
export interface Backlight {
  set(level: BacklightLevel, color: string): void;
}

export function setupBacklight(root: Object3D): Backlight {
  const legends: MeshStandardMaterial[] = [];
  let halo: MeshBasicMaterial | null = null;
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial;
    if (mat?.name === 'teclas') {
      // not tone mapped: ACES would wash a bright colored glow out to white
      mat.toneMapped = false;
      legends.push(mat);
    }
    if (mat?.name === 'brilho_teclas') {
      // additive glow on the deck; the halo mask is grayscale, so it works as an alpha map (green channel)
      halo = new MeshBasicMaterial({ name: 'brilho_teclas', alphaMap: mat.emissiveMap, transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false });
      mesh.material = halo;
      mesh.renderOrder = 2;
    }
  });
  const tint = new Color();
  return {
    set(level, color) {
      tint.set(color);
      for (const m of legends) {
        m.emissive.copy(tint);
        m.emissiveIntensity = BACKLIGHT_LEGEND[level];
      }
      if (halo) {
        halo.color.copy(tint);
        halo.opacity = BACKLIGHT_HALO[level];
        halo.visible = level > 0;
      }
    },
  };
}

/** The power button's LED: an emissive dot whose color the scene sets (see ledState). */
export function setupLed(root: Object3D) {
  let led: MeshStandardMaterial | null = null;
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (mesh.isMesh && (mesh.material as MeshStandardMaterial)?.name === 'led') {
      led = (mesh.material as MeshStandardMaterial).clone();
      led.toneMapped = false;
      mesh.material = led;
    }
  });
  const tint = new Color();
  return {
    set(color: string | null) {
      if (!led) return;
      tint.set(color ?? '#000000');
      led.color.set(color ? '#000000' : '#101012');
      led.emissive.copy(tint);
      led.emissiveIntensity = color ? 3 : 0;
    },
  };
}

/** Swaps in the holographic sticker material and the screen; sharper textures at grazing angles. Returns the screen mesh. */
export function prepareModel(root: Object3D, holo: HoloState, screenMat: Material, aniso: number) {
  let stickers: Material | null = null;
  let tela: Mesh | null = null;
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as MeshStandardMaterial;
    if (mat.map && (mat.name === 'adesivos' || mat.name === 'teclas')) mat.map.anisotropy = aniso;
    if (mat.name === 'adesivos') {
      stickers ??= holoMaterial(mat, holo);
      mesh.material = stickers;
    }
    if (mat.name === 'tela') {
      mesh.material = screenMat;
      tela = mesh;
    }
  });
  return tela as Mesh | null;
}

/** Frees every geometry, material and texture of the scene. */
export function disposeScene(root: Object3D) {
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    for (const m of [mesh.material].flat() as MeshStandardMaterial[]) {
      for (const t of [m.map, m.emissiveMap, m.metalnessMap, m.roughnessMap, m.alphaMap] as (Texture | null)[]) t?.dispose();
      m.dispose();
    }
  });
}
