import { pt } from './i18n.pt';
import { en } from './i18n.en';
import type { Lang, Strings } from './i18n.types';

export type { Lang, Localized } from './i18n.types';
export { pick } from './i18n.types';

export const strings: Record<Lang, Strings> = { pt, en };

// Exact-text lookup for the GitHub activity feed's English labels — the feed
// hook returns pt-only display text (kind alone doesn't distinguish "opened"
// from "merged" a PR, or "branch" from "tag" from "repository"), so this
// translates by the known PT phrase instead of touching the hook's contract.
export const ACTIVITY_TEXT_EN: Record<string, string> = {
  'Fez push': 'Pushed code',
  'Abriu um PR': 'Opened a PR',
  'Fez merge de um PR': 'Merged a PR',
  'Deu estrela': 'Starred',
  'Criou a branch': 'Created branch',
  'Criou a tag': 'Created tag',
  'Criou o repositório': 'Created the repository',
  'Abriu uma issue': 'Opened an issue',
  'Fechou uma issue': 'Closed an issue',
};
