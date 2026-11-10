---
title: "Crumple: Building a procedural WebGL2 crumpled paper library from scratch"
date: 2026-11-02
time: "16:19"
description: "How I built a zero-dependency procedural WebGL2 library featuring 10 paper stocks, seed-based deformation, light creases and synthesized audio for my game."
tags: [webgl, crumple, shaders, gamedev, javascript, opensource]
draft: false
source: 6a8861966b60
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7521189846770405377/) on 11/02/2026.*

I just needed a piece of crumpled paper for my game. I found nothing off-the-shelf that provided convincing physics without pulling gigabytes of heavy dependencies. So I built a library from scratch, 100% procedural.

During the development of **Memory Apartment** (my psychological horror and investigation game), I encountered a critical immersion detail: the player needs to interact with notes on the floor, old memos, thermal receipts and letters that reveal the dark secrets of Edifício Primavera.

## The immersion challenge in Memory Apartment

I did not want a flat 2D static texture or a rigid pre-rendered animation. I wanted the paper to feel physical: flying to the center of the screen, reacting to ambient light and unfolding smoothly right before the player.

> If the player notices that the paper is just a flat plane with a slapped texture, the eerie atmosphere collapses instantly.

Searching the ecosystem, I found no web library combining procedural geometric deformation, touch/mouse interaction and physical audio without pulling all of Three.js or heavy frameworks. The solution was creating **Crumple**: a generative WebGL2 library weighing under 37 KB (gzip) with zero external dependencies.

## Installation and quick usage

The project was packaged for immediate use both in dedicated WebGL canvases or embedded directly into the DOM of modern websites:

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

## Procedural Architecture and GLSL Shaders

All geometry and creasing normals are computed in real time using custom vertex and fragment shaders:

- **100% Seed-Based Generative:** The polygon mesh, primary crease lines and micro-wrinkles use analytical noise functions. Passing the identical seed reproduces the exact crumple pattern deterministically;
- **10 Paper Presets:** Typewritten letter, school notebook ruled paper, continuous tractor-feed forms, thermal POS receipt, instant photo, cyanotype blueprint, IBM punchcard and sealed envelope;
- **14 Physical Weathering States:** Charred burn edges, coffee stains, water damage, wine rings, yellowed tape and aged ink stamps;
- **Complete Interactivity:** Drag to unfold, full 3D flip (recto and verso), interactive combustion and secret invisible ink reacting to cursor illumination.

## Synthesized Audio with the Web Audio API

To keep the library bundle featherlight and avoid downloading external `.mp3` or `.wav` files, every crinkling, cracking and burning sound is generated synthetically at runtime:

- Pink noise synthesis shaped by physical modeling (peaking filter tuned to 420 Hz);
- Dynamic amplitude envelope modulated by the angular velocity of mesh unfolding;
- Zero network requests for audio asset bundles.

The package is published on NPM under [@devandreotti/crumple](https://www.npmjs.com/package/@devandreotti/crumple), open sourced on [GitHub](https://github.com/devAndreotti/crumple) with an interactive demo on the [Playground](https://devandreotti.github.io/crumple/).

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/eu-so-precisava-de-um-papel-amassado-para-o-meu-jo/midia-1.jpg)
