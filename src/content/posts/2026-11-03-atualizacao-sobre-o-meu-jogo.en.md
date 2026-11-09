---
title: Update on my game*
date: 2026-11-03
description: Update on my game* One of the things I most want to explore is the feeling of being trapped in a place that should feel familiar. I've been refining a...
tags: [linkedin, gamedev, indiegame, godot, desenvolvimentodejogos, terrorpsicologico]
draft: false
source: 4665eaa4acc8
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7523398830097305602/) on 11/03/2026.*

Update on my game*

One of the things I most want to explore is the eerie sensation of being trapped inside a space that should feel entirely familiar. I have been refining a non-Euclidean geometry mechanic inside apartment 17.

The idea is simple: the front door does not always lead outside.

At a certain moment, the player opens the door expecting to find the building hallway. But instead, they find the apartment's own interior hallway staring back at them.

They close the door. Open it again.

The interior hallway is still there.

The most fascinating part was figuring out how to implement this without the player ever noticing the swap occurring.

Instead of relying on portal rendering or auxiliary cameras, I chose to seamlessly toggle the environments, their collision shapes, and visibility while the door remains closed. All of this is driven by narrative state*

This way, the same physical space can assume two completely different spatial layouts without loading a new scene, and I can readily reuse this exact logic across other environments down the road.

And the player, who previously could walk out freely through the front entrance, now only encounters the looping interior of the apartment.

I want the horror of this game to stem largely from this: not necessarily from a monster chasing you down, but from the sudden realization that the physical rules of your environment no longer behave as they should.

In the video, a brief demo of this mechanic running inside Godot.

There is still plenty to polish, but I am really enjoying experimenting with impossible spaces. By the way, the game features a theater... Yes, a full theater. It is the only space outside the apartment and part of the building.

Weird, isn't it? What else would you like to see?

---

### Post media

![LinkedIn post media](/blog/atualizacao-sobre-o-meu-jogo/midia-1.jpg)
