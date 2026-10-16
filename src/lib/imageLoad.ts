/**
 * Marks every <img> of the page as loaded (`data-ld`) or failed (`data-err`), so CSS (styles/img-load.css) can show a
 * light shimmer while a picture is on its way and a quiet tile when it never arrives -- one listener for the whole
 * site instead of a wrapper around each <img>. `load` and `error` do not bubble, hence the capture phase.
 */
export function trackImageLoading(root: Document = document): () => void {
  const settle = (img: HTMLImageElement, ok: boolean) => {
    img.toggleAttribute('data-ld', ok);
    img.toggleAttribute('data-err', !ok);
  };
  const onLoad = (event: Event) => {
    if (event.target instanceof HTMLImageElement) settle(event.target, true);
  };
  const onError = (event: Event) => {
    if (event.target instanceof HTMLImageElement) settle(event.target, false);
  };
  root.addEventListener('load', onLoad, true);
  root.addEventListener('error', onError, true);
  // pictures that finished before this ran (a cached one, or one in the prerendered HTML)
  root.querySelectorAll('img').forEach((img) => {
    if (img.getAttribute('src') && img.complete) settle(img, img.naturalWidth > 0);
  });
  return () => {
    root.removeEventListener('load', onLoad, true);
    root.removeEventListener('error', onError, true);
  };
}
