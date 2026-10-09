import type { SVGProps } from 'react';

/**
 * The X (ex-Twitter) logo -- Lucide only ships the old bird. Filled with
 * currentColor on a padded 24 box, so it sits at the same visual size as the
 * stroked Lucide icons next to it.
 */
const XLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="-2.5 -2.5 29 29" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export default XLogo;
