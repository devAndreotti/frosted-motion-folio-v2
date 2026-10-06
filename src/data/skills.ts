import type { Localized } from '@/lib/i18n';

export interface CoreSkill {
  name: string;
  level: number; // 1-5
  learning?: boolean;
}

// "Core stack" feeds the radar chart -- the tools used daily, rated 1-5.
export const CORE_SKILLS: CoreSkill[] = [
  { name: 'React', level: 5 },
  { name: 'TypeScript', level: 5 },
  { name: 'Node.js', level: 4 },
  { name: 'Tailwind CSS', level: 5 },
  { name: 'Supabase', level: 4 },
  { name: 'Python', level: 3, learning: true },
];

export type StackArea = 'web' | 'data' | 'automation' | 'ai' | 'mobile' | 'tools';

export interface StackAreaOption {
  id: StackArea;
  label: Localized<string>;
  tint: string;
}

export const STACK_AREAS: StackAreaOption[] = [
  { id: 'web', label: { pt: 'Web', en: 'Web' }, tint: '#eab308' },
  { id: 'data', label: { pt: 'Dados', en: 'Data' }, tint: '#3b82f6' },
  { id: 'automation', label: { pt: 'Automação', en: 'Automation' }, tint: '#ef4444' },
  { id: 'ai', label: { pt: 'IA aplicada', en: 'Applied AI' }, tint: '#a855f7' },
  { id: 'mobile', label: { pt: 'Mobile', en: 'Mobile' }, tint: '#f97316' },
  { id: 'tools', label: { pt: 'Ferramentas', en: 'Tools' }, tint: '#22c55e' },
];

export interface TierTool {
  name: string;
  mono: string;
  tint: string;
  areas: StackArea[];
  /** Technology names (as written in data/projects.ts) counted toward "used in N projects". */
  matches?: string[];
  /** Shown instead of a project count when the tool doesn't appear as a project technology. */
  note?: Localized<string>;
}

export interface StackTier {
  id: 'daily' | 'comfortable' | 'learning';
  level: 1 | 2 | 3;
  title: Localized<string>;
  desc: Localized<string>;
  tools: TierTool[];
}

// Grouped by how much each tool is used -- no self-rated dots. The numbers
// come from the real project list (see lib/stackCounts.ts), so they move
// on their own as projects are added.
export const STACK_TIERS: StackTier[] = [
  {
    id: 'daily',
    level: 3,
    title: { pt: 'Uso diário', en: 'Daily drivers' },
    desc: { pt: 'A base de quase todo projeto que eu começo.', en: 'The base of almost every project I start.' },
    tools: [
      { name: 'React', mono: 'R', tint: '#0ea5e9', areas: ['web'], matches: ['React'] },
      { name: 'TypeScript', mono: 'TS', tint: '#3b82f6', areas: ['web'], matches: ['TypeScript'] },
      { name: 'JavaScript', mono: 'JS', tint: '#eab308', areas: ['web'], matches: ['JavaScript', 'JavaScript Vanilla'] },
      { name: 'Tailwind CSS', mono: 'TW', tint: '#06b6d4', areas: ['web'], matches: ['Tailwind CSS'] },
      { name: 'Git', mono: 'Gt', tint: '#f97316', areas: ['tools'], note: { pt: 'em todo repositório', en: 'in every repository' } },
    ],
  },
  {
    id: 'comfortable',
    level: 2,
    title: { pt: 'Confortável', en: 'Comfortable' },
    desc: { pt: 'Já levei pra produção.', en: 'Shipped to production.' },
    tools: [
      { name: 'Node.js', mono: 'N', tint: '#22c55e', areas: ['web'], note: { pt: 'backend', en: 'backend' } },
      { name: 'Supabase', mono: 'Sb', tint: '#10b981', areas: ['web', 'data'], matches: ['Supabase'] },
      { name: 'PostgreSQL', mono: 'Pg', tint: '#3b82f6', areas: ['data'], note: { pt: 'dados', en: 'data' } },
      { name: 'Vite', mono: 'V', tint: '#a855f7', areas: ['tools'], matches: ['Vite'] },
      { name: 'n8n', mono: 'n8', tint: '#ef4444', areas: ['automation', 'ai'], matches: ['n8n'] },
      { name: 'Gemini', mono: 'Gm', tint: '#6366f1', areas: ['ai'], matches: ['Gemini (Modelo de IA)'] },
    ],
  },
  {
    id: 'learning',
    level: 1,
    title: { pt: 'Aprendendo', en: 'Learning' },
    desc: { pt: 'Estudando e aplicando aos poucos.', en: 'Studying and applying bit by bit.' },
    tools: [
      { name: 'Python', mono: 'Py', tint: '#22c55e', areas: ['automation', 'data'], note: { pt: 'automação', en: 'automation' } },
      { name: 'React Native', mono: 'RN', tint: '#0ea5e9', areas: ['mobile'], matches: ['React Native'] },
      { name: 'Docker', mono: 'Dk', tint: '#3b82f6', areas: ['tools'], note: { pt: 'infra', en: 'infra' } },
      { name: 'Power BI', mono: 'BI', tint: '#eab308', areas: ['data'], note: { pt: 'dados', en: 'data' } },
      { name: 'Machine Learning', mono: 'ML', tint: '#a855f7', areas: ['ai'], note: { pt: 'IA', en: 'AI' } },
    ],
  },
];

/** Everything else worth naming, without a tier of its own. */
export const ALSO_KNOWN = ['SQL', 'C#', 'Java', 'Expo', 'shadcn/ui', 'Recharts', 'React Query'];
