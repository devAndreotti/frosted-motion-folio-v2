---
title: I just needed a piece of crumpled paper for my game.
date: 2026-11-02
description: I just needed a piece of crumpled paper for my game. I couldn't find anything off-the-shelf. So I built a library from scratch and it is 100% procedural. During...
tags: [linkedin, webgl, creativecoding, javascript, gamedev, opensource]
draft: false
source: 487ada2fff82
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7521189846770405377/) on 11/02/2026.*

I just needed a piece of crumpled paper for my game.

I couldn't find anything off-the-shelf. So I created a library from scratch, and it is 100% procedural.

During the development of Memory Apartment (my psychological horror and investigation game), I encountered a critical immersion detail: the player needs to interact with notes on the floor, old memos, thermal receipts, and letters that uncover the dark secrets of the Primavera Building.

I didn't want a flat static texture or a pre-rendered flip animation. I wanted the paper to feel physical: flying to the center of the screen and unfolding smoothly right before the player.

I searched for a lightweight web library to handle this. I found nothing procedural, interactive, and free of heavy dependencies.

The solution was to build Crumple: a procedural, generative WebGL2 library with zero external dependencies.

What powers the codebase:

- 100% generative: mesh geometry, creases, and procedural deformations computed entirely at runtime. Using a deterministic seed, the identical crumple patterns and fold lines are reproduced reliably.

- 10 paper stock types: typewritten sheet, lined notebook paper, legacy continuous tractor-feed forms, thermal POS receipt, instant photo, sealed envelope, and perforated ticket stub.

- 14 physical weathering states: burned edges, scorched paper, coffee rings, water damage, wine spills, fingerprints, adhesive scotch tape, ink stamps, and temporal aging decay.

- Realtime interactivity: users can unfold sheets by dragging with the mouse, inspect recto and verso sides, burn the note with 4 directional fire-propagation modes, and reveal hidden ultraviolet ink using the cursor as a spotlight.

- Procedural audio: crinkling, unfolding, and combustion sound synthesis built natively with the Web Audio API, requiring zero external audio assets to load.

The project is published on npm (@devandreotti/crumple) and works both directly on raw canvas (Stage) or bound seamlessly to DOM elements (Scene).

Interactive playground: https://lnkd.in/d6gVAMGm

GitHub repository: https://lnkd.in/dytp-QcJ

---

### Post media

![LinkedIn post media](/blog/eu-so-precisava-de-um-papel-amassado-para-o-meu-jo/midia-1.jpg)
