/** The links of the blog frame (header and footer), by the route they open. */
export type BlogNavKey = 'home' | 'blog' | 'uses' | 'novidades';

/**
 * Which frame link is the current page, by its route (`/` home, `/blog` and `/blog/...`, `/uses`, `/novidades`).
 * Pages outside these routes (e.g. /agora, /privacidade) have no link active.
 */
export const blogNavActive = (pathname: string): BlogNavKey | null => {
  if (pathname === '/') return 'home';
  if (/^\/blog(\/|$)/.test(pathname)) return 'blog';
  if (/^\/uses(\/|$)/.test(pathname)) return 'uses';
  if (/^\/novidades(\/|$)/.test(pathname)) return 'novidades';
  return null;
};
