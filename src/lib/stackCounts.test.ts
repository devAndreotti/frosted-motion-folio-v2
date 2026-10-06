import { describe, expect, it } from 'vitest';
import { countProjectsUsing, inArea } from './stackCounts';
import { projects } from '@/data/projects';
import { STACK_TIERS } from '@/data/skills';

describe('countProjectsUsing', () => {
  const sample = [
    { technologies: ['React', 'TypeScript'] },
    { technologies: ['react native', 'Expo'] },
    { technologies: ['JavaScript Vanilla'] },
  ];

  it('matches technology names exactly, ignoring case', () => {
    expect(countProjectsUsing(sample, ['React'])).toBe(1);
    expect(countProjectsUsing(sample, ['React Native'])).toBe(1);
  });

  it('counts a project once even when several names match', () => {
    expect(countProjectsUsing(sample, ['React', 'TypeScript'])).toBe(1);
    expect(countProjectsUsing(sample, ['JavaScript', 'JavaScript Vanilla'])).toBe(1);
  });

  it('every tool with `matches` really shows up in the project list', () => {
    for (const tier of STACK_TIERS) {
      for (const tool of tier.tools) {
        if (tool.matches) expect(countProjectsUsing(projects, tool.matches), tool.name).toBeGreaterThan(0);
        else expect(tool.note, tool.name).toBeDefined();
      }
    }
  });
});

describe('inArea', () => {
  it('matches everything for "all" and only listed areas otherwise', () => {
    const tool = { areas: ['web', 'data'] as const };
    expect(inArea({ areas: [...tool.areas] }, 'all')).toBe(true);
    expect(inArea({ areas: [...tool.areas] }, 'data')).toBe(true);
    expect(inArea({ areas: [...tool.areas] }, 'mobile')).toBe(false);
  });
});
