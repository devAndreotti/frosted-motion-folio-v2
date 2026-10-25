import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three';
import { findParts, makePresser } from './interact';

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
    const parts = findParts(root);
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
});
