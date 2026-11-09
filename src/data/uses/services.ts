import type { UsesCategory } from './types';

export const SERVICES: UsesCategory = {
  id: 'services',
  label: { pt: 'Serviços', en: 'Services' },
  items: [
    {
      name: 'Oracle Cloud',
      main: true,
      detail: { pt: 'Duas instâncias VPS Always Free', en: 'Two Always Free VPS instances' },
      why: {
        pt: 'Servidores de uso geral para serviços, automações e execução contínua de agentes.',
        en: 'General-purpose servers for services, automations, and persistent agent runs.',
      },
    },
    {
      name: 'Cloudflare',
      detail: { pt: 'Cloudflare Workers + D1 e Turnstile', en: 'Cloudflare Workers + D1 and Turnstile' },
      why: {
        pt: 'Hospeda este site na edge, guarda as curtidas no D1 e protege a newsletter com Turnstile.',
        en: 'Hosts this site on the edge, stores likes in D1, and protects the newsletter with Turnstile.',
      },
    },
    {
      name: 'GitHub',
      detail: { pt: 'Repositórios e GitHub Actions CI/CD', en: 'Repositories and GitHub Actions CI/CD' },
      why: {
        pt: 'Onde moram os projetos. O CI roda no GitHub Actions a cada pull request.',
        en: 'Where the projects live. CI runs on GitHub Actions for every pull request.',
      },
    },
    {
      name: 'Tailscale',
      detail: { pt: 'Rede privada WireGuard', en: 'WireGuard private mesh network' },
      why: {
        pt: 'Rede privada entre os meus equipamentos e servidores remotos.',
        en: 'A private network between my own machines and remote servers.',
      },
    },
    {
      name: 'Bitwarden Secrets Manager',
      detail: { pt: 'Cofre seguro de credenciais', en: 'Secure credentials vault' },
      why: {
        pt: 'Armazenamento criptografado de credenciais, chaves de API e segredos de ambiente.',
        en: 'Encrypted storage for credentials, API keys, and environment secrets.',
      },
    },
  ],
};
