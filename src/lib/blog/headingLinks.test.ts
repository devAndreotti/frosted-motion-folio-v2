import { afterEach, describe, expect, it, vi } from 'vitest';
import { addHeadingLinks } from './headingLinks';

const LABELS = { copy: 'Copiar link da seção', copied: 'Link copiado' };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('addHeadingLinks', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  const setup = () => {
    document.body.innerHTML = '<div id="root"><h2 id="a">A</h2><p>texto</p><h3 id="b">B</h3><h4 id="c">C</h4><h2>sem id</h2></div>';
    return document.getElementById('root') as HTMLElement;
  };

  it('adds a button to each h2 and h3 that has an id, and not to the others', () => {
    const root = setup();
    addHeadingLinks(root, LABELS, 'https://devandreotti.com/blog/x/', vi.fn().mockResolvedValue(undefined));
    expect(root.querySelectorAll('button.h-anchor')).toHaveLength(2);
    expect(root.querySelector('#a button')?.getAttribute('aria-label')).toBe('Copiar link da seção: A');
    expect(root.querySelector('#c button')).toBeNull();
  });

  it('copies the address of the section and says so', async () => {
    const root = setup();
    const copy = vi.fn().mockResolvedValue(undefined);
    addHeadingLinks(root, LABELS, 'https://devandreotti.com/blog/x/', copy);
    (root.querySelector('#b button') as HTMLButtonElement).click();
    expect(copy).toHaveBeenCalledWith('https://devandreotti.com/blog/x/#b');
    await flush();
    expect(root.querySelector('#b .sr-only')?.textContent).toBe('Link copiado');
  });

  it('removes the buttons when cleaned up', () => {
    const root = setup();
    const cleanup = addHeadingLinks(root, LABELS, 'https://devandreotti.com/blog/x/', vi.fn().mockResolvedValue(undefined));
    cleanup();
    expect(root.querySelectorAll('button')).toHaveLength(0);
  });

  it('stays quiet when the clipboard refuses', async () => {
    const root = setup();
    addHeadingLinks(root, LABELS, 'https://devandreotti.com/blog/x/', vi.fn().mockRejectedValue(new Error('denied')));
    (root.querySelector('#a button') as HTMLButtonElement).click();
    await flush();
    expect(root.querySelector('#a .sr-only')?.textContent).toBe('');
  });
});
