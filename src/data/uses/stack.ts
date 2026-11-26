import type { UsesCategory } from './types';

// Stack: the languages, engines and tools I work with, grouped by how well I know them (the level tag on each card).
export const STACK: UsesCategory = {
  id: 'stack',
  label: { pt: 'Stack', en: 'Stack' },
  items: [
    {
      name: 'React',
      level: 'daily',
      detail: { pt: 'React 19', en: 'React 19' },
      why: { pt: 'Biblioteca para construir interfaces modernas com componentes reativos.', en: 'Library for building modern interfaces with reactive components.' },
    },
    {
      name: 'TypeScript',
      level: 'daily',
      why: { pt: 'JavaScript com tipos estáticos.', en: 'JavaScript with static types.' },
    },
    {
      name: 'JavaScript',
      level: 'daily',
      why: { pt: 'Linguagem de programação da web.', en: 'The programming language of the web.' },
    },
    {
      name: 'Tailwind CSS',
      level: 'daily',
      detail: { pt: 'Design system com classes utilitárias', en: 'Design system with utility classes' },
      why: { pt: 'Estilização ágil com classes utilitárias e tokens responsivos.', en: 'Fast styling with utility classes and responsive tokens.' },
    },
    {
      name: 'Git',
      level: 'daily',
      why: { pt: 'Controle de versão do código.', en: 'Version control for code.' },
    },
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
      name: 'Vite',
      level: 'daily',
      detail: { pt: 'Build tool ultrarrápido', en: 'Ultra-fast build tool' },
      why: { pt: 'Ferramenta de build moderna e servidor de desenvolvimento com HMR.', en: 'Modern build tool and development server with instant HMR.' },
    },
    {
      name: 'Docker',
      level: 'comfortable',
      why: { pt: 'Containers para rodar serviços de forma isolada.', en: 'Containers to run services in isolation.' },
    },
    {
      name: 'React Native',
      level: 'comfortable',
      why: { pt: 'Apps mobile com React.', en: 'Mobile apps with React.' },
    },
    {
      name: 'Godot',
      level: 'comfortable',
      detail: { pt: 'Godot 4 · Engine de jogos', en: 'Godot 4 · Game engine' },
      why: { pt: 'Engine dos jogos que desenvolvo.', en: 'Engine for the games I develop.' },
    },
    {
      name: 'Blender',
      level: 'comfortable',
      detail: { pt: 'Modelagem 3D e cenas', en: '3D modeling and scenes' },
      why: { pt: 'Modelos e cenas 3D para os jogos e projetos interativos.', en: '3D models and scenes for games and interactive projects.' },
    },
    {
      name: 'QML',
      level: 'comfortable',
      detail: { pt: 'Interfaces Qt', en: 'Qt interfaces' },
      why: { pt: 'Interfaces de desktop com Qt Quick.', en: 'Desktop interfaces with Qt Quick.' },
    },
    {
      name: 'n8n',
      level: 'comfortable',
      why: { pt: 'Automação de fluxos entre serviços.', en: 'Workflow automation between services.' },
    },
    {
      name: 'Node.js',
      level: 'comfortable',
      why: { pt: 'Runtime JavaScript no servidor.', en: 'JavaScript runtime on the server.' },
    },
    {
      name: 'Supabase',
      level: 'comfortable',
      why: { pt: 'Banco PostgreSQL com autenticação e APIs.', en: 'PostgreSQL database with auth and APIs.' },
    },
    {
      name: 'PostgreSQL',
      level: 'comfortable',
      why: { pt: 'Banco de dados relacional de código aberto.', en: 'Open-source relational database.' },
    },
    {
      name: 'Machine learning',
      level: 'learning',
      why: { pt: 'Modelos que aprendem a partir de dados, em estudo.', en: 'Models that learn from data, in study.' },
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
