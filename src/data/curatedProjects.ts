import { projects, Project } from './projects';

export type ProjectCategory = 'web' | 'ia' | 'mobile' | 'tool';

export interface CuratedProject extends Project {
  type: string;
  cat: ProjectCategory;
  tint: string;
  long: string;
  points: string[];
}

interface CurationMeta {
  id: number;
  type: string;
  cat: ProjectCategory;
  tint: string;
  long: string;
  points: string[];
}

const FEATURED_META: CurationMeta = {
  id: 26,
  type: 'Produto pessoal',
  cat: 'web',
  tint: '#3b82f6',
  long: 'Nasceu de um problema meu: eu tentava vários apps de produtividade e nenhum unia tempo, energia e reflexão no mesmo lugar. O Self-Sync Daily junta um planner de tarefas, registro de energia ao longo do dia e um diário curto de reflexão, com autenticação real e dados persistidos por usuário.',
  points: [
    'Modelagem do banco e regras de acesso por usuário no Supabase (RLS).',
    'Dashboard de hábitos com gráficos de energia ao longo da semana.',
    'Onboarding guiado e estado persistido entre sessões.',
  ],
};

const LIST_META: CurationMeta[] = [
  {
    id: 9,
    type: 'Web app',
    cat: 'web',
    tint: '#eab308',
    long: 'Ferramenta para simular alocação de carteira com ativos do mercado brasileiro, visualizando risco e diversificação em gráficos interativos — pensada pra quem quer entender a própria carteira sem depender de planilha solta.',
    points: ['Cálculo de diversificação e risco por classe de ativo.', 'Gráficos interativos com Recharts.', 'Interface responsiva pensada pra uso rápido no celular.'],
  },
  {
    id: 2,
    type: 'IA aplicada',
    cat: 'ia',
    tint: '#22c55e',
    long: 'App que recebe os ingredientes que você tem em casa e devolve sugestões de receita geradas pelo Gemini, com um fluxo de automação via n8n conectando a interface ao modelo de IA.',
    points: ['Prompt engineering pra respostas consistentes em português.', 'Automação da chamada de IA via n8n.', 'UI simples e responsiva feita em Tailwind.'],
  },
  {
    id: 5,
    type: 'Ferramenta',
    cat: 'tool',
    tint: '#a855f7',
    long: 'Um agente criativo voltado a game design e prototipagem rápida — ajuda a estruturar ideias de projeto, narrativa e escopo inicial antes de partir pro código.',
    points: ['Fluxo guiado de geração de conceito a escopo.', 'Componentes shadcn/ui customizados.', 'Base em Vite pra iteração rápida.'],
  },
  {
    id: 30,
    type: 'Educacional',
    cat: 'tool',
    tint: '#ef4444',
    long: 'Plataforma educacional que ensina Git montando comandos visualmente, criando commits de exemplo e testando o conhecimento com quizzes — feita pra quem trava na hora de aprender Git só lendo doc.',
    points: ['Simulador visual de comandos Git.', 'Sistema de quizzes com progresso salvo.', 'Cenas 3D com Spline pra tornar o aprendizado mais leve.'],
  },
  {
    id: 1,
    type: 'Mobile',
    cat: 'mobile',
    tint: '#f97316',
    long: 'App mobile de receitas construído durante um curso da Rocketseat, com CRUD completo via Supabase e experiência nativa em Android e iOS via Expo.',
    points: ['CRUD completo de receitas com Supabase.', 'Build e testes via Expo em Android e iOS.', 'Navegação nativa com React Navigation.'],
  },
];

function merge(meta: CurationMeta): CuratedProject {
  const project = projects.find((p) => p.id === meta.id);
  if (!project) throw new Error(`curatedProjects: no project with id ${meta.id} in data/projects.ts`);
  return { ...project, ...meta };
}

export const featuredProject: CuratedProject = merge(FEATURED_META);
export const curatedProjects: CuratedProject[] = LIST_META.map(merge);

export const CATEGORY_FILTERS: { key: ProjectCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'web', label: 'Web' },
  { key: 'ia', label: 'IA' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'tool', label: 'Ferramentas' },
];
