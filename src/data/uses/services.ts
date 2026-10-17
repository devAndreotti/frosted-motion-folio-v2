import type { UsesCategory } from './types';

export const SERVICES: UsesCategory = {
  id: 'services',
  label: { pt: 'Serviços', en: 'Services' },
  items: [
    {
      name: 'Oracle Cloud',
      main: true,
      detail: { pt: 'Duas VPS', en: 'Two VPS' },
      why: {
        pt: 'Servidores de uso geral para serviços e automações.',
        en: 'General-purpose servers for services and automations.',
      },
    },
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
};
