import type { StackArea, TierTool } from '@/data/skills';

interface WithTechnologies {
  technologies: string[];
}

/** How many projects list at least one of `names` among their technologies (exact, case-insensitive). */
export function countProjectsUsing(projects: WithTechnologies[], names: string[]): number {
  const wanted = new Set(names.map((n) => n.toLowerCase()));
  return projects.filter((p) => p.technologies.some((tech) => wanted.has(tech.toLowerCase()))).length;
}

/** Whether a tool belongs to the selected area filter ('all' matches everything). */
export function inArea(tool: Pick<TierTool, 'areas'>, area: StackArea | 'all'): boolean {
  return area === 'all' || tool.areas.includes(area);
}
