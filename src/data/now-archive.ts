import type { Lang, Localized } from '@/lib/i18n';
import { NOW_UPDATED } from './now';

// Versões anteriores da seção "Agora". A primeira entrada é a atual (mesma data de NOW_UPDATED).
// As antigas têm a data do commit que as publicou em src/data/now.ts (git log -p) e o que estava no ar então.

export interface NowVersion {
  /** ISO date the version went live. */
  date: string;
  /** What the section said then, in each language. */
  summary: Localized<string>;
  /** Names of the cards on screen then (titles as they were). */
  items: string[];
}

export const NOW_ARCHIVE: NowVersion[] = [
  {
    date: NOW_UPDATED,
    summary: {
      pt: 'Versão atual: o Memory Apartment com a TV, o Quality Gate, o Black Hole e o Free Plaud, e seis projetos menores no forno.',
      en: 'Current version: Memory Apartment with its TV, Quality Gate, Black Hole and Free Plaud, and six smaller projects in the oven.',
    },
    items: ['Project 17: Memory Apartment', 'Quality Gate', 'Black Hole', 'Free Plaud', 'Kali Layer', 'Feed Dispatch', 'Orbitaly', 'Scriply', 'Ambiente Hyprland', 'local-llm-rtx-4gb'],
  },
  {
    date: '2026-10-13',
    summary: {
      pt: 'Cards do forno com ícones novos, e os cards do Ambiente Hyprland e do local-llm-rtx-4gb atualizados. Os quatro projetos principais já estavam lá.',
      en: 'Oven cards with new icons, and the Ambiente Hyprland and local-llm-rtx-4gb cards updated. The four main projects were already there.',
    },
    items: ['Project 17: Memory Apartment', 'Quality Gate', 'Black Hole', 'Free Plaud', 'Kali Layer', 'Feed Dispatch', 'Orbitaly', 'Scriply', 'Ambiente Hyprland', 'local-llm-rtx-4gb'],
  },
  {
    date: '2026-10-07',
    summary: {
      pt: 'Primeira versão da seção: sobre mim, os quatro projetos principais e cinco projetos menores no forno (o local-llm aparecia como ollama-rtx-4gb).',
      en: 'First version of the section: about me, the four main projects and five smaller projects in the oven (the local LLM card was still called ollama-rtx-4gb).',
    },
    items: ['Project 17: Memory Apartment', 'Quality Gate', 'Black Hole', 'Free Plaud', 'Orbitaly', 'Scriply', 'Feed Dispatch', 'Ambiente Hyprland', 'ollama-rtx-4gb'],
  },
];

export interface AgoraCopy {
  title: string;
  kicker: string;
  h1: string;
  lead: string;
  updated: (date: string) => string;
  currentTitle: string;
  archiveTitle: string;
  archiveLead: string;
  current: string;
  backHome: string;
}

export const AGORA_COPY: Record<Lang, AgoraCopy> = {
  pt: {
    title: 'Agora',
    kicker: 'Agora · arquivo',
    h1: 'O que estou fazendo, versão por versão.',
    lead: 'A seção Agora muda de tempos em tempos. Aqui fica a versão de hoje e as anteriores, com a data em que cada uma foi ao ar.',
    updated: (date) => `Atualizado em ${date}`,
    currentTitle: 'Versão atual',
    archiveTitle: 'Arquivo',
    archiveLead: 'Versões anteriores, da mais nova para a mais antiga.',
    current: 'atual',
    backHome: 'Voltar para a página inicial',
  },
  en: {
    title: 'Now',
    kicker: 'Now · archive',
    h1: 'What I am doing, version by version.',
    lead: 'The Now section changes every so often. Here is today’s version and the earlier ones, with the date each one went live.',
    updated: (date) => `Updated on ${date}`,
    currentTitle: 'Current version',
    archiveTitle: 'Archive',
    archiveLead: 'Earlier versions, newest first.',
    current: 'current',
    backHome: 'Back to the home page',
  },
};
