---
title: "Memory Apartment: Desenvolvendo um jogo de terror psicológico em Godot 4"
date: 2026-10-10
time: "16:19"
description: "Da narrativa à arquitetura técnica: como estou construindo um jogo 3D de terror psicológico ambientado em 2003 com Godot 4, Blender e interface diegética."
tags: [godot, gamedev, indiegame, blender, horror]
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7512846421105139712/) em 10/10/2026.*

Decidi testar uma ideia que parecia improvável: até onde seria possível ir criando um jogo 3D autoral combinando ferramentas modernas de desenvolvimento, modelos de IA generativa para prototipagem rápida e motores open source.

O que começou como um experimento de fim de semana transformou-se no meu projeto mais ambicioso: **Memory Apartment**.

## O encontro entre narrativa e desenvolvimento

Antes de ingressar na faculdade de Ciência da Computação, escrever ficção era um dos meus principais hobbies. Criava histórias, personagens e cenários complexos que costumavam ficar guardados na gaveta.

Com o amadurecimento técnico, percebi que a programação me permitia transformar essas narrativas em experiências interativas:

> Em vez de apenas ler sobre um corredor escuro ou um telefone tocando de madrugada, o jogador precisa dar o passo, abrir a porta e encarar o silêncio do ambiente.

## A premissa do Edifício Primavera

O enredo coloca você no papel de um desenvolvedor de software trabalhando em regime home office no início dos anos 2000:

- Um novo governo assume sob clima de censura e tensão social;
- Você se muda para o apartamento 17 do Edifício Primavera;
- Ao tentar manter sua rotina de entregas, pequenas anomalias se acumulam: portas que levam para o mesmo cômodo, correspondências sem remetente e gravações em fita K7 com a sua própria voz.

## Sistema de Inventário e interface diegética

Para reforçar a imersão nos anos 2000, evitei menus flutuantes genéricos. O inventário foi desenhado como uma interface diegética inspirada em *Zero Parades*, onde os itens têm peso, textura física e descrições técnicas:

```gdscript
# Gerenciamento de itens inspecionáveis no inventário diegético
func inspect_item(item_resource: ItemData) -> void:
    viewport_3d_preview.display_mesh(item_resource.mesh)
    audio_player.play_sfx(item_resource.handling_sound)
    item_label.text = item_resource.item_name
```

Já foram modelados e renderizados mais de 200 assets no Blender para alimentar esse sistema: chaves antigas, manuais de código, disquetes de 3.5 polegadas e notas manuscritas.

## O emulador de computador pessoal

Como a história se passa em outubro de 2003, um dos elementos centrais da mecânica é o computador de tubo do protagonista. Desenvolvi uma interface que simula um sistema operacional da época (inspirado no Windows XP), com prompts de comando, clientes de chat e editores de texto que o jogador precisa operar para desvendar as conspirações da empresa onde trabalha.

Ainda há um longo caminho de física, iluminação e testes pela frente, mas unir escrita literária, shaders, áudio procedural e código no Godot 4 trouxe de volta o prazer puro de construir mundos.

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/ha-exatamente-1-mes-decidi-testar-uma-ideia-ate-on/midia-1.jpg)
