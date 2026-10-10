/**
 * "RA" in Geist Mono SemiBold -- the header monogram -- as outlines, laid out in a 32 x 32 box:
 * a favicon is drawn as an image and can't load the site's web font.
 * public/favicon.svg draws the same path (favicon.test.ts keeps the two in sync).
 */
export const RA_PATH =
  'M5.22 22.75V9.25H9.49Q11.66 9.25 12.89 10.34Q14.12 11.42 14.12 13.3Q14.12 14.28 13.7 15.02Q13.27 15.76 12.56 16.18Q11.85 16.6 11.03 16.67L10.96 16.42Q12.41 16.47 13.13 17.05Q13.86 17.64 13.97 18.95L14.3 22.75H11.93L11.66 19.5Q11.6 18.78 11.39 18.38Q11.17 17.99 10.71 17.83Q10.26 17.67 9.48 17.67H7.57V22.75ZM7.57 15.51H9.43Q10.53 15.51 11.11 14.97Q11.7 14.43 11.7 13.46Q11.7 12.47 11.11 11.94Q10.53 11.41 9.43 11.41H7.57ZM16.18 22.75 20.02 9.25H22.95L26.78 22.75H24.38L21.48 11.92L18.59 22.75ZM18.54 19.56 19.18 17.45H23.78L24.43 19.56Z';

export interface FaviconColors {
  /** Tile fill: the theme's solid background. */
  bg: string;
  /** Letters and ring: the accent. */
  fg: string;
}

/** The monogram tile as in the nav: theme background, accent letters, a ring tinted by the accent. */
export function faviconSvg({ bg, fg }: FaviconColors): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
    `<rect x="1" y="1" width="30" height="30" rx="9" fill="${bg}" stroke="${fg}" stroke-opacity=".55" stroke-width="2"/>` +
    `<path d="${RA_PATH}" fill="${fg}"/>` +
    '</svg>'
  );
}

/** Repaints the tab icon in the visitor's hue x mode; browsers without SVG favicons keep favicon.ico. */
export function applyFavicon(colors: FaviconColors): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg(colors))}`;
}
