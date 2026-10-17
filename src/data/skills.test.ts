import { describe, expect, it } from 'vitest';
import { STACK_AREAS, STACK_TIERS, type StackArea } from './skills';

const namesOf = (id: string) => STACK_TIERS.find((tier) => tier.id === id)!.tools.map((tool) => tool.name);

describe('STACK_TIERS', () => {
  it('daily group is exactly the requested list', () => {
    expect(namesOf('daily')).toEqual(['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Git', 'NestJS', 'SQL', 'Vite']);
  });

  it('comfortable group is exactly the requested list', () => {
    expect(namesOf('comfortable')).toEqual(['Docker', 'React Native', 'Godot', 'Blender', 'QML', 'n8n', 'Node.js', 'Supabase', 'PostgreSQL']);
  });

  it('learning group is exactly the requested list', () => {
    expect(namesOf('learning')).toEqual(['Machine learning', 'Rust', 'AWS', 'Oracle']);
  });

  it('drops Python, Power BI and Gemini API', () => {
    const all = STACK_TIERS.flatMap((tier) => tier.tools.map((tool) => tool.name));
    for (const removed of ['Python', 'Power BI', 'Gemini API']) expect(all).not.toContain(removed);
  });

  it('gives each item a distinct two-letter mono and a distinct tint', () => {
    const tools = STACK_TIERS.flatMap((tier) => tier.tools);
    expect(new Set(tools.map((tool) => tool.mono)).size).toBe(tools.length);
    expect(new Set(tools.map((tool) => tool.tint)).size).toBe(tools.length);
    for (const tool of tools) expect(tool.mono, tool.name).toMatch(/^[A-Za-z0-9]{2}$/);
  });

  it('gives items without a matching project a note instead of a count', () => {
    for (const tier of STACK_TIERS) {
      for (const tool of tier.tools) {
        if (!tool.matches && !tool.repos) expect(tool.note, tool.name).toBeDefined();
      }
    }
  });

  it('keeps the areas requested for the new items', () => {
    const areasOf = (name: string) => STACK_TIERS.flatMap((tier) => tier.tools).find((tool) => tool.name === name)!.areas;
    expect(areasOf('NestJS')).toEqual(['web']);
    expect(areasOf('SQL')).toEqual(['data']);
    for (const name of ['Godot', 'Blender', 'QML', 'Rust', 'AWS']) expect(areasOf(name)).toEqual(['tools']);
    expect(areasOf('Oracle')).toEqual(['data']);
    expect(areasOf('Machine learning')).toEqual(['ai']);
  });

  it('every area filter has at least one tool, so no chip is empty', () => {
    const tools = STACK_TIERS.flatMap((tier) => tier.tools);
    for (const area of STACK_AREAS) {
      const count = tools.filter((tool) => tool.areas.includes(area.id as StackArea)).length;
      expect(count, area.id).toBeGreaterThan(0);
    }
  });
});
