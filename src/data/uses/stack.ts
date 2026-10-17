import type { UsesCategory } from './types';

// Stack: the languages, engines and tools I work with, grouped by how well I know them (the level tag on each card).
export const STACK: UsesCategory = {
  id: 'stack',
  label: { pt: 'Stack', en: 'Stack' },
  items: [
    {
      name: 'NestJS',
      level: 'daily',
      detail: { pt: 'Backend em TypeScript', en: 'Backend in TypeScript' },
      why: { pt: 'Backend do que construo no dia a dia.', en: 'Backend and day-to-day code.' },
    },
    {
      name: 'SQL',
      level: 'daily',
      why: { pt: 'Modelagem e consultas nos projetos do dia a dia.', en: 'Modeling and queries in day-to-day projects.' },
    },
    {
      name: 'Python',
      level: 'daily',
      why: { pt: 'Scripts, automações e ferramentas do dia a dia.', en: 'Scripts, automation and day-to-day tools.' },
    },
    {
      name: 'Godot',
      level: 'expert',
      detail: { pt: 'Engine de jogos', en: 'Game engine' },
      why: { pt: 'Engine dos jogos que desenvolvo.', en: 'Engine for the games I develop.' },
    },
    {
      name: 'Blender',
      level: 'expert',
      detail: { pt: 'Modelagem 3D', en: '3D modeling' },
      why: { pt: 'Modelos e cenas 3D para os jogos.', en: '3D models and scenes for the games.' },
    },
    {
      name: 'QML',
      level: 'expert',
      detail: { pt: 'Interfaces Qt', en: 'Qt interfaces' },
      why: { pt: 'Interfaces de desktop com Qt Quick.', en: 'Desktop interfaces with Qt Quick.' },
    },
    {
      name: 'Power BI',
      level: 'learning',
      why: { pt: 'Painéis e análise de dados, em estudo.', en: 'Dashboards and data analysis, in study.' },
    },
    {
      name: 'Rust',
      level: 'learning',
      why: { pt: 'Linguagem de sistemas, em estudo.', en: 'Systems language, in study.' },
    },
    {
      name: 'AWS',
      level: 'learning',
      why: { pt: 'Serviços de nuvem, em estudo.', en: 'Cloud services, in study.' },
    },
    {
      name: 'Oracle',
      level: 'learning',
      why: { pt: 'Banco de dados Oracle, em estudo.', en: 'Oracle database, in study.' },
    },
  ],
};
