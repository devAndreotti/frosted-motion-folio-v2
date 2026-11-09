import type { UsesCategory } from './types';

export const TERMINAL: UsesCategory = {
  id: 'terminal',
  label: { pt: 'Terminal', en: 'Terminal' },
  items: [
    {
      name: 'Windows PowerShell',
      detail: { pt: 'PowerShell 7 · Profile customizado de automação', en: 'PowerShell 7 · Custom automation profile' },
      why: {
        pt: 'Shell principal no Windows, turbinado com aliases customizados e funções de produtividade.',
        en: 'Primary Windows shell, boosted with custom aliases and productivity functions.',
      },
    },
    {
      name: 'WSL2 Ubuntu',
      detail: { pt: 'Ambiente Linux integrado no Windows', en: 'Integrated Linux environment on Windows' },
      why: {
        pt: 'Execução de ferramentas e fluxos Linux diretamente no ambiente local.',
        en: 'Running Linux tooling and workflows directly in the local environment.',
      },
    },
    {
      name: 'VPS Oracle Cloud Linux',
      detail: { pt: 'Ambiente remoto Always Free', en: 'Always Free remote environment' },
      why: {
        pt: 'Instâncias remotas para automações, rotinas contínuas e execução de agentes.',
        en: 'Remote instances for automations, background routines, and agent runs.',
      },
    },
    {
      name: 'SSH com chaves ed25519',
      detail: { pt: 'Autenticação criptográfica segura', en: 'Secure cryptographic authentication' },
      why: {
        pt: 'Acesso seguro aos servidores remotos, Git e estações sem senhas.',
        en: 'Secure, passwordless access to remote servers, Git, and workstations.',
      },
    },
    {
      name: 'Tailscale mesh network',
      detail: { pt: 'Rede privada WireGuard ponto a ponto', en: 'Peer-to-peer WireGuard private network' },
      why: {
        pt: 'Conexão segura e direta entre notebook, desktop Linux, VPS e mobile.',
        en: 'Secure, direct mesh interconnecting notebook, Linux desktop, VPS, and mobile.',
      },
    },
    {
      name: 'Windows Terminal',
      why: {
        pt: 'Abas e painéis divididos, com layouts salvos para cada tipo de trabalho.',
        en: 'Tabs and split panes, with layouts saved for each kind of work.',
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
