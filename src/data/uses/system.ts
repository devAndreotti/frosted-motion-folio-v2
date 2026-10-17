import type { UsesCategory } from './types';

export const SYSTEM: UsesCategory = {
  id: 'system',
  label: { pt: 'Sistema', en: 'System' },
  items: [
    {
      name: 'Windows 11 Pro',
      why: {
        pt: 'Sistema do notebook. O WSL2 cobre o que precisa de Linux.',
        en: 'The notebook system. WSL2 covers what needs Linux.',
      },
    },
    {
      name: 'EndeavourOS com Hyprland',
      why: {
        pt: 'Linux baseado em Arch, com compositor Wayland e janelas em mosaico. A barra é própria, feita em QML.',
        en: 'Arch-based Linux with a Wayland compositor and tiled windows. The status bar is my own, written in QML.',
      },
    },
    {
      name: 'Qubes OS',
      why: {
        pt: 'Sistema baseado em Xen, com isolamento por máquinas virtuais.',
        en: 'A Xen-based system, with isolation through virtual machines.',
      },
    },
    {
      name: 'Kali Linux',
      detail: { pt: 'VM dentro do Windows, no notebook', en: 'VM inside Windows, on the notebook' },
      why: {
        pt: 'Distribuição Linux para testes de segurança, isolada numa máquina virtual.',
        en: 'A Linux distribution for security testing, isolated in a virtual machine.',
      },
    },
    {
      name: 'Termux',
      why: {
        pt: 'Terminal no celular, com um Ubuntu em PRoot para pacotes que precisam de glibc.',
        en: 'A terminal on the phone, with an Ubuntu in PRoot for packages that need glibc.',
      },
    },
    {
      name: 'Docker',
      why: {
        pt: 'Contêineres locais para serviços e testes de imagem.',
        en: 'Local containers for services and image tests.',
      },
    },
  ],
};
