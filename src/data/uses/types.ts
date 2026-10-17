import type { Localized } from '@/lib/i18n';

// Tipos da página /uses/. Os dados ficam em um arquivo por categoria, reunidos em index.ts.

export type UsesCategoryId = 'hardware' | 'system' | 'editor' | 'terminal' | 'ai' | 'services' | 'stack';
/** How well I know a stack item: the tag on its card. daily = uso diário, expert = alta habilidade, learning = aprendendo. */
export type UsesLevel = 'daily' | 'expert' | 'learning';
export type UsesLang = 'pt' | 'en';

export interface UsesItem {
  name: string;
  /** Model, version or what it runs on. Optional. */
  detail?: Localized<string>;
  /** What it is used for, one short line. */
  why: Localized<string>;
  /** The main pick of its category: highlighted on the card and tagged "principal" / "main". At most one per category. */
  main?: boolean;
  /** Stack items only: the level tag on the card. */
  level?: UsesLevel;
}

export interface UsesCategory {
  id: UsesCategoryId;
  label: Localized<string>;
  items: UsesItem[];
}
