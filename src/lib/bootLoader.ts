export const BOOT_LOADER_ID = 'boot-loader';
export const BOOT_SEEN_KEY = 'boot-loader-seen';
const FADE_MS = 600;

interface DismissOptions {
  /** Keep the loader up at least this long (ms since navigation start) so it never just flickers. */
  minMs?: number;
  /** Never hold the page hostage longer than this, even if `waitFor` hangs. */
  maxMs?: number;
  /** Something worth waiting for before revealing the page, e.g. the hero photo decoding. */
  waitFor?: Promise<unknown>;
  doc?: Document;
  /** Milliseconds already elapsed since navigation start. */
  elapsed?: number;
}

function wait(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fades out the inline boot loader from index.html once React has mounted,
 * then removes it. Remembers per session, so the inline script skips it on
 * the next reload of the same tab.
 */
export async function dismissBootLoader({
  minMs = 500,
  maxMs = 2500,
  waitFor = Promise.resolve(),
  doc = document,
  elapsed = typeof performance !== 'undefined' ? performance.now() : 0,
}: DismissOptions = {}): Promise<void> {
  const el = doc.getElementById(BOOT_LOADER_ID);
  if (!el) return;

  const ready = waitFor.then(
    () => undefined,
    () => undefined
  );
  await Promise.race([ready, wait(maxMs - elapsed)]);
  await wait(minMs - elapsed);

  el.classList.add('is-out');
  el.setAttribute('aria-hidden', 'true');
  try {
    sessionStorage.setItem(BOOT_SEEN_KEY, '1');
  } catch {
    // sessionStorage unavailable (private mode) -- the loader just shows again next time.
  }
  await wait(FADE_MS);
  el.remove();
}

/** Resolves once `src` is decoded (or failed) -- never rejects, so it's safe to race. */
export function decodeImage(src: string): Promise<void> {
  if (typeof Image === 'undefined') return Promise.resolve();
  const img = new Image();
  img.src = src;
  return typeof img.decode === 'function' ? img.decode().catch(() => undefined) : Promise.resolve();
}
