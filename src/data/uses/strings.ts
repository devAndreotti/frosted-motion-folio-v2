import type { UsesLang, UsesLevel } from './types';

// Textos da página /uses/ que não são dados dos itens: etiqueta do item principal, contagem, índice.
// Ficam aqui, em arquivo próprio, com PT e EN lado a lado.

export interface UsesStrings {
  /** Tag on the main pick of a category. */
  mainTag: string;
  /** aria-label of the jump links at the top of the page. */
  indexLabel: string;
  /** Label of the jump link that covers the editor and terminal categories together. */
  editorTerminal: string;
  /** "1 item", "3 itens": the count shown on each category heading. */
  itemCount: (n: number) => string;
  /** Tag on a stack card: the level of the item. */
  level: Record<UsesLevel, string>;
}

export const USES_STRINGS: Record<UsesLang, UsesStrings> = {
  pt: {
    mainTag: 'principal',
    indexLabel: 'Categorias',
    editorTerminal: 'Editor e terminal',
    itemCount: (n) => (n === 1 ? '1 item' : `${n} itens`),
    level: { daily: 'uso diário', comfortable: 'confortável', learning: 'aprendendo' },
  },
  en: {
    mainTag: 'main',
    indexLabel: 'Categories',
    editorTerminal: 'Editor and terminal',
    itemCount: (n) => (n === 1 ? '1 item' : `${n} items`),
    level: { daily: 'daily', comfortable: 'comfortable', learning: 'learning' },
  },
};
