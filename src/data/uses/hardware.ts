import type { UsesCategory } from './types';

export const HARDWARE: UsesCategory = {
  id: 'hardware',
  label: { pt: 'Hardware', en: 'Hardware' },
  items: [
    {
      name: 'Notebook com Windows',
      detail: { pt: 'Intel Core i5-12450H · 16 GB de RAM · NVIDIA GeForce RTX 2050', en: 'Intel Core i5-12450H · 16 GB RAM · NVIDIA GeForce RTX 2050' },
      why: {
        pt: 'Trabalho e desenvolvimento, no Windows. A GPU roda modelos de IA locais com o Ollama.',
        en: 'Work and development, on Windows. The GPU runs local AI models with Ollama.',
      },
    },
    {
      name: 'Desktop Linux',
      detail: { pt: 'Intel Core i5-4690 · NVIDIA GeForce GTX 1060 6 GB', en: 'Intel Core i5-4690 · NVIDIA GeForce GTX 1060 6 GB' },
      why: {
        pt: 'Ambiente principal de Linux, com Hyprland, para desenvolvimento e ferramentas próprias.',
        en: 'My main Linux environment, with Hyprland, for development and my own tools.',
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
