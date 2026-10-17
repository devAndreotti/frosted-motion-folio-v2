import type { UsesCategory } from './types';

export const EDITOR: UsesCategory = {
  id: 'editor',
  label: { pt: 'Editor', en: 'Editor' },
  items: [
    {
      name: 'VS Code no navegador',
      main: true,
      detail: { pt: 'code-server, numa instância própria', en: 'code-server, on an instance of my own' },
      why: {
        pt: 'Edição pelo navegador, sem instalar nada no computador de onde estou.',
        en: 'Editing from the browser, with nothing to install on the machine I am using.',
      },
    },
  ],
};
