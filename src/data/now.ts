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

/** What a private project's card says, drawn in the project's own colors so it reads like the app itself. */
export interface AlsoDetails {
  /** One line in the project's own voice, under the name. */
  sig: Localized<string>;
  status: Localized<string>;
  meta: Localized<string>;
  pitch: Localized<string>;
  features: Localized<string[]>;
  stack: string[];
  /** The app's own palette; the accent is the item's `color`, `ink` a darker one for small text where the accent is too light on `bg`. */
  palette: { bg: string; fg: string; fg2: string; muted: string; ink?: string };
  /** Type like the app: mono for the terminal tools, serif titles for the editorial panel. */
  face?: 'mono' | 'editorial';
  /** Bullet for the feature list. */
  mark: string;
}

export interface AlsoItem {
  name: string;
  note: Localized<string>;
  /** The public repo; private work has none. */
  href?: string;
  /** The project's own color: the card takes it on hover. */
  color?: string;
  /** App icon in public/now/icons, grey until hover. */
  icon?: string;
  /** Opens a card in the project's own style instead of linking out; a public one links to `href` from inside the card. */
  details?: AlsoDetails;
}

export const NOW_ALSO: AlsoItem[] = [
  {
    name: 'Kali Layer',
    note: { pt: 'meu lab de bug bounty numa VM Kali, com helpers e menus próprios', en: 'my bug bounty lab on a Kali VM, with custom helpers and menus' },
    color: '#e05561',
    icon: './now/icons/kali.webp',
    details: {
      sig: { pt: 'kali@lab:~$ hh', en: 'kali@lab:~$ hh' },
      status: { pt: 'Em desenvolvimento', en: 'In development' },
      meta: { pt: 'sem repositório público', en: 'no public repository' },
      pitch: {
        pt: 'Camada entre o Windows e uma VM Kali que transforma o lab num posto de recon: um menu central com o estado da máquina, workspaces por alvo, notas e achados, e a exportação das evidências de volta para o Windows.',
        en: 'A layer between Windows and a Kali VM that turns the lab into a recon station: one menu with the machine state, per-target workspaces, notes and findings, and evidence exported back to Windows.',
      },
      features: {
        pt: ['Hub hh com uptime, RAM, alvo ativo e IP do Tailscale', 'Atalhos de recon e web: httpx, nuclei, ffuf, gobuster e feroxbuster', 'Kit de OSINT instalado e atualizado pelo ext (holehe, maigret, h8mail…)', 'Workspace por alvo, com notas e achados', 'Exportação para o Windows via Samba e rotas por Tor/proxychains'],
        en: ['hh hub with uptime, RAM, active target and Tailscale IP', 'Recon and web shortcuts: httpx, nuclei, ffuf, gobuster and feroxbuster', 'OSINT kit installed and kept up to date by ext (holehe, maigret, h8mail…)', 'Per-target workspace with notes and findings', 'Export to Windows over Samba, plus Tor/proxychains routes'],
      },
      stack: ['PowerShell', 'zsh', 'Gum + fzf', 'Python', 'tmux', 'Tailscale'],
      palette: { bg: '#0f0a0d', fg: '#cdd6f4', fg2: '#b4bcd6', muted: '#8a8fa8' },
      face: 'mono',
      mark: '›',
    },
  },
  {
    name: 'Feed Dispatch',
    note: { pt: 'curadoria de conteúdo técnico com LLM, revisão e publicação', en: 'LLM-assisted tech content curation, review and publishing' },
    color: '#e37a4d',
    icon: './now/icons/feed-dispatch.webp',
    details: {
      sig: { pt: 'coletar → gerar → revisar → publicar', en: 'collect → draft → review → publish' },
      status: { pt: 'Em uso', en: 'In use' },
      meta: { pt: 'roda na minha VPS', en: 'runs on my VPS' },
      pitch: {
        pt: 'Pipeline de curadoria editorial: coleta posts de Reddit, X, LinkedIn e GitHub, usa LLM para rascunhar o post de cada plataforma e deixa tudo numa fila para eu revisar e aprovar num painel web antes de publicar.',
        en: 'An editorial curation pipeline: it collects posts from Reddit, X, LinkedIn and GitHub, has an LLM draft a post for each platform and queues everything for me to review and approve in a web panel before publishing.',
      },
      features: {
        pt: ['Coleta por tema, preset ou ranking de hype, guardada em Postgres', 'Posts, threads, comentários e respostas gerados com OpenRouter ou Gemini', 'Fila editorial: aprovar, rejeitar, editar e gerar de novo', 'Painel web com histórico, fila e jobs em segundo plano', 'Publicação por plataforma com dry-run e resumo por e-mail'],
        en: ['Collection by topic, preset or hype ranking, stored in Postgres', 'Posts, threads, comments and replies drafted with OpenRouter or Gemini', 'Editorial queue: approve, reject, edit and regenerate', 'Web panel with history, queue and background jobs', 'Per-platform publishing with dry-run and an email summary'],
      },
      stack: ['Python', 'Flask', 'PostgreSQL', 'Redis', 'Playwright', 'Textual'],
      // the panel's own light theme: cream paper, the icon's coral, Palatino titles
      palette: { bg: '#f7f0e4', fg: '#1f2834', fg2: '#3d4450', muted: '#6f665b', ink: '#a24a2e' },
      face: 'editorial',
      mark: '+',
    },
  },
  {
    name: 'Orbitaly',
    note: { pt: 'catálogo desktop de skills e MCP servers', en: 'desktop catalog of skills and MCP servers' },
    color: '#a3ff12',
    icon: './now/icons/orbitaly.webp',
    details: {
      sig: { pt: 'skills · workflows · MCP · workspaces', en: 'skills · workflows · MCP · workspaces' },
      status: { pt: 'Beta', en: 'Beta' },
      meta: { pt: 'v0.1.0 · Windows primeiro', en: 'v0.1.0 · Windows first' },
      pitch: {
        pt: 'Catálogo desktop para descobrir, organizar e preparar os assets de IA que ficam espalhados em pastas ocultas: skills, workflows, servidores MCP e workspaces.',
        en: 'A desktop catalog to discover, curate and stage the AI assets scattered across hidden folders: skills, workflows, MCP servers and workspaces.',
      },
      features: {
        pt: ['Busca por tarefa, taxonomia e intenção, com sugestões opcionais de IA', 'Pastas virtuais que agrupam assets sem mover arquivos', 'Gera o prompt do projeto a partir dos assets escolhidos', 'Monitor de saúde dos servidores MCP', 'API local opcional, desligada por padrão'],
        en: ['Search by task, taxonomy and intent, with optional AI suggestions', 'Virtual folders that group assets without moving files', 'Builds the project prompt from the chosen assets', 'MCP server health monitor', 'Optional local API, off by default'],
      },
      stack: ['Electron', 'React 19', 'TypeScript', 'SQLite', 'MCP SDK', 'Tailwind 4'],
      palette: { bg: '#080b10', fg: '#e2e8f0', fg2: '#b8c2d1', muted: '#7c8798' },
      mark: '◦',
    },
  },
  {
    name: 'Scriply',
    note: { pt: 'app desktop pra gerenciar, editar e agendar scripts de automação', en: 'desktop app to manage, edit and schedule automation scripts' },
    color: '#a78bfa',
    icon: './now/icons/scriply.webp',
    details: {
      sig: { pt: 'PowerShell · Batch · agendador', en: 'PowerShell · Batch · scheduler' },
      status: { pt: 'Em desenvolvimento', en: 'In development' },
      meta: { pt: 'v0.1.0', en: 'v0.1.0' },
      pitch: {
        pt: 'App desktop para quem guarda scripts PowerShell e Batch em pastas soltas e roda tudo na mão: encontra, executa, edita e acompanha cada script num lugar só.',
        en: 'A desktop app for people who keep PowerShell and Batch scripts in loose folders and run them by hand: find, run, edit and track every script in one place.',
      },
      features: {
        pt: ['Catálogo a partir de pastas observadas, com busca e layouts', 'Editor Monaco e terminal integrado com painéis divididos', 'Cofre de segredos local, criptografado com safeStorage', 'Dashboard e logs em SQLite', 'Agendamento pelo Agendador de Tarefas do Windows'],
        en: ['Catalog built from watched folders, with search and layouts', 'Monaco editor and a built-in terminal with split panes', 'Local secret vault, encrypted with safeStorage', 'Dashboard and logs in SQLite', 'Scheduling through Windows Task Scheduler'],
      },
      stack: ['Electron', 'React 19', 'TypeScript', 'node-pty', 'SQLite', 'Tailwind 4'],
      palette: { bg: '#100b1b', fg: '#ece6ff', fg2: '#c9bfe6', muted: '#9488b3' },
      mark: '✓',
    },
  },
  {
    name: 'Ambiente Hyprland',
    note: { pt: 'meu Linux com barra e widgets próprios em QML', en: 'my Linux setup with a custom bar and widgets in QML' },
    color: '#1cb6d4',
    icon: './now/icons/hyprland.webp',
    details: {
      sig: { pt: 'arch · hyprland · quickshell', en: 'arch · hyprland · quickshell' },
      status: { pt: 'Em uso', en: 'In use' },
      meta: { pt: 'meu desktop do dia a dia', en: 'my daily desktop' },
      pitch: {
        pt: 'Meu desktop Linux com Hyprland e uma interface feita do zero em Quickshell/QML: barra superior, popups para cada widget e cores tiradas do papel de parede.',
        en: 'My Linux desktop on Hyprland with an interface built from scratch in Quickshell/QML: a top bar, a popup per widget and colors taken from the wallpaper.',
      },
      features: {
        pt: ['Barra superior por monitor, com popups flutuantes', 'Widgets de bateria, rede, volume, música, notificações, área de transferência e calendário', 'Tema gerado do papel de parede pelo matugen', 'Tela de bloqueio, launcher de apps e painel de ações rápidas', 'Dispatcher IPC central e um watchdog que reinicia o Quickshell'],
        en: ['Per-monitor top bar with floating popups', 'Battery, network, volume, music, notifications, clipboard and calendar widgets', 'Theme generated from the wallpaper by matugen', 'Lock screen, app launcher and quick-actions panel', 'Central IPC dispatcher and a watchdog that restarts Quickshell'],
      },
      stack: ['Hyprland', 'Quickshell', 'QML', 'Bash', 'Python', 'matugen'],
      palette: { bg: '#071824', fg: '#dcf6fb', fg2: '#a9d3df', muted: '#6f9aab' },
      mark: '▸',
    },
  },
  {
    name: 'local-llm-rtx-4gb',
    note: { pt: 'LLMs locais numa GPU de 4 GB, com benchmarks', en: 'local LLMs on a 4 GB GPU, with benchmarks' },
    href: 'https://github.com/devAndreotti/local-llm-rtx-4gb',
    color: '#b9c0c6',
    icon: './now/icons/local-llm.webp',
    details: {
      sig: { pt: 'RTX 2050 · 4 GB VRAM · 100% GPU', en: 'RTX 2050 · 4 GB VRAM · 100% GPU' },
      status: { pt: 'Open source', en: 'Open source' },
      meta: { pt: 'benchmarks de 2026', en: '2026 benchmarks' },
      pitch: {
        pt: 'Modelos de linguagem locais num notebook com RTX 2050 de 4 GB: configurações ajustadas para caber inteiro na GPU, atalhos para abrir cada modelo e uma suíte de benchmark que mede velocidade, lógica e tool calling.',
        en: 'Local language models on a laptop with a 4 GB RTX 2050: configs tuned to fit entirely on the GPU, shortcuts to launch each model and a benchmark suite that measures speed, logic and tool calling.',
      },
      features: {
        pt: ['Qwen 2.5 3B e Coder 3B a ~45 tok/s, 100% na GPU', 'DeepSeek R1 1.5B a ~80 tok/s; o 7B cai para 3–5 tok/s dividindo CPU e GPU', 'Tool calling nativo no Qwen 2.5; R1 e Gemma não servem para chamar ferramentas', 'Variantes customizadas (qcode, qchat, r1fast, Gemma) com launchers', 'Suíte de benchmark em promptfoo: lógica, código e tool calling'],
        en: ['Qwen 2.5 3B and Coder 3B at ~45 tok/s, fully on the GPU', 'DeepSeek R1 1.5B at ~80 tok/s; the 7B drops to 3–5 tok/s split across CPU and GPU', 'Native tool calling on Qwen 2.5; R1 and Gemma are no good for tool dispatch', 'Custom variants (qcode, qchat, r1fast, Gemma) with launchers', 'promptfoo benchmark suite: logic, code and tool calling'],
      },
      stack: ['Ollama', 'promptfoo', 'Qwen 2.5', 'DeepSeek-R1', 'Gemma', 'CUDA'],
      palette: { bg: '#16191b', fg: '#e4e7e9', fg2: '#b8bec3', muted: '#878e94' },
      face: 'mono',
      mark: '›',
    },
  },
];

/** The checks this very repo runs on every PR -- drawn as the Quality Gate card's visual. */
export const GATE_CHECKS = ['Security audit', 'Lint', 'Tests & ratchet', 'E2E (Playwright)', 'Docker image gate', 'PR report'];
