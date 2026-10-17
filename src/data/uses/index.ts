import type { Localized } from '@/lib/i18n';
import type { UsesCategory, UsesLang } from './types';
import { AI } from './ai';
import { EDITOR } from './editor';
import { HARDWARE } from './hardware';
import { SERVICES } from './services';
import { SYSTEM } from './system';
import { TERMINAL } from './terminal';

// /uses/ -- what I use day to day, by category, with the reason for each pick. Only generic, public
// names here (models, systems, tools, services): no hosts, addresses, accounts, paths or keys.
// Every reason is a plain description of what the item is used for, not an opinion invented for the page.

export type { UsesCategory, UsesCategoryId, UsesItem, UsesLang } from './types';

export const USES_CATEGORIES: UsesCategory[] = [HARDWARE, SYSTEM, EDITOR, TERMINAL, AI, SERVICES];

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
    updated: 'Atualizado em 17 de outubro de 2026.',
  },
  en: {
    title: 'Uses',
    kicker: 'Uses',
    h1: 'What I use day to day.',
    lead: 'Hardware, systems, editor, terminal, AI and services. For each item, why I picked it.',
    updated: 'Updated on October 17, 2026.',
  },
};
