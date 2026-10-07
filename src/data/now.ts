import type { Localized } from '@/lib/i18n';

export interface NowProject {
  id: string;
  title: string;
  status: Localized<string>;
  /** Short fact next to the status, e.g. "+44 commits on top of the original". */
  meta: Localized<string>;
  pitch: Localized<string>;
  tags: string[];
  href: string;
  /** Visible link text: the site's host, or "GitHub". */
  linkLabel: string;
  /** Repo is private -- the card links to the public site instead. */
  privateCode?: boolean;
  /** Screenshot in public/now; cards without one draw their own visual. */
  image?: string;
  /** Banner-shaped art that should be shown whole, not cropped. */
  contain?: boolean;
}

// What's on the workbench right now, newest first. Taken from the GitHub
// account in Oct 2026: private repos only ever link to their public site.
export const NOW_PROJECTS: NowProject[] = [
  {
    id: 'memory-apartment',
    title: 'Project 17: Memory Apartment',
    status: { pt: 'Em desenvolvimento', en: 'In development' },
    meta: { pt: 'PC · 2027', en: 'PC · 2027' },
    pitch: {
      pt: 'Terror psicológico em primeira pessoa: outubro de 2003, apartamento 17 e, toda noite às 03:17, alguma coisa muda. Arquitetura impossível, anomalias e um PC dos anos 2000 que funciona dentro do jogo.',
      en: 'First-person psychological horror: October 2003, apartment 17, and every night at 03:17 something changes. Impossible architecture, anomalies and a working early-2000s PC inside the game.',
    },
    tags: ['Godot 4', 'GDScript', 'Blender'],
    href: 'https://memoryapartment.com',
    linkLabel: 'memoryapartment.com',
    privateCode: true,
    image: './now/memory-apartment.webp',
  },
  {
    id: 'quality-gate',
    title: 'Quality Gate',
    status: { pt: 'Open source', en: 'Open source' },
    meta: { pt: 'roda neste portfólio', en: 'runs on this portfolio' },
    pitch: {
      pt: 'Contrato de qualidade plug-and-play para qualquer repositório: CI com 6 jobs em paralelo, ratchet de cobertura que nunca regride, gate de imagem Docker e um agente que acompanha o PR até ficar verde.',
      en: 'A plug-and-play quality contract for any repo: 6 parallel CI jobs, a coverage ratchet that never goes backwards, a Docker image gate and an agent that babysits the PR until it goes green.',
    },
    tags: ['GitHub Actions', 'Node.js', 'SonarCloud'],
    href: 'https://github.com/devAndreotti/quality-gate',
    linkLabel: 'GitHub',
  },
  {
    id: 'black-hole',
    title: 'Black Hole',
    status: { pt: 'Fork estendido', en: 'Extended fork' },
    meta: { pt: '+44 commits sobre o original', en: '+44 commits on top of the original' },
    pitch: {
      pt: 'Buraco negro em tempo real na GPU, por ray-marching de geodésicas. Adicionei física de Kerr (rotação), jatos relativísticos e modos para rodar como papel de parede do Windows ou dentro do terminal.',
      en: 'A real-time black hole on the GPU, by ray-marching geodesics. I added Kerr (spinning) physics, relativistic jets and modes to run it as a Windows wallpaper or inside the terminal.',
    },
    tags: ['C++', 'OpenGL 4.3', 'GLSL'],
    href: 'https://devandreotti.github.io/black_hole/',
    linkLabel: 'devandreotti.github.io',
    image: './now/black-hole.webp',
  },
  {
    id: 'free-plaud',
    title: 'Free Plaud',
    status: { pt: 'TCC', en: 'Thesis' },
    meta: { pt: 'Ciência da Computação', en: 'Computer Science' },
    pitch: {
      pt: 'Começou como automação de áudio → nota no Obsidian e virou meu TCC: app desktop local-first, com transcrição Whisper local e busca híbrida (BM25 + vetorial) que cita o trecho exato.',
      en: 'It started as an audio → Obsidian note automation and became my thesis: a local-first desktop app with on-device Whisper transcription and hybrid search (BM25 + vectors) that cites the exact passage.',
    },
    tags: ['Python', 'Whisper', 'RAG'],
    href: 'https://github.com/devAndreotti/free-plaud',
    linkLabel: 'GitHub (v1)',
    image: './now/free-plaud.webp',
    contain: true,
  },
];

export interface AlsoItem {
  name: string;
  note: Localized<string>;
  /** Missing for private work without a public page. */
  href?: string;
}

export const NOW_ALSO: AlsoItem[] = [
  { name: 'Orbitaly', note: { pt: 'catálogo desktop de skills e MCP servers', en: 'desktop catalog of skills and MCP servers' } },
  { name: 'ollama-rtx-4gb', note: { pt: 'LLMs locais numa GPU de 4 GB, com benchmarks', en: 'local LLMs on a 4 GB GPU, with benchmarks' }, href: 'https://github.com/devAndreotti/ollama-rtx-4gb' },
  { name: 'lenis-mcp-server', note: { pt: 'MCP server de smooth scroll', en: 'smooth-scroll MCP server' }, href: 'https://github.com/devAndreotti/lenis-mcp-server' },
  { name: 'ai-memory', note: { pt: 'grafo interativo da memória de agentes (fork)', en: 'interactive graph for agent memory (fork)' }, href: 'https://github.com/devAndreotti/ai-memory' },
];

/** The checks this very repo runs on every PR -- drawn as the Quality Gate card's visual. */
export const GATE_CHECKS = ['Security audit', 'Lint', 'Tests & ratchet', 'E2E (Playwright)', 'Docker image gate', 'PR report'];
