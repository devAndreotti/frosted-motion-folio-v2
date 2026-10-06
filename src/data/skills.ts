import type { Localized } from '@/lib/i18n';

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
  /** Counted in public GitHub repositories instead of portfolio projects. */
  repos?: boolean;
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
      { name: 'React', mono: 'R', tint: '#0e7490', areas: ['web'], matches: ['React'] },
      { name: 'TypeScript', mono: 'TS', tint: '#1d4ed8', areas: ['web'], matches: ['TypeScript'] },
      { name: 'JavaScript', mono: 'JS', tint: '#854d0e', areas: ['web'], matches: ['JavaScript', 'JavaScript Vanilla'] },
      { name: 'Tailwind CSS', mono: 'TW', tint: '#0f766e', areas: ['web'], matches: ['Tailwind CSS'] },
      { name: 'Git', mono: 'Gt', tint: '#c2410c', areas: ['tools'], repos: true, note: { pt: 'em todo repositório', en: 'in every repository' } },
    ],
  },
  {
    id: 'comfortable',
    level: 2,
    title: { pt: 'Confortável', en: 'Comfortable' },
    desc: { pt: 'Já levei pra produção.', en: 'Shipped to production.' },
    tools: [
      { name: 'Node.js', mono: 'N', tint: '#15803d', areas: ['web'], note: { pt: 'backend', en: 'backend' } },
      { name: 'Supabase', mono: 'Sb', tint: '#047857', areas: ['web', 'data'], matches: ['Supabase'] },
      { name: 'PostgreSQL', mono: 'Pg', tint: '#1e40af', areas: ['data'], note: { pt: 'dados', en: 'data' } },
      { name: 'Vite', mono: 'V', tint: '#7e22ce', areas: ['tools'], matches: ['Vite'] },
      { name: 'n8n', mono: 'n8', tint: '#b91c1c', areas: ['automation', 'ai'], matches: ['n8n'] },
      { name: 'Gemini API', mono: 'Gm', tint: '#4338ca', areas: ['ai'], matches: ['Gemini (Modelo de IA)'] },
    ],
  },
  {
    id: 'learning',
    level: 1,
    title: { pt: 'Aprendendo', en: 'Learning' },
    desc: { pt: 'Estudando e aplicando aos poucos.', en: 'Studying and applying bit by bit.' },
    tools: [
      { name: 'Python', mono: 'Py', tint: '#a16207', areas: ['automation', 'data'], note: { pt: 'automação', en: 'automation' } },
      { name: 'React Native', mono: 'RN', tint: '#0369a1', areas: ['mobile'], matches: ['React Native'] },
      { name: 'Docker', mono: 'Dk', tint: '#1d4ed8', areas: ['tools'], note: { pt: 'infra', en: 'infra' } },
      { name: 'Power BI', mono: 'BI', tint: '#854d0e', areas: ['data'], note: { pt: 'dados', en: 'data' } },
      { name: 'Machine Learning', mono: 'ML', tint: '#6d28d9', areas: ['ai'], note: { pt: 'IA', en: 'AI' } },
    ],
  },
];

/** Everything else worth naming, without a tier of its own. */
export const ALSO_KNOWN = ['SQL', 'C#', 'Java', 'Expo', 'shadcn/ui', 'Recharts', 'React Query'];
