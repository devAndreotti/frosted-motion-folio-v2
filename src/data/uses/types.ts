import type { Localized } from '@/lib/i18n';

// Tipos da página /uses/. Os dados ficam em um arquivo por categoria, reunidos em index.ts.

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
