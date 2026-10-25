import { describe, expect, it } from 'vitest';
import { BoxGeometry, Color, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Texture } from 'three';
import { holoMaterial, setupBacklight } from './materials';

describe('holoMaterial', () => {
  it('keeps the atlas maps, cuts the die-cut shape and limits the iridescence to the film', () => {
    const map = new Texture();
    const mr = new Texture();
    const state = { shift: { value: 0.3 } };
    const m = holoMaterial(new MeshStandardMaterial({ name: 'adesivos', map, metalnessMap: mr, roughnessMap: mr }), state);
    expect(m).toBeInstanceOf(MeshPhysicalMaterial);
    expect(m.map).toBe(map);
    expect(m.alphaTest).toBe(0.5);
    expect(m.iridescenceMap).toBe(mr);
  });

  it('adds the view-dependent rainbow where the film is', () => {
    const state = { shift: { value: 0 } };
    const m = holoMaterial(new MeshStandardMaterial({ name: 'adesivos' }), state);
    const shader = { uniforms: {} as Record<string, unknown>, fragmentShader: '#include <common>\n#include <metalnessmap_fragment>\n#include <opaque_fragment>' };
    m.onBeforeCompile(shader as never, undefined as never);
    expect(shader.uniforms.uHoloShift).toBe(state.shift);
    expect(shader.fragmentShader).toContain('holoFoil = metalnessFactor');
    expect(shader.fragmentShader).toContain('holoRainbow * 0.55, holoFoil');
    expect(shader.fragmentShader.trim().endsWith('#include <opaque_fragment>')).toBe(true);
  });
});

describe('setupBacklight', () => {
  const scene = () => {
    const root = new Group();
    const keys = new MeshStandardMaterial({ name: 'teclas' });
    root.add(new Mesh(new BoxGeometry(), keys));
    const halo = new Mesh(new BoxGeometry(), new MeshStandardMaterial({ name: 'brilho_teclas', emissiveMap: new Texture() }));
    root.add(halo);
    return { root, keys, halo };
  };

  it('lights the legends and the glow with the given color, stronger on high', () => {
    const { root, keys, halo } = scene();
    const light = setupBacklight(root);
    light.set(1, '#22c55e');
    const low = keys.emissiveIntensity;
    light.set(2, '#22c55e');
    expect(keys.emissive.equals(new Color('#22c55e'))).toBe(true);
    expect(keys.emissiveIntensity).toBeGreaterThan(low);
    const glow = halo.material as unknown as MeshBasicMaterial;
    expect(glow).toBeInstanceOf(MeshBasicMaterial);
    expect(glow.visible).toBe(true);
  });

  it('switches everything off at level 0', () => {
    const { root, keys, halo } = scene();
    const light = setupBacklight(root);
    light.set(0, '#ffffff');
    expect(keys.emissiveIntensity).toBe(0);
    expect((halo.material as unknown as MeshBasicMaterial).visible).toBe(false);
  });
});
