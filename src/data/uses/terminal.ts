import type { UsesCategory } from './types';

export const TERMINAL: UsesCategory = {
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
};
