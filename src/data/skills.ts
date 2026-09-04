import type { Localized } from '@/lib/i18n';

export interface CoreSkill {
  name: string;
  level: number; // 1-5
  learning?: boolean;
}

export interface SkillCategory {
  title: Localized<string>;
  mono: string;
  tint: string;
  skills: string[];
}

// "Core stack" is what shows up as proficiency dots and the radar chart —
// the tools used daily. Everything else is grouped by category below.
export const CORE_SKILLS: CoreSkill[] = [
  { name: 'React', level: 5 },
  { name: 'TypeScript', level: 5 },
  { name: 'Node.js', level: 4 },
  { name: 'Tailwind CSS', level: 5 },
  { name: 'Supabase', level: 4 },
  { name: 'Python', level: 3, learning: true },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  { title: { pt: 'Dados', en: 'Data' }, mono: 'DB', tint: '#3b82f6', skills: ['SQL', 'PostgreSQL', 'Power BI'] },
  { title: { pt: 'Automação', en: 'Automation' }, mono: 'AT', tint: '#ef4444', skills: ['n8n', 'Python', 'Scripts'] },
  { title: { pt: 'Mobile', en: 'Mobile' }, mono: 'RN', tint: '#f97316', skills: ['React Native', 'Expo'] },
  { title: { pt: 'IA aplicada', en: 'Applied AI' }, mono: 'AI', tint: '#a855f7', skills: ['Gemini', 'Machine Learning', 'Prompting'] },
  { title: { pt: 'Ferramentas', en: 'Tools' }, mono: 'GT', tint: '#22c55e', skills: ['Git', 'Vite', 'Docker'] },
  { title: { pt: 'Linguagens', en: 'Languages' }, mono: '{}', tint: '#eab308', skills: ['JavaScript', 'C#', 'Java'] },
];
