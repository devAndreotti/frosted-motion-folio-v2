import type { UsesCategory } from './types';

export const HARDWARE: UsesCategory = {
  id: 'hardware',
  label: { pt: 'Hardware', en: 'Hardware' },
  items: [
    {
      name: 'Lenovo LOQ',
      detail: {
        pt: 'Intel Core i5 · NVIDIA GeForce RTX 3050 · 24 GB de RAM · SSD NVMe',
        en: 'Intel Core i5 · NVIDIA GeForce RTX 3050 · 24 GB RAM · NVMe SSD',
      },
      why: {
        pt: 'Notebook principal de desenvolvimento. Roda modelos locais de IA e compilações pesadas.',
        en: 'Primary development notebook. Runs local AI models and heavy compilation.',
      },
    },
    {
      name: 'Desktop Linux',
      main: true,
      detail: { pt: 'Intel Core i5-4690 · NVIDIA GeForce GTX 1060 6 GB', en: 'Intel Core i5-4690 · NVIDIA GeForce GTX 1060 6 GB' },
      why: {
        pt: 'Ambiente principal de Linux, com Hyprland, para desenvolvimento e ferramentas próprias.',
        en: 'My main Linux environment, with Hyprland, for development and my own tools.',
      },
    },
    {
      name: 'Tela secundária',
      detail: { pt: 'Monitor auxiliar para visualização contínua', en: 'Auxiliary monitor for continuous monitoring' },
      why: {
        pt: 'Espaço extra de tela para acompanhar logs, documentação e tarefas em paralelo.',
        en: 'Extra screen space to monitor logs, documentation, and parallel tasks.',
      },
    },
    {
      name: 'Periféricos',
      detail: { pt: 'Teclado mecânico, mouse de precisão e fone isolante', en: 'Mechanical keyboard, precision mouse, and isolating headphones' },
      why: {
        pt: 'Ergonomia e precisão para longas sessões de código e terminal.',
        en: 'Ergonomics and precision for long coding and terminal sessions.',
      },
    },
    {
      name: 'Motorola Edge 50 Pro',
      detail: { pt: 'Snapdragon 7 Gen 3 · 12 GB de RAM', en: 'Snapdragon 7 Gen 3 · 12 GB RAM' },
      why: {
        pt: 'Terminal de bolso, e teste de modelos pequenos rodando no próprio aparelho.',
        en: 'A pocket terminal, and a place to test small models running on the device itself.',
      },
    },
  ],
};
