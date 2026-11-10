---
title: "Crumple: Criando uma biblioteca WebGL2 procedural de papel amassado do zero"
date: 2026-11-02
time: "16:19"
description: "Como construí uma biblioteca WebGL2 procedural e sem dependências com 10 tipos de papel, deformação por seed, vincos na luz e áudio sintetizado para o meu jogo."
tags: [webgl, crumple, shaders, gamedev, javascript, opensource]
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7521189846770405377/) em 02/11/2026.*

Eu só precisava de um papel amassado para o meu jogo. Não achei nada pronto que entregasse física convincente sem arrastar gigabytes de dependências. Então criei uma biblioteca do zero, 100% procedural.

Durante o desenvolvimento de **Memory Apartment** (meu jogo de terror psicológico e investigação), esbarrei em um detalhe essencial de imersão: o jogador precisa interagir com bilhetes no chão, memorandos velhos, recibos térmicos e cartas que contam os segredos do Edifício Primavera.

## O desafio de imersão no Memory Apartment

Eu não queria uma textura 2D estática nem uma animação pré-renderizada rígida. Queria que o papel parecesse físico: voasse até o centro da tela, reagisse à luz ambiente e se desdobrasse diante do jogador.

> Se o jogador puder notar que o papel é só um plano com textura colada, a sensação de mistério se desfaz no mesmo instante.

Ao pesquisar o ecossistema, não encontrei nenhuma biblioteca web que unisse deformação geométrica procedural, interação por toque/mouse e áudio físico sem exigir Three.js completo ou frameworks pesados. A solução foi construir o **Crumple**: uma biblioteca WebGL2 generativa, pesando menos de 37 KB (gzip) e com zero dependências externas.

## Instalação e uso rápido

O projeto foi empacotado para uso imediato tanto em aplicações WebGL dedicadas quanto integrado diretamente ao DOM de sites modernos:

```bash
# Instalação via NPM
npm install @devandreotti/crumple
```

```typescript
import { CrumpleScene } from '@devandreotti/crumple';

// Inicializa o papel sobre um container existente
const paper = new CrumpleScene({
  target: document.querySelector('#documento'),
  type: 'carta_1998',
  wear: ['coffee', 'creased'],
  interactive: true,
});
```

## Arquitetura Procedural e Shaders GLSL

Toda a geometria e os relevos do papel são calculados em tempo de execução através de vertex e fragment shaders customizados:

- **100% Generativo por Seed:** A malha de polígonos, os vincos principais e as microdeformações utilizam funções analíticas de ruído. Passando a mesma seed, o padrão exato de amassado é reproduzido deterministicamente;
- **10 Presets de Papel:** Folha datilografada, papel pautado de caderno escolar, formulário contínuo de impressora matricial, cupom fiscal térmico, foto instantânea, blueprint cianótipo, cartão perfurado IBM e envelope selado;
- **14 Estados de Desgaste Físico:** Queimaduras com bordas carbonizadas, manchas de café, marcas de água, vinho, fita adesiva amarelada e carimbos de tinta envelhecida;
- **Interatividade Completa:** Arraste para desdobrar, virada de folha em 3D (frente e verso), queima interativa e revelação de tinta invisível reagindo à luz do cursor.

## Áudio Sintetizado com Web Audio API

Para manter a biblioteca leve e evitar o download de arquivos `.mp3` ou `.wav` externos, todos os efeitos sonoros de papel farfalhando, estalando e queimando são gerados sinteticamente em tempo real:

- Síntese de ruído rosa filtrado por modelagem física (filtro de pico em 420 Hz);
- Envelope dinâmico modulado pela velocidade angular do desdobramento da malha;
- Zero requisições de rede para assets de áudio.

O projeto está publicado no NPM sob [@devandreotti/crumple](https://www.npmjs.com/package/@devandreotti/crumple), com código aberto no [GitHub](https://github.com/devAndreotti/crumple) e demonstração no [Playground interativo](https://devandreotti.github.io/crumple/).

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/eu-so-precisava-de-um-papel-amassado-para-o-meu-jo/midia-1.jpg)
