---
title: "Impossible Spaces: Non-Euclidean Geometry in Godot 4"
date: 2026-11-03
time: "16:19"
description: "How I implemented impossible spatial transitions and looping doorways in Godot 4 without relying on portals or secondary cameras."
tags: [godot, gamedev, gdscript, terrorpsicologico, indiegame]
draft: false
source: 17efc72ff17c
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7523398830097305602/) on 11/03/2026.*

One of the feelings I want most to explore in **Memory Apartment** is the unease of being trapped inside a space that should feel completely familiar and safe. To achieve this, I have been refining a non-Euclidean geometry mechanic inside apartment 17.

The premise is straightforward: the front door does not always lead outside.

## The horror of what should be familiar

At a specific moment in the narrative, the player unlocks the front door expecting to step into the tiled corridor of Edifício Primavera. Instead, as the handle turns, they are confronted with the apartment's own interior hallway staring back.

> True psychological horror does not come from monsters chasing you down hallways, but from the slow realization that the fundamental physical rules of your room have ceased to function.

They step back, shut the door, take a deep breath, and open it again: the interior hallway remains, stretching out in a claustrophobic loop.

## Implementing without portals or extra cameras

Many games tackle impossible spatial transitions using *stencil buffers*, auxiliary render targets, or duplicate portal cameras. While these work well in heavyweight engines, they often double real-time lighting and shadow draw costs.

In Godot 4, I adopted a lighter and fully deterministic approach: swapping collision shapes, lighting nodes, and visibility flags at the exact frame the door leaf occludes the player's line of sight:

```gdscript
# Alterna o ambiente atrás da porta fechada baseado no estado narrativo
func _on_front_door_closed() -> void:
    if narrative_state.is_anomaly_active("loop_hallway"):
        building_corridor.visible = false
        building_corridor.process_mode = Node.PROCESS_MODE_DISABLED
        interior_mirror.visible = true
        interior_mirror.process_mode = Node.PROCESS_MODE_INHERIT
```

## Benefits of discrete environment swapping

This technique provides clear performance and workflow advantages:

- **Zero Extra Draw Call Overhead:** No secondary cameras rendering duplicate geometry outside player view;
- **Lighting Stability:** Baked lightmaps and reflection probes remain stable without jarring pop-in;
- **Modular Reusability:** The identical narrative trigger logic can be applied to closets, windows, and shifting rooms.

And the game holds other unexpected spaces: beyond the apartment and the main building, an old theater sits hidden deep within the structure.

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/atualizacao-sobre-o-meu-jogo/midia-1.jpg)
