// A copy-link button on every h2 and h3 of a post, so a section can be sent with its #id.
// The button is a real <button>: it takes the keyboard, and the copied message is a live region.

export interface HeadingLabels {
  copy: string;
  copied: string;
}

const ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';

/**
 * Adds the buttons under `root` and returns a function that removes them.
 * `pageUrl` is the post's address without a hash; `copy` writes the text to the clipboard.
 */
export function addHeadingLinks(root: HTMLElement, labels: HeadingLabels, pageUrl: string, copy: (text: string) => Promise<void>): () => void {
  const added: HTMLButtonElement[] = [];
  for (const heading of root.querySelectorAll<HTMLElement>('h2[id], h3[id]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'h-anchor';
    button.setAttribute('aria-label', labels.copy);
    button.innerHTML = `${ICON}<span class="sr-only" aria-live="polite"></span>`;
    const status = button.querySelector('span') as HTMLSpanElement;
    button.addEventListener('click', () => {
      copy(`${pageUrl}#${heading.id}`)
        .then(() => {
          status.textContent = labels.copied;
          window.setTimeout(() => (status.textContent = ''), 2000);
        })
        .catch(() => undefined);
    });
    heading.appendChild(button);
    added.push(button);
  }
  return () => added.forEach((button) => button.remove());
}
