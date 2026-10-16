/** Address of a case: the popup and its static page share it. */
export const casePath = (slug: string) => `/projetos/${slug}/`;

/** Location state of a case pushed by a click on a card: its close button goes back in history, not to a new entry. */
export const CASE_STATE = { caseOpen: true } as const;

/** A plain left click opens the case in the popup; with a modifier the link keeps its own behavior (new tab). */
export const isPlainClick = (e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
