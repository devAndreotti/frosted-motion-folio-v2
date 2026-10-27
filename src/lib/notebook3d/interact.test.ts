import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry } from 'three';
import { bindPointer, cameraToggles, findParts, makePresser } from './interact';

const named = (name: string) => {
  const m = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  m.name = name;
  return m;
};

describe('notebook3d interact', () => {
  afterEach(() => vi.useRealTimers());

  it('finds the keys by id, the lid pieces and the power button in the model', () => {
    const root = new Group();
    root.add(named('tk_a'), named('tk_espaco'), named('tampa_casca'), named('grupo_tampa_adesivos'), named('botao_power'), named('led_power'), named('corpo'));
    root.add(named('camera_capa'), named('camera_trilho'), named('chave_camera_botao'), named('tela'));
    const parts = findParts(root);
    expect(parts.shutter.map((o) => o.name)).toEqual(['camera_capa', 'camera_trilho']);
    expect(parts.camSwitch.map((o) => o.name)).toEqual(['chave_camera_botao']);
    expect(parts.screen.map((o) => o.name)).toEqual(['tela']);
    expect([...parts.keys.keys()]).toEqual(['a', 'espaco']);
    expect(parts.lid.map((o) => o.name)).toEqual(['tampa_casca', 'grupo_tampa_adesivos']);
    expect(parts.power.map((o) => o.name)).toEqual(['botao_power', 'led_power']);
  });

  it('pushes a key down for a moment and ignores a second press while it is down', () => {
    vi.useFakeTimers();
    const redraw = vi.fn();
    const press = makePresser(redraw);
    const key = named('tk_a');
    press(key);
    const low = key.position.y;
    expect(low).toBeLessThan(0);
    press(key);
    expect(key.position.y).toBe(low);
    vi.advanceTimersByTime(200);
    expect(key.position.y).toBeCloseTo(0);
    expect(redraw).toHaveBeenCalledTimes(2);
  });

  it('slides the webcam cover open and back, and the camera switch, with a click sound each time', () => {
    vi.useFakeTimers();
    const root = new Group();
    const knob = named('camera_capa');
    const sw = named('chave_camera_botao');
    root.add(knob, sw);
    const parts = findParts(root);
    const click = vi.fn();
    const cam = cameraToggles(() => parts, vi.fn(), click);
    cam.shutter();
    vi.advanceTimersByTime(400);
    expect(knob.position.x).toBeCloseTo(0.0115);
    cam.shutter();
    vi.advanceTimersByTime(400);
    expect(knob.position.x).toBeCloseTo(0);
    cam.camSwitch();
    vi.advanceTimersByTime(400);
    expect(sw.position.z).toBeCloseTo(-0.0028);
    expect(click).toHaveBeenCalledTimes(3);
  });

  describe('reach of the camera parts', () => {
    // a 2 mm cover at the center of a 400 px stage, the lid's bezel a little behind it (or in front, when closed)
    const stage = (lidZ: number) => {
      const root = new Group();
      const cover = named('camera_capa');
      cover.scale.setScalar(0.002);
      const lid = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial());
      lid.name = 'tampa_casca';
      lid.position.z = lidZ;
      root.add(cover, lid);
      root.updateMatrixWorld(true);
      const camera = new PerspectiveCamera(30, 1, 0.01, 10);
      camera.position.set(0, 0, 0.5);
      camera.updateMatrixWorld(true);
      const el = document.createElement('div');
      el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 400, right: 400, bottom: 400, x: 0, y: 0, toJSON: () => ({}) });
      const on = { key: vi.fn(), lid: vi.fn(), power: vi.fn(), shutter: vi.fn(), camSwitch: vi.fn(), screen: vi.fn() };
      const parts = findParts(root);
      bindPointer(el, camera, () => parts, on);
      const tap = (x: number, y: number, pointerType: string) => {
        for (const type of ['pointerdown', 'pointerup']) {
          const ev = new MouseEvent(type, { clientX: x, clientY: y, button: 0 });
          Object.defineProperty(ev, 'pointerType', { value: pointerType });
          el.dispatchEvent(ev);
        }
      };
      return { on, tap };
    };

    it('opens the cover with a finger a few pixels off it, on the bezel', () => {
      const { on, tap } = stage(-0.01);
      tap(200, 228, 'touch');
      expect(on.shutter).toHaveBeenCalledTimes(1);
      expect(on.lid).not.toHaveBeenCalled();
    });

    it('asks the mouse to come closer', () => {
      const { on, tap } = stage(-0.01);
      tap(200, 228, 'mouse');
      expect(on.shutter).not.toHaveBeenCalled();
      expect(on.lid).toHaveBeenCalledTimes(1);
      tap(200, 212, 'mouse');
      expect(on.shutter).toHaveBeenCalledTimes(1);
    });

    it('does not reach the cover through the closed lid', () => {
      const { on, tap } = stage(0.01);
      tap(200, 228, 'touch');
      expect(on.shutter).not.toHaveBeenCalled();
      expect(on.lid).toHaveBeenCalledTimes(1);
    });
  });
});
