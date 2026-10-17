import type { Localized } from '@/lib/i18n';
import { projects } from './projects';
import type { CuratedProject } from './curatedProjects';

/**
 * The gallery under the ranked list: smaller projects, each with photos taken for the portfolio
 * (public/projects/<slug>/NN.webp, 16:10, the slug from projects.ts). A project with no `shots` is simply not in the gallery.
 * Facts (title, stack, links) come from projects.ts; here only the gallery's own short text and photos.
 */
interface MoreMeta {
  id: number;
  type: Localized<string>;
  tint: string;
  description: Localized<string>;
  /** File numbers in public/projects/<slug>/, in gallery order; the first is the cover. */
  shots: string[];
}

// The first ones are the ones the gallery shows before "see all".
const META: MoreMeta[] = [
  {
    id: 3,
    type: { pt: 'Landing page', en: 'Landing page' },
    tint: '#22c55e',
    description: {
      pt: 'Landing page de um app financeiro, com fundo animado de quadrados e cartões de recursos em vidro.',
      en: 'Landing page for a finance app, with an animated squares background and glass feature cards.',
    },
    shots: ['01', '02'],
  },
  {
    id: 8,
    type: { pt: 'Site institucional', en: 'Business site' },
    tint: '#d4a373',
    description: {
      pt: 'Site de uma clínica odontológica: herói, tratamentos, equipe, contato e rodapé.',
      en: 'Website for a dental clinic: hero, treatments, team, contact and footer.',
    },
    shots: ['01', '02', '03'],
  },
  {
    id: 4,
    type: { pt: 'App web', en: 'Web app' },
    tint: '#c084fc',
    description: {
      pt: 'Interface de plataforma de streaming: destaque do título, carrossel de vídeos semelhantes e menu do perfil.',
      en: 'Streaming platform interface: featured title, a carousel of similar videos and a profile menu.',
    },
    shots: ['01', '02', '03'],
  },
  {
    id: 27,
    type: { pt: 'App web', en: 'Web app' },
    tint: '#facc15',
    description: {
      pt: 'Pokédex com cartões coloridos por tipo, status e habilidades, e troca de Pokémon pela lista ao lado.',
      en: 'Pokédex with type-colored cards, stats and abilities, and a side list to switch Pokémon.',
    },
    shots: ['01', '02', '03', '04'],
  },
  {
    id: 10,
    type: { pt: 'Landing page', en: 'Landing page' },
    tint: '#4ade80',
    description: {
      pt: 'Página inspirada em The Last of Us, com carrossel de cenas em tela cheia e navegação por pontos.',
      en: 'Page inspired by The Last of Us, with a full-screen scene carousel and dot navigation.',
    },
    shots: ['01', '02', '03', '04'],
  },
  {
    id: 11,
    type: { pt: 'Landing page 3D', en: '3D landing page' },
    tint: '#8b5cf6',
    description: {
      pt: 'Primeiro projeto com Spline: página com tema claro e escuro, modal de contato e cena 3D interativa.',
      en: 'First Spline project: page with light and dark themes, a contact modal and an interactive 3D scene.',
    },
    shots: ['01', '02', '03'],
  },
  {
    id: 12,
    type: { pt: 'Landing page', en: 'Landing page' },
    tint: '#00704a',
    description: {
      pt: 'Recriação da página inicial de uma cafeteria, com destaque para a bebida e menu simples.',
      en: 'Recreation of a coffee shop home page, with the drink as the highlight and a simple menu.',
    },
    shots: ['01', '02'],
  },
  {
    id: 20,
    type: { pt: 'Landing page', en: 'Landing page' },
    tint: '#ef4444',
    description: {
      pt: 'Seletor de personagens de One Piece: cada emblema troca o fundo, o nome e a descrição.',
      en: 'One Piece character picker: each emblem swaps the background, name and description.',
    },
    shots: ['01', '02', '03', '04'],
  },
  {
    id: 14,
    type: { pt: 'Efeito visual', en: 'Visual effect' },
    tint: '#ef4444',
    description: {
      pt: 'Fundo de blocos animados com Anime.js, em tom vermelho, com título no centro.',
      en: 'Animated blocks background built with Anime.js, in red, with a title in the center.',
    },
    shots: ['01', '02', '03'],
  },
  {
    id: 17,
    type: { pt: 'Landing page', en: 'Landing page' },
    tint: '#ef4444',
    description: {
      pt: 'Seletor de heróis: passar o mouse por um card troca o herói em destaque.',
      en: 'Hero selector: hovering a card swaps the featured hero.',
    },
    shots: ['01', '02', '03', '04'],
  },
  {
    id: 15,
    type: { pt: 'Efeito visual', en: 'Visual effect' },
    tint: '#a855f7',
    description: {
      pt: 'Cartões com gradiente que reagem ao passar o mouse, em três cores.',
      en: 'Gradient cards that react on hover, in three colors.',
    },
    shots: ['01', '02', '03', '04'],
  },
  {
    id: 18,
    type: { pt: 'Efeito visual', en: 'Visual effect' },
    tint: '#38bdf8',
    description: {
      pt: 'Fundo animado de cubos para usar atrás de qualquer página.',
      en: 'An animated cubes background to put behind any page.',
    },
    shots: ['01', '02'],
  },
  {
    id: 16,
    type: { pt: 'Efeito visual', en: 'Visual effect' },
    tint: '#fb7185',
    description: {
      pt: 'Cartão de produto com um hambúrguer animado, que alterna entre imagem estática e animação.',
      en: 'Product card with an animated burger that switches between a still image and the animation.',
    },
    shots: ['01', '02'],
  },
  {
    id: 23,
    type: { pt: 'Componente', en: 'Component' },
    tint: '#a78bfa',
    description: {
      pt: 'Menu suspenso suave, com ícones e item selecionado.',
      en: 'Soft dropdown menu with icons and a selected item.',
    },
    shots: ['01', '02'],
  },
  {
    id: 13,
    type: { pt: 'Componente', en: 'Component' },
    tint: '#00ff88',
    description: {
      pt: 'Tela de login responsiva em tema escuro, com ilustração que some no celular.',
      en: 'Responsive dark login screen, with an illustration that drops out on phones.',
    },
    shots: ['01', '02', '03'],
  },
];

function build(meta: MoreMeta): CuratedProject {
  const project = projects.find((p) => p.id === meta.id);
  if (!project) throw new Error(`moreProjects: no project with id ${meta.id} in data/projects.ts`);
  // the photos sit in public/projects/<slug>/, the slug the project has in projects.ts
  const images = meta.shots.map((n) => `./projects/${project.slug}/${n}.webp`);
  return {
    ...project,
    image: images[0],
    images,
    type: meta.type,
    cat: 'web',
    tint: meta.tint,
    description: meta.description,
    tagline: meta.description,
    long: meta.description,
    // the dialog leaves the "what I did" list out when it is empty
    points: { pt: [], en: [] },
  };
}

export const moreProjects: CuratedProject[] = META.filter((meta) => meta.shots.length > 0).map(build);
