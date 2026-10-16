import type { Localized } from '@/lib/i18n';

// /uses/ -- what I use day to day, by category, with the reason for each pick. Only generic, public
// names here (models, systems, tools, services): no hosts, addresses, accounts, paths or keys.
// Every reason is a plain description of what the item is used for, not an opinion invented for the page.

export type UsesCategoryId = 'hardware' | 'system' | 'editor' | 'terminal' | 'ai' | 'services';
export type UsesLang = 'pt' | 'en';

export interface UsesItem {
  name: string;
  /** Model, version or what it runs on. Optional. */
  detail?: Localized<string>;
  /** What it is used for, one short line. */
  why: Localized<string>;
}

export interface UsesCategory {
  id: UsesCategoryId;
  label: Localized<string>;
  items: UsesItem[];
}

export const USES_CATEGORIES: UsesCategory[] = [
  {
    id: 'hardware',
    label: { pt: 'Hardware', en: 'Hardware' },
    items: [
      {
        name: 'PC Windows principal',
        detail: { pt: 'Intel Core i5-12450H · 16 GB de RAM · NVIDIA GeForce RTX 2050', en: 'Intel Core i5-12450H · 16 GB RAM · NVIDIA GeForce RTX 2050' },
        why: {
          pt: 'Trabalho e desenvolvimento. A GPU roda modelos de IA locais com o Ollama.',
          en: 'Work and development. The GPU runs local AI models with Ollama.',
        },
      },
      {
        name: 'Desktop Linux',
        detail: { pt: 'Intel Core i5-4690 · NVIDIA GeForce GTX 1060 6 GB', en: 'Intel Core i5-4690 · NVIDIA GeForce GTX 1060 6 GB' },
        why: {
          pt: 'Desktop de uso diário para desenvolvimento e ferramentas próprias.',
          en: 'Daily desktop for development and my own tools.',
        },
      },
      {
        name: 'Motorola Edge 50 Pro',
        detail: { pt: 'Snapdragon 7 Gen 3 · 12 GB de RAM', en: 'Snapdragon 7 Gen 3 · 12 GB RAM' },
        why: {
          pt: 'Terminal de bolso, e teste de modelos pequenos rodando no próprio aparelho.',
          en: 'A pocket terminal, and a place to test small models running on the device itself.',
        },
      },
    ],
  },
  {
    id: 'system',
    label: { pt: 'Sistema', en: 'System' },
    items: [
      {
        name: 'Windows 11 Pro',
        why: {
          pt: 'Sistema do PC principal. O WSL2 cobre o que precisa de Linux.',
          en: 'The main PC system. WSL2 covers what needs Linux.',
        },
      },
      {
        name: 'EndeavourOS com Hyprland',
        why: {
          pt: 'Linux baseado em Arch, com compositor Wayland e janelas em mosaico. A barra é própria, feita em QML.',
          en: 'Arch-based Linux with a Wayland compositor and tiled windows. The status bar is my own, written in QML.',
        },
      },
      {
        name: 'Termux',
        why: {
          pt: 'Terminal no celular, com um Ubuntu em PRoot para pacotes que precisam de glibc.',
          en: 'A terminal on the phone, with an Ubuntu in PRoot for packages that need glibc.',
        },
      },
      {
        name: 'Docker',
        why: {
          pt: 'Contêineres locais para serviços e testes de imagem.',
          en: 'Local containers for services and image tests.',
        },
      },
    ],
  },
  {
    id: 'editor',
    label: { pt: 'Editor', en: 'Editor' },
    items: [
      {
        name: 'VS Code no navegador',
        detail: { pt: 'code-server, numa instância própria', en: 'code-server, on an instance of my own' },
        why: {
          pt: 'Edição pelo navegador, sem instalar nada no computador de onde estou.',
          en: 'Editing from the browser, with nothing to install on the machine I am using.',
        },
      },
    ],
  },
  {
    id: 'terminal',
    label: { pt: 'Terminal', en: 'Terminal' },
    items: [
      {
        name: 'Windows Terminal',
        why: {
          pt: 'Abas e painéis divididos, com layouts salvos para cada tipo de trabalho.',
          en: 'Tabs and split panes, with layouts saved for each kind of work.',
        },
      },
      {
        name: 'PowerShell 7',
        why: {
          pt: 'Shell do Windows, com um profile próprio de aliases e funções.',
          en: 'The Windows shell, with a profile of my own of aliases and functions.',
        },
      },
      {
        name: 'zsh com Starship',
        why: {
          pt: 'Shell do desktop Linux, com prompt enxuto e aliases próprios.',
          en: 'The Linux desktop shell, with a lean prompt and aliases of my own.',
        },
      },
      {
        name: 'Git e GitHub CLI',
        why: {
          pt: 'Controle de versão. O gh cuida da autenticação do Git pelo HTTPS.',
          en: 'Version control. gh handles Git authentication over HTTPS.',
        },
      },
      {
        name: 'lazygit',
        why: {
          pt: 'Git numa interface de terminal, para revisar e fazer commits.',
          en: 'Git in a terminal interface, for reviewing and committing.',
        },
      },
      {
        name: 'yazi',
        why: {
          pt: 'Gerenciador de arquivos no terminal, assíncrono.',
          en: 'A file manager for the terminal, asynchronous.',
        },
      },
      {
        name: 'fzf e zoxide',
        why: {
          pt: 'Busca fuzzy de arquivos e navegação entre pastas pela frequência de uso.',
          en: 'Fuzzy file search, and folder navigation by how often each one is used.',
        },
      },
      {
        name: 'ripgrep, bat e eza',
        why: {
          pt: 'Busca de texto, visualização com cor e listagem com ícones e status do Git.',
          en: 'Text search, colored file viewing, and listings with icons and Git status.',
        },
      },
    ],
  },
  {
    id: 'ai',
    label: { pt: 'IA', en: 'AI' },
    items: [
      {
        name: 'Claude Code',
        why: {
          pt: 'Agente de programação no terminal, usado no dia a dia dos projetos.',
          en: 'A coding agent in the terminal, used day to day on my projects.',
        },
      },
      {
        name: 'Codex CLI',
        why: {
          pt: 'Agente de programação da OpenAI, no terminal.',
          en: 'OpenAI’s coding agent, in the terminal.',
        },
      },
      {
        name: 'OpenCode',
        why: {
          pt: 'Agente de programação no terminal.',
          en: 'A coding agent in the terminal.',
        },
      },
      {
        name: 'Ollama com Gemma',
        detail: { pt: 'Gemma em 2B, 4B e 9B, e variações para código e SQL', en: 'Gemma at 2B, 4B and 9B, plus variants for code and SQL' },
        why: {
          pt: 'Modelos abertos rodando local na GPU, sem mandar o texto para fora.',
          en: 'Open models running locally on the GPU, without sending the text anywhere.',
        },
      },
      {
        name: 'Promptfoo',
        why: {
          pt: 'Testes de prompts e modelos, com casos e métricas.',
          en: 'Tests for prompts and models, with cases and metrics.',
        },
      },
      {
        name: 'Whisper',
        why: {
          pt: 'Transcrição de áudio e geração de legendas, rodando local.',
          en: 'Audio transcription and subtitles, running locally.',
        },
      },
    ],
  },
  {
    id: 'services',
    label: { pt: 'Serviços', en: 'Services' },
    items: [
      {
        name: 'Cloudflare',
        detail: { pt: 'Workers, D1 e Turnstile', en: 'Workers, D1 and Turnstile' },
        why: {
          pt: 'Hospeda este site, guarda as curtidas do blog e protege o formulário da newsletter.',
          en: 'Hosts this site, stores the blog likes and protects the newsletter form.',
        },
      },
      {
        name: 'GitHub',
        detail: { pt: 'Repositórios, pull requests e GitHub Actions', en: 'Repositories, pull requests and GitHub Actions' },
        why: {
          pt: 'Onde moram os projetos. O CI roda no GitHub Actions a cada pull request.',
          en: 'Where the projects live. CI runs on GitHub Actions for every pull request.',
        },
      },
      {
        name: 'Tailscale',
        why: {
          pt: 'Rede privada entre os meus equipamentos.',
          en: 'A private network between my own machines.',
        },
      },
    ],
  },
];

/** The link to the page in the site footer and the blog menu. */
export const USES_LINK: Localized<string> = { pt: 'O que eu uso', en: 'Uses' };

export interface UsesCopy {
  title: string;
  kicker: string;
  h1: string;
  lead: string;
  updated: string;
}

export const USES_COPY: Record<UsesLang, UsesCopy> = {
  pt: {
    title: 'O que eu uso',
    kicker: 'Uses',
    h1: 'O que eu uso no dia a dia.',
    lead: 'Hardware, sistemas, editor, terminal, IA e serviços. Para cada item, o motivo da escolha.',
    updated: 'Atualizado em 16 de outubro de 2026.',
  },
  en: {
    title: 'Uses',
    kicker: 'Uses',
    h1: 'What I use day to day.',
    lead: 'Hardware, systems, editor, terminal, AI and services. For each item, why I picked it.',
    updated: 'Updated on October 16, 2026.',
  },
};
