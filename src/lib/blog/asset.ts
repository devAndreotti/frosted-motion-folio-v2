/**
 * The address of a blog picture (public/blog/...). Relative or root-leading paths
 * resolve from the site base (BASE_URL) so they work both at root ("/") and on subpaths ("/frosted-motion-folio-v2/").
 */
export const blogAsset = (src?: string): string => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  const base = import.meta.env.BASE_URL || '/';
  const clean = src.replace(/^\.?\//, '');
  return `${base}${clean}`;
};
